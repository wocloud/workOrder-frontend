(function() {
    app.controller('MGworkOrder', MGworkOrder);
    MGworkOrder.$inject = ['$rootScope','$scope','WorkOrder.RES','$state','$stateParams','FileUploader'];
    function MGworkOrder($rootScope,$scope,workOrderRES,$state,$stateParams,FileUploader) {
        var params={
            linkId:$stateParams.id
        };
        workOrderRES.getAllDepartment().then(function (result) {
            $scope.departments = result.data.result;
            if(!$scope.externalValue){
                $scope.externalValue = "";
            }
        });

        $scope.uploadEnable = false;
        $scope.uploadError = false;
        var api_uploader = '/wocloud-workorder-restapi/instanceLink/uploadAttachment';
        var uploader = $scope.uploader = new FileUploader({
            url: api_uploader,
            alias: 'files',
            headers: {'Content-Transfer-Encoding': 'utf-8'},
            removeAfterUpload: true
        });

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

        workOrderRES.listById(params).then(function(result) {
            var linkProperties = result.data[0].instanceLinkPropertyList;
            if (linkProperties.length != 0) {
                for (var i = 0; i < linkProperties.length; i++) {
                    var property = linkProperties[i];
                    if (property.propertyType == "select" && typeof(property.propertyOptions)=="string") {
                        property.propertyOptions = jQuery.parseJSON(property.propertyOptions);
                        if(property.propertyKey=="office_select") {
                            var depart = property.propertyValue.split(":");
                            $scope.departmentValue = depart[0];
                            if(depart.length > 0) {
                                $scope.externalValue = depart[1];
                            } else {
                                $scope.externalValue = "";
                            }
                        }
                        if(property.propertyDefaultValue==null || !property.propertyDefaultValue){
                            property.propertyDefaultValue="";
                        }
                        if(!property.propertyValue || property.propertyValue == null){
                            property.propertyValue = property.propertyDefaultValue;
                        }
                    }
                    //筛选出上传下载控制开关
                    if(property.propertyKey == "upload_enable" && (property.propertyValue || property.propertyDefaultValue)) {
                        $scope.uploadEnable = true;
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
            properties.loginUserId = $rootScope.userInfo.userId;
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
                properties.instanceLinkPropertyList=JSON.stringify($scope.mgworkorder.instanceLinkPropertyList);
            }
            //保存工单
            workOrderRES.dispose(properties).then(function (result) {
                $state.go("app.unworkOrder");
                if(result.code=="0"){
                    //保存表单成功,调附件文件
                    uploader.onBeforeUploadItem = function(item) {
                        console.log("onBeforeUploadItem");
                        item.formData = [{'instanceId': $scope.mgworkorder.id, 'userId': $rootScope.userInfo.userId}];
                    };
                    uploader.onCompleteItem = function(fileItem, response, status, headers) {
                        console.log("onCompleteItem");
                        if(response.code=='0') {
                            $scope.saveAttachment = true;
                            window.wxc.xcConfirm("工单和附件处理成功!", window.wxc.xcConfirm.typeEnum.success);
                        } else {
                            $scope.saveAttachment = false;
                            window.wxc.xcConfirm("工单处理成功,附件上传失败: "+ response.msg, window.wxc.xcConfirm.typeEnum.error);
                        }
                    };
                    if($scope.uploader.queue.length > 0) {
                        uploader.uploadAll();
                    } else {
                        window.wxc.xcConfirm("工单处理成功!", window.wxc.xcConfirm.typeEnum.success);
                    }
                } else {
                    $scope.saveOrder = false;
                    window.wxc.xcConfirm("工单处理失败: " + result.msg, window.wxc.xcConfirm.typeEnum.error);
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