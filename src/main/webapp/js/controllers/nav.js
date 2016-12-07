app.controller('navCtrl',['$scope','$http',function($scope,$http){
	$http.get('http://172.20.2.172:8080/commonCloud/pr/getMenu')
	.then(function (respose) {
		$scope.navs = respose.data.list;
		$scope.navs.splice(0,1);
	});
	$scope.isHyperlinks =function(url) {
		if(url == undefined) return false;
		return url.indexOf("http://") >=0;
	};
}]);