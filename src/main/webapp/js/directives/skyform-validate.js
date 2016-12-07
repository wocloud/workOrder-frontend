/**
 * Created by Administrator on 2016-11-03.
 */
var val=angular.module('sky-validate', [])
val.directive('validatehttp',Validatehttp);
val.directive('validateip',Validateip);
val.directive('validateport',Validateport);
val.directive('validatephone',Validatephone);

//验证电话号
Validatephone.$inject=['$timeout'];
function Validatephone($timeout) {
    return {
        restrict: "A",
        require:"ngModel",
        link: function($scope, el, attr,ngModelController) {
            ngModelController.$parsers.push(function(viewValue){
                var pattern = /^0?1[3|4|5|8][0-9]\d{8}$/;
                if(pattern.test(viewValue)){
                    ngModelController.$setValidity('validatephone',true);
                }else{
                    ngModelController.$setValidity('validatephone',false);
                }
                return viewValue;
            });
        }
    };
};
//验证http://192.168.1.1
Validatehttp.$inject=['$timeout','service.RES'];
function Validatehttp($timeout,serviceRES) {
    return {
        restrict: "A",
        require:"ngModel",
        link: function($scope, el, attr,ngModelController) {
            ngModelController.$parsers.push(function(viewValue){
                var pattern = /^((https|http|ftp|rtsp|mms)?:\/\/)((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))/;
                if(pattern.test(viewValue)){
                    ngModelController.$setValidity('validatehttp',true);
                }else{
                    ngModelController.$setValidity('validatehttp',false);
                }
                return viewValue;
            });
        }
    };
};
//验证IP
Validateip.$inject=['$timeout','service.RES'];
function Validateip($timeout,serviceRES) {
    return {
        restrict: "A",
        require:"ngModel",
        link: function($scope, el, attr,ngModelController) {
            ngModelController.$parsers.push(function(viewValue){
                var pattern = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))/;
                if(pattern.test(viewValue)){
                    ngModelController.$setValidity('validateip',true);
                }else{
                    ngModelController.$setValidity('validateip',false);
                }
                return viewValue;
            });
        }
    };
};
//验证端口
Validateport.$inject=['$timeout','service.RES'];
function Validateport($timeout,serviceRES) {
    return {
        restrict: "A",
        require:"ngModel",
        link: function($scope, el, attr,ngModelController) {
            ngModelController.$parsers.push(function(viewValue){
                var pattern = /^[1-9]$|(^[1-9][0-9]$)|(^[1-9][0-9][0-9]$)|(^[1-9][0-9][0-9][0-9]$)|(^[1-6][0-5][0-5][0-3][0-5]$)/;
                if(pattern.test(viewValue)){
                    ngModelController.$setValidity('validateport',true);
                }else{
                    ngModelController.$setValidity('validateport',false);
                }
                return viewValue;
            });
        }
    };
};