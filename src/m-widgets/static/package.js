define(function (require, exports, module) {
    var widgetModule = angular.module("planx.widgets", []);

    var WIDGETS = {
        "pull": require("./mobile/pull/pull-act")
    };

    function initAngularDirectives(widgetModule) {
        widgetModule.filter("toFixed",function() {
            return function(input, len) {
                if(input){
                    return input.toFixed(len);
                }else{
                    return 0;
                }
            }
        });
        widgetModule.filter("urlEncode",function() {
            return function(url) {
                if(url){
                    return encodeURI(url);
                }else{
                    return "";
                }
            }
        });

        widgetModule.filter('makeRange', function() {
            return function(input) {
                var lowBound, highBound;
                switch (input.length) {
                    case 1:
                        lowBound = 0;
                        highBound = parseInt(input[0]) - 1;
                        break;
                    case 2:
                        lowBound = parseInt(input[0]);
                        highBound = parseInt(input[1]);
                        break;
                    default:
                        return input;
                }
                var result = [];
                for (var i = lowBound; i <= highBound; i++)
                    result.push(i);
                return result;
            };
        });


        widgetModule.directive("ngTap", ['$parse', function ($parse) {
            return function (scope, element, attrs) {
                var tapping,tapOffsetX,tapOffsetY;
                tapping = false;

                element.bind('touchstart', function (e) {
                    var touch = event.touches[0];
                    tapOffsetX = touch.screenX;
                    tapOffsetY = touch.screenY;
                    element.addClass('active');
                    tapping = true;
                });
                element.bind('touchmove', function (e) {
                    var touch = event.touches[0];
                    element.removeClass('active');
                    //移动超过48像素才不算tap点击处理
                    if(Math.abs(touch.screenX - tapOffsetX) > 48){
                        tapping = false;
                    }
                    if(Math.abs(touch.screenY - tapOffsetY) > 48){
                        tapping = false;
                    }
                });
                element.bind('touchend', function (e) {
                    element.removeClass('active');
                    if (tapping) {
                        var fn = $parse(attrs["ngTap"]);
                        scope.$apply(function () {
                            fn(scope, {$event: e});

                        });
                    }
                });
            }
        }]);

        //长按一秒触发时间
        widgetModule.directive("ngPress", ['$parse', function ($parse) {
            return function (scope, element, attrs) {
                var tapping, tapMill;
                tapping = false;
                element.bind('touchstart', function (e) {
                    element.addClass('active');
                    tapping = true;
                    tapMill = new Date().getTime();
                    setTimeout(function (e) {
                        if (tapping) {
                            var fn = $parse(attrs["ngPress"]);
                            scope.$apply(function () {
                                fn(scope, {$event: e});
                            });
                        }
                    }, 1000);
                });
                element.bind('touchmove', function (e) {
                    element.removeClass('active');
                    tapping = false;
                });
                element.bind('touchend', function (e) {
                    element.removeClass('active');
                    tapping = false;
                });
            }
        }]);

        widgetModule.directive('infiniteScroll', [
            '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
                return {
                    link: function(scope, elem, attrs) {
                        var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
                        $window = angular.element($window);
                        scrollDistance = 0;
                        if (attrs.infiniteScrollDistance != null) {
                            scope.$watch(attrs.infiniteScrollDistance, function(value) {
                                return scrollDistance = parseInt(value, 10);
                            });
                        }
                        scrollEnabled = true;
                        checkWhenEnabled = false;
                        if (attrs.infiniteScrollDisabled != null) {
                            scope.$watch(attrs.infiniteScrollDisabled, function(value) {
                                scrollEnabled = !value;
                                if (scrollEnabled && checkWhenEnabled) {
                                    checkWhenEnabled = false;
                                    return handler();
                                }
                            });
                        }
                        handler = function() {
                            var elementBottom, remaining, shouldScroll, windowBottom;
                            windowBottom = $window.height() + $window.scrollTop();
                            elementBottom = elem.offset().top + elem.height();
                            remaining = elementBottom - windowBottom;
                            shouldScroll = remaining <= $window.height() * scrollDistance;
                            if (shouldScroll && scrollEnabled) {
                                if ($rootScope.$$phase) {
                                    return scope.$eval(attrs.infiniteScroll);
                                } else {
                                    return scope.$apply(attrs.infiniteScroll);
                                }
                            } else if (shouldScroll) {
                                return checkWhenEnabled = true;
                            }
                        };
                        $(elem).parent().on('scroll', handler);
                        scope.$on('$destroy', function() {
                            return $window.off('scroll', handler);
                        });
                        return $timeout((function() {
                            if (attrs.infiniteScrollImmediateCheck) {
                                if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                                    return handler();
                                }
                            } else {
                                return handler();
                            }
                        }), 0);
                    }
                };
            }
        ]);
    }

    exports.init = function () {
        initAngularDirectives(widgetModule);
    };

    exports.WIDGETS = WIDGETS;

});