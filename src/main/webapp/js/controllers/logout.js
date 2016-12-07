'use strict';

/* Controllers */
  // signin controller
app.controller('LogoutController', ['$rootScope', '$scope', '$http', '$state', function($rootScope, $scope, $http, $state) {
    $scope.logout = function() {
      $scope.authError = null;
      $.post('pr/logout')
      .then(function(response) {
        if (response!=1 ) {
        }else{
          $rootScope.user = null;
          $state.go('access.signin');
        }
      }, function(x) {
      });
    };
    
  }])
;