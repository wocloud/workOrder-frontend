'use strict';

/* Controllers */

angular.module('app')
    .controller('AppCtrl', ['$rootScope','User','$scope', '$translate', '$localStorage', '$window','$http','$timeout',
      function(    $rootScope,   User,       $scope,   $translate,   $localStorage,   $window, $http ,$timeout) {

        /* $http.get('js/app/nav/nav.json').then(function(resp) {
         $scope.navs = resp.data.navs;
         $scope.nav = $scope.navs[0];
         });*/
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
        }
        $scope.dianji=true;
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

        var locationUrl = window.location.hash;
        $scope.hash = locationUrl.split('?')[0];
        var parameters = locationUrl.split('?')[1];
        User.getUserInfo().then(function(userInfo){
          $scope.userInfo=userInfo;
          var params={
            userName:userInfo.userName
          };
          if(parameters && parameters.split("=").length >0){
            params.sideid = parameters.split("=")[1];
          }
          User.getUserMenu(params).then(function(userMenu){
            $scope.userMenu=[];
            angular.forEach(userMenu.result,function(a,b,c){
              if(a.parentIds.split(',').length==4){
                $scope.userMenu.push(a);
              }
            });
            angular.forEach($scope.userMenu,function(d,e,f){
              d.node=[];
              angular.forEach(userMenu.result,function(a,b,c){
                if(a.parentId== d.id){
                  d.node.push(a);
                }
              });
            });
          });
        });
        // angular translate
        $scope.lang = {isopen: false};
//            $scope.langs = {zh: '中文', en: 'English'};
        $scope.langs = {zh: '中文'};
        $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "中文";
        $translate.use('zh');
        $scope.setLang = function(langKey, $event) {
          // set the current lang
          $scope.selectLang = $scope.langs[langKey];
          // You can change the language during runtime
          $translate.use(langKey);
          $scope.lang.isopen = !$scope.lang.isopen;
        };


        $scope.workOrderConfigTabs = [
          {index: 1, title: '自定义属性', content: '自定义属性', url: '#/app/workOrderAttrs', name: 'app.workOrderAttrs'},
          {index: 2, title: '工单类型', content: '工单类型', url:'#/app/workOrderTypes', name: 'app.workOrderTypes'}];

        $scope.workOrderDealTabs = [
          {index: 1, title: '我的工单', content: '我的工单', url: '#/app/myWorkOrder', name: 'app.myWorkOrder'},
          {index: 2, title: '未处理工单', content: '未处理工单', url:'#/app/unworkOrder', name: 'app.unworkOrder'},
          {index: 3, title: '已处理工单', content: '已处理工单', url:'#/app/disworkOrder', name: 'app.disworkOrder'}];

        angular.forEach($scope.workOrderConfigTabs, function(tab, index, array){
          if(tab.url == $scope.hash)   {
            tab.active = true;
            $scope.app.settings.asideFolded=true;
          }
        });
        angular.forEach($scope.workOrderDealTabs, function(tab, index, array){
          if(tab.url == $scope.hash)   {
            tab.active = true;
            $scope.app.settings.asideFolded=true;
          }
        });
        $rootScope.workOrderConfigTabs=$scope.workOrderConfigTabs;
        $rootScope.workOrderDealTabs=$scope.workOrderDealTabs;

        $scope.app.treeNav={};
        $scope.tabChange = function(tab){
          window.location.href = tab.url;
          $scope.app.settings.asideFolded=true;
        };
        $rootScope.$watch("asideFolded",function(a,b,c){
          if(a!=undefined){
            $scope.app.settings.asideFolded=a;
          }
        });
        $scope.$watch("app.settings.asideFolded",function(a,b,c){//-----------------------
          //lb_fan controlStyles.indentShow()
          controlStyles.indentShow();
          //lb_fan --end
          //不隐藏
          if(a==false&&$rootScope.haveArray){
            $scope.dianji=true;
            $scope.app.treeNav.header="three_nav_header1";
            $scope.app.treeNav.app="three_nav_app1";
            $scope.app.treeNav.nav="three_nav_nav3";
            $scope.app.treeNav.nav1="three_nav_nav2";
            $scope.app.treeNav.nav2="three_nav_nav1";
          }
          //隐藏有三级单
          if(a&&$rootScope.haveArray){
            $scope.dianji=false;
            $scope.app.treeNav.header="three_nav_header";
            $scope.app.treeNav.app="three_nav_app";
            $scope.app.treeNav.nav="three_nav_nav";
            $scope.app.treeNav.nav1="three_nav_nav1";
            $scope.app.treeNav.nav2="three_nav_nav2";
            //lb_fan
            controlStyles.threeLevelMenu();
            controlStyles.ReachHide();

            //lb_fan --end
          }
          //隐藏
          if(a&&$rootScope.haveArray==false){
            $scope.dianji=false;
            $scope.app.treeNav.header="";
            $scope.app.treeNav.app="";
            $scope.app.treeNav.nav="";
            $scope.app.treeNav.nav1="";
            $scope.app.treeNav.nav2="";

            //lb_fan  controlStyles.ReachHide()
            controlStyles.ReachHide();
            //lb_fan --end
          }
          $rootScope.asideFolded=$scope.app.settings.asideFolded;
        })
        $rootScope.$watch('haveArray',function(a,b,c){
          if($rootScope.asideFolded&&a){

            $scope.app.treeNav.header="three_nav_header";
            $scope.app.treeNav.app="three_nav_app";
            $scope.app.treeNav.nav="three_nav_nav";
            $scope.app.treeNav.nav1="three_nav_nav1";
            $scope.app.treeNav.nav2="three_nav_nav2";
            $timeout(function(){
              controlStyles.threeLevelMenu();
              controlStyles.ReachHide();
            },2000);

          }
          $scope.haveArray=a;

          if(a==false){
            $scope.app.treeNav.header="";
            $scope.app.treeNav.app="";
            $scope.app.treeNav.nav="";
            $scope.app.treeNav.nav1="";
            $scope.app.treeNav.nav2="";
          }
        });
        $rootScope.$watch('tabs',function(a,b,c){
          $scope.tabs=a;
        });
        function isSmartDevice( $window )
        {
          // Adapted from http://www.detectmobilebrowsers.com
          var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
          // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        }
      }]);
