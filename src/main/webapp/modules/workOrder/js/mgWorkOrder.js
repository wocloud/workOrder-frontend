(function() {
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
    app.controller('MGworkOrder', MGworkOrder);
    MGworkOrder.$inject = ['$rootScope','$scope','ngDialog', '$location', '$log', '$cacheFactory', 'MyWorkOrder.RES', '$state','$stateParams'];
    function MGworkOrder($rootScope,$scope,ngDialog, $location, $log, $cacheFactory, myWorkOrderRES, $state,$stateParams) {
        var params={
            linkId:$stateParams.id
        };
        myWorkOrderRES.listById(params).then(function(result) {
            var linkProperties = result.data[0].instanceLinkPropertyList;
            if (linkProperties.length != 0) {
                for (var i = 0; i < linkProperties.length; i++) {
                    if (linkProperties[i].propertyType == "select") {
                        linkProperties[i].propertyOptions = JSON.parse(linkProperties[i].propertyOptions);
                        if(linkProperties[i].propertyValue==null || !linkProperties[i].propertyValue){
                            linkProperties[i].propertyValue="";
                        }
                    }
                }
            }
            $scope.mgworkorder = result.data[0];
            var fileName = $scope.mgworkorder.attachmentName;
            if(fileName && fileName!="" && $scope.mgworkorder.id!=""){
                var params = "instanceId="+$scope.mgworkorder.id+"&userId="+$rootScope.userInfo.userId+"&fileName="+fileName;
                var api_downloadFile = "/wocloud-workorder-restapi/instanceLink/downloadAttachment?";
                $scope.downloadUrl = api_downloadFile + params;
            }
            if($scope.mgworkorder && $scope.mgworkorder.id) {
                //查询工单当前处理记录
                myWorkOrderRES.listWorkOrderProcessResultById({"id": $scope.mgworkorder.id}).then(function (result) {
                    $scope.records = result.data;
                });
            }
        });
        $scope.disposeToMain = function () {
            var properties={};
            properties.id=$scope.mgworkorder.linkId;
            properties.loginUserId =$rootScope.userInfo.userId;
            properties.remark=$scope.mgworkorder.remark;
            properties.instanceLinkPropertyList=JSON.stringify($scope.mgworkorder.instanceLinkPropertyList);
            $log.info($scope.mgworkorder.instanceLinkPropertyList);
            myWorkOrderRES.dispose(properties).then(function (result) {
                $scope.closeThisDialog();
                $state.go("app.unworkOrder");
                if(result.code=="0"){
                    window.wxc.xcConfirm("处理成功!", window.wxc.xcConfirm.typeEnum.success);
                } else {
                    window.wxc.xcConfirm("处理失败: " + result.msg, window.wxc.xcConfirm.typeEnum.error);
                }
            });
        };

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
                myWorkOrderRES.getProcessPicture($scope.mgworkorder.id).then(function (result) {
                    if(result.data!=undefined && result.data!="") {
                        $scope.imageSrc = "data:image/png;base64," + result.data;
                    }
                });
            }
        };

        //return to the main page
        $scope.backToMain = function () {
            history.back();
        };
    };
})()