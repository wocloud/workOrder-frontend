'use strict';
/**
 * Created by sophia.wang on 16/11/3.
 */
$(function(){
    /**
     * workOrder attributes controller
     */
    app.controller('WorkOrderAttrsViewCtrl', AttrViewCtrl);
    AttrViewCtrl.$inject = ['$scope', 'ngDialog', 'workOrderAttr.RES', 'storeService', 'i18nService'];
    function AttrViewCtrl($scope, ngDialog, workOrderAttrRES, storeService, i18nService) {

        i18nService.setCurrentLang("zh-cn");
        renderAttrTable($scope, workOrderAttrRES, storeService);

        //查询重置
        $scope.reset = function(){
            $scope.query = {};
            $scope.loadData(1, 10);
        };

        //create new attr
        $scope.createItem = function () {
            $scope.selectedItem = undefined;
            ngDialog.open({
                template: 'modules/workOrder/attr.create.html',
                className:'ngdialog-theme-default wocloud-ngdialog-blue',
                controller: 'WorkOrderAttrCreateOrUpdateViewCtrl',
                scope: $scope
            });
        };

        //edit attr
        $scope.updateItem = function() {
            ngDialog.openConfirm({
                template: 'modules/workOrder/attr.create.html',
                className:'ngdialog-theme-default wocloud-ngdialog-blue',
                controller: 'WorkOrderAttrCreateOrUpdateViewCtrl',
                scope: $scope
            });
        };

        //delete an attribute
        $scope.deleteItem = function() {
            ngDialog.open({
                template: 'deleteTemplate.html',
                className:'ngdialog-theme-default wocloud-ngdialog-blue',
                controller: 'WorkOrderAttrDeleteViewCtrl',
                scope: $scope
            });
        };
    }

    /**
     * workOrder attributes create controller
     */
    app.controller('WorkOrderAttrCreateOrUpdateViewCtrl', AttrCreateOrUpdateViewCtrl);
    AttrCreateOrUpdateViewCtrl.$inject = ['$scope', 'workOrderAttr.RES'];
    function AttrCreateOrUpdateViewCtrl($scope, workOrderAttrRES){
        var key = "";
        //if($scope.selectedRows && $scope.selectedRows.length>0) {
        //    key = $scope.selectedRows[0].propertyKey;
        //}
        if($scope.selectedItem) {
            key = $scope.selectedItem.propertyKey;
        }
        $scope.PropertyType = workOrderAttrRES.baseEnum().propertyType;

        if ($scope.attr == undefined || $scope.attr == null){
            $scope.attr = {};
        }

        $scope.createOrUpdate = 'C';
        if(key!=undefined && key!=null && key!=""){
            $scope.createOrUpdate = 'U';
            workOrderAttrRES.list({"propertyKey":key}).then(function(result){
                $scope.attr = result.content[0];
                if($scope.attr.propertyOptions!=""){
                    $scope.optionProperties = JSON.parse($scope.attr.propertyOptions);
                }
            }, function(e){
                alert(e);
            });
        }

        if($scope.optionProperties=="" || $scope.optionProperties == undefined){
            $scope.optionProperties = [{'optionValue': 'value 1', 'optionName': 'name 1'}];
        }

        if ($scope.attr.propertyType == undefined || $scope.attr.propertyType == null) {
            $scope.attr.propertyType = $scope.PropertyType[0];
        }

        //create new attr
        $scope.saveItem = function (isValid) {
            if (!isValid) return;
            $scope.attrForm.$invalid = false;
            if($scope.attr.propertyType!='select') {
                delete $scope.attr.propertyOptions;
            } else {
                $scope.attr.propertyOptions = JSON.stringify($scope.optionProperties);
            }
            if($scope.createOrUpdate=="C"){
                workOrderAttrRES.create($scope.attr).then(function(result){
                    $scope.closeThisDialog();
                    if(result.code=="0"){
                        window.wxc.xcConfirm("自定义属性新建成功!", window.wxc.xcConfirm.typeEnum.success);
                        $scope.loadData();
                    } else {
                        window.wxc.xcConfirm("自定义属性新建失败: " + result.msg, window.wxc.xcConfirm.typeEnum.error);
                    }
                });
            } else if($scope.createOrUpdate=="U"){
                workOrderAttrRES.create($scope.attr).then(function(result){
                    $scope.closeThisDialog();
                    if(result.code=="0"){
                        window.wxc.xcConfirm("自定义属性编辑成功!", window.wxc.xcConfirm.typeEnum.success);
                        $scope.loadData();
                    } else {
                        window.wxc.xcConfirm("自定义属性编辑失败: " + result.msg, window.wxc.xcConfirm.typeEnum.error);
                    }
                });
            }
        };

        //watch the propertyType change
        $scope.$watch("attr.propertyType", function(newValue, oldValue){
            $scope.f = newValue;
        });

        //click handler function
        var valueIndex = 2, nameIndex = 2;
        $scope.addOptionValue = function (index) {
            $scope.optionProperties.splice(index + 1, 0, {optionValue: 'value ' + valueIndex++, optionName: 'name' + nameIndex++});
        };

        $scope.removeOptionValue = function (index) {
            $scope.optionProperties.splice(index, 1);
        };
    }

    /**
     * workOrder attr delete controller
     */
    app.controller('WorkOrderAttrDeleteViewCtrl', AttrDeleteViewCtrl);
    AttrDeleteViewCtrl.$inject = ['$scope', 'workOrderAttr.RES'];
    function AttrDeleteViewCtrl($scope, workOrderAttrRES) {
        //var ids = [];

        //if($scope.selectedRows) {
        //    $scope.items = $scope.selectedRows;
        //    angular.forEach($scope.selectedRows, function(data,index,array){
        //        ids.push(data.id);
        //    });
        //}
        var id = "";
        if($scope.selectedItem) {
            id = $scope.selectedItem.id;
        }

        //remove attr
        $scope.removeItem = function () {
            workOrderAttrRES.removeById(id).then(function (result) {
                $scope.closeThisDialog();
                if(result.code=="0"){
                    window.wxc.xcConfirm("自定义属性删除成功!", window.wxc.xcConfirm.typeEnum.success);
                    $scope.loadData();
                } else {
                    window.wxc.xcConfirm("自定义属性删除失败: " + result.msg, window.wxc.xcConfirm.typeEnum.error);
                }
            });
        };
    }

    /**
     * attr linked controller
     */
    app.controller('WorkOrderAttrLinkedViewCtrl', AttrLinkedViewCtrl);
    AttrLinkedViewCtrl.$inject = ['$scope', '$stateParams', '$log', 'workOrderAttr.RES'];
    function AttrLinkedViewCtrl($scope, $stateParams, $log, workOrderAttrRES){
        var key = $stateParams.key;
        renderAttrLinkedView(key, $scope, $log, workOrderAttrRES);
    }

    /**
     * workOrder attributes create controller
     */
    app.controller('WorkOrderAttrInfoViewCtrl', AttrInfoViewCtrl);
    AttrInfoViewCtrl.$inject = ['$scope', '$location', '$stateParams', 'workOrderAttr.RES'];
    function AttrInfoViewCtrl($scope, $location, $stateParams, workOrderAttrRES){
        var key = $stateParams.key;
        $scope.attr = {};
        if(key!=undefined && key!=null && key!=''){
            workOrderAttrRES.list({"propertyKey":key}).then(function(result){
                $scope.attr = result.content[0];
                if($scope.attr.propertyOptions!=""){
                    $scope.optionProperties = JSON.parse($scope.attr.propertyOptions);
                }
            }, function(e){
                alert(e);
            });
        }

        //return to the main page
        $scope.backToMain = function () {
            $location.url("/app/workOrderAttrs");
        };
    }

    /*************************
     * render view
     ************************/
    function renderAttrTable($scope, workOrderAttrRES, storeService){
        $scope.paginationCurrentPage=storeService.getObject('attrStore').paginationCurrentPage!=undefined?storeService.getObject('attrStore').paginationCurrentPage:1;
        $scope.paginationPageSize=storeService.getObject('attrStore').paginationPageSize!=undefined?storeService.getObject('attrStore').paginationPageSize:10;
        $scope.query=storeService.getObject('attrStore').query!=undefined?storeService.getObject('attrStore').query:{};
        $scope.attrStore = {
            query : $scope.query || {},
            paginationCurrentPage : $scope.paginationCurrentPage,
            paginationPageSize : $scope.paginationPageSize
        };
        var index = 0;
        $scope.attrGridOptions = {
            columnDefs: [
                {
                    field: 'propertyKey',
                    displayName: 'key',
                    cellTemplate:'<div class="ui-grid-cell-contents"><a class="text-info" ui-sref="app.workOrderAttrInfo({key:row.entity.propertyKey})">{{row.entity.propertyKey}}</a></div>'
                },
                {
                    field: "propertyName",
                    displayName: '名称'
                },
                {
                    field: "propertyType",
                    displayName: '格式',
                    cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.propertyType | propertyTypeFilter}}</div>'
                }],
            multiSelect: false, //限制多选
            enableCellEdit: false, // 是否可编辑
            enableSorting: true, //是否排序
            useExternalSorting: false, //是否使用自定义排序规则
            enableGridMenu: true, //是否显示grid 菜单
            showGridFooter: false, //是否显示grid footer
            enableHorizontalScrollbar: 1, //grid水平滚动条是否显示, 0-不显示  1-显示
            enableVerticalScrollbar: 1, //grid垂直滚动条是否显示, 0-不显示  1-显示
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
            isRowSelectable: function (row) { //GridRow
                index += 1;//下标加1
                if(index==$scope.queryLength){
                    index=0;
                }
                if (index == 1) {
                    row.grid.api.selection.selectRow(row.entity);
                }
            },
            useExternalPagination: true, //是否使用客户端分页,默认false
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                //分页按钮事件
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    index =0;
                    if (getPage) {
                        $scope.paginationCurrentPage = newPage;
                        $scope.paginationPageSize = pageSize;
                        $scope.loadData(newPage,pageSize);
                    }
                });
                //行选中事件
                $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if (row && row.isSelected) {
                        //$scope.selectedRows.push(row.entity);
                        $scope.selectedItem=row.entity;
                    } else {
                        $scope.selectedItem = undefined;
                    }
                    //if(row && !row.isSelected){
                    //    angular.forEach($scope.selectedRows, function(data, index, rows){
                    //       if(data.propertyKey == row.entity.propertyKey) {
                    //           $scope.selectedRows.splice(index, 1);
                    //       }
                    //    });
                    //}
                });
            }
        };
        var attrs=[];

        var getPage = function (curPage, pageSize,totalSize) {
            index = 0;
            $scope.attrGridOptions.paginationCurrentPage = curPage;
            $scope.attrGridOptions.paginationPageSize = pageSize;
            $scope.attrGridOptions.totalItems = totalSize;
            $scope.attrGridOptions.data = attrs;
        };
        $scope.loadData = function(newPage,pageSize){
            //$scope.selectedRows = [];
            $scope.selectedItem = undefined;
            $scope.attrStore = {
                query : $scope.query || {},
                paginationCurrentPage : $scope.paginationCurrentPage,
                paginationPageSize : $scope.paginationPageSize
            };
            storeService.setObject('attrStore', $scope.attrStore);
            var params = {
                'propertyKey' : $scope.attrStore.query.propertyKey ? $scope.attrStore.query.propertyKey : "",
                'propertyName' : $scope.attrStore.query.propertyName ? $scope.attrStore.query.propertyName : "",
                'page' : $scope.attrStore.paginationCurrentPage,
                'size' : $scope.attrStore.paginationPageSize
            };
            workOrderAttrRES.list(params).then(function (result) {
                $scope.queryLength=result.content.length;
                attrs = result.content;  //每次返回结果都是最新的
                getPage(params.page, params.size, result.totalElements);
            }, function(){
                attrs = [];
            });
        };
        //the list of attrs
        $scope.loadData(1, 10);

        //search function end
        $scope.params = {grid: {}, fun: {}};

        // callback function
        $scope.callFn = function(item){
            $scope.rowItem = item;
        };
    }

    function renderAttrLinkedView(key, $scope, $log, workOrderAttrRES) {
        //i18nService.setCurrentLang("zh-cn");

        var index=0;//默认选中行，下标置为0
        $scope.linkedGridOptions = {
            columnDefs: [
                {
                    field: "flowName",
                    displayName: '流程名称'
                },
                {
                    field: "sectionName",
                    displayName: '环节名称'
                },
                {
                    field: "createDate",
                    displayName: '创建时间',
                    cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.createDate | date:"yyyy-MM-dd HH:mm:ss"}}</div>'
                }],
            paginationCurrentPage: 1, //当前页码
            paginationPageSize: 5, //每页显示个数
            paginationPageSizes: [5,10,20,50],//默认[250, 500, 1000]
            isRowSelectable: function (row) { //GridRow
                index+=1;//下标加1
                if(index==1){
                    row.grid.api.selection.selectRow(row.entity);
                }
            },
            noUnselect: true,//默认false,选中后是否可以取消选中
            useExternalPagination: true, //是否使用客户端分页,默认false
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                //分页按钮事件
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    var params = {};
                    params.page=newPage;
                    params.pageSize=pageSize;
                    if (getPage) {
                        workOrderAttrRES.listLinkedFlow(key).then(function (result) {
                            linkeds=result.content;
                            getPage(params.page,params.pageSize, result.totalElements);
                        });
                    }
                });
                //行选中事件
                $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if (row) {
                        $scope.testRow = row.entity;
                    }
                });
            }
        };
        var linkeds=[];
        var params={
            page: $scope.linkedGridOptions.paginationCurrentPage,
            pageSize: $scope.linkedGridOptions.paginationPageSize
        };

        var getPage = function (curPage, pageSize,totalSize) {
            index=0;//下标置为0
            $scope.linkedGridOptions.totalItems = totalSize;
            $scope.linkedGridOptions.data = linkeds;
        };

        var loadData = function(){
            workOrderAttrRES.listLinkedFlow(key).then(function (result) {
                linkeds = result.content;
                getPage(1,params.pageSize, result.totalElements);
            });
        };

        //the list of attrs
        loadData();

        //search function end
        $scope.params = {grid: {}, fun: {}};

        // callback function
        $scope.callFn = function(item){
            $scope.rowItem = item;
        }
    }
});
/***********************
 * validate the unique
 ***********************/
//app.directive('ensureUnique', ['workOrderAttr.RES', function(workOrderAttrRES) {
//    return {
//        require: 'ngModel',
//        link: function(scope, element, attrs, c) {
//            scope.$watch(attrs.ngModel, function () {
//                workOrderAttrRES.isNameUnique(attrs.ensureUnique).then(function(result){
//                    c.$setValidity('ensureUnique', result);
//                }, function(e){
//                    c.$setValidity('ensureUnique', false);
//                    alert(e);
//                })
//            })
//        }
//    }
//}]);