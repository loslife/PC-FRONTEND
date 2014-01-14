define(function (require, exports, module) {
    var controlTargets = {
        enabled: false,
        startDate: new Date("2013/10/1 12:00").getTime(),
        endDate: new Date().getTime(),
        memberCount: 60,
        billCount: 400
    };

    exports.controlTargets = controlTargets;
});