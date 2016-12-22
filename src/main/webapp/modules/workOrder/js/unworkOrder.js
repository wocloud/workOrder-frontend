'use strict';
(function(){
    app.controller('UnWorkOrderViewCtrl', UnWorkOrderViewCtrl);
    UnWorkOrderViewCtrl.$inject = ['storeService','$rootScope','$scope','WorkOrder.RES','$state','i18nService'];
    function UnWorkOrderViewCtrl(storeService,$rootScope,$scope,workOrderRES,$state,i18nService) {
        i18nService.setCurrentLang("zh-cn");
        $scope.paginationCurrentPage=storeService.getObject('unStore').paginationCurrentPage!=undefined?storeService.getObject('unStore').paginationCurrentPage:1;
        $scope.search=storeService.getObject('unStore').search!=undefined?storeService.getObject('unStore').search:{};
        $scope.properties = storeService.getObject('unStore').properties!=undefined?storeService.getObject('unStore').properties:[];
        $scope.unStore={
            search:$scope.search,
            properties:$scope.properties||[],
            paginationCurrentPage:$scope.paginationCurrentPage
        };
        $scope.singflag=true;
        $scope.disposeflag=true;
        $scope.yel=false;
        var index = 0;//默认选中行，下标置为0
        $scope.myGridOptions = {
            columnDefs: [
                {
                    field: 'id',
                    displayName: 'ID',
                    type:'number',
                    cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope"><a class="text-info" ui-sref="app.workOrderInfo({id:row.entity.linkId, flag:\'undo\'})">{{row.entity.id}}</a></div>'
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
                        $scope.unStore.paginationCurrentPage=newPage;
                        $scope.sreach(newPage,pageSize);
                    }
                });
                //行选中事件
                $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if (row && row.isSelected) {
                        $scope.selectedRows = row.entity;
                        $scope.initBtn($scope.selectedRows.status);
                    }
                });
            }
        };
        $scope.searchParams={};
        workOrderRES.list_typeCode().then(function (result) {
            $scope.searchParams.workOrderTypeList= result.data;  //每次返回结果都是最新的
        });
        workOrderRES.list_priority().then(function (result) {
            $scope.searchParams.priorityList= result.data;
        });
        workOrderRES.list_ProductType().then(function (result) {
            $scope.searchParams.productTypeList= result.data;  //每次返回结果都是最新的
        });
        $scope.initBtn=function(sign){
            if(sign==0){
                $scope.singflag=false;
                $scope.disposeflag=true;
            }
            else if(sign==1){
                $scope.singflag=true;
                $scope.disposeflag=false;
            }else{
                $scope.singflag=true;
                $scope.disposeflag=true;
            }
        };
        var getPage = function (curPage, pageSize, totalSize,workOrders) {
            index = 0;//下标置为0
            $scope.myGridOptions.totalItems = totalSize;
            $scope.myGridOptions.data = workOrders;
        };
        $scope.selectInstanceLinkPropertyList=function(instanceLinkPropertyList){
            var a=[];
            angular.forEach(instanceLinkPropertyList,function(data,index){
                var b={};
                for(var i in data){
                    if(i!=null&&i=="propertyOptions"){
                        b[i]=JSON.stringify(data[i])
                    }else{
                        b[i]= data[i];
                    }
                }
                a.push(b);
            });
            return a;
        };
        $scope.sreach = function (page,pageSize) {
            storeService.setObject('unStore',$scope.unStore);
            var instanceLinkPropertyList=$scope.properties;
            $scope.search.instanceLinkPropertyList=$scope.selectInstanceLinkPropertyList(instanceLinkPropertyList);
            $scope.search.performerId=$rootScope.userInfo.userId;
            $scope.search.loginUserId =$rootScope.userInfo.userId;
            $scope.search.page=page!=undefined?page:1;
            $scope.myGridOptions.paginationCurrentPage=$scope.search.page;
            $scope.search.size=pageSize!=undefined?pageSize:10;
            workOrderRES.list_unwork($scope.search).then(function (result) {
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
        $scope.sreach($scope.paginationCurrentPage);
        // callback function
        $scope.callFn = function (item) {
            $scope.rowItem = item;
        };
        $scope.propertieslist = [];
        workOrderRES.list_attr().then(function (result) {
            var a = result.data;
            for (var i = 0; i < a.length; i++) {
                if (a[i].propertyType == "select") {
                    a[i].propertyOptions = jQuery.parseJSON(a[i].propertyOptions);
                }
                a[i].propertyValue = a[i].propertyDefaultValue;
            }
            var arr = [];
            $scope.allproperties = a;
        });

        $scope.disposeItem = function () {
            $state.go("app.mgworkOrder",{id:$scope.selectedRows.linkId});
        };
        $scope.signItem = function () {
            var params={
                id:$scope.selectedRows.linkId,
                performerId:$rootScope.userInfo.userId,
                loginUserId :$rootScope.userInfo.userId
            };
            workOrderRES.sign(params).then(function (result) {
                $scope.sreach();
                if(result.code=="0"){
                    window.wxc.xcConfirm("签收成功!", window.wxc.xcConfirm.typeEnum.success);
                } else {
                    window.wxc.xcConfirm("签收失败: " + result.msg, window.wxc.xcConfirm.typeEnum.error);
                }
            });
        };
    };
})();