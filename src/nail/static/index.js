document.documentElement.style.webkitTouchCallout = "none";
document.documentElement.style.webkitUserSelect = "none";
function getRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
window.global = {_g_server: {}, setting: {lockable: true}};
global["_g_server"].protocol = "http";
global["_g_server"].ip = "";
global["_g_server"].staticurl = "";
global["_g_server"].uploadurl = "http://www.yilos.com/svc/file-upload";
global["_g_server"].authurl = "http://www.yilos.com/svc";
global["_g_server"].serviceurl = "http://www.yilos.com/svc";
global["_g_env"] = "production";
var YILOS = {
    model: "production",
    dbinstance: null,
    startTime: (new Date()).getTime(),
    deviceID: getRequest()["deviceRequestId"],
    USERNAME: getRequest()["username"],
    ENTERPRISEID: getRequest()["enterpriseId"],
    INITCLEANCACHE: getRequest()["cleanWebCache"],
    LANGUAGE: getRequest()["language"],
    DOCPATH: getRequest()["docpath"]
}

if(!YILOS.DOCPATH){
    YILOS.DOCPATH = "/sdcard/yilos/nailshop";
}

function getDeviceId(){
    //当前毫秒数到2013-1-1的分钟数除600000的余数，大致对应当前时间对应的分钟数
    var intervalTo2013 = ((new Date().getTime()-new Date("2013/1/1").getTime())/60000)%600000;
    return  parseInt(intervalTo2013);
}

var YILOS_NAIL_MODULE = {
    MEMBER: "member",
    EMPLOYEE: "employee",
    SERVICE: "service",
    SHOW: "show",
    SERVICEBILL: "serviceBill",
    USERS: "users",
    ENTERPRISE: "enterprise"
}

var ENV = {
    OFFLINE: 1,
    MOBILE: 2,
    NORMAL: 0
}
var planx = {},                                   //全局名字空间，放全局对象
    dbVersion,                                        //数据库schema版本号，代表数据库表结构版本，如果版本号发生变化会出发客户端重新创建表结构
    localtag = false;
global.ismobile = true;
global.eventEmitter = new EventEmitter();

function PlanxIndex(scope) {
    this.rootScope = scope;
    this.rootScope.main = {subMenus: []};
    this.viewMap = {currentFeatureId: ""};
};
PlanxIndex.prototype.layout = {
    showAll: function (options) {
    },
    hideLeft: function () {
    },
    hideRight: function () {
    }
}
//主页面控制器，构造全局的控制模型
var mainController = function ($scope, $location, $rootScope) {
    $rootScope.language = "zh_CN";
    if (window.LosNailActivity) {
        $rootScope.language = window.LosNailActivity.getLanguage();
    }
    planx = new PlanxIndex($scope.$parent);

    $scope.clickMainMenu = function (path, module, feature, $event) {
        YILOS.startTime = (new Date()).getTime();
        $("#header .nav>li").removeClass("selected");
        $($event.target).closest("li").addClass("selected");

        //如果管理台界面第一次进入，提示设置密码
        if (global.setting.lockable && path == "/m-setting/setting") {
            global.eventEmitter.emitEvent('client.password.lock');
        } else {
            global.eventEmitter.emitEvent('client.password.disablelock');
        }
        $location.path(path);
    }
    $rootScope.backto = function (url) {
        $location.path(url);
    }
};

window.activeLoadingFinished = false;
seajs.config({
    base: "../../sea_modules/"
});
seajs.use(['nail/static/main.js', 'mframework/static/package.js',
    'm-widgets/static/package.js'], function (main, framework, widgets) {
    framework.utils.global.enterpriseId = $.cookie('enterpriseId');
    framework.utils.global.username = $.cookie('username');
    framework.utils.global.userId = $.cookie('userId');
    widgets.init();
    $.i18n.init({
        lng: YILOS.LANGUAGE,
        fallbackLng:false,
        ns: { namespaces: ['resource',"ios_resource"], defaultNs: 'resource'},
        useLocalStorage: false,
        debug: false
    }, function() {
        var options = {
            LANGUAGE: YILOS.LANGUAGE
        }
        main.init(options);
    });

});

/**
 * 初始化测试数据
 */
function initTestData() {
    seajs.use(['nail/package.js'], function (mock) {
        mock.mockData.init();
    });
}

//用例数据初始化完成
function guideDataInitFinish() {
    global.eventEmitter.emitEvent("guideData.checkout.finish");
}


$(function () {
    $("#client-lock-pwd .button-calculator").bind('touchstart', function () {
        var num = this.dataset["num"];
        if (num == "-1") {
            for (var i = 4; i > 0; i--) {
                if ($("#pwd-" + i).val()) {
                    $("#pwd-" + i).val("");
                    return;
                }
            }
        }
        else if (num == "setting") {
            var pwd = "";
            for (var i = 1; i <= 4; i++) {
                if ($("#pwd-" + i).val()) {
                    pwd += $("#pwd-" + i).val();

                }
            }
            //设置客户端密码
            global.eventEmitter.emitEvent('client.password.setting', [pwd]);
        }
        else if (num == "ok") {
            var pwd = "";
            //比较数据,解锁
            for (var i = 1; i <= 4; i++) {
                if ($("#pwd-" + i).val()) {
                    pwd += $("#pwd-" + i).val();

                }
            }
            global.eventEmitter.emitEvent('client.password.unlock', [pwd]);
        } else {
            $("#client-lock-pwd>div>ul>li input").each(function (i) {
                if (!$(this).val()) {
                    $(this).val(num)
                    var pwd = "";
                    for (var i = 1; i <= 4; i++) {
                        if ($("#pwd-" + i).val()) {
                            pwd += $("#pwd-" + i).val();
                        }
                    }
                    if ($("#client-lock-pwd-setting").is(":hidden") && pwd.length == 4) {
                        global.eventEmitter.emitEvent('client.password.unlock', [pwd]);
                    }
                    return false;
                }
            });
        }

    });
});

function validateAccessToken() {
    var locationhash = window.location.hash;
    if (locationhash.indexOf("#/") == 0) {
        locationhash = locationhash.replace("#/", "");
    }
    var hash_data = {
    };
    $.each(locationhash.replace("#", "").split("&"), function (i, value) {
            value = value.split("=");
            if (!hash_data[value[0]]) {
                hash_data[value[0]] = [];
            }
            hash_data[value[0]].push(value[1]);
        }
    );
    if ($.cookie('accessToken')) {
        ENV.access_token = $.cookie('accessToken');
    }
    if (hash_data["access_token"]) {
        $.cookie('accessToken', hash_data["access_token"][0]);
        ENV.access_token = hash_data["access_token"][0];
    }

    if (ENV.access_token) {
        //校验token有效性，如果无效跳转登陆界面
        $.ajax({
            type: "GET",
            url: global["_g_server"].authurl + "/oauth/validate",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + $.cookie('accessToken')
            },
            success: function (response, status, xhr) {
                //设置全局对象
                $.cookie('enterpriseId', response.enterpriseId)

                $.cookie('userId', response.userId)

                $.cookie('username', response.username)

                $(".search-global .badge .username").html(response.username);
            },
            error: function (xhr, textStatus, errorThrown) {
                if (xhr.status == 401) {
                    window.location.href = global["_g_server"].staticurl + "/portal/index.html"
                }
            }
        });
    } else {
        //跳转登陆界面
        window.location.href = global["_g_server"].staticurl + "/portal/index.html"
    }
}