var controlStyles={
  indentShow:function(){
    $(".swicthBtn").find("ul").attr("style","position:static;");
    $(".swicthBtn").find("ul").attr("style","position:static;width:100%;");
    $(".swicthBtn .dk").attr("style","position:static;width:100%;");
    //  显示时箭头方向及文字隐藏
    controlStyles.showIconText();
    $(".swicthBtn a[class='auto']").unbind("mouseover");
    $(".swicthBtn li").not("li:first-child").unbind("mouseout");
    $(".swicthBtn .dk li").unbind("mouseover");
    $(".swicthBtn .dk li a").unbind("mouseout");
  },
  ReachHide:function(){
    $(".navi ul.nav li").attr("style","position:static;");
    $(".swicthBtn").find("ul").attr("style","position:static;width:100%;");
    $(".swicthBtn .dk").attr("style","position:static;width:100%;");
    //  隐藏时箭头方向及文字隐藏
    controlStyles.hideIconText();
    //  鼠标移入移出事件 -- 一级菜单
    $(".swicthBtn a[class='auto']").unbind("mouseover").bind("mouseover",function(){
      controlStyles.mouseOver(this);
    });
    $(".swicthBtn li").not("li:first-child").unbind("mouseout").bind("mouseout",function(){
      controlStyles.mouseOut(this);
    });
    //  鼠标移入移出事件 -- 二级菜单
    $(".swicthBtn .dk li").unbind("mouseover").bind("mouseover",function(){
      controlStyles.mouseOver(this);
    });
    $(".swicthBtn .dk li a").unbind("mouseout").bind("mouseout",function(){
      controlStyles.mouseOut(this);
    });
  },
  //三级菜单
  threeLevelMenu:function(){
    $(".swicthBtn").find("ul").attr("style","position:static;width:47px;");
    controlStyles.hideIconText();
    //  鼠标移入移出事件 -- 一级菜单
    $(".swicthBtn a[class='auto']").unbind("mouseover").bind("mouseover",function(){
      controlStyles.mouseOver(this);
    });
    $(".swicthBtn li").not("li:first-child").unbind("mouseout").bind("mouseout",function(){
      controlStyles.mouseOut(this);
    });
    //  鼠标移入移出事件 -- 二级菜单
    $(".swicthBtn .dk li").unbind("mouseover").bind("mouseover",function(){
      controlStyles.mouseOver(this);
    });
    $(".swicthBtn .dk li a").unbind("mouseout").bind("mouseout",function(){
      controlStyles.mouseOut(this);
    });
    console.log("threeLevelMenu")
  },
  //  显示时箭头方向及文字隐藏
  showIconText:function(){
    var str= '<i class="fa fa-fw fa-angle-right text"></i>'
        +'<i class="fa fa-fw fa-angle-down text-active"></i>';
    $(".swicthBtn .pull-left").html(str);
    $(".swicthBtn .dk a span").removeClass("hidden").addClass("show");
  },
  //  隐藏时箭头方向及文字隐藏
  hideIconText:function(){
    var str='<i class="fa fa-fw fa-angle-right"></i>';
    $(".swicthBtn .pull-left").html(str);
    $(".swicthBtn .dk a span").removeClass("show").addClass("hidden");
  },
  //  鼠标移入移出事件
  mouseOver:function(thisBtn){
    var $btn=$(thisBtn);
    var thisTop=$btn.offset().top;
    var textCon=$btn.text();
    if(textCon.length == "14"){
      textCon ="&nbsp;&nbsp;&nbsp;"+textCon+"&nbsp;&nbsp;&nbsp;";
    }
    var divBox= '<div'
        +' id="divBox" style="color:#fff;font-weight:bold;font-size:15px;background: rgba(34,85,144,.6);position:absolute;top:'+thisTop+'px;left:70px;z-index:999999;padding:10px;">'
        +textCon+'</div>';
    $("body").append(divBox);
  },
  mouseOut:function(){
    $("#divBox").remove();
  },
//  点击首页
  clickHomePage:function(){
    $(".swicthBtn .nav-first_").unbind("click").bind("click",function(){
      var naviWrap=$(".navi-wrap").width();
      console.log(naviWrap)
      //if(){}
    })
  }
}
