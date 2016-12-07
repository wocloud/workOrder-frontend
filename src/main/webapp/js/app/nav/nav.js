app.controller('navCtrl',['$scope','$http',function($scope,$http){
	$http.get('./pr/getMenu')
	.then(function (respose) {
		$scope.navs = respose.data.list;
	});
}]);