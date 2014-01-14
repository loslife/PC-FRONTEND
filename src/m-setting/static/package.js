//注册模块内部特性
define(function (require, exports, module) {
    exports.setting = require("./setting.js");
    exports.service = require("./service.js");
    exports.member = require("./member.js");
    exports.show = require("./show.js");
    exports.store = require("./store.js");
    exports.employee = require("./employee.js");
    exports.performance = require("./performance.js");
    exports.backup = require("./backup.js");
    exports.account = require("./account.js");
    exports.aboutlos = require("./aboutlos.js");
    exports.messageCenter = require("./messageCenter.js");
    exports.terminal = require("./terminal.js");
    exports.newGuide = require("./newGuide.js");
});