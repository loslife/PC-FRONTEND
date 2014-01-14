define(function (require, exports, module) {
    require("./i18n");
    var _appModule,
        _serviceFactory = {},
        _modelRoot = {},
        _directives = {},
        _services = {},
        _filters = {},
        _appInjector;
    exports.initAppModule = function (_module) {
        _appModule = angular.module("planx.mvc", ["planx.widgets", "planx.i18n"]).provider({
            $exceptionHandler: function () {
                var handler = function (exception, cause) {
                    console.log(exception);
                    console.log(exception.message);
                    console.log(exception.stack);
                    console.log(cause);
                };

                this.$get = function () {
                    return handler;
                };
            }
        })
        .directive([ 'focus', 'blur', 'keyup', 'keydown', 'keypress' ].reduce(function (container, name) {
                var directiveName = 'ng' + name[ 0 ].toUpperCase() + name.substr(1);
                container[ directiveName ] = [ '$parse', function ($parse) {
                    return function (scope, element, attr) {
                        var fn = $parse(attr[ directiveName ]);
                        element.bind(name, function (event) {
                            scope.$apply(function () {
                                fn(scope, {
                                    $event: event
                                });
                            });
                        });
                    };
                } ];

                return container;
            }, { }));
        _.each(_directives, function (value, key) {
            _appModule.directive(key, value);
        });
        _.each(_services, function (value, key) {
            _appModule.factory(key, value);
        });
        _.each(_filters, function (value, key) {
            _appModule.filter(key, value);
        });
        _appInjector = angular.bootstrap(document, ["planx.mvc"])
        _modelRoot = _appInjector.get("$rootScope");
        return _appModule;
    }
    exports.getAngularService = function (serviceName) {
        return _appInjector.get(serviceName);
    }
    exports.getAppModule = function () {
        return _appModule;
    }
    exports.on = function (eventName, callback) {
        _modelRoot.$on(eventName, callback);
    }
    exports.rootController = function ($scope) {

    }
    exports.$rootScope = _modelRoot;
    exports.registeModes = function (moduleId, featureId, model) {
        if (model) {
            _modelRoot[moduleId + "_" + featureId] = model;
        } else {
            _modelRoot[moduleId + "_" + featureId] = {};
        }
    };
    exports.registeFilters = function (id, filter) {
        _filters[id] = filter;
    }
    exports.registeServices = function (id, service) {
        _services[id] = service;
    }
    exports.registeDirectives = function (id, directive) {
        _directives[id] = directive;
    }
})