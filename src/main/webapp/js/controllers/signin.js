'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$rootScope', '$scope', '$http', '$state', function($rootScope, $scope, $http, $state) {
    $scope.user = {email:"",password:""};
   
    $scope.login = function() {
      // Try to login
     
      var info ;
      $.post('pr/login', {username: $scope.user.email, password: $scope.user.password})
      .then(function(response) {
    	  console.log("response="+response);
        if (response!=1 ) {
            $rootScope.user = null;
        	 $("#tipInfo").text("用户名或密码不正确");
        }else{
          $rootScope.user = $scope.user.email;
          $state.go('app.index');
        }
      }, function(x) {
    	  
        $scope.authError = 'Server Error';
      });
    };

  }])
;