'use strict';
/**
 * Created by sophia.wang on 16/11/4.
 */
(function(){

    /**
     * myWorkOrder list controller defined
     */
    app.controller('MyWorkOrderCtrl', MyWorkOrderViewCtrl);
    MyWorkOrderViewCtrl.$inject = ['storeService','$scope', '$rootScope', 'WorkOrder.RES', '$state','i18nService','ngDialog'];
    function MyWorkOrderViewCtrl(storeService,$scope, $rootScope, workOrderRES, $state,i18nService,ngDialog) {
    	i18nService.setCurrentLang("zh-cn");

    	$scope.status;
        $scope.paginationCurrentPage=storeService.getObject('myStore').paginationCurrentPage!=undefined?storeService.getObject('myStore').paginationCurrentPage:1;
        $scope.search=storeService.getObject('myStore').search!=undefined?storeService.getObject('myStore').search:{};
        $scope.properties = storeService.getObject('myStore').properties!=undefined?storeService.getObject('myStore').properties:[];
        $scope.myStore={
            search:$scope.search,
            properties:$scope.properties||[],
            paginationCurrentPage:$scope.paginationCurrentPage
        };
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
                if(index==$scope.queryLength){
                    index=0;
                }
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
                        $scope.myStore.paginationCurrentPage=newPage;
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
        workOrderRES.list_typeCode().then(function (result) {
            $scope.searchParams.workOrderTypeList= result.data;  //每次返回结果都是最新的
        });
        workOrderRES.list_priority().then(function (result) {
            $scope.searchParams.priorityList= result.data;
        });
        workOrderRES.list_ProductType().then(function (result) {
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
        $scope.queryByCondition = function (page,pageSize) {
            storeService.setObject('myStore',$scope.myStore);
            var instanceLinkPropertyList=$scope.properties;
            $scope.search.instanceLinkPropertyList=$scope.selectInstanceLinkPropertyList(instanceLinkPropertyList);
            $scope.search.page=page!=undefined?page:1;
            $scope.myGridOptions.paginationCurrentPage=$scope.search.page;
            $scope.search.loginUserId =$rootScope.userInfo.userId;
            $scope.search.size=pageSize!=undefined?pageSize:10;
            $scope.search.ownerId = $rootScope.userInfo.userId;
            if($scope.search.startTime=="" || $scope.search.startTime==null){
                delete $scope.search.startTime;
            }
            if($scope.search.endTime=="" || $scope.search.endTime==null){
                delete $scope.search.endTime;
            }
            workOrderRES.list_work($scope.search).then(function (result) {
                $scope.queryLength=result.data.content.length;
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
        $scope.queryByCondition($scope.paginationCurrentPage);
        // callback function
        $scope.callFn = function (item) {
            $scope.rowItem = item;
        };
        workOrderRES.list_attr().then(function (result) {
            var a = result.data;
            for (var i = 0; i < a.length; i++) {
                if (a[i].propertyType == "select") {
                    a[i].propertyOptions = JSON.parse(a[i].propertyOptions);
                }
                a[i].propertyValue = a[i].propertyDefaultValue;
            }
            $scope.allproperties = a;
        });

        $scope.createItem = function () {
            $state.go("app.workOrderCreateOrUpdate");
        };

        $scope.updateItem = function () {
            $state.go("app.workOrderCreateOrUpdate", {'id' : $scope.selectedRows.id, 'linkId': $scope.selectedRows.linkId});
        };

        $scope.updateItem = function () {
            $state.go("app.workOrderCreateOrUpdate", {'id' : $scope.selectedRows.id, 'linkId': $scope.selectedRows.linkId});
        };

        $scope.deleteItem = function () {
            ngDialog.open({
                template: 'deleteTemplate.html',
                className:'ngdialog-theme-default wocloud-ngdialog-blue',
                controller: 'WorkOrderDeleteViewCtrl',
                scope: $scope
            });
        };
    };

    /**
     * myWorkOrder list controller defined
     */
    app.controller('WorkOrderCreateOrUpdateCtrl', CreateOrUpdateViewCtrl);
    CreateOrUpdateViewCtrl.$inject = ['ngDialog','$scope', '$rootScope', 'WorkOrder.RES', '$state', '$stateParams', 'FileUploader'];
    function CreateOrUpdateViewCtrl(ngDialog,$scope, $rootScope, workOrderRES, $state, $stateParams, FileUploader) {
        $scope.id = $stateParams.id;
        $scope.linkId = $stateParams.linkId;
        $scope.currentValue = {};
        $scope.attachmentName = "";
        $scope.attachName = "";
        $scope.uploadEnable = false;

        workOrderRES.list_typeCode().then(function (result) {
            $scope.typeCodeList = result.data;
            if(!$scope.workorderType) {
                if(!$scope.id && result.data.length>0){
                    $scope.workorderType=result.data[0].id;
                }
            }
        });
        workOrderRES.list_priority().then(function (result) {
            $scope.priorityList = result.data;
            if(!$scope.priority) {
                $scope.priority=result.data[0].priorityValue;
            }
        });
        workOrderRES.list_ProductType().then(function (result) {
            $scope.productTypeList = result.data;
            if(!$scope.productType) {
                $scope.productType=result.data[0].productType;
            }
        });

        workOrderRES.getAllDepartment().then(function (result) {
            $scope.departments = result.data.result;
            if(!$scope.externalValue){
                $scope.externalValue = "";
            }
        });

        if($scope.id) {
            var parameters = {
                "ownerId"   : $rootScope.userInfo.userId,
                "linkId"        : $scope.linkId
            };
            workOrderRES.listMyWorkOrderById(parameters).then(function (result) {
                var workOrder = result.data;
                if(workOrder) {
                    $scope.currentValue = workOrder[0];
                    $scope.attachmentName = $scope.currentValue.attachmentName;
                    $scope.attachName = $scope.currentValue.attachmentName;
                    if($scope.attachName!="" && $scope.attachName!=null){
                        var params = "instanceId="+$scope.id+"&userId="+$rootScope.userInfo.userId+"&fileName="+$scope.attachName;
                        var api_downloadFile = "/wocloud-workorder-restapi/instanceLink/downloadAttachment?";
                        $scope.downloadUrl = api_downloadFile + params;
                    }
                    if($scope.currentValue.workorderTypeId) {
                        $scope.workorderType = $scope.currentValue.workorderTypeId;
                    }
                    if($scope.currentValue.priority) {
                        $scope.priority = $scope.currentValue.priority;
                    }
                    if($scope.currentValue.productType) {
                        $scope.productType = $scope.currentValue.productType;
                    }
                    $scope.properties = [];
                    var propertyList = $scope.currentValue.instanceLinkPropertyList;
                    for (var i = 0; i < propertyList.length; i++) {
                        filterProperty(propertyList[i]);
                        $scope.properties.push(propertyList[i]);
                    }
                } else {
                    window.wxc.xcConfirm("工单查询失败,请稍后再试!", window.wxc.xcConfirm.typeEnum.error);
                }
            });
        }

        function filterProperty(property) {
            var options = property.propertyOptions;
            if (property.propertyType == "select" && typeof(property.propertyOptions)=="string") {
                options = jQuery.parseJSON(property.propertyOptions);
                if(property.propertyKey=="office_select") {
                    var depart = property.propertyValue.split(":");
                    $scope.departmentValue = depart[0];
                    if(depart.length > 0) {
                        $scope.externalValue = depart[1];
                    } else {
                        $scope.externalValue = "";
                    }
                }
            }
            property.propertyOptions = options;
            if (property.propertyDefaultValue || property.propertyDefaultValue == null) {
                property.propertyDefaultValue = '';
            }
            if(!property.propertyValue || property.propertyValue == null){
                property.propertyValue = property.propertyDefaultValue;
            }
            //筛选出上传下载控制开关(暂时默认只要有该属性,就可编辑)
            //if(property.propertyKey == "upload_enable" && (property.propertyValue || property.propertyDefaultValue)) {
            //    $scope.uploadEnable = true;
            //}
            if(property.propertyKey == "upload_enable") {
                $scope.uploadEnable = true;
            }
        }

        $scope.$watch('workorderType', function(newValue,oldValue, scope){
            if (newValue != undefined) {
                var params={
                    id: newValue
                };
                if($scope.workorderType==$scope.currentValue.workorderTypeId){
                    $scope.properties = [];
                    var propertyList = $scope.currentValue.instanceLinkPropertyList;
                    for (var i = 0; i < propertyList.length; i++) {
                        filterProperty(propertyList[i]);
                        $scope.properties.push(propertyList[i]);
                    }
                }else {
                    workOrderRES.list_create_attr(params).then(function (result) {
                        for (var i = 0; i < result.data.length; i++) {
                            filterProperty(result.data[i]);
                        }
                        $scope.properties = result.data;
                    });
                }
            }
        });

        $scope.change = function(value){
            $scope.departmentValue = value;
        };

        $scope.change2 = function(value){
            $scope.externalValue = value;
        };

        function data(){
            if($scope.properties!=undefined&&$scope.properties.length>0) {
                angular.forEach($scope.properties, function(property, index, array){
                    if(property.propertyKey=="office_select"){
                        var officeValue = "internal";
                        if($scope.departmentValue=="internal"){
                            officeValue = "internal";
                        } else if($scope.departmentValue=="external"){
                            if($scope.externalValue=="" || !$scope.externalValue){
                                officeValue = "external";
                            } else {
                                officeValue = "external:" + $scope.externalValue;
                            }
                        }
                        property.propertyValue = officeValue;
                        return;
                    }
                });
                $scope.currentValue.properties=JSON.stringify($scope.properties);
            }
            $scope.currentValue.loginUserId =$rootScope.userInfo.userId;
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

        $scope.uploading = false;
        var api_uploader = '/wocloud-workorder-restapi/instanceLink/uploadAttachment';
        var uploader = $scope.uploader = new FileUploader({
            url: api_uploader,
            alias: 'files',
            headers: {'Content-Transfer-Encoding': 'utf-8'},
            removeAfterUpload: true
        });

        $scope.uploadError = false;

        //file type
        $scope.fileTypes = ".csv," +
            "application/msexcel," +
            "application/msword," +
            "application/pdf," +
            "application/rtf," +
            "application/x-zip-compressed," +
            "image/*,text/plain";

        //add failed
        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/ , filter, options) {
            console.info('添加文件失败', item, filter, options);
        };

        //after add
        uploader.onAfterAddingFile = function(fileItem) {
            //console.log("onAfterAddingFile");
            if(fileItem.file.size/1024/1024 > 5){
                //console.log("too big");
                $scope.uploader.removeFromQueue(fileItem);
                $scope.uploadError = true;
                //console.log(uploader.queue);
                return;
            }
            $scope.uploadError = false;
            $scope.attachmentName = fileItem.file.name;
        };

        //create new workOrder
        $scope.saveItem = function () {
            var params=data();
            workOrderRES.save(params).then(function (result) {
                ngDialog.open({
                    template: 'modules/workOrder/confirmDialog.html',
                    className:'ngdialog-theme-default ngdialog-theme-dadao',
                    scope:$scope,
                    controller:function($scope){
                        $scope.instanceId="";
                        if(result.code==0){
                            $scope.instanceId = result.data.id;
                            //保存表单成功,调附件文件
                            uploader.onBeforeUploadItem = function(item) {
                                console.log("onBeforeUploadItem");
                                $scope.uploading = true;
                                item.formData = [{'instanceId': $scope.instanceId, 'userId': $rootScope.userInfo.userId}];
                            };
                            uploader.onCompleteItem = function(fileItem, response, status, headers) {
                                console.log("onCompleteItem");
                                $scope.uploading = false;
                                if(response.code=='0') {
                                    $scope.titleName="提示";
                                    $scope.content="工单和附件均保存成功,是否提交？";
                                } else {
                                    $scope.closeThisDialog();
                                    window.wxc.xcConfirm("工单保存成功, 附件上传失败!", window.wxc.xcConfirm.typeEnum.error);
                                }
                            };
                            if($scope.uploader.queue.length > 0) {
                                $scope.titleName="进行中";
                                $scope.content="工单保存成功, 正在上传附件!";
                                $scope.uploading = true;
                                uploader.uploadAll();
                            } else {
                                $scope.titleName="提示";
                                $scope.content="工单保存成功,是否提交？";
                            }
                        } else{
                            $scope.closeThisDialog();
                            window.wxc.xcConfirm("工单保存失败: "+result.msg, window.wxc.xcConfirm.typeEnum.error);
                        }
                        $scope.close=function(){
                            $scope.closeThisDialog();
                            $state.go("app.myWorkOrder");
                        };
                        $scope.ok = function(){
                            $scope.closeThisDialog();
                            $scope.paramss={
                                id:$scope.instanceId,
                                ownerId:result.data.ownerId,
                                loginUserId:$scope.currentValue.loginUserId
                            };
                            workOrderRES.submit($scope.paramss).then(function (result1) {
                                $scope.closeThisDialog();
                                $state.go("app.myWorkOrder");
                                if(result1.code=="0"){
                                    window.wxc.xcConfirm("提交成功!", window.wxc.xcConfirm.typeEnum.success);
                                } else {
                                    window.wxc.xcConfirm("提交失败: " + result1.msg, window.wxc.xcConfirm.typeEnum.error);
                                }
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

    /**
     * workOrder delete controller
     */
    app.controller('WorkOrderDeleteViewCtrl', DeleteViewCtrl);
    DeleteViewCtrl.$inject = ['$scope', 'WorkOrder.RES'];
    function DeleteViewCtrl($scope, workOrderRES) {
        var id = "";
        if($scope.selectedRows) {
            id = $scope.selectedRows.id;
        }

        //remove workOrde
        $scope.removeItem = function () {
            var params = {"id" : id};
            workOrderRES.removeWorkOrderById(params).then(function (result) {
                $scope.closeThisDialog();
                if(result.code=="0"){
                    window.wxc.xcConfirm("删除成功!", window.wxc.xcConfirm.typeEnum.success);
                    $scope.queryByCondition();
                } else {
                    window.wxc.xcConfirm("删除失败: " + result.msg, window.wxc.xcConfirm.typeEnum.error);
                }
            });
        };
    }
})();