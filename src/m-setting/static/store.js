define(function (require, exports, module) {
    exports.init = init;
    exports.switchMenu = switchMenu;
    exports.paramsChange = paramsChange;
    exports.afterPageLoaded = afterPageLoaded;
    exports.loadModelAsync = loadModelAsync;
    exports.initContoller = initContoller;
    exports.fullscreen = true;

    require("./setting.css");

    var CONSTANT = {
        tb_enterprise: "tb_enterprise",
        tb_operateItem: "tb_operateItem",
        tb_standOperate: "tb_standOperateItem",
        NETWORK_NONE: 0,
        NETWORK_WIFI: 1,
        NETWORK_MOBILE: 2
    };
    var utils = require("mframework/package").utils;
    var dataUtils = require("mframework/package").dataUtils;
    var database = require("mframework/package").database;
    var address = require("mframework/package").addressData;

    var dbInstance = null;
    var moduleScope;

    function loadModelAsync(params, callback) {
        dbInstance = database.getDBInstance();
        var model = {};
        //店铺信息
        model.store = {};
        //临时变量模型
        model.temp = {};
        //店铺经营项目
        model.operateItem = [];
        model.standOperate = [];

        //省市区数据
        model.address = address.getAddress();

        initData(model, callback);
    }

    function initData(model, callback) {
        initStore(model, function (model) {
            initOperateItem(model, function (model) {
                initStandOperate(model, callback);
            });
        });
    }

    function initStandOperate(model, callback) {
        model.standOperate = [];
        var selItem = "select id,name from " + CONSTANT.tb_standOperate + ";";
        dbInstance.execQuery(selItem, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                model.standOperate.push(result.rows.item(i));
            }
            model.standOperate.push({
                id: "00000001",
                name: "美甲",
                enterprise_id: YILOS.ENTERPRISEID
            });
            model.standOperate.push({
                id: "00000002",
                name: "美发",
                enterprise_id: YILOS.ENTERPRISEID
            });
            callback(model)
        }, function (error) {
            utils.log("m-setting store.js initStandOperate", error);
            callback(model);
        });
    }

    //初始化经营项目
    function initOperateItem(model, callback) {
        model.operateItem = [];
        var selItem = "select id,name from " + CONSTANT.tb_operateItem + ";";
        dbInstance.execQuery(selItem, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                model.operateItem.push(result.rows.item(i));
            }
            callback(model)
        }, function (error) {
            utils.log("m-setting store.js initOperateItem", error);
            callback(model);
        });
    }

    //初始化店铺信息
    function initStore(model, callback) {
        var sqlStr = "select id,name,hours_begin,hours_end,logo,comment,admin_account,contact_phoneMobile,addr_state,addr_city,addr_area,addr_detail,addr_state_city_area,location from " + CONSTANT.tb_enterprise + ";";
        dbInstance.execQuery(sqlStr, [], function (result) {
            if (result.rows.length !== 0) {
                model.store = _.clone(result.rows.item(0));
            }
            //把null转换为""
            for (var key in model.store) {
                if (model.store.hasOwnProperty(key)) {
                    if (!model.store[key]) {
                        model.store[key] = "";
                    }
                }
            }
            callback(model);
        }, function (error) {
            utils.log("m-setting store.js initStore", error);
            callback(model);
        });
    }

    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;

        $scope.digestScope = function () {
            try {
                $scope.$digest()
            }
            catch (error) {
                console.log(error);
            }
        };

        //设置店铺头像
        $scope.getPicture = function (record, sourceType) {
            var oldPath;
            if (record.logo) {
                oldPath = record.logo.substring(7);//remove file://
            }
            utils.getPicture(sourceType, null, "nailshop", "userImage", function (error, path) {
                if (error) {
                    utils.log("m-setting store.js getPicture", error);
                    utils.showAreaFailMsg("#m-setting-store-area", "图片保存失败");
                    return;
                }
                var store = {};
                store.id = $scope.store.id;
                store.logo = path;
                store.modify_date = new Date().getTime();
                dataUtils.updateRecordById(CONSTANT.tb_enterprise, store, null, function (error, rowsAffected) {
                    if (error) {
                        utils.showAreaFailMsg("#m-setting-store-area", "图片保存失败");
                        utils.log("m-setting store.js getPicture", error);
                        return;
                    }
                    record.logo = path;
                    if (oldPath) {
                        utils.deleteFileByPath(oldPath);
                    }
                    $scope.digestScope();
                    database.updateBackupFlag(store.modify_date, YILOS_NAIL_MODULE.ENTERPRISE, null);
                    utils.showAreaSuccessMsg("#m-setting-store-area", "图片保存成功");
                });
            });
        };

        //编辑店铺信息
        $scope.editStoreInfo = function (action) {
            $scope.temp.action = action;
            $(".error-hint").hide();
            $("#m-setting-store-detail").hide();
            $("#m-setting-store-edit").show();
            $("#m-setting-edit-address-map").hide();
            var mapImgDom = $("#no-network-map-image").hide();
            $scope.storeTemp = _.clone($scope.store);

            if (action == "operate") {
                $scope.operateItemTemp = _.clone($scope.operateItem);
                //保持标准经营项目选中
                $(".standOperate-item").removeClass("stand-operate-color");
                _.each($scope.operateItemTemp, function (item) {
                    $("#standOperate-" + item.id).addClass("stand-operate-color");
                });

                //经营项目改变项
                $scope.temp.addItems = [];          //新增项目
                $scope.temp.delItems = [];          //删除项目
                return;
            }

            if (action == "address") {
                $("#m-setting-store-province-select").hide();
                $("#m-setting-store-city-select").hide();
                $("#m-setting-store-area-select").hide();
                if (!$scope.storeTemp.addr_state_city_area) {
                    $("#m-setting-store-addr_detail").hide();
                    $("#m-setting-store-province-select").show();
                }
                else {
                    //选择省市区的值
                    for (var i = 0; i < $scope.address.length; i++) {
                        if ($scope.address[i].name === $scope.storeTemp.addr_state) {
                            $scope.storeTemp.selectedProvince = $scope.address[i];
                            for (var j = 0; j < $scope.storeTemp.selectedProvince.cities.length; j++) {
                                if ($scope.storeTemp.selectedProvince.cities[j].name === $scope.store.addr_city) {
                                    $scope.storeTemp.selectedCity = $scope.storeTemp.selectedProvince.cities[j];
                                    for (var k = 0; k < $scope.storeTemp.selectedProvince.cities[j].areas.length; k++) {
                                        if ($scope.storeTemp.selectedProvince.cities[j].areas[k].name === $scope.storeTemp.addr_area) {
                                            $scope.storeTemp.selectedArea = $scope.storeTemp.selectedProvince.cities[j].areas[k];
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    var address = $scope.storeTemp.addr_state_city_area + $scope.storeTemp.addr_detail;
                    if ($scope.temp.map) {
                        movePointMap(address, function (error) {
                            if (error) {
                                utils.log("m-setting store.js editStoreInfo.movePointMap", error);
                            }
                        });
                    }
                    else {
                        initMap(address, function (error) {
                            if (error) {
                                utils.log("m-setting store.js editStoreInfo.initMap", error);
                            }
                        });
                    }
                    //没有网络隐藏地图绘制区域、显示地图图片
                    if (window.LosNailActivity.getNetworkState() == CONSTANT.NETWORK_NONE) {
                        $scope.store.location = YILOS.DOCPATH + YILOS.ENTERPRISEID + "/images/userImage/map_" + YILOS.ENTERPRISEID + "?" + Math.random();
                        mapImgDom.show();
                    }
                }
                return;
            }
            utils.showSoftKeyboard("#m-setting-store-edit-" + action, 500);
        };

        //编辑返回
        $scope.cancel = function () {
            $("#m-setting-store-detail").show();
            $("#m-setting-store-edit").hide();
        };

        //输入验证
        function checkInput() {
            var flag = true;
            var phoneErr = $("#store-error-phoneMobile").hide();

//            var nameErr = $("#store-error-name").hide();
//            var addressErr = $("#store-error-addr_detail").hide();
//            var commentErr = $("#store-error-comment").hide();

            if ($scope.storeTemp.contact_phoneMobile) {
                if (!utils.isPhoneNumber($scope.storeTemp.contact_phoneMobile)) {
                    flag = false;
                    phoneErr.show();
                }
            }

            return flag;
        }

        //保存店铺编辑信息
        $scope.editInfoSave = function (action) {
            var updateField = ["id", "modify_date"];
            if (!checkInput()) {
                return;
            }
            switch (action) {
                case "name":
                    updateField.push("name");
                    break;
                case "phone":
                    updateField.push("contact_phoneMobile");
                    break;
                case "comment":
                    updateField.push("comment");
                    break;
                case "hours":
                    updateField.push("hours_begin");
                    updateField.push("hours_end");
                    break;
                case "address":
                    updateField.push("addr_state");
                    updateField.push("addr_city");
                    updateField.push("addr_area");
                    updateField.push("addr_detail");
                    updateField.push("addr_state_city_area");
                    updateField.push("location");
                    $scope.storeTemp.addr_state = $scope.storeTemp.selectedProvince ? $scope.storeTemp.selectedProvince.name : "";
                    $scope.storeTemp.addr_city = $scope.storeTemp.selectedCity ? $scope.storeTemp.selectedCity.name : "";
                    $scope.storeTemp.addr_area = $scope.storeTemp.selectedArea ? $scope.storeTemp.selectedArea.name : "";
                    break;
            }

            var sqlArray = [];

            var modifyDate = new Date().getTime();
            var store = {
                id: $scope.storeTemp.id,
                logo: $scope.store.logo,//保持log可继续选择
                name: $scope.storeTemp.name,
                contact_phoneMobile: $scope.storeTemp.contact_phoneMobile,
                addr_state: $scope.storeTemp.addr_state,
                addr_city: $scope.storeTemp.addr_city,
                addr_area: $scope.storeTemp.addr_area,
                addr_detail: $scope.storeTemp.addr_detail,
                addr_state_city_area: $scope.storeTemp.addr_state_city_area,
                comment: $scope.storeTemp.comment,
                hours_begin: $scope.storeTemp.hours_begin,
                hours_end: $scope.storeTemp.hours_end,
                modify_date: modifyDate
            };

            if (action === "address") {
                store.location = YILOS.DOCPATH + YILOS.ENTERPRISEID + "/images/userImage/map_" + YILOS.ENTERPRISEID;
            }
            else {
                store.location = $scope.storeTemp.location;
            }

            //修改该经营项目时不需要更新user字段
            if (updateField.length !== 2) {
                var sqlStr = dataUtils.getUpdateSqlOfObjId(CONSTANT.tb_enterprise, store, updateField);
                sqlArray.push(sqlStr);
            }

            if (action == "operate") {
                //新增经营项目
                _.each($scope.temp.addItems, function (item) {
                    item.create_date = modifyDate;
                    sqlArray.push(dataUtils.getInsertSqlOfObj(CONSTANT.tb_operateItem, item, ["id", "name", "enterprise_id", "create_date"]));
                });

                //删除经营项目
                _.each($scope.temp.delItems, function (item) {
                    sqlArray.push(dataUtils.getDelSqlById(CONSTANT.tb_operateItem, item.id));
                });
            }

            dataUtils.batchExecuteSql(sqlArray, function (error) {
                if (error) {
                    utils.showAreaFailMsg("#m-setting-store-edit", "修改失败");
                    utils.log("m-setting store.js editInfoSave", error);
                    return;
                }
                $scope.store = store;
                //将选择的省市区对象继续保留
                $scope.store.selectedProvince = $scope.storeTemp.selectedProvince ? $scope.storeTemp.selectedProvince : "";
                $scope.store.selectedCity = $scope.storeTemp.selectedCity ? $scope.storeTemp.selectedCity : "";
                $scope.store.selectedArea = $scope.storeTemp.selectedArea ? $scope.storeTemp.selectedArea : "";
                $scope.store.admin_account = $scope.storeTemp.admin_account;
                if (action == "operate") {
                    $scope.operateItem = $scope.operateItemTemp;
                }
                $scope.temp.addItems = [];
                $scope.temp.delItems = [];
                if (action == "address") {
                    //输入地址后直接保存
                    var address = $scope.storeTemp.addr_state_city_area + $scope.storeTemp.addr_detail;
                    if ($scope.temp.map) {
                        movePointMap(address, function (error) {
                            if (error) {
                                utils.log("m-setting store.js editInfoSave.movePointMap", error);
                            }
                            $scope.downloadStoreLocImg();
                        });
                    }
                    else {
                        initMap(address, function (error) {
                            if (error) {
                                utils.log("m-setting store.js editInfoSave.initMap", error);
                            }
                            $scope.downloadStoreLocImg();
                        });
                    }
                }
                setTimeout(function () {
                    $scope.digestScope();
                    $scope.cancel();
                }, 2000);
                database.updateBackupFlag(store.modify_date, YILOS_NAIL_MODULE.ENTERPRISE, null);
                var storeInfo = {
                    name: store.name,
                    contact_phoneMobile: store.contact_phoneMobile,
                    addr_state_city_area: store.addr_state_city_area,
                    addr_detail: store.addr_detail
                };
                utils.setStoreInfo(storeInfo);
                utils.showAreaSuccessMsg("#m-setting-store-edit", "修改成功");
            });
        };

        //手工添加
        $scope.addOperateItem = function () {
            var operateList;
            var operateStr;
            if ($scope.temp.newOperateStr) {
                operateStr = $scope.temp.newOperateStr.replace(/，/ig, ",");
            }
            operateList = operateStr.split(",");

            async.each(operateList, function (item, callback) {
                if (item && item.length < 16) {
                    database.getUniqueId(YILOS.ENTERPRISEID, function (error, trans, id) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        var temp = {
                            id: id,
                            name: item,
                            enterprise_id: YILOS.ENTERPRISEID
                        };
                        $scope.temp.addItems.push(temp);
                        $scope.operateItemTemp.push(temp);
                        callback(null);
                    });
                }
                else {
                    utils.showGlobalMsg("部分项目添加失败、名称过长或者过短");
                    callback(null);
                }
            }, function (error) {
                if (error) {
                    utils.log("m-setting store.js addOperateItem", error);
                    return;
                }
                $scope.temp.newOperateStr = "";
                $scope.digestScope();
            });
        };

        //删除经营项目
        $scope.delOperateItem = function (operateItem) {
            _.each($scope.operateItemTemp, function (item, index) {
                if (item.id === operateItem.id) {
                    $scope.operateItemTemp.splice(index, 1);
                }
            });

            var isItemExists = true;
            for (var i = 0; i < $scope.temp.addItems.length; i++) {
                if ($scope.temp.addItems[i].id === operateItem.id) {
                    $scope.temp.addItems.splice(i, 1);
                    isItemExists = false;
                    break;
                }
            }
            if (isItemExists) {
                $scope.temp.delItems.push(operateItem);
            }
            $("#standOperate-" + operateItem.id).removeClass("stand-operate-color");
        };

        $scope.modalDialogClose = function () {
            $.fancybox.close();
        };

        //显示地址区域选择
        $scope.showAddSel = function (selItem) {
            $("#m-setting-store-province-select").hide();
            $("#m-setting-store-city-select").hide();
            $("#m-setting-store-area-select").hide();
            $("#m-setting-edit-address-map").hide();
            $("#no-network-map-image").hide();
            $("#m-setting-store-addr_detail").hide();
            $("#m-setting-store-" + selItem + "-select").show();
            switch (selItem) {
                case "province":
                    $scope.storeTemp.selectedCity = "";
                    $scope.storeTemp.selectedArea = "";
                    break;
                case "city":
                    $scope.storeTemp.selectedArea = "";
                    break;
            }
        };

        //选取省市区
        $scope.selProvince = function (province) {
            $scope.storeTemp.selectedProvince = province;
            $scope.storeTemp.addr_state_city_area = $scope.storeTemp.selectedProvince.name;
            $("#m-setting-store-province-select").hide();
            $("#m-setting-store-city-select").show();
        };
        $scope.selCity = function (city) {
            $scope.storeTemp.selectedCity = city;
            $scope.storeTemp.addr_state_city_area = $scope.storeTemp.selectedProvince.name + $scope.storeTemp.selectedCity.name;
            $("#m-setting-store-city-select").hide();
            $("#m-setting-store-area-select").show();
        };
        $scope.selArea = function (area) {
            $scope.storeTemp.selectedArea = area;
            $("#m-setting-store-area-select").hide();
            $("#m-setting-store-addr_detail").show();
            var address = $scope.storeTemp.selectedProvince.name + $scope.storeTemp.selectedCity.name + $scope.storeTemp.selectedArea.name;
            $scope.storeTemp.addr_state_city_area = address;
            if ($scope.temp.map) {
                movePointMap(address, function (error) {
                    if (error) {
                        utils.log("m-setting store.js selArea.movePointMap", error);
                    }
                });
            }
            else {
                initMap(address, function (error) {
                    if (error) {
                        utils.log("m-setting store.js selArea.initMap", error);
                    }
                });
            }
        };

        //移动地图点
        function movePointMap(address, callback) {
            if (window.LosNailActivity) {
                if (window.LosNailActivity.getNetworkState() !== CONSTANT.NETWORK_NONE) {
                    $("#no-network-map-image").hide();
                    //防止选择省市区未完成点击保存页面显示错误
                    $("#m-setting-store-province-select").hide();
                    $("#m-setting-store-city-select").hide();
                    $("#m-setting-store-area-select").hide();
                    $("#m-setting-edit-address-map").show();
                    $scope.temp.myGeo.getPoint(address, function (point) {
                        if (point) {
                            $scope.temp.map.removeOverlay($scope.temp.localMarker); //移除上一个标注点
                            $scope.temp.localPoint = point;
                            $scope.temp.localMarker = new BMap.Marker(point);
                            $scope.temp.map.setCenter(point);
                            $scope.temp.map.addOverlay($scope.temp.localMarker);
                            callback(null);
                        }
                        else {
                            callback("移动地图点失败,未查询到该地址" + address);
                        }
                    });
                }
                else {
                    callback(null, "没有网络");
                }
            }
            else {
                callback("插件不存在");
            }

        }

        //用address初始化地图并显示
        function initMap(address, callback) {
            if (window.LosNailActivity) {
                if (window.LosNailActivity.getNetworkState() !== CONSTANT.NETWORK_NONE) {
                    $("#no-network-map-image").hide();
                    //防止选择省市区未完成点击保存页面显示错误
                    $("#m-setting-store-province-select").hide();
                    $("#m-setting-store-city-select").hide();
                    $("#m-setting-store-area-select").hide();
                    $("#m-setting-edit-address-map").show();
                    $scope.temp.map = new BMap.Map("m-setting-edit-address-map");              // 创建Map实例
                    $scope.temp.myGeo = new BMap.Geocoder();                        // 创建地址解析器实例
                    // 将地址解析结果显示在地图上,并调整地图视野
                    $scope.temp.myGeo.getPoint(address, function (point) {
                        if (point) {
                            $scope.temp.localPoint = point;
                            $scope.temp.localMarker = new BMap.Marker(point);
                            $scope.temp.map.centerAndZoom(point, 16);
                            $scope.temp.map.addOverlay($scope.temp.localMarker);
                            callback(null);
                        }
                        else {
                            callback("初始化地图失败、未查询到该地址" + address);
                        }
                    });
                }
                else {
                    $("#no-network-map-image").show();
                    callback(null, "没有网络");
                }
            }
            else {
                callback("插件不存在");
            }
        }

        //在地图上标注出位置
        $scope.showAddPointOfMap = function () {
            if (window.LosNailActivity) {
                if (window.LosNailActivity.getNetworkState() !== CONSTANT.NETWORK_NONE) {
                    if ($scope.storeTemp.addr_state_city_area) {
                        var addressStandard = $scope.storeTemp.addr_state_city_area;    //标准省市区地址
                        var addressDetail = $scope.storeTemp.addr_state_city_area + $scope.storeTemp.addr_detail;   //街道地址
                        if (!$scope.temp.map || !$scope.temp.myGeo) {
                            initMap(addressDetail, function (error) {
                                if (error) {
                                    utils.log("m-setting store.js showAddPointOfMap.initMap", error);
                                    return;
                                }
                                markerPoint();
                            });
                        }
                        else {
                            markerPoint();
                        }


                        function markerPoint() {
                            async.waterfall([getStandardAdd, getDetailAdd], function (error, result) {
                                if (result) {
                                    $scope.temp.map.removeOverlay($scope.temp.localMarker);
                                    $scope.temp.localPoint = result;
                                    $scope.temp.localMarker = new BMap.Marker(result);
                                    $scope.temp.map.setCenter(result);
                                    $scope.temp.map.addOverlay($scope.temp.localMarker);
                                }
                            });
                        }

                        //获取标准省市区域地址
                        function getStandardAdd(callback) {
                            $scope.temp.myGeo.getPoint(addressStandard, function (point) {
                                callback(null, point);
                            });
                        }

                        //获取详细街道地址
                        function getDetailAdd(standPoint, callback) {
                            if (!standPoint) {
                                callback(null, null);
                                return;
                            }
                            $scope.temp.myGeo.getPoint(addressDetail, function (point) {
                                if (point) {
                                    //街道地址输入后地图搜索结果未变、可能街道地址输入有误
                                    if (point.lat === standPoint.lat && point.lng === standPoint.lng) {
                                    }
                                }
                                callback(null, point);
                            });
                        }
                    }
                }
                else {
                    utils.showAreaFailMsg("#m-setting-store-edit", "没有网络,不能获取地图信息");
                }
            }
        };

        //保存店铺位置图片
        $scope.downloadStoreLocImg = function () {
            var url, path;
            if ($scope.temp.localPoint) {
                url = "http://api.map.baidu.com/staticimage?center=" + $scope.temp.localPoint.lng + "," + $scope.temp.localPoint.lat + "&width=621&height=456&zoom=16&markers=" + $scope.temp.localPoint.lng + "," + $scope.temp.localPoint.lat;
            }
            path = YILOS.DOCPATH + YILOS.ENTERPRISEID + "/images/userImage/map_" + YILOS.ENTERPRISEID;
            var config = {
                url: url,
                savePath: path
            };

            if (cordova && cordova.platformId == "ios") {
                if (window.LosNailActivity) {
                    window.LosNailActivity.downloadStoreLocImg(url, path, function () {
                        $scope.store.location = YILOS.DOCPATH + YILOS.ENTERPRISEID + "/images/userImage/map_" + YILOS.ENTERPRISEID + "?" + Math.random();
                        $scope.digestScope();
                    });
                }
            } else {
                downloadBaiduMapImg(config, function (error) {
                    if (error) {
                        if (error == "noNetwork") {
                            showMsg("无网络,地图图片保存失败");
                        }
                        else {
                            showMsg("地图图片保存失败");
                            utils.log("m-setting store.js downloadStoreLocImg.downloadBaiduMapImg", error);
                        }
                        return;
                    }
                    $scope.store.location = YILOS.DOCPATH + YILOS.ENTERPRISEID + "/images/userImage/map_" + YILOS.ENTERPRISEID + "?" + Math.random();
                    $scope.digestScope();
                });
            }


        };

        function showMsg(msg) {
            utils.showTips(msg);
        }

        //百度地图静态图下载
        function downloadBaiduMapImg(config, callback) {
            if (window.plugins.DownloadFileAsync) {
                window.plugins.DownloadFileAsync.downloadFile(config, function () {
                    callback(null);
                }, function (error) {
                    callback(error)
                });
            }
            else {
                callback("插件不存在");
            }
        }

        //选择标准项目
        $scope.selStandOperate = function (operateItem) {
            $("#standOperate-" + operateItem.id).toggleClass("stand-operate-color");

            var operateExists = false;     //考虑移除某项
            var addExists = false;
            var delExists = false;

            _.each($scope.operateItem, function (item) {
                if (item.id === operateItem.id) {
                    operateExists = true;
                }
            });

            if (operateExists) {
                //删除或者是添加
                _.each($scope.temp.delItems, function (item, index) {
                    if (item.id === operateItem.id) {
                        delExists = true;
                        $scope.temp.delItems.splice(index, 1);
                    }
                });
                if (!delExists) {
                    $scope.temp.delItems.push(operateItem);
                }
            }
            else {
                _.each($scope.temp.addItems, function (item, index) {
                    if (item.id === operateItem.id) {
                        addExists = true;
                        $scope.temp.addItems.splice(index, 1)
                    }
                });
                if (!addExists) {
                    $scope.temp.addItems.push(operateItem);
                }
            }

            var tempOperateExists = false;
            for (var i = 0; i < $scope.operateItemTemp.length; i++) {
                if (operateItem.id === $scope.operateItemTemp[i].id) {
                    $scope.operateItemTemp.splice(i, 1);
                    tempOperateExists = true;
                    break;
                }
            }
            if (!tempOperateExists) {
                $scope.operateItemTemp.push(operateItem);
            }
        };

        //汉化action
        $scope.transAction = function (action) {
            var actionCN = "";
            switch (action) {
                case "name" :
                    actionCN = "修改店名";
                    break;
                case "phone":
                    actionCN = "修改电话";
                    break;
                case "address":
                    actionCN = "修改地址";
                    break;
                case "hours":
                    actionCN = "修改经营时间";
                    break;
                case "operate":
                    actionCN = "修改经营项目";
                    break;
                case "comment":
                    actionCN = "修改简介";
                    break;
            }
            return actionCN;
        };

        //选择营业开始时间
        $scope.selBeginHours = function ($event) {
            showTimeSelDia({
                title: "开始时间",
                hour: 10,
                minute: 0
            }, $event.target, function (error, time) {
                if (error) {
                    utils.log("m-setting store.js selBeginHours.showTimeSelDia", error);
                    return;
                }
                $scope.storeTemp.hours_begin = time;
                $scope.digestScope();
            })
        };

        //选择营业结束时间
        $scope.selEndHours = function ($event) {
            showTimeSelDia({
                title: "结束时间",
                hour: 20,
                minute: 0
            }, $event.target, function (error, time) {
                if (error) {
                    utils.log("m-setting store.js selEndHours.showTimeSelDia", error);
                    return;
                }
                $scope.storeTemp.hours_end = time;
                $scope.digestScope();
            })
        };

        function showTimeSelDia(config, el, callback) {
            if (cordova.platformId == "ios") {
                var c_date = (new Date()).setHours(config.hour);
                var options = {
                    date: new Date((new Date(c_date)).setMinutes(config.minute)),
                    x: $(el).offset().left + $(el).outerWidth() / 2,
                    y: $(el).offset().top + $(el).outerHeight(),
                    mode: 'time'
                };
                if ($(el).val() == "") {
                    $(el).val(new Date((new Date(c_date)).setMinutes(config.minute)).Format("hh:mm"));
                }
                // calling show() function with options and a result handler
                datePicker.show(options, function (date) {
                    callback(null, date.Format("hh:mm"));
                });
            }
            else if (window.plugins.DatePicker) {
                window.plugins.DatePicker.showTimeDia(config, function (result) {
                    callback(null, result.time);
                }, function (error) {
                    callback(error);
                });
            }
            else {
                callback("时间选择插件不存在");
            }
        }
    }

    function init() {
    }


    function afterPageLoaded() {
        $("#m-setting-store-area").height($(window).height());
        $("#m-setting-content").height($(window).height() - $("#m-setting-title").outerHeight());
    }


    function switchMenu(params) {
    }

    function paramsChange(params) {
    }
});