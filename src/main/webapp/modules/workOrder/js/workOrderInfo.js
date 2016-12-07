(function() {
    app.controller('WorkOrderInfo', WorkOrderInfo);
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
    WorkOrderInfo.$inject = ['$scope', '$rootScope', 'MyWorkOrder.RES', '$stateParams'];
    function WorkOrderInfo($scope, $rootScope, myWorkOrderRES, $stateParams) {
        $scope.imageSrc = "";
        $scope.records = [];
        $scope.instanceLinkPropertyList = [];
        $scope.workOrderInstanceId = "";

        //查询工单详情
        var params={
            linkId:$stateParams.id
        };
        var flag = $stateParams.flag;
        if(flag=="my") {
            params.ownerId = $rootScope.userInfo.userId;
            myWorkOrderRES.listMyWorkOrderById(params).then(function (result) {
                $scope.workOrder = result.data[0];
                processData();
                if($scope.workOrder && $scope.workOrder.id) {
                    $scope.workOrderInstanceId = $scope.workOrder.id;
                    //查询工单当前处理记录
                    myWorkOrderRES.listWorkOrderProcessResultById({"id": $scope.workOrder.id}).then(function (result) {
                        $scope.records = result.data;
                    });
                }
            });
        } else if(flag=="undo"){
            myWorkOrderRES.listUndoWorkOrderById(params).then(function (result) {
                $scope.workOrder = result.data[0];  //每次返回结果都是最新的
                processData();
                if($scope.workOrder && $scope.workOrder.id) {
                    $scope.workOrderInstanceId = $scope.workOrder.id;
                    //查询工单当前处理记录
                    myWorkOrderRES.listWorkOrderProcessResultById({"id": $scope.workOrder.id}).then(function (result) {
                        $scope.records = result.data;
                    });
                }
            });
        } else if(flag=="processed"){
            params.performerId = $rootScope.userInfo.userId;
            myWorkOrderRES.listProcessedWorkOrderById(params).then(function (result) {
                $scope.workOrder = result.data[0];  //每次返回结果都是最新的
                processData();
                if($scope.workOrder && $scope.workOrder.id) {
                    $scope.workOrderInstanceId = $scope.workOrder.id;
                    //查询工单当前处理记录
                    myWorkOrderRES.listWorkOrderProcessResultById({"id": $scope.workOrder.id}).then(function (result) {
                        $scope.records = result.data;
                    });
                }
            });
        } else if(flag=="all"){
            myWorkOrderRES.listAllWorkOrderById(params).then(function (result) {
                $scope.workOrder = result.data[0];  //每次返回结果都是最新的
                processData();
                if($scope.workOrder && $scope.workOrder.id) {
                    $scope.workOrderInstanceId = $scope.workOrder.id;
                    //查询工单当前处理记录
                    myWorkOrderRES.listWorkOrderProcessResultById({"id": $scope.workOrder.id}).then(function (result) {
                        $scope.records = result.data;
                    });
                }
            });
        }

        //处理数据
        function processData() {
            if($scope.workOrder==undefined){
                return;
            }
            angular.forEach($scope.workOrder.instanceLinkPropertyList, function(data, index, array) {
                var item = {
                    'name' : data.propertyName,
                    'value': data.propertyValue
                };
                if(data.propertyType=='select') {
                    var options = JSON.parse(data.propertyOptions);
                    var value = data.propertyValue;
                    angular.forEach(options, function(option, i, obj){
                        if(option.optionValue==data.propertyValue) {
                            value = option.optionName;
                            return;
                        }
                    });
                    item = {
                        'name'  : data.propertyName,
                        'value' : value
                    }
                }
                $scope.instanceLinkPropertyList.push(item);
            });
        }

        //显示隐藏
        $scope.isShow=true;
        $scope.folder = function(){
            $scope.isShow=!$scope.isShow;
        };
        $scope.isShow1=true;
        $scope.folder1 = function(){
            $scope.isShow1=!$scope.isShow1;
        };
        $scope.isShow2=true;
        $scope.folder2 = function(){
            $scope.isShow2=!$scope.isShow2;
            if(!$scope.isShow2){
                myWorkOrderRES.getProcessPicture($scope.workOrderInstanceId).then(function (result) {
                    if(result.data!=undefined && result.data!="") {
                        $scope.imageSrc = "data:image/png;base64," + result.data;
                    }
                });
            }
        };
    };
})();