(function() {
    app.controller('MGworkOrder', MGworkOrder);
    MGworkOrder.$inject = ['$rootScope','$scope','WorkOrder.RES','$state','$stateParams'];
    function MGworkOrder($rootScope,$scope,workOrderRES,$state,$stateParams) {
        var params={
            linkId:$stateParams.id
        };
        workOrderRES.getAllDepartment().then(function (result) {
            $scope.departments = result.data.result;
            if(!$scope.externalValue){
                $scope.externalValue = "";
            }
        });

        workOrderRES.listById(params).then(function(result) {
            var linkProperties = result.data[0].instanceLinkPropertyList;
            if (linkProperties.length != 0) {
                for (var i = 0; i < linkProperties.length; i++) {
                    var property = linkProperties[i];
                    if (linkProperties[i].propertyType == "select" && typeof(linkProperties[i].propertyOptions)=="string") {
                        linkProperties[i].propertyOptions = jQuery.parseJSON(linkProperties[i].propertyOptions);
                        if(property.propertyKey=="office_select") {
                            var depart = property.propertyValue.split(":");
                            $scope.departmentValue = depart[0];
                            if(depart.length > 0) {
                                $scope.externalValue = depart[1];
                            } else {
                                $scope.externalValue = "";
                            }
                        }
                        if(linkProperties[i].propertyDefaultValue==null || !linkProperties[i].propertyDefaultValue){
                            linkProperties[i].propertyDefaultValue="";
                        }
                        if(!linkProperties[i].propertyValue || linkProperties[i].propertyValue == null){
                            linkProperties[i].propertyValue = linkProperties[i].propertyDefaultValue;
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
                workOrderRES.listWorkOrderProcessResultById({"id": $scope.mgworkorder.id}).then(function (result) {
                    $scope.records = result.data;
                });
            }
        });

        $scope.change = function(value){
            $scope.departmentValue = value;
        };

        $scope.change2 = function(value){
            $scope.externalValue = value;
        };

        $scope.disposeToMain = function () {
            var properties={};
            properties.id=$scope.mgworkorder.linkId;
            properties.loginUserId =$rootScope.userInfo.userId;
            properties.remark=$scope.mgworkorder.remark;
            if($scope.mgworkorder.instanceLinkPropertyList!=undefined && $scope.mgworkorder.instanceLinkPropertyList.length>0) {
                angular.forEach($scope.mgworkorder.instanceLinkPropertyList, function(property, index, array){
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
                properties.instanceLinkPropertyList=JSON.stringify($scope.properties);
            }
            workOrderRES.dispose(properties).then(function (result) {
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
                workOrderRES.getProcessPicture($scope.mgworkorder.id).then(function (result) {
                    if(result.data!=undefined && result.data!="") {
                        $scope.imageSrc = "data:image/png;base64," + result.data;
                    }
                });
            }
        };

        //return to the main page
        $scope.backToMain = function () {
            $state.go("app.unworkOrder");
        };
    };
})();