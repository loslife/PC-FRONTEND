define(function (require, exports, module) {
    exports.jqueryExtend = function(){
        $.validator.addMethod(
            "regex",
            function(value, element, regexp) {
                if (regexp.constructor != RegExp)
                    regexp = new RegExp(regexp);
                else if (regexp.global)
                    regexp.lastIndex = 0;
                return this.optional(element) || regexp.test(value);
            },
            "Please check your input."
        );

        $.validator.addMethod(
            "monilePhone",
            function(value, element) {
                var regexp = /^(1(([35][0-9])|(47)|[8][0123456789]))\d{8}$/;
                if (regexp.constructor != RegExp)
                    regexp = new RegExp(regexp);
                else if (regexp.global)
                    regexp.lastIndex = 0;
                return this.optional(element) || regexp.test(value);
            },
            "手机号格式不正确，11位国内手机"
        );
    }
})