define(function (require, exports, module) {
    var database = require("./database.js");		//数据操作服务
    var dataUtils = require("./dataUtils.js");
    var dbInstance = database.getDBInstance();

    var storeInfo = null;
    var msgSwitch = null;
    var ticketSwitch = null;

    exports.global = {
        url: global["_g_server"].serviceurl,
        graphPath: "graph",
        uploadUrl: "http://graph.hwapi.com/",
        enterpriseId: $.cookie('enterpriseId')
    };

    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };

    Storage.prototype.getObject = function (key) {
        return JSON.parse(this.getItem(key));
    };

    /*
     * Dustin Diaz's CacheProvider
     * From: http://www.dustindiaz.com/javascript-cache-provider/
     */
    function CacheProvider() {
        // values will be stored here
        CacheProvider.hasLocalStorage = ('localStorage' in window) && window['localStorage'] !== null && typeof Storage !== 'undefined';
        this._cache = {};
    }

    CacheProvider.prototype = {
        /**
         * {String} k - the key
         * {Boolean} local - get this from local storage?
         * {Boolean} o - is the value you put in local storage an object?
         */
        get: function (k, local, o) {
            if (local && CacheProvider.hasLocalStorage) {
                var action = o ? 'getObject' : 'getItem';
                return localStorage[action](k) || undefined;
            } else {
                return this._cache[k] || undefined;
            }
        },
        getObject: function (k) {
            if (CacheProvider.hasLocalStorage) {
                return localStorage["getObject"](k) || undefined;
            } else {
                return this._cache[k] || undefined;
            }
        },

        /**
         * {String} k - the key
         * {Object} v - any kind of value you want to store
         * however only objects and strings are allowed in local storage
         * {Boolean} local - put this in local storage
         */
        set: function (k, v, local) {

            CacheProvider.hasLocalStorage = ('localStorage' in window) && window['localStorage'] !== null && typeof Storage !== 'undefined';

            if (local && CacheProvider.hasLocalStorage) {
                if (typeof v !== 'string') {
                    // make assumption if it's not a string, then we're storing an object
                    localStorage.setObject(k, v);
                } else {
                    try {
                        localStorage.setItem(k, v);
                    } catch (ex) {
                        if (ex.name == 'QUOTA_EXCEEDED_ERR') {
                            // developer needs to figure out what to start invalidating
                            throw new Exception(v);
                            return;
                        }
                    }
                }
            } else {
                // put in our local object
                this._cache[k] = v;
            }
            // return our newly cached item
            return v;
        },
        /**
         * {String} k - the key
         * {Boolean} local - put this in local storage
         * {Boolean} o - is this an object you want to put in local storage?
         */
        clear: function (k, local, o) {
            if (local && CacheProvider.hasLocalStorage) {
                localStorage.removeItem(k);
            }
            // delete in both caches - doesn't hurt.
            delete this._cache[k];
        },
        clearAll: function () {
            if (CacheProvider.hasLocalStorage) {
                localStorage.clear();
            }
            // delete in both caches - doesn't hurt.
            this._cache = {};
        }
    };


    var cacheProvider = new CacheProvider();

    function getCache() {
        return cacheProvider;
    }

    var getPicture = function (sourceType, imgtype, sysname, modulename, callback) {
        if (cordova && cordova.platformId == "ios") {
            var CameraPopoverOptions = { x: 0,
                y: 32,
                width: 320,
                height: 480,
                arrowDir: Camera.PopoverArrowDirection.ARROW_ANY
            };
            var option = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 1280,
                targetHeight: 960,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            if (sourceType == "folder") {
                option.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            } else {
                option.sourceType = Camera.PictureSourceType.CAMERA;
            }

            navigator.camera.getPicture(onPhotoURISuccess, onFail, option);

            function onPhotoURISuccess(imageURI) {
                toMove(imageURI);
                //callback(null, imageURI);
            }

            // Called if something bad happens.
            //
            function onFail(message) {
                console.log("error code: " + message);
                callback(message);
            }

        } else {
            if (navigator.cropCamera) {
                if (sourceType == "folder") {
                    navigator.cropCamera.getPicture(
                        function (data) {
                            toMove(data);
                        },
                        function (e) {
                            console.log(e);
                        },
                        {   quality: 100,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                            allowEdit: true,
                            targetWidth: 1280,
                            targetHeight: 960
                        });
                } else {
                    navigator.cropCamera.getPicture(
                        function (data) {
                            toMove(data);
                        },
                        function (e) {
                            console.log(e);
                        },
                        {   quality: 100,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.CAMERA,
                            allowEdit: true,
                            targetWidth: 1280,
                            targetHeight: 960
                        });
                }

            } else {
                setTimeout(function () {
                    jcropImage();
                }, 10);
            }
        }
        //文件操作失败
        function onFileFail(error) {
            console.log("error code: " + error.code);
            console.log("error code: " + error);
            callback(error);
        }

        //移动图像
        function toMove(m_imageURI) {
            DoFile(m_imageURI, true);
        }

        //负责图像
        function toCopy(m_imageURI) {
            console.log(m_imageURI);
            DoFile(m_imageURI, false);
        }

        function DoFile(m_imageURI, ismove) {
            var fname = (new Date().getTime()).toString();
            var dirname = YILOS.DOCPATH;  //目标路径
            //开始操作文件
            //通过本地URI参数检索DirectoryEntry或FileEntry
            window.resolveLocalFileSystemURI(m_imageURI,
                function (fileEntry) {
                    //请求持久化的文件系统
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                        function (fileSystem) {
                            //如果目录不存在就创建
                            var direc = fileSystem.root.getDirectory(dirname, {create: true},
                                function (parent) {
                                    fileSystem.root.getDirectory(dirname + "/" + YILOS.ENTERPRISEID, {create: true},
                                        function (parent) {
                                            fileSystem.root.getDirectory(dirname + "/" + YILOS.ENTERPRISEID + "/images/" + modulename, {create: true},
                                                function (parent) {
                                                    //移动文件
                                                    if (ismove) {
                                                        fileEntry.moveTo(parent/*fileSystem.root*/, fname,
                                                            function () {
                                                                callback(null, parent.fullPath + "/" + fname);
                                                            }, onFileFail);
                                                    } else {
                                                        //复制文件
                                                        fileEntry.copyTo(parent/*fileSystem.root*/, fname,
                                                            function () {
                                                                callback(null, parent.fullPath + "/" + fname);
                                                            }, onFileFail);
                                                    }//end if
                                                }, onFileFail);
                                        }, onFileFail);
                                }, onFileFail);
                        }, onFileFail);
                }, onFileFail);
        }
    };

    function jcropImage() {
        // Create variables (in this scope) to hold the API and image size
        var jcrop_api,
            boundx,
            boundy,
            $preview = $('#preview-pane'),
            $pcnt = $('#preview-pane .preview-container'),
            $pimg = $('#preview-pane .preview-container img'),

            xsize = $pcnt.width(),
            ysize = $pcnt.height();
        var setSelect_x1 = 0;
        var setSelect_y1 = 0;
        $('#target').Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            bgFade: true,
            allowResize: false,
            bgOpacity: .6,
            setSelect: [ setSelect_x1, setSelect_y1, (setSelect_x1 + 300), (setSelect_y1 + 300) ],
            aspectRatio: xsize / ysize
        }, function () {
            var bounds = this.getBounds();
            boundx = bounds[0];
            boundy = bounds[1];
            // Store the API in the jcrop_api variable
            jcrop_api = this;
            // Move the preview into the jcrop container for css positioning
            $preview.appendTo(jcrop_api.ui.holder);
        });

        function updatePreview(c) {
            if (parseInt(c.w) > 0) {
                var rx = xsize / c.w;
                var ry = ysize / c.h;

                $pimg.css({
                    width: Math.round(rx * boundx) + 'px',
                    height: Math.round(ry * boundy) + 'px',
                    marginLeft: '-' + Math.round(rx * c.x) + 'px',
                    marginTop: '-' + Math.round(ry * c.y) + 'px'
                });
            }
        }
    }

    function showMsg(msg, delay) {
        $(".m-global-msg").text(msg).removeClass("m-global-msg-success").addClass("m-global-msg-fail");
        if (!delay) {
            delay = 2000;
        }
        setTimeout(function () {
            $(".m-global-msg").text("").removeClass("m-global-msg-fail");
        }, delay)
    }

    function showGlobalSuccessMsg(msg, delay) {
        $(".m-global-msg").text(msg).removeClass("m-global-msg-fail").addClass("m-global-msg-success");
        if (!delay) {
            delay = 2000;
        }
        setTimeout(function () {
            $(".m-global-msg").text("").removeClass("m-global-msg-success");
        }, delay)
    }

    function hiddenMsg(msg, delay) {
        $(".m-global-msg").text("").removeClass("m-global-msg-success").removeClass("m-global-msg-fail");
    }

    function showAreaSuccessMsg(selector, msg, delay) {
        $(selector + " .m-area-msg").text(msg).removeClass("m-area-msg-fail").addClass("m-area-msg-success");
        if (!delay) {
            delay = 2000;
        }
        setTimeout(function () {
            $(selector + " .m-area-msg").text("").removeClass("m-area-msg-success");
        }, delay)
    }

    function showAreaFailMsg(selector, msg, delay) {
        $(selector + " .m-area-msg").text(msg).removeClass("m-area-msg-success").addClass("m-area-msg-fail");
        if (!delay) {
            delay = 2000;
        }
        setTimeout(function () {
            $(selector + " .m-area-msg").text("").removeClass("m-area-msg-fail");
        }, delay)
    }


    /*****************************日期相关公共函数*****************************************************/
        //获取上周开始日期
    function getLastWeekStartDate(now) {
        var nowDayOfWeek = now.getDay(); //今天本周的第几天
        var nowDay = now.getDate(); //当前日
        var nowMonth = now.getMonth(); //当前月
        var nowYear = now.getYear(); //当前年
        nowYear += (nowYear < 2000) ? 1900 : 0; //

        var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 7);
        return weekStartDate;
    }

    //获取上周结束日期
    function getLastWeekEndDate(now) {
        var nowDayOfWeek = now.getDay(); //今天本周的第几天
        var nowDay = now.getDate(); //当前日
        var nowMonth = now.getMonth(); //当前月
        var nowYear = now.getYear(); //当前年
        nowYear += (nowYear < 2000) ? 1900 : 0; //

        var weekEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 1);
        return weekEndDate;
    }

    //获取下周周开始日期
    function getNextWeekStartDate(now) {
        var nowDayOfWeek = now.getDay(); //今天本周的第几天
        var nowDay = now.getDate(); //当前日
        var nowMonth = now.getMonth(); //当前月
        var nowYear = now.getYear(); //当前年
        nowYear += (nowYear < 2000) ? 1900 : 0; //

        var weekStartDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek) + 1);
        return weekStartDate;
    }

    //获取下周结束日期
    function getNextWeekEndDate(now) {
        var nowDayOfWeek = now.getDay(); //今天本周的第几天
        var nowDay = now.getDate(); //当前日
        var nowMonth = now.getMonth(); //当前月
        var nowYear = now.getYear(); //当前年
        nowYear += (nowYear < 2000) ? 1900 : 0; //

        var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek) + 7);
        return weekEndDate;
    }


    //获得本周的开始日期
    function getWeekStartDate(now) {
        var nowDayOfWeek = now.getDay(); //今天本周的第几天
        var nowDay = now.getDate(); //当前日
        var nowMonth = now.getMonth(); //当前月
        var nowYear = now.getYear(); //当前年
        nowYear += (nowYear < 2000) ? 1900 : 0; //
        var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
        return weekStartDate;
    }

    //获得本周的结束日期
    function getWeekEndDate(now) {
        var nowDayOfWeek = now.getDay(); //今天本周的第几天
        var nowDay = now.getDate(); //当前日
        var nowMonth = now.getMonth(); //当前月
        var nowYear = now.getYear(); //当前年
        nowYear += (nowYear < 2000) ? 1900 : 0; //
        var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
        return weekEndDate;
    }

    // 计算当前日期在本年度的周数
    Date.prototype.getWeekOfYear = function (weekStart) { // weekStart：每周开始于周几：周日：0，周一：1，周二：2 ...，默认为周日
        weekStart = (weekStart || 0) - 0;
        if (isNaN(weekStart) || weekStart > 6)
            weekStart = 0;

        var year = this.getFullYear();
        var firstDay = new Date(year, 0, 1);
        var firstWeekDays = 7 - firstDay.getDay() + weekStart;
        var dayOfYear = (((new Date(year, this.getMonth(), this.getDate())) - firstDay) / (24 * 3600 * 1000)) + 1;
        return Math.ceil((dayOfYear - firstWeekDays) / 7) + 1;
    }

    // 计算当前日期在本月份的周数
    Date.prototype.getWeekOfMonth = function (weekStart) {
        weekStart = (weekStart || 0) - 0;
        if (isNaN(weekStart) || weekStart > 6)
            weekStart = 0;

        var dayOfWeek = this.getDay();
        var day = this.getDate();
        return Math.ceil((day - dayOfWeek - 1) / 7) + ((dayOfWeek >= weekStart) ? 1 : 0);
    }
    function prevMonth() {
        var thisMonth = this.getMonth();
        this.setMonth(thisMonth - 1);
        if (this.getMonth() != thisMonth - 1 && (this.getMonth() != 11 || (thisMonth == 11 && this.getDate() == 1)))
            this.setDate(0);
        return this;
    }

    function nextMonth() {
        var that = new Date(this);
        var thisMonth = that.getMonth();
        that.setMonth(thisMonth + 1);
        if (that.getMonth() != thisMonth + 1 && this.getMonth() != 0)
            that.setDate(1);
        return that;

    }

    //根据路径删除文件
    function deleteFileByPath(path) {
        if (window.LosNailActivity) {
            var result = window.LosNailActivity.deleteFileByPath(path);
            if (!result) {
                console.log("删除文件" + path + "失败!");
            }
        }
    }

    //在view中显示软键盘、使用elementSel选择元素并获得焦点
    function showSoftKeyboard(elementSel, delay) {
        if (!delay) {
            delay = 500;
        }

        setTimeout(function () {
            if (elementSel) {
                //当元素选择器有误时不显示软键盘
                if ($(elementSel).focus().length !== 0) {
                    if (window.LosNailActivity) {
                        window.LosNailActivity.showSoftKeyboard();
                    }
                }
            }
        }, delay);
    }

    //获取应用程序缓存数据(SharedPreferences中的数据)
    function getUserData(callback) {
        var licenseInfo = null;
        if (window.LosNailActivity && window.LosNailActivity.getLicenseInfo) {
            licenseInfo = window.LosNailActivity.getLicenseInfo();
            if (licenseInfo) {
                licenseInfo = JSON.parse(licenseInfo);
            }
        }
        if (licenseInfo) {
            callback(null, licenseInfo);
        }
        else {
            callback(null, {});
        }
    }

    //日志记录,不传level参数使用error级别
    function logger(feature, msg, level) {
        if (cordova.platformId == "ios") {
            console.error(feature + ":" + formatError(msg));
        }
        else {
            var loggerLevel, msgStr;
            if (!level) {
                loggerLevel = 4;//error
            }
            else {
                loggerLevel = level;
            }

            if (window.LosNailActivity) {
                window.LosNailActivity.logger(loggerLevel, feature + ":" + formatError(msg));
            }
        }

        function formatError(msg) {
            var msgStr = "";
            if (typeof msg == "object") {
                try {
                    msgStr = JSON.stringify(msg);
                }
                catch (error) {
                    msgStr = "json转换出错!";
                }
            }
            else {
                msgStr = msg.toString();
            }
            return msgStr;
        }
    }

    //校验字符串、长度介于minLen和maxLen之间
    function checkStrMinLen(str, minLen) {
        var flag = true;
        var strTemp = str ? (str + "").replace(/^\s+|\s+$/g, "") : "";
        if (strTemp.length < minLen) {
            flag = false;
        }
        return flag;
    }

    //校验数字
    function checkNum(num, minValue, maxValue) {
        var numTemp = Number(num);
        var flag = true;
        //NaN
        if (numTemp !== numTemp) {
            flag = false;
        }
        if (num < minValue || num > maxValue) {
            flag = false;
        }
        return flag;
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function showTips(msg) {
        if (window.LosNailActivity) {
            window.LosNailActivity.showMsg(msg);
        }
    }

    function getStoreInfo(callback) {
        if (storeInfo) {
            callback(null, storeInfo);
        }
        else {
            queryFromDB(callback);
        }

        function queryFromDB(callback) {
            dbInstance.transaction(function (trans) {
                var selStore = "select name,contact_phoneMobile,addr_state_city_area,addr_detail from tb_enterprise;";
                trans.executeSql(selStore, [], function (trans, result) {
                    if (result.rows.length !== 0) {
                        setStoreInfo(_.clone(result.rows.item(0)));
                    }
                    callback(null, storeInfo);
                }, function (trans, error) {
                    callback(error);
                });
            });
        }
    }

    function setStoreInfo(info) {
        if (storeInfo) {
            for (var key in info) {
                if (info.hasOwnProperty(key)) {
                    //null to ""
                    if (info[key] == null) {
                        info[key] = "";
                    }
                    storeInfo[key] = info[key];
                }
            }
        }
        else {
            storeInfo = info;
        }
    }


    function getMsgSwitch(callback) {
        if (msgSwitch) {
            callback(null, msgSwitch);
        }
        else {
            queryFromDB(callback);
        }

        function queryFromDB(callback) {
            var msgSwitchFlag = {};
            var switchList = ["consumeMsgSwitch", "newRecordMsgSwitch", "newCardMsgSwitch", "cardCateChangeMsgSwitch", "cardRechargeMsgSwitch"];
            var replaceArg = [];
            for (var i = 0; i < switchList.length; i++) {
                replaceArg.push("?");
            }

            var querySwitchStatus = "select name,value from sys_config where name in (" + replaceArg.join(",") + ");";
            dbInstance.transaction(function (trans) {
                trans.executeSql(querySwitchStatus, switchList, function (trans, result) {
                    var rowsLen = result.rows.length;
                    var temp;
                    for (var i = 0; i < rowsLen; i++) {
                        temp = result.rows.item(i);
                        msgSwitchFlag[temp.name] = temp.value;
                    }

                    //查询开关数量不一致、可能新加入了某些短信模版
                    if (rowsLen !== switchList.length) {
                        var insertSwitch = [];//需要新增的某些开关项
                        _.each(switchList, function (item) {
                            if (!msgSwitchFlag[item]) {
                                msgSwitchFlag[item] = "0";//默认关闭状态
                                insertSwitch.push([item, "0"]);
                            }
                        });
                        insertNewSwitch(insertSwitch);
                    }
                    setMsgSwitch(msgSwitchFlag);
                    callback(null, msgSwitch);
                }, function (trans, error) {
                    callback(error);
                });
            });

            function insertNewSwitch(switchFlag) {
                var insertSwitch = "insert into sys_config(name,value) values(?,?);";
                var sqlArray = [];
                _.each(switchFlag, function (item) {
                    sqlArray.push({
                        statement: insertSwitch,
                        value: item
                    });
                });
                dataUtils.batchExecuteSql(sqlArray, function (error) {
                    if (error) {
                        logger("mframework utils.js getMsgSwitch.insertNewSwitch", error);
                    }
                });
            }
        }
    }

    function setMsgSwitch(switchFlag) {
        //保持其他模块拿到的值相应改变
        if (msgSwitch) {
            for (var key in switchFlag) {
                if (switchFlag.hasOwnProperty(key)) {
                    msgSwitch[key] = switchFlag[key];
                }
            }
        }
        else {
            msgSwitch = switchFlag;
        }
    }


    function getTicketSwitch(callback) {
        if (ticketSwitch) {
            callback(null, ticketSwitch);
        }
        else {
            queryFromDB(callback);
        }

        function queryFromDB(callback) {
            var ticketSwitchFlag = {};
            var switchList = ["discount_amount", "balance", "checkoutTicketSwitch", "newCardTicketSwitch", "rechargeTicketSwitch"];
            var replaceArg = [];
            for (var i = 0; i < switchList.length; i++) {
                replaceArg.push("?");
            }

            var querySwitchStatus = "select name,value from sys_config where name in (" + replaceArg.join(",") + ");";
            dbInstance.transaction(function (trans) {
                trans.executeSql(querySwitchStatus, switchList, function (trans, result) {
                    var rowsLen = result.rows.length;
                    var temp;
                    for (var i = 0; i < rowsLen; i++) {
                        temp = result.rows.item(i);
                        ticketSwitchFlag[temp.name] = temp.value;
                    }

                    //查询开关数量不一致、可能新加入了某些小票设置项
                    if (rowsLen !== switchList.length) {
                        var insertSwitch = [];//需要新增的某些开关项
                        _.each(switchList, function (item) {
                            if (!ticketSwitchFlag[item]) {
                                ticketSwitchFlag[item] = "1";//默认关闭状态
                                insertSwitch.push([item, "1"]);
                            }
                        });
                        insertNewSwitch(insertSwitch);
                    }
                    setTicketSwitch(ticketSwitchFlag);
                    callback(null, ticketSwitch);
                }, function (trans, error) {
                    callback(error);
                });
            });

            function insertNewSwitch(switchFlag) {
                var insertSwitch = "insert into sys_config(name,value) values(?,?);";
                var sqlArray = [];
                _.each(switchFlag, function (item) {
                    sqlArray.push({
                        statement: insertSwitch,
                        value: item
                    });
                });
                dataUtils.batchExecuteSql(sqlArray, function (error) {
                    if (error) {
                        logger("mframework utils.js getTicketSwitch.insertNewSwitch", error);
                    }
                });
            }
        }
    }

    function setTicketSwitch(switchFlag) {
        //保持其他模块拿到的值相应改变
        if (ticketSwitch) {
            for (var key in switchFlag) {
                if (switchFlag.hasOwnProperty(key)) {
                    ticketSwitch[key] = switchFlag[key];
                }
            }
        }
        else {
            ticketSwitch = switchFlag;
        }
    }

    //小票打印
    function printTicket(template, callback) {
        if (window.plugins && window.plugins.BluetoothPrinter) {
            window.plugins.BluetoothPrinter.print(template, function () {
                callback(null);
            }, function (error) {
                callback(error);
            });
        }
        else {
            callback("插件不存在");
        }
    }

    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    function isPhoneNumber(phoneNumber) {
        var regExpPhoneNumber = new RegExp(/^(\d|\s|-){1,}$/ig);//匹配数字、空格、-、宽松电话号码匹配
        return regExpPhoneNumber.test(phoneNumber);
    }

    Date.prototype.nextMonth = nextMonth;
    Date.prototype.prevMonth = prevMonth;

    exports.getLastWeekStartDate = getLastWeekStartDate;
    exports.getLastWeekEndDate = getLastWeekEndDate;
    exports.getNextWeekStartDate = getNextWeekStartDate;
    exports.getNextWeekEndDate = getNextWeekEndDate;
    exports.getWeekStartDate = getWeekStartDate;
    exports.getWeekEndDate = getWeekEndDate;


    exports.getCache = getCache;
    exports.showGlobalMsg = showMsg;
    exports.showGlobalSuccessMsg = showGlobalSuccessMsg;
    exports.showAreaSuccessMsg = showAreaSuccessMsg;
    exports.showAreaFailMsg = showAreaFailMsg;
    exports.hiddenGlobalMsg = hiddenMsg;
    exports.deleteFileByPath = deleteFileByPath;
    exports.showSoftKeyboard = showSoftKeyboard;
    exports.getUserData = getUserData;
    exports.log = logger;
    exports.checkStrMinLen = checkStrMinLen;
    exports.checkNum = checkNum;
    exports.endsWith = endsWith;
    exports.isPhoneNumber = isPhoneNumber;
    exports.showTips = showTips;//android原生冒泡提示

    //多个模块需要的信息
    exports.getStoreInfo = getStoreInfo;//获取店铺信息
    exports.setStoreInfo = setStoreInfo;//设置店铺信息
    exports.getMsgSwitch = getMsgSwitch;//获取信息开关
    exports.setMsgSwitch = setMsgSwitch;//设置信息开关
    exports.getTicketSwitch = getTicketSwitch;//获取小票状态开关
    exports.setTicketSwitch = setTicketSwitch;//设置小票状态开关
    exports.printTicket = printTicket;//打印小票

    exports.getPicture = getPicture;
});
