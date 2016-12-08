<!DOCTYPE html>
<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<meta http-equiv=Content-Type content=text/html;charset=utf-8>
<html lang="en" data-ng-app="app">
<head>
  <%!String serviceUrl="http://172.20.2.172:8080/commonCloud";%>
  <meta charset="utf-8" />
  <title>沃云</title>
  <meta name="description" content="app, web app, responsive, responsive layout, admin, admin panel, admin dashboard, flat, flat ui, ui kit, AngularJS, ui route, charts, widgets, components" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="<%=serviceUrl%>/modules/grid_test/css/ui-grid.min.css"/>
  <link rel="stylesheet" href="<%=serviceUrl%>/css/bootstrap.css" type="text/css" />
  <link rel="stylesheet" href="<%=serviceUrl%>/css/animate.css" type="text/css" />
  <link rel="stylesheet" href="<%=serviceUrl%>/css/font-awesome.min.css" type="text/css" />
  <link rel="stylesheet" href="<%=serviceUrl%>/css/simple-line-icons.css" type="text/css" />
  <link rel="stylesheet" href="<%=serviceUrl%>/css/font.css" type="text/css" />
  <link rel="stylesheet" href="<%=serviceUrl%>/css/app.css" type="text/css" />
  <link rel="stylesheet" href="<%=serviceUrl%>/vendor/jquery/datatables/dataTables.bootstrap.css">
  <link rel="stylesheet" href="<%=serviceUrl%>/css/alert.css">
</head>
<body ng-controller="AppCtrl">
  <div class="app" id="app" ng-class="{'app-header-fixed':app.settings.headerFixed, 'app-aside-fixed':app.settings.asideFixed, 'app-aside-folded':app.settings.asideFolded, 'app-aside-dock':app.settings.asideDock, 'container':app.settings.container}" ui-view></div>


  <!-- jQuery -->
  <script src="<%=serviceUrl%>/vendor/jquery/jquery.min.js"></script>
  <!-- Bootstrap -->
  <script src="<%=serviceUrl%>/vendor/jquery/bootstrap.min.js"></script>

  <!-- Angular -->
  <script src="<%=serviceUrl%>/vendor/angular/angular.js"></script>
  <script src="<%=serviceUrl%>/vendor/angular/angular-messages/angular-messages.js"></script>
  
  <script src="<%=serviceUrl%>/vendor/angular/angular-animate/angular-animate.js"></script>
  <script src="<%=serviceUrl%>/vendor/angular/angular-cookies/angular-cookies.js"></script>
  <script src="<%=serviceUrl%>/vendor/angular/angular-resource/angular-resource.js"></script>
  <script src="<%=serviceUrl%>/vendor/angular/angular-sanitize/angular-sanitize.js"></script>
  <script src="<%=serviceUrl%>/vendor/angular/angular-touch/angular-touch.js"></script>
<!-- Vendor -->
  <script src="<%=serviceUrl%>/vendor/angular/angular-ui-router/angular-ui-router.js"></script> 
  <script src="<%=serviceUrl%>/vendor/angular/ngstorage/ngStorage.js"></script>

  <!-- bootstrap -->
  <script src="<%=serviceUrl%>/vendor/angular/angular-bootstrap/ui-bootstrap-tpls.js"></script>
  <!-- lazyload -->
  <script src="<%=serviceUrl%>/vendor/angular/oclazyload/ocLazyLoad.js"></script>
  <!-- translate -->
  <script src="<%=serviceUrl%>/vendor/angular/angular-translate/angular-translate.js"></script>
  <script src="<%=serviceUrl%>/vendor/angular/angular-translate/loader-static-files.js"></script>
  <script src="<%=serviceUrl%>/vendor/angular/angular-translate/storage-cookie.js"></script>
  <script src="<%=serviceUrl%>/vendor/angular/angular-translate/storage-local.js"></script>
  <script src="vendor/modules/angular-dialog/angular-dialog.js"></script>
  <script src="js/directives/fake-backend.js"></script>
  <script src="js/directives/skyform-validate.js"></script>
  <script src="js/app.js"></script>
  <script src="js/config.js"></script>
  <script src="js/config.lazyload.js"></script>
  <script src="js/config.router.js"></script>
  <script src="js/main.js"></script>
  <script src="<%=serviceUrl%>/js/services/ui-load.js"></script>
  <script src="<%=serviceUrl%>/js/filters/fromNow.js"></script>
  <script src="<%=serviceUrl%>/js/directives/setnganimate.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-butterbar.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-focus.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-fullscreen.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-jq.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-module.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-nav.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-scroll.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-shift.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-toggleclass.js"></script>
  <script src="<%=serviceUrl%>/js/directives/ui-validate.js"></script>
  <script src="<%=serviceUrl%>/js/controllers/bootstrap.js"></script>
  <script src="<%=serviceUrl%>/js/controllers/logout.js"></script>
  <script src="<%=serviceUrl%>/js/alert.js"></script>
  <script src="<%=serviceUrl%>/js/dateFormat.js"></script>

  <!-- Lazy loading -->
  <script src="<%=serviceUrl%>/vendor/jquery/datatables/jquery.dataTables.min.js"></script>
  <script src="<%=serviceUrl%>/vendor/jquery/datatables/dataTables.bootstrap.js"></script>
  <script src="<%=serviceUrl%>/modules/grid_test/js/ui-grid.min.js"></script>
  <script src="<%=serviceUrl%>/modules/grid_test/js/grid-directive.js"></script>
  <script src="vendor/modules/angularjs-toaster/toaster.js"></script>
  <script src="js/directives/ui-laydate.js"></script>
  <script src="vendor/jquery/laydate/laydate.js"></script>
  <script src="modules/workOrder/js/getCurrentUser.js"></script>
  <script src="js/directives/sreach-button.js"></script>
  <script src="js/directives/ui-workSreach.js"></script>
  <script src="js/config.wangpeipei.router.js"></script>

  <link rel="stylesheet" href="css/wo_commom.css" type="text/css" />
  <link rel="stylesheet" href="css/ng-dialog/ngDialog.min.css">
  <link rel="stylesheet" href="css/ng-dialog/myth/ngDialog-theme-default.css">
  <link rel="stylesheet" href="css/ng-dialog/myth/ngDialog-theme-plain.css">
  <link rel="stylesheet" href="vendor/modules/angularjs-toaster/toaster.css"/>
</body>
</html>