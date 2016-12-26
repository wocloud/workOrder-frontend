var uiLaydate=angular.module("ui-laydate",[]);
uiLaydate.directive('defLaydate', function($timeout) {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            ngModel: '=',
            min:'=',
            max: '='
        },
        link: function(scope, element, attr, ngModel) {
            scope._date = null;
            scope._config = {};
            var myDate = new Date();
            $timeout(function()
            {
                scope._config = {
                    istime: true,
                    elem: "#" + element.attr("id", myDate.getMilliseconds()).context.id,
                    format: attr.format != undefined && attr.format != '' ? attr.format : 'YYYY-MM-DD hh:mm:ss',
                    max: attr.hasOwnProperty('maxDate') ? attr.maxDate : '2099-06-16 23:59:59',
                    min: attr.hasOwnProperty('minDate') ? attr.minDate : '1900-01-01 00:00:00',
                    choose: function (data) {
                        scope.$apply(setViewValue);
                    },
                    clear: function () {
                        ngModel.$setViewValue(null);
                    }
                };
                // 初始化
                scope._date = laydate(scope._config);
                // 模型值同步到视图上
                ngModel.$render = function () {
                    element.val(ngModel.$viewValue);
                };
                setViewValue();
                // 更新模型上的视图值
                function setViewValue() {
                    var val = element.val();
                    ngModel.$setViewValue(val);
                }

                //监听事件
                 scope.$watch('min',function(a, b,c){
                     if(a){
                         scope._config.min=a;
                         scope._date = laydate(scope._config);
                     }
                 });
                 scope.$watch('max',function(a, b,c){
                     if(a){
                         scope._config.max=a;
                         scope._date = laydate(scope._config);
                     }
                 });
                // 监听元素上的事件
                element.on('blur keyup change', function (e) {
                    scope.$apply(setViewValue);
                });
            },0)
        }
    }
});