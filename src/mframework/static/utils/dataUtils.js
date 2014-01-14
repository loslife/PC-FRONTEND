//数据操作辅助工具
define(function (require, exports, module) {
    var database = require("./database.js");
    var dbInstance = database.getDBInstance();

    exports.getInsertSqlOfObj = getInsertSqlOfObj;//获取一个insert语句、
    exports.getUpdateSqlOfObjId = getUpdateSqlOfObjId;//获取一个update语句、
    exports.getDelSqlById = getDelSqlById;//获取一个delete语句

    exports.insertRecord = insertRecord;//向某数据库某表插入一条记录
    exports.updateRecordById = updateRecordById;//向某数据库某表根据id为条件更新某记录
    exports.deleteRecordById = deleteRecordById;//从某数据库某表根据id删除一条记录
    exports.batchExecuteSql = batchExecuteSql;//批量执行一个sql数组、异步的
    exports.execOneSql = execOneSql;//执行单条sql

    //向某数据库某表插入一条记录，fitter过滤数组，obj需要插入的对象，callback返回影响行数
    function insertRecord(tableName, obj, fitter, callback) {
        dbInstance.transaction(function (trans) {
            var insertSql = getInsertSqlOfObj(tableName, obj, fitter);
            trans.executeSql(insertSql.statement, insertSql.value, function (trans, result) {
                callback(null, result.rowsAffected);
            }, function (trans, error) {
                callback(error);
            });
        });
    }

    //向某数据库某表根据id为条件更新某对象，fitter过滤属性数组，obj需要更新的对象,callback返回影响行数
    function updateRecordById(tableName, obj, fitter, callback) {
        dbInstance.transaction(function (trans) {
            var updateSql = getUpdateSqlOfObjId(tableName, obj, fitter);
            trans.executeSql(updateSql.statement, updateSql.value, function (trans, result) {
                callback(null, result.rowsAffected);
            }, function (trans, error) {
                callback(error);
            });
        });
    }

    //从某数据库某表根据id删除一条记录，delId需要删除记录的id，callback返回影响行数
    function deleteRecordById(tableName, delId, callback) {
        dbInstance.transaction(function (trans) {
            var deleteSql = getDelSqlById(tableName, delId);
            trans.executeSql(deleteSql.statement, deleteSql.value, function (trans, result) {
                callback(null, result.rowsAffected);
            }, function (trans, error) {
                callback(error);
            });
        });
    }

    //批量执行一个sql数组、
    function batchExecuteSql(sqlArray, callback) {
        dbInstance.transaction(function (trans) {
            async.each(sqlArray, function (item, callback) {
                trans.executeSql(item.statement, item.value, function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    callback(error);
                });
            }, function (error) {
                callback(error);
            });
        });
    }

    //执行一条sql
    function execOneSql(sql, callback) {
        dbInstance.transaction(function (trans) {
            trans.executeSql(sql.statement, sql.value, function (trans, result) {
                callback(null, result.rowsAffected);
            }, function (trans, error) {
                callback(error);
            });
        });
    }

    //获取一个insert语句及参数，fitterArray过滤数组
    function getInsertSqlOfObj(tableName, obj, fitterArray) {
        var field = "(", values = "(", valuesPlace = [];
        var insertObj, key, insertSql;

//        //空对象
//        if (_.isEmpty(obj)) {
//            return;
//        }
//        //fitter内容有误
//        if (fitterArray && !_.isArray(fitterArray)) {
//            return;
//        }

        insertObj = fitterArray ? fitterObjAttr(obj, fitterArray) : obj;
        for (key in insertObj) {
            if (insertObj.hasOwnProperty(key)) {
                field += key + ",";
                values += "?,";
                valuesPlace.push(insertObj[key]);
            }
        }
        field = field.slice(0, field.length - 1) + ")";
        values = values.slice(0, values.length - 1) + ")";
        insertSql = "insert into " + tableName + field + " values" + values + ";";
        return {statement: insertSql, value: valuesPlace};
    }

    //根据对象id获取update语句及参数
    function getUpdateSqlOfObjId(tableName, obj, fitterArray) {
        var setFieldStr = "", valuesPlace = [];
        var updateObj, key, updateSql, id;

//        //空对象或者无id
//        if (_.isEmpty(obj) || !obj.id) {
//            return;
//        }
//        //fitter内容有误
//        if (fitterArray && !_.isArray(fitterArray)) {
//            return;
//        }

        updateObj = fitterArray ? fitterObjAttr(obj, fitterArray) : obj;

        for (key in updateObj) {
            if (updateObj.hasOwnProperty(key)) {
                if (key === "id") {
                    continue;
                }
                setFieldStr += key + "=?,";
                valuesPlace.push(updateObj[key]);
            }
        }
        id = updateObj.id;
        setFieldStr = setFieldStr.slice(0, setFieldStr.length - 1);
        updateSql = "update " + tableName + " set " + setFieldStr + " where id='" + id + "';";

        return {statement: updateSql, value: valuesPlace};
    }

    //根据id获取SQL删除语句
    function getDelSqlById(tableName, id) {
        var deleteSql = "delete from " + tableName + " where id=?;";
        var values = [id];
        return {statement: deleteSql, value: values};
    }

    //过滤对象属性
    function fitterObjAttr(obj, fitterArray) {
        var key, fitterResult = {};
        if (_.isArray(fitterArray)) {
            for (key in obj) {
                if (obj.hasOwnProperty(key) && fitterArray.indexOf(key.toString()) !== -1) {
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
        }
        return fitterResult;
    }
});