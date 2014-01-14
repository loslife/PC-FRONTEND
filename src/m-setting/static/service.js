define(function (require, exports, module) {
    //暴露全局初始化方法
    exports.init = init;
    //一级菜单切换回调
    exports.switchMenu = switchMenu;
    //URL参数变更回调
    exports.paramsChange = paramsChange;
    //模块页面完全加载完成后回调
    exports.afterPageLoaded = afterPageLoaded;
    //模块模型初始化接口
    exports.loadModelAsync = loadModelAsync;
    //模块控制器初始化接口
    exports.initContoller = initContoller;
    exports.fullscreen = true;
    require("./setting.css")
    //基础服务
    var utils = require("mframework/package").utils, 			        //全局公共函数
        database = require("mframework/package").database,		//数据操作服务
        db = null,		//数据操作服务
        cache = utils.getCache();

    var moduleScope;

    function loadModelAsync(params, callback) {
        db = database.getDBInstance();
        var model = {
            productCategories: [],
            productCategorySelected: "",
            productViewArray: {},
            newProductRecord: {},
            newServiceCateRecord: {},
            action: "index"
        };

        model.licenseInfo = {};
        model.temp = {};

        getMaxServiceCount(function (error, maxServiceCount) {
            if (error) {
                utils.log("m-setting service.js getMaxServiceCount", error);
                model.licenseInfo.maxServiceCount = 50;
            }
            else {
                model.licenseInfo.maxServiceCount = maxServiceCount;
            }

            //初始化服务项数据
            if (YILOS.onDeviceReady) {
                initData(model, callback)
            } else {
                global.eventEmitter.addListener("data-init-success", function () {
                    initData(model, callback)
                });
            }
        });
    }

    function getMaxServiceCount(callback) {
        utils.getUserData(function (error, data) {
            if (error) {
                callback(error);
                return;
            }
            if (data.maxServiceCount) {
                callback(null, data.maxServiceCount);
            }
            else {
                callback(null, 50);
            }
        })
    }

    function initData(model, callback) {
        //查询数据库，查询出所有服务类型
        //查询出当前类型对应的商品类型
        model.productCategorieMap = cache.getObject("service.category.map");
        model.productList = cache.getObject("service.itemList");
        model.productCategories = cache.getObject("service.productCategories");

        if (model.productCategorieMap && model.productList && model.productCategories) {
            var proSelTemp = _.pairs(model.productCategorieMap);
            if (proSelTemp.length !== 0) {
                if (!model.productSelected) {
                    model.productSelected = proSelTemp[0][1][0];
                }
                if (!model.productCategorySelected) {
                    model.productCategorySelected = proSelTemp[0][0];
                }
                model.productViewArray = model.productCategorieMap[model.productCategorySelected];
            }
            else {
                model.showViewArray = {};
                model.productCategorySelected = "all";
            }
            callback(model);
        } else {
            model.productCategorieMap = {};
            model.productList = {};
            model.productCategories = {};
            async.waterfall([queryCate, queryItems], function (error) {
                if (error) {
                    utils.log("m-setting service.js initData", error);
                }
                //非缓存数据、重新初始化保持选中某项
                var proSelTemp = _.pairs(model.productCategorieMap);
                if (proSelTemp.length !== 0) {
                    if (!model.productSelected) {
                        model.productSelected = proSelTemp[0][1][0];
                    }
                    if (!model.productCategorySelected) {
                        model.productCategorySelected = proSelTemp[0][0];
                    }
                    model.productViewArray = model.productCategorieMap[model.productCategorySelected];
                }
                else {
                    model.showViewArray = {};
                    model.productCategorySelected = "all";
                }
                callback(model);
            })
        }

        function queryCate(callback) {
            db.transaction(function (tx) {
                tx.executeSql("select a.id ,a.name from tb_service_cate a", [], function (tx, result) {
                    var len = result.rows.length;
                    for (var i = 0; i < len; i++) {
                        var tmp = result.rows.item(i);
                        if (i === 0 && !model.productCategorySelected) {
                            model.productCategorySelected = tmp.id;
                        }
                        if (!model.productCategorieMap[tmp.id]) {
                            model.productCategories[tmp.id] = tmp;
                            model.productCategorieMap[tmp.id] = [];
                        }
                    }
                    cache.set("service.productCategories", model.productCategories, true);
                    callback(null);

                }, function (tx, error) {
                    callback(error);
                })
            });
        }

        function queryItems(callback) {
            db.transaction(function (tx) {
                tx.executeSql("select a.id c_id,a.name c_name,a.img,b.id,b.name,b.comment,b.baseInfo_image,b.baseInfo_code,b.prices_salesPrice,b.create_date from tb_service_cate a,tb_service b where a.id == b.serviceCategory_id", [], function (tx, result) {
                    var len = result.rows.length;
                    for (var i = 0; i < len; i++) {
                        var tmp = result.rows.item(i);
                        if (i == 0) {
                            tmp.selected = true;
                            model.productSelected = tmp;

                        }
                        if (!model.productCategorieMap[tmp.c_id]) {
                            model.productCategorieMap[tmp.c_id] = [];
                        }
                        if (i == 0) {
                            model.productViewArray = model.productCategorieMap[tmp.c_id];
                        }
                        model.productCategorieMap[tmp.c_id].push(tmp);
                        model.productList[tmp.id] = tmp;
                    }
                    cache.set("service.category.map", model.productCategorieMap, true);
                    cache.set("service.itemList", model.productList, true);
                    cache.set("service.productCategories", model.productCategories, true);
                    callback(null);

                }, function (tx, error) {
                    callback(error);
                })
            });
        }
    }

    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;

        $scope.showImageStyle = function (product) {
            var main_container_height = $("#main-container").height();
            if ($scope.showImageStyle.main_container_height) {
                main_container_height = $scope.showImageStyle.main_container_height;
            } else {
                main_container_height = $("#main-container").height();
            }
            var title_height = $("#m-setting-service-area .m-setting-title").height() + 18;

            var tmp_img_size = (main_container_height - title_height) + "px " + (main_container_height - title_height) + "px";
            if (!product) {
                return {};
            }
            var img = product.baseInfo_image;
            return {
                "background-image": "url(" + img + ")",
                "background-size": tmp_img_size,
                "width": main_container_height - title_height,
                "height": main_container_height - title_height
            }
        }

        $scope.choiceCate = function (cate, key) {
            $scope.productViewArray = cate;
            $scope.productCategorySelected = key;
        }

        $scope.choiceAllCate = function (cate, key) {
            $scope.productViewArray = $scope.productList;
            $scope.productCategorySelected = "all";
        }


        $scope.selectProduct = function (product, $event) {
            $scope.productSelected = product;
            $scope.productSelected.baseInfo_image = product.baseInfo_image;
            $scope.action = "info";
        }
        $scope.backIndex = function () {
            $scope.action = "index";
        }

        $scope.newProductCate = function (cate, $event) {
            $scope.action = "newcate";
            cleanCheckServiceCate();
            utils.showSoftKeyboard("#m-setting-serviceCate-add", 500);
        }

        //检查服务项目上限
        function checkServiceCount(callback) {
            //存入temp中避免每次查询
            if ($scope.temp.currentServiceCount) {
                if ($scope.temp.currentServiceCount < $scope.licenseInfo.maxServiceCount) {
                    callback(null, false);//服务项未达到上限
                }
                else {
                    callback(null, true);//服务项达到上限
                }
            }
            else {
                var selectServiceCount = "select count(*) as count from tb_service;";
                db.execQuery(selectServiceCount, [], function (result) {
                    if (result.rows.length === 0) {
                        callback("查询服务数量出错!");
                        return;
                    }
                    $scope.temp.currentServiceCount = result.rows.item(0).count;
                    if ($scope.temp.currentServiceCount < $scope.licenseInfo.maxServiceCount) {
                        callback(null, false);//服务项未达到上限
                    }
                    else {
                        callback(null, true);//服务项达到上限
                    }
                }, function (error) {
                    callback(error);
                });
            }
        }

        $scope.newProduct = function (cate, $event) {
            checkServiceCount(function (error, reachMaxCount) {
                if (error) {
                    utils.showGlobalMsg("系统错误!");
                    utils.log("m-setting service.js checkServiceCount", error);
                    return;
                }
                if (reachMaxCount) {
                    utils.showGlobalMsg("服务项数量已达到上限,请联系客服人员升级版本!");
                }
                else {
                    $scope.action = "new";
                    $scope.newProductRecord.baseInfo_image = "";
                    $scope.newProductRecord.name = "";
                    $scope.newProductRecord.prices_salesPrice = "";
                    $scope.newProductRecord.comment = "";
                    cleanCheckService();
                    utils.showSoftKeyboard("#m-setting-service-add-name", 500);
                }
            });
        };

        $scope.commitNewServiceCate = function (newServiceCateRecord) {
            if (!checkServiceCate()) {
                return;
            }

            database.getUniqueId(YILOS.ENTERPRISEID, function (error, txx, id) {
                var createDate = new Date().getTime();
                txx.executeSql("INSERT INTO tb_service_cate (name,desc,create_date,id,enterprise_id) VALUES (?,?,?,?,?)",
                    [newServiceCateRecord.name, newServiceCateRecord.desc, createDate, id, YILOS.ENTERPRISEID ],
                    function (tx, results) {
                        //更新备份表
                        database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.SERVICE, null);
                        cache.clear("service.category.map", true);
                        cache.clear("service.productCategories", true);
                        global.eventEmitter.emitEvent('setting.service.servicecate.change');
                        $scope.newServiceCateRecord.name = "";
                        initData(moduleScope, function (moduleScope) {
                            moduleScope.$apply(function () {
                                $scope.choiceCate({}, id);
                            })
                        });
                        //提示成功、成功后2s后返回
                        utils.showAreaSuccessMsg("#m-setting-more-servicecate", "新增成功");
                        setTimeout(function () {
                            $scope.backIndex();
                            try {
                                $scope.$digest();
                            }
                            catch (error) {
                                console.log(error);
                            }
                        }, 2000);
                    },
                    function (tx, error) {
                        utils.log("m-setting service.js", error);
                        utils.showAreaFailMsg("#m-setting-more-servicecate commitNewServiceCate", "新增失败");
                    });
            });
        }

        $scope.commitNewService = function (newProductRecord) {
            if (!checkService(newProductRecord)) {
                return;
            }
            database.getUniqueCode("tb_service", 4, function (error, txx, code) {
                database.getUniqueId(YILOS.ENTERPRISEID, function (error, txx, id) {
                    var createDate = new Date().getTime();
                    txx.executeSql("INSERT INTO tb_service (name,comment,baseInfo_image,prices_salesPrice,serviceCategory_id,create_date,baseInfo_code,id,enterprise_id) VALUES (?,?,?,?,?,?,?,?,?)",
                        [newProductRecord.name, newProductRecord.comment, newProductRecord.baseInfo_image, newProductRecord.prices_salesPrice, $scope.productCategorySelected, createDate, code, id, YILOS.ENTERPRISEID],
                        function (tx, results) {
                            //更新备份表
                            database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.SERVICE, null);
                            cache.clear("service.itemList", true);
                            global.eventEmitter.emitEvent('setting.service.service.change');
                            initData(moduleScope, function (moduleScope) {
                                moduleScope.$apply(function () {
                                    moduleScope.newServiceCateRecord = {};
                                })
                            });
                            //新增服务成功、当前服务数量+1
                            $scope.temp.currentServiceCount++;

                            //提示成功、2s后返回
                            utils.showAreaSuccessMsg("#m-setting-service-morePopup", "新增成功");
                            setTimeout(function () {
                                $scope.backIndex();
                                try {
                                    $scope.$digest();
                                }
                                catch (error) {
                                    console.log(error);
                                }
                            }, 2000);
                        },
                        function (tx, error) {
                            utils.showAreaFailMsg("#m-setting-service-morePopup", "新增失败");
                            utils.log("m-setting service.js commitNewService", error);
                        });
                });
            });
        };

        $scope.initEditService = function (product) {
            $scope.editSelected = _.clone(product);
            $scope.action = "edit";
            cleanCheckService();
            utils.showSoftKeyboard("#m-setting-service-edit-name", 500);
        }
        $scope.cancelEditService = function () {
            $scope.action = "info";
        }

        $scope.editService = function (productSelected) {
            if (!checkService(productSelected)) {
                return;
            }

            //获取更新的标签信息
            var categoryIds = "";
            db.transaction(function (tx) {
                var modifyDate = new Date().getTime();
                tx.executeSql("update tb_service set name=?,baseInfo_image=?,prices_salesPrice=?,serviceCategory_id=?,comment=?,modify_date=? where id=? ",
                    [productSelected.name, productSelected.baseInfo_image, productSelected.prices_salesPrice, productSelected.c_id, productSelected.comment, modifyDate, productSelected.id],
                    function (tx, results) {
                        //更新备份表
                        database.updateBackupFlag(modifyDate, YILOS_NAIL_MODULE.SERVICE, null);
                        cache.clear("service.category.map", true);
                        cache.clear("service.itemList", true);
                        cache.clear("service.productCategories", true);
                        global.eventEmitter.emitEvent('setting.service.service.change');
                        initData(moduleScope, function (moduleScope) {
                            if ($scope.productCategorySelected == 'all') {
                                $scope.choiceAllCate();
                            }
                            moduleScope.$digest();
                        });

                        //提示成功、2s后返回
                        utils.showAreaSuccessMsg("#m-setting-service-eidtPopup", "修改成功");
                        setTimeout(function () {
                            $scope.backIndex();
                            try {
                                $scope.$digest();
                            }
                            catch (error) {
                                console.log(error);
                            }
                        }, 2000);
                    }, function (tx, error) {
                        utils.log("m-setting service.js editService", error);
                        utils.showAreaFailMsg("#m-setting-service-eidtPopup", "修改失败");
                    });
            });
        }
        $scope.editServiceCate = function (productCateSelected) {
            if (!checkServiceCate()) {
                return;
            }
            db.transaction(function (tx) {
                var modifyDate = new Date().getTime();
                tx.executeSql("update tb_service_cate set name=?,desc=?,modify_date=? where id=?",
                    [productCateSelected.name, productCateSelected.desc, modifyDate, productCateSelected.id],
                    function (tx, results) {
                        //更新备份表
                        database.updateBackupFlag(modifyDate, YILOS_NAIL_MODULE.SERVICE, null);
                        $scope.backIndex();
                        cache.clear("service.category.map", true);
                        cache.clear("service.productCategories", true);
                        global.eventEmitter.emitEvent('setting.service.servicecate.change');
                        initData(moduleScope, function (moduleScope) {
                            moduleScope.$digest();
                        })
                    }, function (tx, error) {
                        utils.log("m-setting service.js editServiceCate", error);
                        utils.showAreaFailMsg("#m-setting-servicecate-eidtPopup", "修改失败");
                    })
            });
        }


        $scope.initDeleteServiceCate = function () {
            $("#m-setting-service-cate-delete .m-setting-addMsg").html("");
            $("#m-setting-service-cate-delete .m-setting-addMsg").hide();
            $.fancybox.open("#m-setting-service-cate-delete", {
                openEffect: 'none',
                closeEffect: 'none',
                closeBtn: false,
                closeClick: false,
                autoSize: false,
                minHeight: 50,
                autoHeight: true,
                autoWidth: true,
                fitToView: true,
                padding: 0,
                margin: 0,
                helpers: {
                    overlay: {
                        closeClick: false
                    }
                }
            });
        }
        $scope.initDeleteServiceItem = function () {
            $("#m-setting-service-delete .m-setting-addMsg").html("");
            $("#m-setting-service-delete .m-setting-addMsg").hide();
            $.fancybox.open("#m-setting-service-delete", {
                openEffect: 'none',
                closeEffect: 'none',
                closeBtn: false,
                closeClick: false,
                minHeight: 50,
                autoSize: false,
                autoHeight: true,
                autoWidth: true,
                fitToView: true,
                padding: 0,
                margin: 0,
                helpers: {
                    overlay: {
                        closeClick: false
                    }
                }
            });
        }

        $scope.deleteServiceCate = function (productCateSelected, $event) {
            try {
                $event.preventDefault();
            } catch (e) {

            }
            db.transaction(function (tx) {
                tx.executeSql("select count(id) count from tb_service where serviceCategory_id='" + productCateSelected.id + "'", [], function (tx, result) {
                    var len = result.rows.item(0).count;
                    if (len > 0) {
                        utils.showAreaFailMsg("#m-setting-service-cate-delete", "分类下存在关联服务信息,请先删除分类下所有服务项");
                    } else {
                        tx.executeSql("delete from tb_service_cate where id='" + productCateSelected.id + "'", [], function (tx, result) {
                            //更新备份表
                            database.updateBackupFlag(new Date().getTime(), YILOS_NAIL_MODULE.SERVICE, null);
                            cache.clear("service.category.map", true);
                            cache.clear("service.productCategories", true);
                            global.eventEmitter.emitEvent('setting.service.servicecate.change');
                            initData(moduleScope, function (moduleScope) {
                                var proSelTemp = _.pairs($scope.productCategorieMap);
                                if (proSelTemp.length !== 0) {
                                    $scope.productSelected = proSelTemp[0][1][0];
                                    $scope.productCategorySelected = proSelTemp[0][0];
                                    $scope.productViewArray = $scope.productCategorieMap[$scope.productCategorySelected];
                                }
                                else {
                                    $scope.showViewArray = {};
                                    $scope.productCategorySelected = "all";
                                }
                                moduleScope.$digest();
                            });

                            utils.showAreaSuccessMsg("#m-setting-service-cate-delete", "删除成功");
                            setTimeout(function () {
                                $scope.modalDialogClose();
                                $scope.backIndex();
                                try {
                                    $scope.$digest();
                                }
                                catch (error) {
                                    console.log(error);
                                }
                            }, 2000);

                        }, function (tx, error) {
                            utils.log("m-setting service.js deleteServiceCate", error);
                            utils.showAreaFailMsg("#m-setting-srvice-cate-delete", "删除失败");
                        });
                    }
                }, function (tx, error) {
                    utils.showAreaFailMsg("#m-setting-srvice-cate-delete", "删除失败");
                    utils.log("m-setting service.js deleteServiceCate", error);
                })
            });
        }

        $scope.deleteService = function (productSelected, $event) {
            try {
                $event.preventDefault();
                $event.stopPropagation();
            } catch (e) {

            }

            db.transaction(function (tx) {
                tx.executeSql("delete from tb_service where id='" + productSelected.id + "'", [], function (tx, result) {
                    //更新备份表
                    database.updateBackupFlag(new Date().getTime(), YILOS_NAIL_MODULE.SERVICE, null);
                    cache.clear("service.category.map", true);
                    cache.clear("service.itemList", true);
                    cache.clear("service.productCategories", true);
                    global.eventEmitter.emitEvent('setting.service.service.change');
                    initData(moduleScope, function (moduleScope) {
                        if ($scope.productCategorySelected == 'all') {
                            $scope.choiceAllCate();
                        }
                    });
                    //删除服务成功、当前服务数-1
                    if ($scope.temp.currentServiceCount) {
                        $scope.temp.currentServiceCount--;
                    }

                    //提示成功、2s后返回
                    utils.showAreaSuccessMsg("#m-setting-service-delete", "删除成功");
                    setTimeout(function () {
                        $scope.backIndex();
                        $scope.modalDialogClose();
                        try {
                            $scope.$digest();
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }, 2000);
                }, function (tx, error) {
                    utils.showAreaFailMsg("#m-setting-service-delete", "删除失败");
                    utils.log("m-setting service.js deleteService", error);
                })
            });
        };

        $scope.modalDialogClose = function () {
            $.fancybox.close();
        };


        /**
         * Capture picture
         */
        $scope.getPicture = function (record, sourceType, imgtype) {
            utils.getPicture(sourceType, imgtype, "nailshop", "service", function (error, path) {
                if (error) {
                    utils.log("m-setting service.js getPicture", error);
                    if ($scope.action == "new") {
                        utils.showAreaFailMsg("#m-setting-service-morePopup", "获取图片失败");

                    } else if ($scope.action == "edit") {
                        utils.showAreaFailMsg("#m-setting-service-eidtPopup", "获取图片失败");
                    }
                } else {
                    moduleScope.$apply(function () {
                        if (imgtype == "cate") {
                            record.baseInfo_image = path;

                        } else {
                            record.baseInfo_image = path;
                        }
                    })
                }
            });
        };

        $scope.shareToWeixin = function () {
            if (window.plugins.weixin) {
                window.plugins.weixin.send({type: 'image',
                    imageType: 'path',//you can also use 'url' to send image.
                    desc: $scope.productSelected.name + ":" + ($scope.productSelected.comment ? $scope.productSelected.comment : ""),//you can also use 'url' to send image.
                    data: $scope.productSelected.baseInfo_image,//SD card path or Url
                    isSendToTimeline: true
                }, function () {

                }, function (e) {
                    utils.showGlobalMsg("分享失败");
                });
            }
        }

        //show删除控件
        $scope.showDeleteControl = function () {
            if ($(".deletion-control").is(":visible")) {
                $(".deletion-control").css("display", "none");
            }
            else {
                $(".deletion-control").css("display", "block");
            }
        }

        $scope.shareToSinaWeibo = function () {
            if (window.plugins.sinaWeibo) {
                window.plugins.sinaWeibo.send({type: 'image',
                    desc: $scope.productSelected.name + ":" + ($scope.productSelected.comment ? $scope.productSelected.comment : ""),//you can also use 'url' to send image.
                    imageType: 'path',//you can also use 'url' to send image.
                    data: $scope.productSelected.baseInfo_image
                }, function () {
                }, function () {
                    utils.showGlobalMsg("分享失败");
                });
            }
        }


        function cleanCheckServiceCate() {
            $(".error-hint-cate").css("display", "none");
        }

        //检查服务类型输入
        function checkServiceCate() {
            cleanCheckServiceCate();
            var legal = utils.checkStrMinLen($scope.newServiceCateRecord.name, 1);
            if (!legal) {
                $(".error-hint-cate").css("display", "inline");
            }
            return legal;
        }


        function cleanCheckService() {
            $(".error-hint-service-name").css("display", "none");
            $(".error-hint-service-price").css("display", "none");
        }

        //检查服务输入
        function checkService(serviceRecord) {
            var flag = true;
            cleanCheckService();
            if (!utils.checkStrMinLen(serviceRecord.name, 1)) {
                $(".error-hint-service-name").css("display", "inline");
                flag = false;
            }

            if (!serviceRecord.prices_salesPrice || serviceRecord.prices_salesPrice === "") {
                flag = false;
                $(".error-hint-service-price").css("display", "inline");
            }
            return flag;
        }
    }

    function init() {

    }


    function afterPageLoaded() {
        var c_height = $("#m-setting-service-area .top-area").height() - $("#m-setting-service-area .service-category-option").height();
        $("#m-setting-service-area .service-category-list").height(c_height - 12);
        $("#m-setting-service-area .product-list").height($("#m-setting-service-area .top-area").height() - 12);
    }


    function switchMenu(params) {
    }

    function paramsChange(params) {

    }
})
;