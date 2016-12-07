var at = angular.module("ui-sreach", []);
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
        '<div class="col-md-6 col-sm-6 no-padder-sm" >' +
                '<div class="form-group" style="margin-bottom:40px;" ng-if="flag">'+
                    '<label class="col-md-offset-1 col-sm-offset-1 col-md-3 col-sm-2 control-label">' +
                        '<span>受理状态</span>:' +
                    '</label>' +
                    '<div class="col-md-6 col-sm-6 no-padder-sm">' +
                        '<select class="form-control"  ng-model="search.status" ng-selected="$index==0" style="height:30px;width:300px">' +
                            '<option value="">全部</option>' +
                            '<option value="0">未受理</option>' +
                            '<option value="1">受理中</option>' +
                            '<option value="2">已受理</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" style="margin-bottom:40px;">'+
                    '<label class="col-md-offset-1 col-sm-offset-1 col-md-3 col-sm-2 control-label">' +
                        '<span>创建时间</span>:' +
                    '</label>' +
                    '<div class="col-md-6 col-sm-6 no-padder-sm" style="margin-bottom: 10px;">' +
                        '<div  style="width:300px">'+
                            '<input class="laydate-icon" def-laydate type="text" maxDate="search.endTime" ng-model="search.startTime" style="width:47.5%;height:30px;" />' +
                            '<span style="padding: -1px 2.5%">至</span>'+
                            '<input class="laydate-icon" def-laydate type="text" minDate="search.startTime" ng-model="search.endTime" style="width:47.5%;height:30px;"/>' +
                        '</div>'+
                    '</div>' +
                '</div>' +
                '<div class="form-group" style="margin-bottom:40px;">'+
                    '<label class="col-md-offset-1 col-sm-offset-1 col-md-3 col-sm-2 control-label">' +
                        '<span>工单类型</span>:' +
                    '</label>' +
                    '<div class="col-md-6 col-sm-6 no-padder-sm" style="margin-bottom: 10px;">' +
                        '<div  style="width:300px">'+
                            '<select class="form-control"  ng-model="search.workorderTypeId" ng-selected="$index==0" style="height:30px;width:300px;">' +
                                '<option  value="">全部</option>' +
                                '<option ng-repeat="item in searchParams.workOrderTypeList track by $index" value="{{item.id}}">{{item.typeName}}</option>' +
                            '</select>' +
                        '</div>'+
                    '</div>' +
                '</div>' +
            '<div class="form-group" style="margin-bottom:40px;">'+
                '<label class="col-md-offset-1 col-sm-offset-1 col-md-3 col-sm-2 control-label">' +
                    '<span>工单状态</span>:' +
                '</label>' +
                '<div class="col-md-6 col-sm-6 no-padder-sm" style="margin-bottom: 10px;">' +
                    '<div  style="width:300px">'+
                        '<select class="form-control"  ng-model="search.workorderStatus" ng-selected="$index==0" style="height:30px;width:300px;">' +
                            '<option value="">全部</option>' +
                            '<option value="0">已保存</option>' +
                            '<option value="1">已提交</option>' +
                            '<option value="2">处理完成</option>' +
                        '</select>' +
                    '</div>'+
                '</div>' +
            '</div>' +
                '<div class="form-group" style="margin-bottom:40px;">'+
                    '<label class="col-md-offset-1 col-sm-offset-1 col-md-3 col-sm-2 control-label">' +
                        '<span>问题分类</span>:' +
                    '</label>' +
                    '<div class="col-md-6 col-sm-6 no-padder-sm" style="margin-bottom: 10px;">' +
                        '<div  style="width:300px">'+
                            '<select class="form-control"  ng-model="search.productType" ng-selected="$index==0" style="height:30px;width:300px;">' +
                                '<option  value="">全部</option>' +
                                '<option ng-repeat="item in searchParams.productTypeList track by $index" value="{{item.productType}}">{{item.productName}}</option>' +
                            '</select>' +
                        '</div>'+
                    '</div>' +
                '</div>' +
                '<div class="form-group" style="margin-bottom:40px;">'+
                    '<label class="col-md-offset-1 col-sm-offset-1 col-md-3 col-sm-2 control-label">' +
                        '<span>优先级</span>:' +
                    '</label>' +
                    '<div class="col-md-6 col-sm-6 no-padder-sm" style="margin-bottom: 10px;">' +
                        '<div  style="width:300px">'+
                            '<select class="form-control"  ng-model="search.priority" ng-selected="$index==0" style="height:30px;width:300px;">' +
                                '<option  value="">全部</option>' +
                                '<option ng-repeat="item in searchParams.priorityList track by $index" value="{{item.priorityValue}}">{{item.priorityName}}</option>' +
                            '</select>' +
                        '</div>'+
                    '</div>' +
                '</div>' +

                '<div class="form-group" style="margin-bottom:40px;">'+
                    '<label class="col-md-offset-1 col-sm-offset-1 col-md-3 col-sm-2 control-label">' +
                        '<span>主题</span>:' +
                    '</label>' +
                        '<div class="col-md-6 col-sm-6 no-padder-sm" style="margin-bottom: 10px;">' +
                            '<div  style="width:300px">'+
                            '<input class="form-control" type="text"  ng-model="search.title"  style="height:30px;width:300px;"/>' +
                        '</div>'+
                    '</div>' +
                '</div>' +

                '<div class="form-group" ng-repeat="items in properties" style="margin-bottom:30px;">'+
                    '<label class="col-md-offset-1 col-sm-offset-1 col-md-3 col-sm-2 control-label" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">' +
                        '<input  type="checkbox" checked="true" ng-click="prCheck({$event:$event,items:items})"/>' +
                        '<span title="{{items.propertyName}}" ng-bind="items.propertyName"></span>:' +
                    '</label>' +
                    '<div class="col-md-6 col-sm-6 no-padder-sm" style="margin-bottom:10px;">' +
                        '<select class="form-control" ng-if=items.propertyType=="select"  ng-model="items.propertyValue" ng-selected="$index==0" style="height:30px;width:300px;">' +
                            '<option ng-repeat="item in items.propertyOptions track by $index" value="{{item.optionValue}}">{{item.optionName}}</option>' +
                        '</select>' +
                        '<input class="form-control" type="text" ng-if=items.propertyType=="text" ng-model="items.propertyValue" value="{{items.propertyDefaultValue}}" style="height:30px;width:300px;"/>' +
                        '<textarea class="form-control" ng-if=items.propertyType=="textArea" ng-model="items.propertyValue" style="height:20px;">{{items.propertyDefaultValue}}</textarea>' +
                        '<div ng-if=items.propertyType=="datetime" style="width:300px">'+
                            '<input class="laydate-icon" def-laydate type="text" min-date="items.propertyValue.endTime" ng-model="items.propertyValue.startTime" style="width:47.5%;height:30px;"/>' +
                            '<span style="padding: -1px 2.5%">至</span>'+
                            '<input class="laydate-icon" def-laydate type="text" min-date="items.propertyValue.startTime" ng-model="items.propertyValue.endTime" style="width:47.5%;height:30px;"/>' +
                        '</div>'+
                    '</div>' +
                '</div>'+
            '<button ng-click="prClick()" style="position: absolute;bottom:10px;right:0;">查询</button>' +
        '</div>' +
        '<div class="col-md-6 col-sm-6 no-padder-sm" style="height: 100%">' +
            '<div style="float:right">' +
                '<span>增加过滤器:</span>' +
                '<select  ng-model="propertiesevent" ng-options="item.propertyName for item in allproperties"> '+
                '<option value="">--请选择自定义属性--</option></select>'+
            '</div>' +
        '</div>',
        link: function ($scope, element, attr){
            $scope.$watch('propertiesevent', function (r, t, y) {
                if (r != undefined) {
                    if ($scope.properties.indexOf(r) == -1) {
                        $scope.properties.push(r);
                    }
                }
            });
        }
    }
}]);