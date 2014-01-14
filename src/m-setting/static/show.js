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

    require("./setting.css");
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
            showViewArray: {},
            pageViewArray: [],
            newProductRecord: {},
            newServiceCateRecord: {},
            action: "index"
        };

        model.memberList = [];
        model.condition = "";
        model.shearch = {
            keyWord: ""
        };
        if (YILOS.onDeviceReady) {
            initData(model, callback)
        } else {
            global.eventEmitter.addListener("data-init-success", function () {
                initData(model, callback)
            });
        }
    }

    function initData(model, callback) {
        //查询数据库，查询出所有服务类型
        //查询出当前类型对应的商品类型
        model.productCategorieMap = cache.getObject("show.category.map");
        model.productList = cache.getObject("show.itemList");
        model.productCategories = cache.getObject("show.productCategories");
        if (model.productCategorieMap && model.productList && model.productCategories) {
            //防止对空数据进行转换得到空数组、导致访问下标出现问题
            if (_.pairs(model.productCategorieMap).length > 0) {
                if (!model.productSelected) {
                    model.productSelected = _.pairs(model.productCategorieMap)[0][1][0];
                    convertItemCate(model.productCategories, model.productSelected)
                }
                if (!model.productCategorySelected) {
                    model.productCategorySelected = _.pairs(model.productCategorieMap)[0][0];
                }
                model.showViewArray = model.productCategorieMap[model.productCategorySelected];
            }
            else {
                //当没有数据时、触发中所有操作、让右边没有新增按钮
                model.showViewArray = {};
                model.productCategorySelected = "all";
            }
            if (model.initPageViewArray) {
                model.initPageViewArray();
            }
            callback(model);
        } else {
            model.productCategorieMap = {};
            model.productList = {};
            model.productCategories = {};
            async.waterfall([queryCate, queryItems], function (error) {
                if (error) {
                    utils.log("m-setting show.js initData", error);
                }
                if (_.pairs(model.productCategorieMap).length > 0) {
                    if (!model.productSelected) {
                        model.productSelected = _.pairs(model.productCategorieMap)[0][1][0];
                        convertItemCate(model.productCategories, model.productSelected)
                    }
                    if (!model.productCategorySelected) {
                        model.productCategorySelected = _.pairs(model.productCategorieMap)[0][0];
                    }
                    model.showViewArray = model.productCategorieMap[model.productCategorySelected];
                }
                else {
                    model.showViewArray = {};
                    model.productCategorySelected = "all";
                }
                if (model.initPageViewArray) {
                    model.initPageViewArray();
                }
                callback(model);
            })
        }

        function queryCate(callback) {
            db.transaction(function (tx) {
                tx.executeSql("select a.id ,a.name,a.img from tb_showitem_cate a", [], function (tx, result) {
                    var len = result.rows.length;
                    for (var i = 0; i < len; i++) {
                        var tmp = result.rows.item(i);
                        if (i == 0 && !model.productCategorySelected) {
                            model.productCategorySelected = tmp.id;

                        }
                        if (!model.productCategorieMap[tmp.id]) {
                            model.productCategories[tmp.id] = tmp;
                            model.productCategorieMap[tmp.id] = [];
                        }
                    }
                    cache.set("show.productCategories", model.productCategories, true);
                    callback(null);
                }, function (tx, error) {
                    callback(error);
                })
            });
        }

        function queryItems(callback) {
            db.transaction(function (tx) {
                tx.executeSql("select a.categoryId c_id,a.img c_img,a.id,a.name,a.img,a.like,a.share,a.create_date,a.desc from tb_showitem a order by a.create_date DESC", [], function (tx, result) {
                    var len = result.rows.length;
                    for (var i = 0; i < len; i++) {
                        var tmp = result.rows.item(i);
                        if (i == 0 & !model.productSelected) {
                            tmp.selected = true;
                            model.productSelected = tmp;
                            convertItemCate(model.productCategories, model.productSelected);
                        }
                        if (!tmp.c_id) {
                            continue;
                        }
                        var cateIds = tmp.c_id.split(",");
                        _.each(cateIds, function (cate) {
                            if (cate && cate != "") {
                                if (model.productCategorieMap[cate]) {
                                    if (i == 0 && !model.productCategorySelected) {
                                        model.showViewArray = model.productCategorieMap[cate];
                                    } else {
                                        model.showViewArray = model.productCategorieMap[model.productCategorySelected];
                                    }
                                    model.productCategorieMap[cate].push(tmp);
                                }
                            }
                        })
                        model.productList[tmp.id] = tmp;
                    }
                    cache.set("show.category.map", model.productCategorieMap, true);
                    cache.set("show.itemList", model.productList, true);
                    cache.set("show.productCategories", model.productCategories, true);
                    callback(null);

                }, function (tx, error) {
                    callback(error);
                })
            });
        }
    }


    function initContoller($scope, $parse, $q, $http) {
        moduleScope = $scope;


        $scope.initPageViewArray = function () {
            $scope.pageViewArray = [];
            var showViewObjectArray = _.pairs($scope.showViewArray);
            var len = showViewObjectArray.length;
            var last = $scope.pageViewArray.length;
            //判断当前到了第几页，获取下一页数据到数据结构中
            for (var i = 0; i < 50; i++) {
                if ((last + i) < len) {
                    if (showViewObjectArray[last + i] && showViewObjectArray[last + i].length > 0) {
                        $scope.pageViewArray.push(showViewObjectArray[last + i][1]);
                    }
                }
            }
        };

        $scope.loadMore = function () {
            var showViewObjectArray = _.pairs($scope.showViewArray);
            var len = showViewObjectArray.length;
            var last = $scope.pageViewArray.length;
            //判断当前到了第几页，获取下一页数据到数据结构中
            for (var i = 0; i < 50; i++) {
                if ((last + i) < len) {
                    if (showViewObjectArray[last + i] && showViewObjectArray[last + i].length > 0) {
                        $scope.pageViewArray.push(showViewObjectArray[last + i][1]);
                    }
                }
            }
        };


        $scope.showImageStyle = function (product) {
            var main_container_height = $("#main-container").height();
            if ($scope.showImageStyle.main_container_height) {
                main_container_height = $scope.showImageStyle.main_container_height;
            } else {
                main_container_height = $("#main-container").height();
            }
            var title_height = $("#m-setting-show-area .m-setting-title").height() + 18;

            var tmp_img_size = (main_container_height - title_height) + "px " + (main_container_height - title_height) + "px";
            if (!product) {
                return {};
            }
            var img = product.img;
            return {
                "background-image": "url(" + img + ")",
                "background-size": tmp_img_size,
                "width": main_container_height - title_height,
                "height": main_container_height - title_height
            }
        }

        $scope.choiceCate = function (cate, key) {
            $scope.showViewArray = cate;
            $scope.pageViewArray = [];
            $scope.productCategorySelected = key;
            $scope.loadMore();
        }

        $scope.choiceAllCate = function (cate, key) {
            $scope.showViewArray = $scope.productList;
            $scope.pageViewArray = [];
            $scope.productCategorySelected = "all";
            $scope.loadMore();
        }


        $scope.selectProduct = function (product, $event) {
            $scope.productSelected = product;
            $scope.productSelected.img = product.img;
            convertItemCate($scope.productCategories, $scope.productSelected)
            $scope.action = "info";
        }
        $scope.backIndex = function () {
            $scope.action = "index";
        }

        $scope.newProductCate = function (cate, $event) {
            if (_.keys($scope.productCategories).length > 9) {
                utils.showGlobalMsg("最多添加10个分类!", 2000);
                return;
            }
//            $scope.newProductRecord.c_id = $scope.productCategorySelected;
            $scope.action = "newcate";
            cleanCheckShowCate();
            utils.showSoftKeyboard("#m-setting-showType-add", 500);
        }

        $scope.newProduct = function (cate, $event) {
            $scope.newProductRecord.img = "";
            $scope.newProductRecord.desc = "";
            //默认选中当前分类的风格标签、避免添加进没有类型的show项目
            $scope.newProductRecord.c_id = cate;
            $scope.action = "new";
            cleanCheckShowItem();
            utils.showSoftKeyboard("#m-setting-show-add-name", 500);
        };

        $scope.commitNewShowCate = function (newServiceCateRecord) {
            if (!checkShowCate()) {
                return;
            }
            database.getUniqueId(YILOS.ENTERPRISEID, function (error, txx, id) {
                var createDate = new Date().getTime();
                txx.executeSql("INSERT INTO tb_showitem_cate (name,img,desc,create_date,id,enterprise_id) VALUES (?,?,?,?,?,?)",
                    [newServiceCateRecord.name, newServiceCateRecord.img, newServiceCateRecord.desc, createDate, id, YILOS.ENTERPRISEID],
                    function (tx, results) {
                        //更新备份表
                        database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.SHOW, null);
                        cache.clear("show.category.map", true);
                        cache.clear("show.productCategories", true);
                        $scope.newServiceCateRecord.name = "";
                        initData(moduleScope, function (moduleScope) {
                            moduleScope.$apply(function () {
                                $scope.choiceCate({}, id);
                            })
                        });

                        global.eventEmitter.emitEvent('setting.show.showCate.change');
                        utils.showAreaSuccessMsg("#m-setting-more-showcate", "新增成功");
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
                        utils.showAreaFailMsg("#m-setting-more-showcate", "新增失败");
                        utils.log("m-setting show.js commitNewShowCate", error);
                    });
            });
        };

        $scope.commitNewShowItem = function (newProductRecord) {
            if (!checkShowItem(newProductRecord)) {
                return;
            }
            database.getUniqueCode("tb_showitem", 4, function (error, txx, code) {
                database.getUniqueId(YILOS.ENTERPRISEID, function (error, txx, id) {
                    var createDate = new Date().getTime();
                    txx.executeSql("INSERT INTO tb_showitem (name,desc,img,categoryId,create_date,code,id,enterprise_id) VALUES (?,?,?,?,?,?,?,?)",
                        [newProductRecord.name, newProductRecord.desc, newProductRecord.img, newProductRecord.c_id, createDate, code, id, YILOS.ENTERPRISEID],
                        function (tx, results) {
                            //更新备份表
                            database.updateBackupFlag(createDate, YILOS_NAIL_MODULE.SHOW, null);
                            cache.clear("show.itemList", true);
                            initData(moduleScope, function (moduleScope) {
                                moduleScope.$apply(function () {
                                    moduleScope.newProductRecord = {};
                                })
                            });
                            global.eventEmitter.emitEvent('setting.show.showItem.change');
                            utils.showAreaSuccessMsg("#m-setting-show-morePopup", "新增成功");
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
                            utils.log("m-setting show.js commitNewShowItem", error);
                            utils.showAreaFailMsg("#m-setting-show-morePopup", "新增失败");
                        });
                });
            });

        }
        $scope.initEditShowItem = function (product) {
            $scope.editSelected = _.clone(product);
            $scope.action = "edit";
            cleanCheckShowItem();
            utils.showSoftKeyboard("#m-setting-show-edit-name", 500);
        }
        $scope.cancelEditShowItem = function () {
            $scope.action = "info";
        }


        $scope.editShowItem = function (productSelected) {
            if (!checkShowItem(productSelected)) {
                return;
            }
            //获取更新的标签信息
            var categoryIds = "";
            db.transaction(function (tx) {
                var modifyDate = new Date().getTime();
                tx.executeSql("update tb_showitem set name=?,img=?,categoryId=?,desc=?,modify_date=? where id=? ",
                    [productSelected.name, productSelected.img, productSelected.c_id, productSelected.desc, modifyDate, productSelected.id],
                    function (tx, results) {
                        //更新备份表
                        database.updateBackupFlag(modifyDate, YILOS_NAIL_MODULE.SHOW, null);
                        cache.clear("show.category.map", true);
                        cache.clear("show.itemList", true);
                        cache.clear("show.productCategories", true);
                        initData(moduleScope, function (moduleScope) {
                            if ($scope.productCategorySelected == 'all') {
                                $scope.choiceAllCate();
                            }
                            moduleScope.$digest();
                        });

                        //修改成功、2s后返回
                        utils.showAreaSuccessMsg("#m-setting-show-eidtPopup", "修改成功");
                        global.eventEmitter.emitEvent('setting.show.showItem.change');

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
                        utils.log("m-setting show.js editShowItem", error);
                        utils.showAreaFailMsg("#m-setting-show-eidtPopup", "修改失败");
                    })
            });
        }

        $scope.getCateClass = function (cateId, productSelected) {
            if (!productSelected || !productSelected.c_id) {
                return "";
            }

            if (productSelected.c_id.indexOf(cateId) != -1) {
                return "selected";
            } else {
                return "";
            }
        }

        $scope.selectItemTag = function (cateId, productSelected) {
            if (!productSelected) {
                return;
            }
            if (productSelected.c_id
                && productSelected.c_id.split(",").length > 2
                && productSelected.c_id.indexOf(cateId) == -1) {
                return;
            }
            if (productSelected.c_id
                && productSelected.c_id.split(",").length == 1
                && productSelected.c_id.indexOf(cateId) != -1) {
                return;
            }
            if (!productSelected.c_id) {
                productSelected.c_id = cateId;
            }
            else if (productSelected.c_id.indexOf(cateId) == -1) {
                productSelected.c_id = productSelected.c_id + "," + cateId;
            } else if (productSelected.c_id === cateId) {
                productSelected.c_id = "";
            } else if (productSelected.c_id.indexOf(cateId) == 0) {
                productSelected.c_id = productSelected.c_id.substr(productSelected.c_id.indexOf(",") + 1);
            } else {
                productSelected.c_id = productSelected.c_id.replace("," + cateId, "");
            }
        };


        $scope.editShowCate = function (productCateSelected) {
            db.transaction(function (tx) {
                var modifyDate = new Date().getTime();
                tx.executeSql("update tb_showitem_cate set name=?,desc=?,modify_date=? where id=?",
                    [productCateSelected.name, productCateSelected.desc, modifyDate, productCateSelected.id],
                    function (tx, results) {
                        //更新备份表
                        database.updateBackupFlag(modifyDate, YILOS_NAIL_MODULE.SHOW, null);
                        $scope.backIndex();
                        cache.clear("show.category.map", true);
                        cache.clear("show.productCategories", true);
                        global.eventEmitter.emitEvent('setting.show.showCate.change');
                        initData(moduleScope, function (moduleScope) {
                            moduleScope.$digest();
                        })
                    }, function (tx, error) {
                        utils.log("m-setting show.js editShowCate", error);
                        utils.showAreaFailMsg("#m-setting-edit-showcate", "修改失败");
                    })
            });
        }

        $scope.initDeleteShowCate = function () {
            $("#m-setting-cate-delete .m-setting-addMsg").html("");
            $("#m-setting-cate-delete .m-setting-addMsg").hide();
            $.fancybox.open("#m-setting-cate-delete", {
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
        $scope.initDeleteShowItem = function () {
            $("#m-setting-show-delete .m-setting-addMsg").html("");
            $("#m-setting-show-delete .m-setting-addMsg").hide();
            $.fancybox.open("#m-setting-show-delete", {
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

        $scope.deleteShowCate = function (productCateSelected, $event) {
            try {
                $event.preventDefault();
            } catch (e) {

            }
            db.transaction(function (tx) {
                tx.executeSql("select count(id) count from tb_showitem where categoryId='" + productCateSelected.id + "'", [], function (tx, result) {
                    var len = result.rows.item(0).count;
                    if (len > 0) {
                        utils.showAreaFailMsg("#m-setting-cate-delete", "分类下存在关联秀信息,请先删除分类下所有秀");
                    } else {
                        tx.executeSql("delete from tb_showitem_cate where id='" + productCateSelected.id + "'", [], function (tx, result) {
                            //更新备份表
                            database.updateBackupFlag(new Date().getTime(), YILOS_NAIL_MODULE.SHOW, null);
                            cache.clear("show.category.map", true);
                            cache.clear("show.productCategories", true);
                            initData(moduleScope, function (moduleScope) {
                                //删除分类之后不选中某分类问题
                                if (_.pairs($scope.productCategorieMap).length !== 0) {
                                    $scope.productSelected = _.pairs($scope.productCategorieMap)[0][1][0];
                                    convertItemCate($scope.productCategories, $scope.productSelected);
                                    $scope.productCategorySelected = _.pairs($scope.productCategorieMap)[0][0];
                                    $scope.showViewArray = $scope.productCategorieMap[$scope.productCategorySelected];
                                }
                                else {
                                    $scope.showViewArray = {};
                                    $scope.productCategorySelected = "all";
                                }
                                moduleScope.$digest();
                            });
                            //成功提示、2s后返回
                            utils.showAreaSuccessMsg("#m-setting-cate-delete", "删除成功");
                            global.eventEmitter.emitEvent('setting.show.showCate.change');

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
                            utils.log("m-setting show.js deleteShowCate", error);
                            utils.showAreaFailMsg("#m-setting-cate-delete", "删除失败");
                        })
                    }
                }, function (tx, error) {
                    utils.log("m-setting show.js deleteShowCate", error);
                    utils.showAreaFailMsg("#m-setting-cate-delete", "删除失败");
                })
            });
        }

        $scope.deleteShowItem = function (productSelected, $event) {
            try {
                $event.preventDefault();
                $event.stopPropagation();
            } catch (e) {

            }

            db.transaction(function (tx) {
                tx.executeSql("delete from tb_showitem where id='" + productSelected.id + "'", [], function (tx, result) {
                    //更新备份表
                    database.updateBackupFlag(new Date().getTime(), YILOS_NAIL_MODULE.SHOW, null);
                    cache.clear("show.category.map", true);
                    cache.clear("show.itemList", true);
                    cache.clear("show.productCategories", true);
                    initData(moduleScope, function (moduleScope) {
                        if ($scope.productCategorySelected == 'all') {
                            $scope.choiceAllCate();
                        }
                        moduleScope.$digest();
                    });

                    utils.showAreaSuccessMsg("#m-setting-show-delete", "删除成功");
                    global.eventEmitter.emitEvent('setting.show.showItem.change');

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
                    utils.showAreaFailMsg("#m-setting-show-delete", "删除失败");
                    console.log(error);
                    //TODO 错误处理
                })
            });
        }

        $scope.modalDialogClose = function () {
            $.fancybox.close();
        };

        /**
         * Capture picture
         */
        $scope.getPicture = function (record, sourceType, imgtype) {
            utils.getPicture(sourceType, imgtype, "nailshop", "show", function (error, path) {
                if (error) {
                    console.log(error);
                    if ($scope.action == "new") {
                        utils.showAreaFailMsg("#m-setting-show-morePopup", "获取图片失败");

                    } else if ($scope.action == "edit") {
                        utils.showAreaFailMsg("#m-setting-show-eidtPopup", "获取图片失败");
                    }
                } else {
                    moduleScope.$apply(function () {
                        if (imgtype == "cate") {
                            record.img = path;

                        } else {
                            record.img = path;
                        }
                    })
                }
            });
        }
        $scope.shareToWeixin = function () {
            if (window.plugins.weixin) {
                window.plugins.weixin.send({type: 'image',
                    imageType: 'path',//you can also use 'url' to send image.
                    desc: $scope.productSelected.name + ":" + $scope.productSelected.desc ? $scope.productSelected.desc : "",//you can also use 'url' to send image.
                    data: $scope.productSelected.img,//SD card path or Url
                    isSendToTimeline: true
                }, function () {

                }, function (e) {
                    utils.showAreaFailMsg("#m-setting-show-infopopup", "分享失败");
                });
            }
        }
        $scope.shareToSinaWeibo = function () {
            if (window.plugins.sinaWeibo) {
                window.plugins.sinaWeibo.send({type: 'image',
                    desc: $scope.productSelected.name + ":" + $scope.productSelected.desc ? $scope.productSelected.desc : "",//you can also use 'url' to send image.
                    imageType: 'path',//you can also use 'url' to send image.
                    data: $scope.productSelected.img
                }, function () {
                }, function () {
                    utils.showAreaFailMsg("#m-setting-show-infopopup", "分享失败");
                });
            }
        }

        function cleanCheckShowCate() {
            $(".error-hint-showcate").css("display", "none");
        }

        //检查服务类型输入
        function checkShowCate() {
            cleanCheckShowCate();
            var legal = utils.checkStrMinLen($scope.newServiceCateRecord.name, 1);
            if (!legal) {
                $(".error-hint-showcate").css("display", "inline");
            }
            return legal;
        }

        function cleanCheckShowItem() {
            $(".error-hint-show-name").css("display", "none");
        }

        //检查服务输入
        function checkShowItem(showRecord) {
            cleanCheckShowItem();
            var legal = utils.checkStrMinLen(showRecord.name, 1);
            if (!legal) {
                $(".error-hint-show-name").css("display", "inline");
            }
            return legal;
        }
    }

    function convertItemCate(productCategories, product) {
        var cates = [];
        if (product && product.c_id) {
            var cateIds = product.c_id.split(",");
            _.each(cateIds, function (id) {
                if (productCategories[id]) {
                    cates.push({
                        id: id,
                        name: productCategories[id].name
                    })
                }
            })
            product.cateList = cates;
        }
    }

    function init() {

    }

    function afterPageLoaded() {
        var c_height = $("#m-setting-show-area .top-area").height() - $("#m-setting-show-area .service-category-option").height();
        var main_container_height = $("#m-setting-show-area .top-area").height();
        $("#m-setting-show-area .service-category-list").height(c_height - 12);
        $("#m-setting-show-area .product-list").height(main_container_height - 12);
    }


    function switchMenu(params) {
    }

    function paramsChange(params) {

    }
})
;