define(function (require, exports, module) {
    exports.getDBInstance = getDBInstance;
    exports.getUniqueCode = getUniqueCode;
    exports.getUniqueId = getUniqueId;

    exports.getInsertSqlOfObj = getInsertSqlOfObj;
    exports.getUpdateSqlOfObjId = getUpdateSqlOfObjId;
    exports.getDelSqlByObjId = getDelSqlByObjId;
    exports.updateBackupFlag = updateBackupFlag;


    function getDBInstance() {
        if (YILOS.dbinstance) {
            return YILOS.dbinstance;
        }
        if (window.sqlitePlugin) {
            YILOS.dbinstance = window.sqlitePlugin.openDatabase({name: YILOS.USERNAME});
        } else {
            YILOS.dbinstance = window.openDatabase("losgraph", '1.0', 'losgraph', 2 * 1024 * 1024, function () {
            });
        }

        //执行单条语句查询
        YILOS.dbinstance.execQuery = function (sql, args, successCallback, errorCallback) {
            if (window.sqlitePlugin) {
                this.executeSql(sql, args, function (result) {
                    if (result) {
                        successCallback(result);
                    }
                }, errorCallback);
            } else {
                this.readTransaction(function (tx) {
                    tx.executeSql(sql, args, function (tx, result) {
                        successCallback(result);
                    });
                }, function (error) {
                    console.log(error);
                    errorCallback(error);
                });
            }
        }

        return YILOS.dbinstance;
    }


    function getUniqueCode(entity, len, callback) {
        var that = this;
        var updatesql = "UPDATE  ticket_mutex SET value=? WHERE name='" + entity + "';";
        var querysql = "SELECT value FROM  ticket_mutex WHERE name='" + entity + "'";
        var insertsql = "INSERT INTO ticket_mutex (name,value) values(?,?)";
        getDBInstance().transaction(function (tx) {
            tx.executeSql(querysql, [], function (tx, result) {
                if (result.rows.length == 0) {
                    tx.executeSql(insertsql, [entity, "1"], function (tx, result) {
                        var currentID = 1;
                        tx.executeSql(updatesql, [(currentID + 1)], function (tx, result) {
                            callback(null, tx, _buqBeforeiNumberString(currentID + "", len));
                        });
                    });
                } else {
                    var currentID = parseInt(result.rows.item(0).value);
                    tx.executeSql(updatesql, [(currentID + 1)], function (tx, result) {
                        callback(null, tx, _buqBeforeiNumberString(currentID + "", len));
                    });
                }
            });
        });
    }

    /**
     * ID规则 企业ID(18)+节点ID(3)+进程ID(5)+数据库计数器(<=8)+JS方法上下文计数器(3)（利用JS单线程机制）<37位
     * @param enterpriseId
     * @param callback
     */
    function getUniqueId(enterpriseId, callback) {
        var updatesql = "UPDATE ticket_mutex SET value=? WHERE name='ENTITY';"
        var querysql = "SELECT value FROM ticket_mutex WHERE name='ENTITY'";
        if (!getUniqueId.id) {
            getDBInstance().transaction(function (tx) {
                tx.executeSql(querysql, [], function (tx, result) {
                    var currentID = parseInt(result.rows.item(0).value);
                    if (!getUniqueId.contextID) {
                        getUniqueId.contextID = 1;
                    } else if (getUniqueId.contextID >= 998) {  //如果计数器超过998，则重置计数器，假设在同一秒一个进程内部不会有999个对象创建
                        getUniqueId.contextID = 1;
                    }
                    var contextID = getUniqueId.contextID++;
                    tx.executeSql(updatesql, [currentID + 1], function (tx, result) {
                        //进程函数上下文中存储当前ID
                        getUniqueId.id = currentID + 1;
                        //运行时位等长8位（服务端生成时:节点ID进程ID）,
                        // 如果是离线生成固定为登陆是分配的设备ID，暂时固定为
                        var runtimeID = YILOS.deviceID;
                        //上下文计数器等长3位
                        contextID = _buqiNumberString(contextID + "", 3);
                        var tmp = enterpriseId + "" + runtimeID + "" + (currentID + 1) + contextID;
                        callback(null, tx, tmp);
                    });
                }, function (tx, error) {
                    callback(error);
                });
            })
        } else {
            setTimeout(function () {
                if (!getUniqueId.contextID) {
                    getUniqueId.contextID = 1;
                } else if (getUniqueId.contextID >= 9998) {
                    getUniqueId.contextID = 1;
                }
                var contextID = getUniqueId.contextID++;
                //运行时位等长8位（节点ID进程ID）
                var runtimeID = YILOS.deviceID;
                //上下文计数器等长3位
                contextID = _buqiNumberString(contextID + "", 3);
                var tmp = enterpriseId + "" + runtimeID + "" + (getUniqueId.id++) + contextID;
                getDBInstance().transaction(function (tx) {
                    tx.executeSql(updatesql, [getUniqueId.id], function (tx, result) {
                        callback(null, tx, tmp)
                    });
                });
            }, 10);
        }
    }

    function _buqiNumberString(nos, len) {
        var noslen = nos.length;
        var _tmp = nos;
        if (noslen < len) {
            for (var i = 0; i < (len - noslen); i++) {
                _tmp = _tmp + "0";
            }
        }
        return _tmp;
    }

    function _buqBeforeiNumberString(nos, len) {
        var noslen = nos.length;
        var _tmp = nos;
        if (noslen < len) {
            for (var i = 0; i < (len - noslen); i++) {
                _tmp = "0" + _tmp;
            }
        }
        return _tmp;
    }


    //获取一个对象的SQL插入语句、fitterArray过滤对象属性数组
    function getInsertSqlOfObj(dbName, tableName, obj, fitterArray) {
        var field = "(", values = "(";
        var insertObj, key;
        insertObj = fitterArray ? fitterObj(obj, fitterArray) : fitterObj(obj);
        if (_.isEmpty(insertObj)) {
            return "";
        }
        for (key in insertObj) {
            if (insertObj.hasOwnProperty(key)) {
                field += key + ",";
                values += insertObj[key] === null ? insertObj[key] + "," : "'" + insertObj[key] + "',";    //null不需要用''包围
            }
        }
        field = field.slice(0, field.length - 1) + ")";
        values = values.slice(0, values.length - 1) + ")";
        if (dbName) {
            return "insert into " + dbName + "." + tableName + field + " values" + values + ";";
        }
        else {
            return "insert into " + tableName + field + " values" + values + ";";
        }
    }


    //获取一个对象的SQL更新语句、fitterArray过滤对象属性数组
    function getUpdateSqlOfObjId(dbName, tableName, obj, fitterArray) {
        var setFieldStr = "";
        var insertObj, key, id;
        insertObj = fitterArray ? fitterObj(obj, fitterArray) : fitterObj(obj);
        if (_.isEmpty(insertObj)) {
            return "";
        }
        for (key in insertObj) {
            if (insertObj.hasOwnProperty(key)) {
                if (key == "id") {
                    id = insertObj[key];
                    continue;
                }
                setFieldStr += key + "=" + (insertObj[key] === null ? insertObj[key] + "," : "'" + insertObj[key] + "',");
            }
        }
        setFieldStr = setFieldStr.slice(0, setFieldStr.length - 1);
        if (dbName) {
            return "update " + dbName + "." + tableName + " set " + setFieldStr + " where id='" + id + "';";
        }
        else {
            return "update " + tableName + " set " + setFieldStr + " where id='" + id + "';";
        }
    }

    //根据id获取SQL删除语句
    function getDelSqlByObjId(dbName, tableName, id) {
        if (dbName) {
            return "delete from " + dbName + "." + tableName + " where id = '" + id + "';";
        }
        else {
            return "delete from " + tableName + " where id = '" + id + "';";
        }
    }

    //过滤对象属性
    function fitterObj(obj, fitterArray) {
        var key, fitterResult = {};
        if (fitterArray && !_.isArray(fitterArray)) {
            return fitterResult;
        }
        for (key in obj) {
            if (obj.hasOwnProperty(key) && (!fitterArray || fitterArray.indexOf(key.toString()) !== -1)) {
                if (_.isNumber(obj[key]) || _.isString(obj[key])) {
                    //默认""转换为NULL进行插入
                    if (obj[key] === "") {
                        fitterResult[key] = null;
                        continue;
                    }
                    fitterResult[key] = obj[key];
                }
            }
        }
        return fitterResult;
    }

    function updateBackupFlag(backupTime, business_id, callback) {
        getDBInstance().transaction(function (trans) {
            //这里只是需要修改backup_flag为1即可，不需要修改create_date，因为create_date会在每次备份完成后修改
            var update_backupFlag = "update tb_backupData set backup_flag = 1 "
                + " where backup_flag = 0 and business_id = '" + business_id + "' and enterprise_id = '" + YILOS.ENTERPRISEID + "'";
            trans.executeSql(update_backupFlag, [], function (trans, result) {
                if (callback) {
                    callback(null);
                }
            }, function (trans, error) {
                console.error(error);
                if (callback) {
                    callback(error);
                }
            });
        });
    }
});