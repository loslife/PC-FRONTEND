/**
 * Created with JetBrains WebStorm.
 * User: yilos
 * Date: 13-10-4
 * Time: 下午9:36
 * To change this template use File | Settings | File Templates.
 */
define(function (require, exports, module) {
    var i, resItem, language;
    //模块国际化资源
    var i18nModuleRes = [
        require("./i18nResExampleCN"),
        require("./i18nResExampleUS")
    ];

    //应用国际化资源、
    var i18nResource = {};

    //循环模块、循环模块中声明语言类型、循环该语言中的资源
    for (i = 0; i < i18nModuleRes.length; i++) {
        for (language in i18nModuleRes[i]) {
            if (i18nModuleRes[i].hasOwnProperty(language)) {
                if (!i18nResource[language]) {
                    i18nResource[language] = {};
                }
                for (resItem in i18nModuleRes[i][language]) {
                    if (i18nModuleRes[i][language].hasOwnProperty(resItem)) {
                        i18nResource[language][resItem] = i18nModuleRes[i][language][resItem];
                    }
                }
            }
        }
    }
    angular.module("planx.i18n", [])
        .filter("i18n", ["localizedTexts", "$rootScope", function (localizedTexts, $rootScope) {
            return function (text) {
                currentLanguage = $rootScope.language || "en_US";
                if (localizedTexts[currentLanguage].hasOwnProperty(text)) {
                    return localizedTexts[currentLanguage][text];
                }
                return text;
            };
        }])
        .value("localizedTexts", i18nResource);
});