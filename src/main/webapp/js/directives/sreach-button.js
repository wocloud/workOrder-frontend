angular.module("sreach-button",[]).directive("sreachButton", function () {
    return{
        restrict: 'AE',
        template:
        '<div>' +
            '<div ng-show="isShow">' +
                '<div ng-transclude></div>'+
            '</div>' +
        '<div>' +
        '<button class="footer_list_collect" ng-click="show()"><i class="fa {{istyle}}" aria-hidden="true"></i>{{title}}</button></div>'+
        '</div>' +
        '</div>',
        transclude:true,
        link:function(scope){
            scope.isShow=false;
            scope.title="展开"
            scope.istyle="fa-angle-double-down"
            scope.show=function(){
                scope.isShow=!scope.isShow;
                if(scope.isShow){
                    scope.istyle="fa-angle-double-up";
                    scope.title="收起";
                }else{
                    scope.istyle="fa-angle-double-down";
                    scope.title="展开";
                }

            }
        }
    };
})