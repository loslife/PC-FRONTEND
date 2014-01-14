define(function (require, exports, module) {
    exports.framework = require("./mvc/framework");
    exports.uiRouter = require("./mvc/uirouter");
    exports.errorHandler = require("./utils/errorHandler");
    exports.urls = require("./utils/urls");
    exports.utils = require("./utils/utils");
    exports.database = require("./utils/database");
    exports.cache = require("./utils/cache");
    exports.RSA = require("./utils/RSA");
    exports.addressData = require("./utils/addressData");
    exports.dataUtils = require("./utils/dataUtils");
});