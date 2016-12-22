'use strict';
/**
 * Created by sophia.wang on 16/12/14.
 */
$(function(){
    app.controller('WorkOrderViewCtrl', ['$scope', function($scope){

        $scope.configTabs = [
            {index: 1, title: '自定义属性', content: '自定义属性', url: '#/app/workOrderAttrs', href: '"modules/workOrder/attrs.html"'},
            {index: 2, title: '工单类型', content: '工单类型', url:'#/app/workOrderTypes', href: '"modules/workOrder/types.html"'}];

        $scope.dealTabs = [
            {index: 1, title: '我的工单', content: '我的工单', url: '#/app/myWorkOrder'},
            {index: 2, title: '未处理工单', content: '未处理工单', url:'#/app/unworkOrder'},
            {index: 3, title: '已处理工单', content: '已处理工单', url:'#/app/disworkOrder'}];

        angular.forEach($scope.configTabs, function(tab, index, array){
           if(tab.url == window.location.hash)   tab.active = true;
        });

        angular.forEach($scope.dealTabs, function(tab, index, array){
            if(tab.url == window.location.hash)   tab.active = true;
        });

        $scope.tabChange = function(tab){
            window.location.href = tab.url;
        };
    }]);
});