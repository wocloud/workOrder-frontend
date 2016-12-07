/**
 * Created by sophia.wang on 16/12/1.
 */
app.controller('CurrentUserCtrl', ['ngDialog','$q','$resource', '$scope', function (ngDialog, $q, $resource, $scope){
    var storage = window.localStorage;
    $scope.$parent.loginName = storage.getItem("currentLoginName");
    //查询创建人
    $scope.selectCustomer = function(){
        ngDialog.open({
            template:'modules/workOrder/owner.html',
            className:'ngdialog-theme-default',
            scope:$scope,
            controller:function($scope){
                $scope.searchCustomer = function(newPage){
                    if(newPage==undefined){
                        $scope.customerOptions.paginationCurrentPage=1;
                    }
                    var param={
                        first:$scope.first,
                        page:newPage==undefined?1:newPage
                    };
                    $scope.listUser(param).then(function (result) {
                        getCustomerPage(param.targetPage,result.totalRecord,result.data.content);

                    });
                };
                $scope.customerOptions = {
                    columnDefs: [{field:'id', displayName:'登录名'},{field:'first', displayName:'用户名'},{field:'pwd', displayName:'密码'}],
                    paginationCurrentPage: 1, //当前页码
                    paginationPageSize: 10, //每页显示个数
                    paginationPageSizes: [10],
                    noUnselect: false,//默认false,选中后是否可以取消选中
                    modifierKeysToMultiSelect: true,//默认false,为true时只能 按ctrl或shift键进行多选, multiSelect 必须为true;
                    isRowSelectable: function(row){ //GridRow
                    },
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;
                        //分页按钮事件
                        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                            if (getCustomerPage) {
                                $scope.searchCustomer(newPage);
                            }
                        });
                        $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                            if (row) {
                                $scope.customerRow = row.entity;
                            }
                        });
                    },
                    useExternalPagination: true//是否使用分页按钮
                };
                var getCustomerPage = function (curPage,totalSize,customerlists) {
                    $scope.customerOptions.totalItems = totalSize;
                    $scope.customerOptions.data = customerlists;
                };
                $scope.searchCustomer();
                $scope.confirm = function(){
                    if( $scope.customerRow){
                        $scope.$parent.loginName = $scope.customerRow.first;
                        storage.setItem("currentLoginId", $scope.customerRow.id);
                        storage.setItem("currentLoginName", $scope.customerRow.first);
                    }
                    $scope.closeThisDialog();
                };
                $scope.cancel = function(){
                    $scope.closeThisDialog();
                };
            }
        });
    };
    var api_user_list = '/wocloud-workorder-restapi/actIdUser/getActIdUserListByConditions',
    res_user_list = $resource(api_user_list,{},{post:{
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json;charset=UTF-8'
        }
    }});
    $scope.listUser=function(params){
        var task = $q.defer();
        res_user_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
}]);
