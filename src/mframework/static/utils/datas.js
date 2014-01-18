/**
 * 数据访问封装层界面下面几个问题
 1、查询本地数据的版本号，与服务器版本号进行比较，如果版本相同则不进行同步
 2、判断当前浏览器状态 离线和手机客户端，则不操作本地表  PC浏览器才从服务器同步数据
 3、对一些特殊表开放扩展能力，比如指定某些表不存本地
 */
define(function (require, exports, module) {
    var utils = require("./utils");
    var RECORD_STATUS_NORMAL = "0";
    var _global = utils.global;

    exports.instance = datas();

    function datas() {

        return {
            getResource: getResource,
            postResource: postResource,
            putResource: putResource,
            deleteResource: deleteResource,
            batchPostResource: batchPostResource,
            queryTable: queryTable,
            queryPageData: queryPageData,
            getLocalRecordById: getLocalRecordById,
            syncQueryTable: syncQueryTable,
            addRecords: addRecords,
            modifyRecords: modifyRecords,
            deleteRecordByIdArray: deleteRecordByIdArray,
            deleteRecordByIdMap: deleteRecordByIdMap,
            syncQueryMultTable: syncQueryMultTable,
            sync2Local: sync2Local,
            global: _global
        }

        /**
         * 同步服务端资源到本地indexedDB中
         * 如果当前浏览器状态是NORMAL状态才进行数据同步，
         * 否则直接查询远程数据
         * @param  string dbName       [本地数据库名称]
         * @param  string tableName    [本地数据表名]
         * @param  string resourcePath [服务端资源URL]
         * @param  object condition    [条件对象]{where:function(item,index){}}
         * @return promise             [promise:function(datas<Array>)(),function(error){}]
         */
        function syncQueryTable(dbName, tableName, resourcePath, condition) {
            var deferred = Q.defer();
            //1、查询本地数据的版本号，与服务器版本号进行比较，如果版本相同则不进行同步
            //2、判断当前浏览器状态 离线和手机客户端，则不操作本地表  PC浏览器才从服务器同步数据

            getResource(resourcePath, condition)
                .then(function (records) {
                    //获取服务器数据成功，更新模型
                    sync2Local(dbName, tableName, resourcePath, condition, records).then(function (records) {
                        //查询本地数据
                        queryTable(dbName, tableName, resourcePath, condition).then(function (data) {
                            deferred.resolve(data);
                        }, function (e) {
                            deferred.reject(e);
                        });
                    }, function (errors) {
                        queryTable(dbName, tableName, resourcePath, condition).then(function (data) {
                            deferred.resolve(data);
                        }, function (e) {
                            deferred.reject(e);
                        });
                    });
                }, function (e) {
                    deferred.reject(e);
                }
            )
            return deferred.promise;
        }

        function batchPostResource(records) {
            var deferred = Q.defer();
            var putPromises = [];
            _.each(records, function (item) {
                _cleanObject(item);
                var tmpp = putResource(_global.graphPath + "/" + item.id, item);
                tmpp["__record"] = item;
                putPromises.push(tmpp);
            });
            var putSuccess = [], putErrors = [];
            Q.allResolved(putPromises)
                .then(function (promises) {
                    promises.forEach(function (promise) {
                        if (promise.isFulfilled()) {
                            var value = promise.valueOf();
                            putSuccess.push(value);
                        } else {
                            var exception = promise.valueOf().exception;
                            putErrors.push({name: "put_server_exception", exception: exception});
                        }
                    });
                    deferred.resolve({success: putSuccess, fail: putErrors});
                });
            return deferred.promise;
        }

        function modifyRecords(dbName, tableName, records) {
            var deferred = Q.defer();
            var putPromises = [];
            _.each(records, function (item) {
                _cleanObject(item);
                var tmpp = putResource(_global.graphPath + "/" + item.id, item);
                tmpp["__record"] = item;
                putPromises.push(tmpp);
            });
            var putSuccess = [], putErrors = [];
            var updateLocalPromises = [];
            Q.allResolved(putPromises)
                .then(function (promises) {
                    promises.forEach(function (promise) {
                        if (promise.isFulfilled()) {
                            var value = promise.valueOf();
                            updateLocalPromises.push(updateLocalRecord(dbName, tableName, value));
                        } else {
                            var exception = promise.valueOf().exception;
                            putErrors.push({name: "put_server_exception", exception: exception});
                        }
                    });
                    if (updateLocalPromises.length > 0) {
                        Q.allResolved(updateLocalPromises)
                            .then(function (promises) {
                                promises.forEach(function (promise) {
                                    if (promise.isFulfilled()) {
                                        var value = promise.valueOf();
                                        putSuccess.push(value);
                                    } else {
                                        var exception = promise.valueOf().exception;
                                        putErrors.push({name: "update_local_exception", exception: exception});
                                    }
                                });
                                deferred.resolve({success: putSuccess, fail: putErrors});
                            });
                    } else {
                        deferred.resolve({success: [], fail: putErrors});
                    }
                });
            return deferred.promise;
        }

        /**
         * 删除客户端服务端数据 根据id数组， ID结构为[serverId_clientId]
         * @param  {[type]} dbName    [description]
         * @param  {[type]} tableName [description]
         * @param  {[type]} ids       [description]
         * @return {[type]}           [description]
         */
        function deleteRecordByIdArray(dbName, tableName, deleteIds) {
            var server2client = {}, clientIds = [], serverIds = [];
            for (var i = 0; i < deleteIds.length; i++) {
                var tmp = deleteIds[i], index = tmp.indexOf("_");
                var tmps = tmp.substring(0, index);
                var tmpc = tmp.substring(index + 1, tmp.length);
                clientIds.push(tmpc);
                serverIds.push(tmps);
                server2client[tmps] = tmpc;
            }
            return deleteRecordByIdMap(dbName, tableName, server2client);
        }

        function deleteRecordByIdMap(dbName, tableName, server2client) {
            var deferred = Q.defer();
            var delPromises = [];
            _.each(server2client, function (clientId, serverId) {
                delPromises.push(deleteResource(_global.graphPath + "/" + serverId, serverId));
            });

            var delSuccess = [], delErrors = [];
            var deleteLocalPromises = [];
            Q.allResolved(delPromises)
                .then(function (promises) {
                    promises.forEach(function (promise) {
                        if (promise.isFulfilled()) {
                            var value = promise.valueOf();
                            deleteLocalPromises.push(deleteLocalRecord(dbName, tableName, server2client[value]));
                            deleteLocalPromises["__serverId"] = value;
                        } else {
                            var exception = promise.valueOf().exception;
                            delErrors.push({name: "delete_server_exception", exception: exception});
                        }
                    });
                    if (deleteLocalPromises.length > 0) {
                        Q.allResolved(deleteLocalPromises)
                            .then(function (promises) {
                                promises.forEach(function (promise) {
                                    if (promise.isFulfilled()) {
                                        var value = promise.valueOf();
                                        delSuccess.push({serverId: promise["__serverId"], clientId: value});
                                    } else {
                                        var exception = promise.valueOf().exception;
                                        delErrors.push({name: "delete_local_exception", exception: exception});
                                    }
                                });
                                deferred.resolve({success: delSuccess, fail: delErrors});
                            });
                    } else {
                        deferred.resolve({success: [], fail: delErrors});
                    }
                });
            return deferred.promise;
        }

        function addRecords(dbName, tableName, resourcePath, records) {
            var deferred = Q.defer();
            var postPromises = [];
            _.each(records, function (item) {
                //没有设置本地和server数据表示提交本地和服务器的数据均为当前提交记录
                var tmpp;
                if (!item.server) {
                    tmpp = postResource(resourcePath, item);
                    tmpp["__record"] = item;
                } else {
                    tmpp = postResource(resourcePath, item.server);
                    tmpp["__record"] = item.local;
                }
                postPromises.push(tmpp);
            });
            var postSuccess = [], postErrors = [];
            var addLocalPromises = [];
            Q.allResolved(postPromises)
                .then(function (promises) {
                    promises.forEach(function (promise) {
                        if (promise.isFulfilled()) {
                            var value = promise.valueOf();
                            addLocalPromises.push(addLocalRecords(dbName, tableName, [_.extend(promise["__record"], value)]));
                        } else {
                            var exception = promise.valueOf().exception;
                            postErrors.push({name: "post_server_exception", exception: exception});
                        }
                    });
                    if (addLocalPromises.length > 0) {
                        Q.allResolved(addLocalPromises)
                            .then(function (promises) {
                                promises.forEach(function (promise) {
                                    if (promise.isFulfilled()) {
                                        var value = promise.valueOf()[0];
                                        postSuccess.push(value);
                                    } else {
                                        var exception = promise.valueOf().exception;
                                        postErrors.push({name: "add_local_exception", exception: exception});
                                    }
                                });
                                deferred.resolve({success: postSuccess, fail: postErrors});
                            });
                    } else {
                        deferred.resolve({success: [], fail: postErrors});
                    }
                });
            return deferred.promise;
        }

        /**
         * 同步服务器数据到本地indexedDB中
         * tables描述同步信息：
         *    {
		 * 		dbName:dbName, //本地数据库名
		 * 		tableName:tableName, //本地数据表名
		 * 		resourcePath:“服务器资源路径”,
		 * 		condition:"查询条件"
		 * 	}
         * @param  {[type]} tables [description]
         * @return {[type]}        [description]
         */
        function syncQueryMultTable(tables) {
            var promises = [];
            var deferred = Q.defer();
            _.each(tables, function (item) {
                var tmp = syncQueryTable(item.dbName, item.tableName, item.resourcePath, item.condition);
                tmp["_tableName"] = item.dbName + "_" + item.tableName;
                promises.push(tmp);
            });
            var successes = {}, errors = {};
            Q.allResolved(promises)
                .then(function (promises) {
                    promises.forEach(function (promise) {
                        if (promise.isFulfilled()) {
                            var value = promise.valueOf();
                            successes[promise["_tableName"]] = value;
                        } else {
                            var exception = promise.valueOf().exception;
                            errors[promise["_tableName"]] = exception;
                        }
                    });
                    deferred.resolve({success: successes, fail: errors});
                });
            return deferred.promise;
        }

        /**
         * 查询本地数据库数据
         * @param  {[type]} dbName    [description]
         * @param  {[type]} tableName [description]
         * @param  {[type]} condition [description]
         * @return {[type]}           [description]
         */
        function queryTable(dbName, tableName, resourcePath, condition, pagenation) {
            var that = this;
            var deferred = Q.defer();
            //查询本地数据
            _doDBOperation(dbName, function (dbServer) {
                try {
                    dbServer.query(tableName, "id")
                        .all()
                        .execute()
                        .done(function (datas) {
                            deferred.resolve(_filter(datas, condition, pagenation));
                        })
                        .fail(function (err) {
                            deferred.reject(err);
                        });
                } catch (e) {
                    deferred.reject(e);
                }
            });
            return deferred.promise;
        };

        function queryPageData(dbName, tableName, resourcePath, page, per_page, condition) {
            var pagination = {page: page, per_page: per_page};
            return queryTable(dbName, tableName, resourcePath, condition, pagination);
        }

        /**
         * 获取{objectId}下关系为{connection}的对象的列表信息。
         * @param  {[type]} resourcePath   [description]
         * @param  {[type]} connection [description]
         * @param  {[type]} condition  [description]
         * @return {[type]}            [description]
         */
        function getResource(resourcePath, condition, pagenation) {
            var that = this;
            var uri = _global.url + "/" + resourcePath;
            var deferred = Q.defer();
            $.ajax({
                url: uri,
                type: 'GET',
                crossDomain: true,
                dataType: 'json',
                headers: {
                    "Authorization": "Bearer " + ENV.access_token,
                    "custom-enterpriseId": $.cookie('enterpriseId')
                },
                beforeSend: function (xhr) {
                    xhr.withCredentials = true;
                },
                success: function (_records) {
                    if (0 == _records.code) {
                        deferred.resolve(_filter(_records.result, condition, pagenation));
                    } else {
                        deferred.reject(_records.error);
                    }

                },
                error: function (xhr, textStatus, errorThrown) {
                    if (xhr.status == 401) {
                        $.Topic("accessToken").publish("accessToken-Invalid");
                        deferred.reject(401);
                    } else {
                        deferred.reject(xhr.responseText);
                    }
                }
            });
            return deferred.promise;
        };

        /**
         * 新增服务端资源信息
         * @param  {[type]} resourcePath [description]
         * @param  {[type]} connection   [description]
         * @param  {[type]} record       [description]
         * @return {[type]}              [description]
         */
        function postResource(resourcePath, record) {
            var that = this;
            var deferred = Q.defer();
            delete record.type;
            delete record.id;
            var dataType = "json",
                processData = true,
                contentType = "application/x-www-form-urlencoded";
            if (_.isObject(record)) {
                if ("clientId" in record) {
                    delete record.clientId;
                }
                _cleanObject(record)
                record.tag__ = RECORD_STATUS_NORMAL;
            } else {
                processData = false;
                dataType = "html";
                contentType = "application/json";
            }
            $.ajax({
                type: "POST",
                url: _global.url + "/" + resourcePath,
                data: record,
                headers: {
                    "Authorization": "Bearer " + $.cookie('accessToken'),
                    "custom-enterpriseId": $.cookie('enterpriseId')
                },
                dataType: dataType,
                processData: processData,
                contentType: contentType,
                success: function (data) {

                    if(0==data.code){
                        if(data.result && "clientId" in data.result){
                            delete data.result.clientId;
                        }
                        deferred.resolve(data.result);
                    }else{
                        deferred.reject(data.error);
                    }


                },
                error: function (xhr, textStatus, errorThrown) {
                    if (xhr.status == 401) {
                        $.Topic("accessToken").publish("accessToken-Invalid");
                        deferred.reject(401);
                    } else {
                        deferred.reject(xhr.responseText);
                    }
                }
            });
            return deferred.promise;
        }

        function putResource(resourcePath, record) {
            var that = this;
            var clientId = record.clientId;
            var deferred = Q.defer();
            var recordId = record.id;
            var recordType = record.type;

            delete record.type;
            delete record.id;
            if ("clientId" in record) {
                delete record.clientId;
            }
            $.ajax({
                type: "PUT",
                url: _global.url + "/" + resourcePath,
                data: record,
                headers: {
                    "Authorization": "Bearer " + ENV.access_token,
                    "custom-enterpriseId": $.cookie('enterpriseId')

                },
                dataType: "json",
                success: function (data) {

                    if(0 ==data.code){
                        var result = data.result;
                        result.id = recordId;
                        result.type = recordType;
                        result.clientId = clientId;
                        deferred.resolve(result);
                    }else{
                        deferred.reject(data.error);
                    }

                },
                error: function (xhr, textStatus, errorThrown) {
                    if (xhr.status == 401) {
                        $.Topic("accessToken").publish("accessToken-Invalid");
                        deferred.reject(401);
                    } else {
                        deferred.reject(xhr.responseText);
                    }
                }
            });
            return deferred.promise;
        }

        function deleteResourceConnection(objectId_1, connection, objectId_2) {
            var deferred = Q.defer();
            $.ajax({
                type: "DELETE",
                url: _global.url + "/" + _global.graphPath + "/" + objectId_1 + "/" + connection + "/" + objectId_2,
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + ENV.access_token,
                    "custom-enterpriseId": $.cookie('enterpriseId')

                },
                success: function (result) {
                    deferred.resolve(id);
                },
                error: function (xhr, textStatus, errorThrown) {
                    if (xhr.status == 200 && xhr.responseText == "") {
                        deferred.resolve(id);
                    } else {
                        deferred.reject(xhr.responseText);
                    }
                }
            });
            return deferred.promise;
        }

        function deleteResource(resourcePath, id) {
            var that = this;
            var deferred = Q.defer();
            $.ajax({
                type: "DELETE",
                url: _global.url + "/" + resourcePath,
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + ENV.access_token,
                    "custom-enterpriseId": $.cookie('enterpriseId')
                },
                success: function (data) {

                    if(0==data.code){
                        deferred.resolve(data.result);
                    }else{
                        deferred.reject(data.error);
                    }
                },
                error: function (xhr, textStatus, errorThrown) {
                    if (xhr.status == 200 && xhr.responseText == "") {
                        deferred.resolve({errorCode:"-1"});  //TODO整改ajax请求返回码
                    }
                    else if (xhr.status == 401) {
                        $.Topic("accessToken").publish("accessToken-Invalid");
                        deferred.reject({errorCode:"401"});
                    } else {
                        deferred.reject({errorCode:xhr.status,message:"xhr.responseText"});
                    }
                }
            });
            return deferred.promise;
        }

        function getLocalRecordById(dbName, tableName, id) {
            var that = this;
            var deferred = Q.defer();
            //查询本地数据
            _doDBOperation(dbName, function (dbServer) {
                try {
                    dbServer.query(tableName, "id")
                        .filter('id', id)
                        .execute()
                        .done(function (datas) {
                            if (datas) {
                                deferred.resolve(datas);
                            } else {
                                deferred.reject({msg: "record not find"});
                            }
                        })
                        .fail(function (err) {
                            deferred.reject(err);
                        });
                } catch (e) {
                    deferred.reject(e);
                }
            });
            return deferred.promise;
        }

        /**
         * 新增本地数据库数据
         * @param {[type]} dbName    [description]
         * @param {[type]} tableName [description]
         * @param {[type]} records   [description]
         */
        function addLocalRecords(dbName, tableName, records) {
            var addRecords = [];
            for (var i = 0; i < records.length; i++) {
                _tmpRecord = _.clone(records[i]);
                delete _tmpRecord.clientId;
                _cleanObject(_tmpRecord);
                addRecords.push(_tmpRecord);
            }
            var deferred = Q.defer();
            _doDBOperation(dbName, function (dbServer) {
                dbServer.batchAdd(tableName, addRecords)
                    .done(function (_records) {
                        deferred.resolve(_records);
                    })
                    .fail(function (records, error) {
                        deferred.reject(error);
                    }
                );
            });
            return deferred.promise;
        }

        /**
         * 批量删除本地IndexedDB数据库数据
         * @param  {[type]} dbName    [description]
         * @param  {[type]} tableName [description]
         * @param  {[type]} recordIds [description]
         * @return {[type]}           [description]
         */
        function deleteLocalRecords(dbName, tableName, recordIds) {
            var promises = [];
            _.each(recordIds, function (recordId) {
                promises.push(deleteLocalRecord(dbName, tableName, recordId));
            });
            return promises;
        }

        /**
         * 单条删除本地IndexedDB数据库数据
         * @param  {[type]} dbName    [description]
         * @param  {[type]} tableName [description]
         * @param  {[type]} recordId  [description]
         * @return {[type]}           [description]
         */
        function deleteLocalRecord(dbName, tableName, recordId) {
            var deferred = Q.defer();
            _doDBOperation(dbName, function (dbServer) {
                var index = 0;
                if (_.isString(recordId)) {
                    recordId = parseInt(recordId);
                }
                dbServer.remove(tableName, recordId)
                    .done(function (key) {
                        deferred.resolve(key);
                    }).fail(function (e) {
                        deferred.reject(e);
                    }
                );
            });
            return deferred.promise;
        }

        /**
         * 批量更新本地IndexedDB数据
         * @param  {[type]} dbName    [description]
         * @param  {[type]} tableName [description]
         * @param  {[type]} records   [description]
         * @return {[type]}           [description]
         */
        function updateLocalRecords(dbName, tableName, records) {
            var promises = [];
            _.each(records, function (record) {
                promises.push(updateLocalRecord(dbName, tableName, record));
            });
            return promises;
        }

        /**
         * 单条更新本地IndexedDB数据
         * @param  {[type]} dbName    [description]
         * @param  {[type]} tableName [description]
         * @param  {[type]} record    [description]
         * @return {[type]}           [description]
         */
        function updateLocalRecord(dbName, tableName, record) {
            var deferred = Q.defer();
            _doDBOperation(dbName, function (dbServer) {
                dbServer[tableName]
                    .update(record)
                    .done(function (data) {
                        deferred.resolve(data);
                    }).fail(function (err) {
                        deferred.reject(err);
                    });
            });
            return deferred.promise;
        }

        /**
         * 同步数据数据datas到本地数据库
         * （比较新增、修改、数据）
         * @param  {[type]} dbName    [description]
         * @param  {[type]} tableName [description]
         * @param  {[type]} condition [description]
         * @param  {[type]} datas     [description]
         * @return {[type]}           [description]
         */
        function sync2Local(dbName, tableName, resourcePath, condition, datas) {
            if (datas.length > 0) {
                var qprimise = queryTable(dbName, tableName, resourcePath, condition).then(
                    function (ldatas) {
                        //标记服务器数据与本地数据差异
                        var updates = [], adds = [], dels = [];
                        _.each(ldatas, function (item) {
                            var deltag = true;
                            for (i = 0; i < datas.length; i++) {
                                if (item.id == datas[i].id) {
                                    deltag = false;
                                    if (item.updatetime != datas[i].updatetime) {
                                        updates.push(item);
                                        datas.splice(i, 1);
                                        break;
                                    } else {
                                        datas.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                            if (deltag) {
                                dels.push(item.clientId);
                            }
                        });
                        //TODO 后续要删除
                        for (var i = 0; i < datas.length; i++) {
                            delete datas[i].clientId;
                        }
                        adds = datas;
                        var promises = [];
                        promises = _.union(promises, updateLocalRecords(dbName, tableName, updates));
                        promises = _.union(promises, deleteLocalRecords(dbName, tableName, dels));
                        promises = _.union(promises, addLocalRecords(dbName, tableName, adds));
                        return promises;

                    },
                    function (err) {
                        //同步失败
                        outputError(dbName, tableName, resourcePath, err)
                        var deferred = Q.defer();
                        deferred.reject(err);
                        return deferred.promise;
                    }
                );
                var deferred = Q.defer(), successes = [], errors = [];
                Q.allResolved(qprimise)
                    .then(function (promises) {
                        promises.forEach(function (promise) {
                            if (promise.isFulfilled()) {
                                var value = promise.valueOf();
                                successes.push(value);
                            } else {
                                var exception = promise.valueOf().exception;
                                errors.push(exception);
                            }
                        });
                        deferred.resolve({success: successes, fail: errors});
                    });
                return deferred.promise;
            } else {
                var deferred = Q.defer();
                deferred.reject("no data to sync2Local");
                return deferred.promise;
            }
        }

    }

    function outputError(dbName, tableName, resourcePath, err) {
        console.log(err);
        console.log("dbName,tableName,resourcePath:" + dbName + "\n" + tableName + "\n" + resourcePath);
    }

    function _filter(datas, condition, pagenation) {
        var result = datas;
        if (condition && _.isFunction(condition.where) && _.isFunction(condition.OrderBy)) {
            result = JSLINQ(datas).OrderBy(condition.OrderBy).Where(condition.where).items;
        } else if (condition && _.isFunction(condition.where) && _.isFunction(condition.OrderByDescending)) {
            result = JSLINQ(datas).OrderByDescending(condition.OrderByDescending).Where(condition.where).items;
        } else if (condition && _.isFunction(condition.where)) {
            result = JSLINQ(datas).OrderByDescending(function (item) {
                return item.clientId
            }).Where(condition.where).items;
        }
        if (pagenation) {
            var pageCond = {
                where: function (item, index) {
                    return  (index >= pagenation.per_page * (pagenation.page - 1) && index < pagenation.per_page * pagenation.page);
                }
            };
            result = JSLINQ(result).OrderByDescending(function (item) {
                return item.clientId
            }).Where(pageCond.where).items;
        }

        return result;
    }

    //删除提交数据中不需要提交的数据
    function _cleanObject(object) {
        if ("$$hashKey" in object) {
            delete object.$$hashKey;
        }
        object.__proto__ = null;
        for (var p in object) {
            if (p.indexOf("_") == 0 || p.indexOf("$") == 0) {
                delete object[p];
            } else if (_.isObject(object[p])) {
                _cleanObject(object[p]);
            }
        }
    }

    function _doDBOperation(dbname, action) {

        var dbServer = dbServers["enterprise." + dbname];
        if (action && typeof(action) == "function") {
            try {
                action(dbServer);
            } catch (e) {
                console.log(e);
            }
        }


    }
})