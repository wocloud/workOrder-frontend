'use strict';

/* Controllers */

angular.module('app')
    .controller('AppCtrl', ['User','$scope', '$rootScope', '$translate', '$localStorage', '$window','$http',
      function(User, $rootScope, $scope,   $translate,   $localStorage,  $window, $http ) {
        $http.get('js/app/nav/nav.json').then(function(resp) {
          $scope.navs = resp.data.navs;
          $scope.nav = $scope.navs[0];
        });
        // add 'ie' classes to html
        var isIE = !!navigator.userAgent.match(/MSIE/i);
        isIE && angular.element($window.document.body).addClass('ie');
        isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');

        // config
        $scope.app = {
          name: 'WOCLOUD沃云',
          version: '1.0.0',
          // for chart colors
          color: {
            primary: '#7266ba',
            info:    '#23b7e5',
            success: '#27c24c',
            warning: '#fad733',
            danger:  '#f05050',
            light:   '#e8eff0',
            dark:    '#3a3f51',
            black:   '#1c2b36'
          },
          settings: {
            themeID: 1,
            navbarHeaderColor: 'bg-black',
            navbarCollapseColor: 'bg-black',
            asideColor: 'bg-black',
            headerFixed: true,
            asideFixed: true,
            asideFolded: false,
            asideDock: false,
            container: false
          }
        };

        // save settings to local storage
        if ( angular.isDefined($localStorage.settings) ) {
          //$scope.app.settings = $localStorage.settings;
        } else {
          $localStorage.settings = $scope.app.settings;
        }
        $scope.$watch('app.settings', function(){
          if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
            // aside dock and fixed must set the header fixed.
            $scope.app.settings.headerFixed = true;
          }
          // save to local storage
          $localStorage.settings = $scope.app.settings;
        }, true);

        // angular translate
        $scope.lang = { isopen: false };
        $scope.langs = {en:'English', de_DE:'German', it_IT:'Italian'};
        $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
        $scope.setLang = function(langKey, $event) {
          // set the current lang
          $scope.selectLang = $scope.langs[langKey];
          // You can change the language during runtime
          $translate.use(langKey);
          $scope.lang.isopen = !$scope.lang.isopen;
        };

        /***get user**/
        User.getUserInfo().then(function(userInfo){
          $scope.userInfo=userInfo;
        });

        /***menu   start****/
        $scope.configTabs = [
          {index: 1, title: '自定义属性', content: '自定义属性', url: '#/app/workOrderAttrs', name: 'app.workOrderAttrs'},
          {index: 2, title: '工单类型', content: '工单类型', url:'#/app/workOrderTypes', name: 'app.workOrderTypes'}];

        $scope.dealTabs = [
          {index: 1, title: '我的工单', content: '我的工单', url: '#/app/myWorkOrder', name: 'app.myWorkOrder'},
          {index: 2, title: '未处理工单', content: '未处理工单', url:'#/app/unworkOrder', name: 'app.unworkOrder'},
          {index: 3, title: '已处理工单', content: '已处理工单', url:'#/app/disworkOrder', name: 'app.disworkOrder'}];

        //$scope.logicalResourceTabs = [
        //  {index: 1, title: '资源池', content: '资源池', url: '#/app/datacenter',name:"app.ui-datacenter"},
        //  {index: 2, title: '可用域', content: '可用域', url:'#/app/def_pool_az',name:"app.def_pool_az"}];
        //
        //$scope.softResourceTabs = [
        //  {index: 1, title: '操作系统', content: '操作系统', url: '#/app/operate_system',name:"app.operate_system"},
        //  {index: 2, title: '镜像资源', content: '镜像资源', url:'#/app/system_mirror',name:"app.ui-system-mirror"}];
        //
        //$scope.basicResourceTabs = [
        //  {index: 1, title: '机房', content: '机房', url: '#/app/room',name:"app.room"},
        //  {index: 2, title: '机架', content: '机架', url:'#/app/cabinet',name:"app.cabinet"},
        //  {index: 3, title: '物理机节点', content: '物理机节点', url:'#/app/phy_node',name:"app.ui-phy-node"},
        //  {index: 4, title: '网络设备', content: '网络设备', url:'#/app/network-eq-management',name:"app.ui-network-eq-management"},
        //  {index: 5, title: '链路', content: '链路', url:'#/app/asset_manage',name:"app.ui-asset-manage"},
        //  {index: 6, title: '公网IP', content: '公网IP', url:'#/app/public_ip',name:"app.ui-public-ip"}
        //];
        //$scope.resourceMonitorTabs = [
        //  {index: 1, title: '物理机监控', content: '物理机监控', url: '#/app/physical_monitor',name:"app.physical_monitor"},
        //  {index: 2, title: '存储监控', content: '存储监控', url:'#/app/storage_monitor',name:"app.storage_monitor"}
        //];
        //$rootScope.logicalResourceTabs=$scope.logicalResourceTabs;
        //$rootScope.softResourceTabs=$scope.softResourceTabs;
        //$rootScope.basicResourceTabs=$scope.basicResourceTabs;
        //$rootScope.resourceMonitorTabs=$scope.resourceMonitorTabs;
        $rootScope.configTabs=$scope.configTabs;
        $rootScope.dealTabs=$scope.dealTabs;
        //angular.forEach($scope.logicalResourceTabs, function(tab, index, array){
        //  if(tab.url == window.location.hash)   {
        //    tab.active = true;
        //    $scope.app.settings.asideFolded=true;
        //  }
        //});
        //angular.forEach($scope.basicResourceTabs, function(tab, index, array){
        //  if(tab.url == window.location.hash)   {
        //    tab.active = true;
        //    $scope.app.settings.asideFolded=true;
        //  }
        //});
        //angular.forEach($scope.softResourceTabs, function(tab, index, array){
        //  if(tab.url == window.location.hash)   {
        //    tab.active = true;
        //    $scope.app.settings.asideFolded=true;
        //  }
        //});
        //angular.forEach($scope.resourceMonitorTabs, function(tab, index, array){
        //  if(tab.url == window.location.hash)   {
        //    tab.active = true;
        //    $scope.app.settings.asideFolded=true;
        //  }
        //});
        angular.forEach($scope.configTabs, function(tab, index, array){
          if(tab.url == window.location.hash) {
            tab.active = true;
            $scope.app.settings.asideFolded=true;
          }
        });

        angular.forEach($scope.dealTabs, function(tab, index, array){
          if(tab.url == window.location.hash){
            tab.active = true;
            $scope.app.settings.asideFolded=true;
          }
        });

        $scope.tabChange = function(tab){
          window.location.href = tab.url;
          //$scope.app.settings.asideFolded=true;
        };

        //$scope.app.treeNav={};
        //
        //$rootScope.$watch("asideFolded",function(a,b,c){
        //  if(a!=undefined){
        //    $scope.app.settings.asideFolded=a;
        //  }
        //});
        //$scope.$watch("app.settings.asideFolded",function(a,b,c){
        //  if(a==false&&$rootScope.haveArray){
        //    $scope.app.treeNav.header="three_nav_header1";
        //    $scope.app.treeNav.app="three_nav_app1";
        //    $scope.app.treeNav.nav="three_nav_nav3";
        //    $scope.app.treeNav.nav1="three_nav_nav2";
        //    $scope.app.treeNav.nav2="three_nav_nav1";
        //  }
        //  if(a&&$rootScope.haveArray){
        //    $scope.app.treeNav.header="three_nav_header";
        //    $scope.app.treeNav.app="three_nav_app";
        //    $scope.app.treeNav.nav="three_nav_nav";
        //    $scope.app.treeNav.nav1="three_nav_nav1";
        //    $scope.app.treeNav.nav2="three_nav_nav2";
        //  }
        //  if(a&&$rootScope.haveArray==false){
        //    $scope.app.treeNav.header="";
        //    $scope.app.treeNav.app="";
        //    $scope.app.treeNav.nav="";
        //    $scope.app.treeNav.nav1="";
        //    $scope.app.treeNav.nav2="";
        //  }
        //  $rootScope.asideFolded=$scope.app.settings.asideFolded;
        //});
        //$rootScope.$watch('haveArray',function(a,b,c){
        //  if($rootScope.asideFolded && a){
        //    $scope.app.treeNav.header="three_nav_header";
        //    $scope.app.treeNav.app="three_nav_app";
        //    $scope.app.treeNav.nav="three_nav_nav";
        //    $scope.app.treeNav.nav1="three_nav_nav1";
        //    $scope.app.treeNav.nav2="three_nav_nav2";
        //  }
        //  $scope.haveArray=a;
        //
        //  if(a==false){
        //    $scope.app.treeNav.header="";
        //    $scope.app.treeNav.app="";
        //    $scope.app.treeNav.nav="";
        //    $scope.app.treeNav.nav1="";
        //    $scope.app.treeNav.nav2="";
        //  }
        //});
        //$rootScope.$watch('tabs',function(a,b,c){
        //  $scope.tabs=a;
        //});
        /***menu   end****/

        function isSmartDevice( $window )
        {
          // Adapted from http://www.detectmobilebrowsers.com
          var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
          // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        }

      }]);