'use strict';
/**
 * Created by sophia.wang on 16/11/28.
 */
$(function(){
    /**
     * workOrder types service
     */
    app.service('workOrderType.RES', ServiceWorkOrderTypeRES);
    ServiceWorkOrderTypeRES.$inject = ['$q', '$resource', '$rootScope'];
    function ServiceWorkOrderTypeRES($q, $resource, $rootScope) {

        //获取流程列表
        this.listWorkFlows = function(params){
            var cmd = '/wocloud-workorder-restapi/workflow/listProcessDefinition';
            var task = $q.defer();
            var parameters = params==undefined ? {} : params;
            $resource(cmd).save(parameters, function(response){
                task.resolve(response.data);
            }, function(response){
                task.reject(response);
            });
            return task.promise;
        };

        //绑定工单类型流程
        this.bind = function(params){
            var cmd = '/wocloud-workorder-restapi/workorderTypeProcess/insertOrUpdateWorkorderTypeAndProcess';
            var task = $q.defer();
            var parameters = params==undefined ? {} : params;
            params.loginUserId = $rootScope.userInfo.userId;
            $resource(cmd).save(parameters, function(response){
                task.resolve(response);
            }, function(response){
                task.reject(response);
            });
            return task.promise;
        };

        //查询工单类型与流程定义绑定关系
        this.queryRelation = function(params){
            var cmd = '/wocloud-workorder-restapi/workorderTypeProcess/selectWorkorderTypeAndProcessByCondition';
            var task = $q.defer();
            var parameters = params==undefined ? {} : params;
            $resource(cmd).save(parameters, function(response){
                task.resolve(response.data);
            }, function(response){
                task.reject(response);
            });
            return task.promise;
        };

        //解绑工单类型流程
        this.unbind = function(params){
            var cmd = '/wocloud-workorder-restapi/workorderTypeProcess/unbindWorkorderTypeProcess';
            var task = $q.defer();
            var parameters = params==undefined ? {} : params;
            params.loginUserId = $rootScope.userInfo.userId;
            $resource(cmd).save(parameters, function(response){
                task.resolve(response);
            }, function(response){
                task.reject(response);
            });
            return task.promise;
        };

        this.save = function(params){
            var task = $q.defer();
            var cmd = '/wocloud-workorder-restapi/workorderType/saveWorkorderType';
            params.loginUserId = $rootScope.userInfo.userId;
            $resource(cmd).save(params,function(response){
                task.resolve(response);
            }, function(response){
                task.reject("调用失败,属性信息更新失败!");
            });
            return task.promise;
        };

        this.removeById = function(id){
            var task = $q.defer();
            var cmd = '/wocloud-workorder-restapi/workorderType/removeWorkorderType';
            var params = {};
            params.loginUserId = $rootScope.userInfo.userId;
            params.id = id;
            $resource(cmd).save(params,function(response){
                task.resolve(response);
            }, function(response){
                task.reject("调用失败,属性信息删除失败!");
            });
            return task.promise;
        };

        this.list = function() {
            var task = $q.defer();
            var cmd = '/wocloud-workorder-restapi/workorderType/listWorkorderTypes';
            $resource(cmd).save({}, function (response) {
                task.resolve(response.data);
            });
            return task.promise;
        };

        this.listByCondition = function(params) {
            var task = $q.defer();
            var cmd = '/wocloud-workorder-restapi/workorderType/selectWorkorderTypesByCondition';
            var parameters = params == undefined ? {} : params;
            $resource(cmd).save(parameters, function (response) {
                task.resolve(response.data);
            });
            return task.promise;
        };
    }

    /**
     * workOrder types controller
     */
    app.controller('WorkOrderTypesViewCtrl', TypeViewCtrl);
    TypeViewCtrl.$inject = ['$scope', 'ngDialog', 'workOrderType.RES', 'toaster','i18nService'];
    function TypeViewCtrl($scope, ngDialog, workOrderTypeRES, toaster,i18nService) {
        i18nService.setCurrentLang("zh-cn");
        $scope.myData = [];
        $scope.myGridOptions = {
            data: 'myData',
            columnDefs: [
                {
                    field: 'id',
                    type:'number',
                    displayName: 'ID'
                },
                {
                    field: "typeName",
                    displayName: '名称'
                },
                {
                    field: "typeCode",
                    displayName: 'Code'
                }],
            multiSelect: false,
            enableCellEdit: false, // 是否可编辑
            enableSorting: true, //是否排序
            useExternalSorting: false, //是否使用自定义排序规则
            enableGridMenu: true, //是否显示grid 菜单
            showGridFooter: false, //是否显示grid footer
            enableFooterTotalSelected: false, // 是否显示选中的总数，默认为true, 如果显示，showGridFooter 必须为true
            enableFullRowSelection: true, //是否点击行任意位置后选中,默认为false,当为true时，checkbox可以显示但是不可选中
            enableRowHeaderSelection: true, //是否显示选中checkbox框 ,默认为true
            enableRowSelection: true, // 行选择是否可用，默认为true;
            enableSelectAll: true, // 选择所有checkbox是否可用，默认为true;
            enableSelectionBatchEvent: true, //默认true
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                //行选中事件
                $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if (row && row.isSelected) {
                        $scope.selectedItem=row.entity;
                    } else {
                        $scope.selectedItem = undefined;
                    }
                });
            }
        };
        $scope.loadData = function(){
            $scope.selectedItem = undefined;
            workOrderTypeRES.list().then(function (result) {
                $scope.myData = result;
            }, function(){
                $scope.myData = [];
            });
        };
        //the list of attrs
        $scope.loadData();

        //search function end
        $scope.params = {grid: {}, fun: {}};

        // callback function
        $scope.callFn = function(item){
            $scope.rowItem = item;
        };

        //create
        $scope.createItem = function () {
            ngDialog.open({
                template: 'createOrUpdateTemplate',
                className:'ngdialog-theme-default wocloud-ngdialog-blue',
                controller: 'WorkOrderTypeCreateOrUpdateViewCtrl',
                scope: $scope
            });
        };

        //edit
        $scope.updateItem = function() {
            if(!$scope.selectedItem){
                toaster.pop('info', "提示", "请选择要操作的条目!");
                return;
            }
            ngDialog.open({
                template: 'createOrUpdateTemplate',
                className:'ngdialog-theme-default wocloud-ngdialog-blue',
                controller: 'WorkOrderTypeCreateOrUpdateViewCtrl',
                scope: $scope
            });
        };

        //delete an attribute
        $scope.deleteItem = function() {
            ngDialog.open({
                template: 'deleteTemplate',
                className:'ngdialog-theme-default wocloud-ngdialog-blue',
                controller: 'WorkOrderTypeDeleteViewCtrl',
                scope: $scope
            });
        };

        //bind
        $scope.bindWithProcess = function () {
            ngDialog.open({
                template: 'bindWithProcessTemplate',
                className:'ngdialog-theme-default wocloud-ngdialog-blue',
                controller: 'bindWithProcessViewCtrl',
                scope: $scope
            });
        };

        // unbind
        $scope.unbindWithProcess = function () {
            $scope.relationId = -1;
            $scope.processDeploymentId = "";

            workOrderTypeRES.queryRelation({"workorderTypeId": $scope.selectedItem.id}).then(function (result) {
                if(result.content && result.content.length > 0){
                    $scope.relationId = result.content[0].id;
                    $scope.processDeploymentId = result.content[0].processDeploymentId;

                    ngDialog.open({
                        template: 'unbindWithProcessTemplate',
                        className:'ngdialog-theme-default wocloud-ngdialog-blue',
                        controller: 'unbindWithProcessViewCtrl',
                        scope: $scope
                    });
                } else {
                    toaster.pop("info", "提示", "该工单还没有绑定任何流程!");
                }
            });
        };
    }

    /**
     * workOrder types create controller
     */
    app.controller('WorkOrderTypeCreateOrUpdateViewCtrl', TypeCreateOrUpdateViewCtrl);
    TypeCreateOrUpdateViewCtrl.$inject = ['$scope', 'toaster', 'workOrderType.RES'];
    function TypeCreateOrUpdateViewCtrl($scope, toaster, workOrderTypeRES){
        var id = "";
        if($scope.selectedItem) {
            id = $scope.selectedItem.id;
        }

        if ($scope.workOrderType == undefined || $scope.workOrderType == null){
            $scope.workOrderType = {};
        }

        $scope.createOrUpdate = 'C';
        if(id!=undefined && id!=null && id!=''){
            $scope.createOrUpdate = 'U';
            workOrderTypeRES.listByCondition({"id":id}).then(function(result){
                $scope.workOrderType = result.content[0];
            }, function(e){
            });
        }

        //create or update
        $scope.saveItem = function () {
            if($scope.createOrUpdate=="U"){
                $scope.workOrderType.id = id;
            }
            workOrderTypeRES.save($scope.workOrderType).then(function(result){
                if($scope.createOrUpdate=="C") {
                    if(result.code=="0"){
                        toaster.pop('info', "提示", " 工单类型新建成功!");
                    } else {
                        toaster.pop('error', "提示", " 工单类型新建失败!");
                    }
                } else if($scope.createOrUpdate=="U") {
                    if(result.code=="0"){
                        toaster.pop('info', "提示", " 工单类型编辑成功!");
                    } else {
                        toaster.pop('error', "提示", " 工单类型编辑失败!");
                    }
                }
                $scope.loadData();
                $scope.closeThisDialog();
            });
        };

        //cancel the modal
        $scope.cancel = function () {
            $scope.closeThisDialog();
        };
    }

    /**
     * workOrder attr delete controller
     */
    app.controller('WorkOrderTypeDeleteViewCtrl', TypeDeleteViewCtrl);
    TypeDeleteViewCtrl.$inject = ['$scope', 'toaster', 'workOrderType.RES'];
    function TypeDeleteViewCtrl($scope, toaster, workOrderTypeRES) {
        $scope.currentItem = $scope.selectedItem;
        var id = $scope.currentItem.id;

        //remove
        $scope.removeItem = function () {
            workOrderTypeRES.removeById(id).then(function (result) {
                if(result.code=="0"){
                    toaster.pop('info', "提示", " 工单类型删除成功!");
                } else {
                    toaster.pop('error', "提示", " 工单类型删除失败!");
                }
                $scope.loadData();
                $scope.closeThisDialog();
            });
        };

        //cancel the modal
        $scope.cancel = function () {
            $scope.closeThisDialog();
        }
    }

    /**
     * workOrder bind With Process controller
     */
    app.controller('bindWithProcessViewCtrl', BindWithProcessViewCtrl);
    BindWithProcessViewCtrl.$inject = ['$scope', 'toaster', 'workOrderType.RES'];
    function BindWithProcessViewCtrl($scope, toaster, workOrderTypeRES) {
        var workorderTypeId = $scope.selectedItem.id;
        $scope.myData = [];
        $scope.flowGridOptions = {
            data: 'myData',
            columnDefs: [
                {
                    field: 'id',
                    displayName: 'ID'
                },
                {
                    field: "key",
                    displayName: 'KEY'
                },
                {
                    field: "name",
                    displayName: '名称'
                }],
            multiSelect: false,
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                //行选中事件
                $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if (row && row.isSelected) {
                        $scope.selectedItem = row.entity;
                    } else {
                        $scope.selectedItem = undefined;
                    }
                });
            }
        };
        $scope.loadData2 = function(){
            var workorderTypeId = $scope.selectedItem.id;
            $scope.selectedItem = undefined;
            workOrderTypeRES.listWorkFlows().then(function (result) {
                $scope.myData = result;

                // 已有流程加上选中时间
                workOrderTypeRES.queryRelation({"workorderTypeId": workorderTypeId}).then(function (result) {
                    if(result.content && result.content.length > 0){
                        angular.forEach($scope.myData, function(data, index, array){
                            if(data.key == result.content[0].processDeploymentKey) {
                                $scope.gridApi.selection.selectRow(data);
                                return;
                            }
                        });
                    }
                });
            }, function(){
                $scope.myData = [];
            });
        };
        //the list of attrs
        $scope.loadData2();

        //search function end
        $scope.params = {grid: {}, fun: {}};

        // callback function
        $scope.callFn = function(item){
            $scope.rowItem = item;
        };

        //bind
        $scope.bindWorkorderTypeAndProcess = function () {
            var selectItem = $scope.selectedItem;
            var params = {
                "workorderTypeId"       : workorderTypeId,
                "processDeploymentKey"  : selectItem.key,
                "processDeploymentId"   : selectItem.id
            };
            workOrderTypeRES.bind(params).then(function (result) {
                if(result.code=="0"){
                    toaster.pop('info', "提示", "工单绑定流程成功!");
                } else {
                    toaster.pop('error', "提示", result.msg);
                }
                $scope.closeThisDialog();
            });
        };

        //cancel the modal
        $scope.cancel = function () {
            $scope.closeThisDialog();
        }
    };

    /**
     * workOrder unbind With Process controller
     */
    app.controller('unbindWithProcessViewCtrl', UnbindWithProcessViewCtrl);
    UnbindWithProcessViewCtrl.$inject = ['$scope', 'toaster', 'workOrderType.RES'];
    function UnbindWithProcessViewCtrl($scope, toaster, workOrderTypeRES) {
        //unbind
        $scope.unbindWorkorderTypeAndProcess = function () {
            workOrderTypeRES.unbind({"id": $scope.relationId}).then(function (result) {
                if(result.code=="0"){
                    toaster.pop('info', "提示", "工单解绑流程成功!");
                } else {
                    toaster.pop('error', "提示", result.msg);
                }
                $scope.closeThisDialog();
            });
        };

        //cancel the modal
        $scope.cancel = function () {
            $scope.closeThisDialog();
        }
    }

});
