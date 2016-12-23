var at = angular.module("ui-sreach", []);
at.service('storeService',['$window',function($window){
    return {        //存储单个属性
        set: function (key, value) {
            $window.localStorage[key] = value;
        },        //读取单个属性
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },        //存储对象，以JSON格式存储
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },        //读取对象
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        delObject:function(){
            for(var key in $window.localStorage){
                delete $window.localStorage[key];
            }
            return;
        }
    }
}]);
at.directive("myWorkOrderSreach", ['ngDialog','$q','$resource',function (ngDialog,$q,$resource) {
    return {
        restrict: 'AE',
        scope: {
            properties: '=',
            allproperties: '=',
            prClick: '&',
            prCheck: '&',
            propertiesevent: '=',
            status:'=',
            addproperties:"@",
            haveproperties:"=",
            haveCms:"&",
            search:"=",
            flag:"=",
            searchParams:"="
        },
        template:''+
            '<div class="row _swithch__board_heard_ search-box clear">' +
        '<form  class="file-brief file-brief-show form-validation" name="workOrderSearchForm"  id="form-new-style">'+
        '<div class="col-sm-6 m-t-xs m-b-xs" >' +
                '<div class="form-group"  ng-if="flag">'+
                    '<label class="col-md-3 col-sm-2 control-label">' +
                        '<span>受理状态</span>:' +
                    '</label>' +
                    '<div class="col-md-9 col-sm-9">' +
                        '<select class="form-control"  ng-model="search.status" ng-selected="$index==0">' +
                            '<option value="">全部</option>' +
                            '<option value="0">未受理</option>' +
                            '<option value="1">受理中</option>' +
                            '<option value="2">已受理</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" ">'+
                    '<label class="col-md-3 col-sm-2 control-label">' +
                        '<span>创建时间</span>:' +
                    '</label>' +
                    '<div class="col-md-9 col-sm-9">' +
                        '<input class="form-control laydate-icon" def-laydate type="text" max="search.endTime" ng-model="search.startTime" style="width:45.5%;" />' +
                        '<span style="padding: -1px 2.5%">至</span>'+
                        '<input class="form-control laydate-icon" def-laydate type="text" min="search.startTime" ng-model="search.endTime" style="width:45.5%;"/>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" ">'+
                    '<label class="col-md-3 col-sm-2 control-label">' +
                        '<span>工单类型</span>:' +
                    '</label>' +
                    '<div class="col-md-9 col-sm-9" ">' +
                        '<select class="form-control"  ng-model="search.workorderTypeId">' +
                            '<option  value="">全部</option>' +
                            '<option ng-repeat="item in searchParams.workOrderTypeList track by $index" value="{{item.id}}" ng-selected="item.id==search.workorderTypeId">{{item.typeName}}</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" >'+
                    '<label class="col-md-3 col-sm-2 control-label">' +
                        '<span>工单状态</span>:' +
                    '</label>' +
                    '<div class="col-md-9 col-sm-9" ">' +
                        '<select class="form-control"  ng-model="search.workorderStatus" ng-selected="$index==0" >' +
                            '<option value="">全部</option>' +
                            '<option value="0">已保存</option>' +
                            '<option value="1">已提交</option>' +
                            '<option value="2">处理完成</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" >'+
                    '<label class="col-md-3 col-sm-2 control-label">' +
                        '<span>问题分类</span>:' +
                    '</label>' +
                    '<div class="col-md-9 col-sm-9" >' +
                        '<select class="form-control"  ng-model="search.productType" >' +
                            '<option  value="">全部</option>' +
                            '<option ng-repeat="item in searchParams.productTypeList track by $index" value="{{item.productType}}" ng-selected="item.productType==search.productType">{{item.productName}}</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" >'+
                    '<label class="col-md-3 col-sm-2 control-label">' +
                        '<span>优先级</span>:' +
                    '</label>' +
                    '<div class="col-md-9 col-sm-9" >' +
                        '<select class="form-control"  ng-model="search.priority" >' +
                            '<option  value="">全部</option>' +
                            '<option ng-repeat="item in searchParams.priorityList track by $index" value="{{item.priorityValue}}" ng-selected="item.priorityValue==search.priority">{{item.priorityName}}</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +

                '<div class="form-group" >'+
                    '<label class="col-md-3 col-sm-2 control-label">' +
                        '<span>主题</span>:' +
                    '</label>' +
                    '<div class="col-md-9 col-sm-9" >' +
                        '<input  class="form-control" type="text"  ng-model="search.title"  />' +
                    '</div>'+
                '</div>' +

                '<div class="form-group" ng-repeat="items in properties" >'+
                    '<label class="col-md-3 col-sm-2 control-label" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">' +
                        '<input  type="checkbox" checked="true" ng-click="prCheck({$event:$event,items:items})"/>' +
                        '<span title="{{items.propertyName}}" ng-bind="items.propertyName"></span>:' +
                    '</label>' +
                    '<div class="col-md-9 col-sm-9" ">' +
                        '<select class="form-control" ng-if=items.propertyType=="select"  ng-model="items.propertyValue" ng-selected="$index==0" ">' +
                            '<option   value="" ng-if=items.propertyValue=="">请选择</option>' +
                            '<option ng-repeat="item in items.propertyOptions track by $index" value="{{item.optionValue}}">{{item.optionName}}</option>' +
                        '</select>' +
                        '<input class="form-control" type="text" ng-if=items.propertyType=="text" ng-model="items.propertyValue" value="{{items.propertyDefaultValue}}" "/>' +
                        '<textarea class="form-control" ng-if=items.propertyType=="textarea" ng-model="items.propertyValue" style="height:20px;">{{items.propertyDefaultValue}}</textarea>' +
                        '<div ng-if=items.propertyType=="datetime" >'+
                            '<input class=" form-control laydate-icon" def-laydate type="text" min-date="items.propertyValue.endTime" ng-model="items.propertyValue.startTime" style="width:45.5%;"/>' +
                            '<span style="padding: -1px 2.5%">至</span>'+
                            '<input class=" form-control laydate-icon" def-laydate type="text" min-date="items.propertyValue.startTime" ng-model="items.propertyValue.endTime" style="width:45.5%;"/>' +
                        '</div>'+
                    '</div>' +
                '</div>' +
            '<div class="form-group common-group" style="position: absolute;bottom:5px;right: -100px;">' +
                '<button type="button" class="operate-btn on" ng-click="prClick()">' +
                    '<i class="glyphicon glyphicon-search"></i>' +
                    '<span>查找</span> ' +
                ' </button> ' +
            '</div>'+
        '</div>'+
        '<div class="col-sm-6 m-t-xs m-b-xs" style="height: 100%">' +
        '<div style="float:right">' +
        '<span>增加过滤器:</span>' +
        '<select  class="form-control" ng-model="propertiesevent" ng-options="item.propertyName for item in allproperties"> '+
        '<option value="">--请选择自定义属性--</option></select>'+
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</form>',
        link: function ($scope, element, attr){
            $scope.$watch('propertiesevent', function (r, t, y) {
                if (r != undefined) {
                    if ($scope.properties.indexOf(r) == -1) {
                        if(r.propertyDefaultValue==null|| r.propertyDefaultValue==""){
                            r.propertyValue="";
                        }else{
                            r.propertyValue=r.propertyDefaultValue;
                        }
                        $scope.properties.push(r);
                    }
                }
            });
        }
    }
}]);