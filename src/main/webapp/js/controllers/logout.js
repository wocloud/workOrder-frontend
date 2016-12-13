'use strict';

/* Controllers */
  // signin controller
app.controller('LogoutController', ['$rootScope', '$scope', '$http', '$state', function($rootScope, $scope, $http, $state) {
    $scope.logout = function() {
      //$scope.authError = null;
      //$.post('pr/logout')
      //.then(function(response) {
      //  if (response!=1 ) {
      //  }else{
      //    $rootScope.user = null;
      //    $state.go('access.signin');
      //  }
      //}, function(x) {
      //});
        $scope.authError = null;
        $rootScope.userInfo = null;
        var apphostname = window.location.hostname;
        var appport = window.location.port;
        var appName = window.location.pathname.split(";")[0];
        var moduleName = window.location.hash;
        var callbackUrl = "?service=http%3A%2F%2F"+apphostname+"%3A"+appport+appName+moduleName;
        var logoutUrl = "http://172.20.2.137:8888/cas/logout";
        window.location = logoutUrl+ callbackUrl;
    };
    
  }])
;