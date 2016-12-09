'use strict';
/**
 * Created by sophia.wang on 16/11/4.
 */
(function(){

    /**
     * flow status filter
     * @returns {Function}
     * @constructor
     */
    app.filter('status', Status);
    function Status (){
        return function(input){
            if ( input == "open") {
                return  "启用";
            } else if(input == "closed") {
                return "已挂起";
            }
        };
    };
    app.filter('dit', dit);
    function dit (){
        return function(input){
            if ( input == 1) {
                return  true;
            } else if(input == 0) {
                return false;
            }
        };
    };
    app.filter('priorityStatus', priorityStatus);
    function priorityStatus (){
        return function(input){
            if ( input == 0) {
                return  "低";
            } else if(input == 1) {
                return "中";
            }
            else if(input == 2) {
                return "高";
            }
        };
    };
    app.filter('productTypeStatus', productTypeStatus);
    function productTypeStatus (){
        return function(input){
            if ( input == 1001) {
                return  "云主机";
            } else if(input == 1002) {
                return "云存储";
            }
            else {
                return "其他";
            }
        };
    };
    app.filter('performerStatus', performerStatus);
    function performerStatus (){
        return function(input){
            if ( input == 1) {
                return  "受理中";
            } else if(input == 2) {
                return "已受理";
            }
            else {
                return "未受理";
            }
        };
    };
    app.filter('workorderStatus', workorderStatus);
    function workorderStatus (){
        return function(input){
            if ( input == 0) {
                return  "已保存";
            } else if(input == 1) {
                return "已提交";
            }
            else {
                return "处理完成";
            }
        };
    };

    /**
     * myWorkOrder list controller defined
     */
    app.controller('MyWorkOrderCtrl', MyWorkOrderViewCtrl);
    MyWorkOrderViewCtrl.$inject = ['$scope', '$rootScope', 'ngDialog', '$log', 'MyWorkOrder.RES', '$state','i18nService'];
    function MyWorkOrderViewCtrl($scope, $rootScope, ngDialog, $log, myWorkOrderRES, $state,i18nService) {
    	i18nService.setCurrentLang("zh-cn");
    	$scope.status;
        $scope.search={};
        $scope.yel=true;
        var index = 0;//默认选中行，下标置为0
        $scope.myGridOptions = {
            columnDefs: [
                {
                    field: 'id',
                    displayName: 'ID',
                    type:'number',
                    cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope"><a class="text-info" ui-sref="app.workOrderInfo({id:row.entity.linkId, flag:\'my\'})">{{row.entity.id}}</a></div>'
                },
                {
                    field: "workorderType",
                    displayName: '工单类型'

                },
                {
                    field: "title",
                    displayName: '主题'
                },
                {
                    field: "priority",
                    displayName: '优先级',
                    cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.priority|priorityStatus}}</div>'
                },
                {
                    field: "productType",
                    displayName: '问题分类',
                    cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.productType|productTypeStatus}}</div>'
                },
                {
                    field: "linkName",
                    displayName: '当前环节'
                },
                {
                    field: "performerName",
                    displayName: '受理人'
                },
                {
                    field: "status",
                    displayName: '受理状态',
                    cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.status|performerStatus}}</div>'
                },
                {
                    field: "workorderStatus",
                    displayName: '工单状态',
                    cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.workorderStatus|workorderStatus}}</div>'
                },
                {
                    field: "contactName",
                    displayName: '联系人'
                },

                {
                    field: "ownerName",
                    displayName: '创建人'
                },
                {
                    field: "createTime",
                    displayName: '创建时间'
                }],
            enableCellEdit: false, // 是否可编辑
            enableSorting: true, //是否排序
            useExternalSorting: false, //是否使用自定义排序规则
            enableGridMenu: true, //是否显示grid 菜单
            showGridFooter: false, //是否显示grid footer
            enableHorizontalScrollbar: 0, //grid水平滚动条是否显示, 0-不显示  1-显示
            enableVerticalScrollbar: 0, //grid垂直滚动条是否显示, 0-不显示  1-显示
            //-------- 分页属性 ----------------
            enablePagination: true, //是否分页，默认为true
            enablePaginationControls: true, //使用默认的底部分页
            paginationPageSizes: [10], //每页显示个数可选项
            paginationCurrentPage: 1, //当前页码
            paginationPageSize: 10, //每页显示个数
            //paginationTemplate:"<div></div>", //自定义底部分页代码
            totalItems: 0, // 总数量
            //----------- 选中 ----------------------
            enableFooterTotalSelected: false, // 是否显示选中的总数，默认为true, 如果显示，showGridFooter 必须为true
            enableFullRowSelection: true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
            enableRowHeaderSelection: true, //是否显示选中checkbox框 ,默认为true
            enableRowSelection: true, // 行选择是否可用，默认为true;
            enableSelectAll: true, // 选择所有checkbox是否可用，默认为true;
            enableSelectionBatchEvent: true, //默认true
            isRowSelectable: function (row) { //GridRow
                index += 1;//下标加1
                if (index == 1) {
                    row.grid.api.selection.selectRow(row.entity);
                }
            },
            modifierKeysToMultiSelect: true,//默认false,为true时只能 按ctrl或shift键进行多选, multiSelect 必须为true;
            multiSelect: true,// 是否可以选择多个,默认为true;
            noUnselect: true,//默认false,选中后是否可以取消选中
            useExternalPagination: true, //是否使用客户端分页,默认false
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                //分页按钮事件
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    if (getPage) {
                        $scope.queryByCondition(newPage,pageSize)
                    }
                });
                //行选中事件
                $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if (row && row.isSelected) {
                        $scope.selectedRows = row.entity;
                        $scope.status = row.entity.workorderStatus;
                    }
                });
            }
        };
        var getPage = function (curPage, pageSize, totalSize,workOrders) {
            index = 0;//下标置为0
            $scope.myGridOptions.totalItems = totalSize;
            $scope.myGridOptions.data = workOrders;
        };
        $scope.searchParams={};
        myWorkOrderRES.list_typeCode().then(function (result) {
            $scope.searchParams.workOrderTypeList= result.data;  //每次返回结果都是最新的
        });
        myWorkOrderRES.list_priority().then(function (result) {
            $scope.searchParams.priorityList= result.data;
        });
        myWorkOrderRES.list_ProductType().then(function (result) {
            $scope.searchParams.productTypeList= result.data;  //每次返回结果都是最新的
        });
        $scope.addCms=function(){
            angular.forEach($scope.haveproperties,function(a1,b1,c1){
                var ds=true;
                angular.forEach($scope.myGridOptions.columnDefs,function(a,b,c){
                    if(a1.propertyKey== a.field){
                         ds=false ;
                        return;
                    }
                });
                if(ds){
                    var param={
                        field:a1.propertyKey,
                        displayName:a1.propertyName
                    };
                    $scope.myGridOptions.columnDefs.push(param);
                }
            });
        };
        $scope.selectInstanceLinkPropertyList=function(instanceLinkPropertyList){
            angular.forEach(instanceLinkPropertyList,function(data,index){
                for(var i in data){
                    if(i!=null&&i=="propertyOptions"){
                        data[i]=JSON.stringify(data[i])
                    }
                }
            });
            return instanceLinkPropertyList;
        }
        $scope.queryByCondition = function (page,pageSize) {
            var instanceLinkPropertyList=$scope.properties;
            $scope.search.instanceLinkPropertyList=$scope.selectInstanceLinkPropertyList(instanceLinkPropertyList);
            $scope.search.page=page!=undefined?page:1;
            $scope.search.size=pageSize!=undefined?pageSize:10;
            $scope.search.ownerId = $rootScope.userInfo.userId;
            myWorkOrderRES.list_work($scope.search).then(function (result) {
                var workOrders = result.data.content;  //每次返回结果都是最新的
                getPage($scope.search.page, $scope.search.pageSize, result.data.totalElements,workOrders);
            });
        };
        $scope.check = function (event) {
            $scope.removeEvent(event.items);
        };
        $scope.removeEvent = function (b) {
            var a = $scope.properties.indexOf(b);
            if (a >= 0) {
                $scope.properties.splice(a, 1);
                return true;
            }
            return false;
        };

        //the list of flows
        $scope.queryByCondition();
        // callback function
        $scope.callFn = function (item) {
            $scope.rowItem = item;
        };
        myWorkOrderRES.list_attr().then(function (result) {
            var a = result.data;
            for (var i = 0; i < a.length; i++) {
                if (a[i].propertyType == "select") {
                    a[i].propertyOptions = jQuery.parseJSON(a[i].propertyOptions);
                }
                a[i].propertyValue = a[i].propertyDefaultValue;
            }
            $scope.properties = [];
            $scope.allproperties = a;
        });

        $scope.createItem = function () {
            $state.go("app.workOrderCreateOrUpdate");
        };

        $scope.updateItem = function () {
            $state.go("app.workOrderCreateOrUpdate", {'id' : $scope.selectedRows.id, 'linkId': $scope.selectedRows.linkId});
        };

        $scope.putItem = function () {
            var para={
                id:$scope.selectedRows.id
            };
            myWorkOrderRES.submit(para).then(function (result1) {
                $log.info(result1);
                ngDialog.open({ template: 'modules/workOrder/test.html',//模式对话框内容为test.html
                    className:'ngdialog-theme-default ngdialog-theme-dadao',
                    scope:$scope,
                    controller:function($scope){
                        if(result1.code==0){
                            $scope.titel="成功";
                            $scope.content="提交成功";
                        }else{
                            $scope.titel="失败";
                            $scope.content="提交失败"+result1.msg;
                        }
                        $scope.ok = function(){
                            $scope.closeThisDialog(); //关闭弹窗
                            $scope.queryByCondition();
                        };
                        $scope.close=function(){
                            $scope.closeThisDialog();
                        }
                    }
                });
            });
        };
    };

    /**
     * myWorkOrder list controller defined
     */
    app.controller('WorkOrderCreateOrUpdateCtrl', CreateOrUpdateViewCtrl);
    CreateOrUpdateViewCtrl.$inject = ['ngDialog','$scope', '$rootScope', '$log', 'MyWorkOrder.RES', '$state', '$stateParams', 'toaster'];
    function CreateOrUpdateViewCtrl(ngDialog,$scope, $rootScope, $log, myWorkOrderRES, $state, $stateParams, toaster) {
        $scope.id = $stateParams.id;
        $scope.linkId = $stateParams.linkId;
        $scope.currentValue = {};

        myWorkOrderRES.list_typeCode().then(function (result) {
            $scope.typeCodeList = result.data;
            if(!$scope.workorderType) {
                if(!$scope.id){
                    $scope.workorderType=result.data[0].id;
                }
            }
        });
        myWorkOrderRES.list_priority().then(function (result) {
            $scope.priorityList = result.data;
            if(!$scope.priority) {
                $scope.priority=result.data[0].priorityValue;
            }
        });
        myWorkOrderRES.list_ProductType().then(function (result) {
            $scope.productTypeList = result.data;
            if(!$scope.productType) {
                $scope.productType=result.data[0].productType;
            }
        });

        if($scope.id) {
            var parameters = {
                "ownerId"   : $rootScope.userInfo.userId,
                "linkId"        : $scope.linkId
            };
            myWorkOrderRES.listMyWorkOrderById(parameters).then(function (result) {
                var workOrder = result.data;
                if(workOrder) {
                    $scope.currentValue = workOrder[0];
                    if($scope.currentValue.workorderTypeId) {
                        $scope.workorderType = $scope.currentValue.workorderTypeId;
                    }
                    if($scope.currentValue.priority) {
                        $scope.priority = $scope.currentValue.priority;
                    }
                    if($scope.currentValue.productType) {
                        $scope.productType = $scope.currentValue.productType;
                    }
                    $scope.properties=$scope.currentValue.instanceLinkPropertyList;
                } else {
                    toaster.pop('error', "错误", "工单查询失败,请稍后再试!");
                }
            });
        }

        $scope.$watch('workorderType', function(newValue,oldValue, scope){
            if (newValue != undefined) {
                var params={
                    id: newValue
                };
                if($scope.workorderType==$scope.currentValue.workorderTypeId){
                    $scope.properties=$scope.currentValue.instanceLinkPropertyList;
                }else {
                    myWorkOrderRES.list_create_attr(params).then(function (result) {
                        for (var i = 0; i < result.data.length; i++) {
                            if (result.data[i].propertyType == "select") {
                                result.data[i].propertyOptions = jQuery.parseJSON(result.data[i].propertyOptions);
                            }
                            if (result.data[i].propertyDefaultValue == null) {
                                result.data[i].propertyDefaultValue = '';
                            }
                            result.data[i].propertyValue = result.data[i].propertyDefaultValue;
                        }
                        $scope.properties = result.data;
                    });
                }
            }
        });

        function data(){
            if($scope.properties!=undefined&&$scope.properties.length>0) {
                for (var i = 0; i < $scope.properties.length; i++) {
                    if($scope.properties[i].propertyType=="datetime"){
                        $scope.properties[i].propertyValue = (new Date()).getTime();
                    }
                }
                $scope.currentValue.properties=JSON.stringify($scope.properties);
            }
            $scope.currentValue.ownerId = $rootScope.userInfo.userId;
            $scope.currentValue.contactId=$rootScope.userInfo.userId;
            $scope.currentValue.typeId = $scope.workorderType;
            $scope.currentValue.priority = $scope.priority;
            $scope.currentValue.productType = $scope.productType;
            delete $scope.currentValue.workorderType;
            delete $scope.currentValue.workorderTypeId;
            delete $scope.currentValue.createTime;
            return $scope.currentValue;
        }

        //create new workOrder
        $scope.saveItem = function () {
            var params=data();
            myWorkOrderRES.save(params).then(function (result) {
                $log.info(result);
                ngDialog.open({ template: 'modules/workOrder/test.html',//模式对话框内容为test.html
                    className:'ngdialog-theme-default ngdialog-theme-dadao',
                    controller:function($scope){
                        $scope.yn=true;
                        if(result.code==0){
                            $scope.titel="成功";
                            $scope.content="保存成功,是否提交？";
                        }else{
                            $scope.titel="失败";
                            $scope.content="保存失败:"+result.msg;
                        }
                        $scope.paramss={
                            id:result.data.id,
                            ownerId:result.data.ownerId
                        };
                        $scope.close=function(){
                            $scope.closeThisDialog();
                            $state.go("app.myWorkOrder");
                        }
                        $scope.ok = function(){
                            $scope.closeThisDialog();
                            myWorkOrderRES.submit($scope.paramss).then(function (result1) {
                                $log.info(result1);
                                ngDialog.open({ template: 'modules/workOrder/test.html',//模式对话框内容为test.html
                                    className:'ngdialog-theme-default ngdialog-theme-dadao',
                                    controller:function($scope){
                                        if(result1.code==0){
                                            $scope.titel="成功";
                                            $scope.content="提交成功";

                                        }else{
                                            $scope.titel="失败";
                                            $scope.content="提交失败:"+result1.msg;
                                        }

                                        $scope.ok = function(){
                                            $scope.closeThisDialog(); //关闭弹窗
                                            $state.go("app.myWorkOrder");
                                        }
                                        $scope.close=function(){
                                            $scope.closeThisDialog();
                                            $state.go("app.myWorkOrder");
                                        }
                                    }
                                });
                            });
                        };
                    }
                });
            });
        };
        //return to the main page
        $scope.backToMain = function () {
            history.back();
        };
    };
})();