'use strict';

/**
 * Config for the router
 */
angular.module('app')
    .factory('User', function($q,$resource){
    var userInfo,
        loading,
        deferred = $q.defer();
        var api_user = window.location.pathname.split(";")[0] +"/getUserInfo";
        var res_user = $resource(api_user, {}, {
            get:{
                method : 'GET'
            }
        });
    return {
        getUserInfo: function(){
            if(!loading){
                loading = true;
                res_user.get({},function(response) {
                    userInfo=response.toJSON();
                    deferred.resolve(response.toJSON());
                });
                return deferred.promise;
            }else if( userInfo ){
                return deferred.resolve(userInfo);
            }else{
                return deferred.promise;
            }
        }
    }
}).run(
    ['$rootScope', '$state', '$stateParams','User', '$location','storeService',
        function ($rootScope, $state, $stateParams,User, $location,storeService) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            User.getUserInfo().then(function(userInfo){
                $rootScope.userInfo=userInfo;
            });
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                var index=1;
                if(fromState.name=="app.disworkOrder"||fromState.name=="app.unworkOrder"||fromState.name=="app.lkworkOrder"||fromState.name=="app.myWorkOrder"){
                    if(toState.name!="app.workOrderInfo"){
                        storeService.delObject();
                    }
                }
                //angular.forEach($rootScope.logicalResourceTabs,function(a,b,c){
                //    if(a.name==toState.name){
                //        $rootScope.tabs=$rootScope.logicalResourceTabs;
                //        $rootScope.asideFolded=true;
                //        $rootScope.haveArray=true;
                //        index=0;
                //    }
                //});
                //angular.forEach($rootScope.basicResourceTabs,function(a,b,c){
                //    if(a.name==toState.name){
                //        $rootScope.tabs=$rootScope.basicResourceTabs;
                //        $rootScope.asideFolded=true;
                //        $rootScope.haveArray=true;
                //        index=0;
                //    }
                //});
                //angular.forEach($rootScope.softResourceTabs,function(a,b,c){
                //    if(a.name==toState.name){
                //        $rootScope.tabs=$rootScope.softResourceTabs;
                //        $rootScope.asideFolded=true;
                //        $rootScope.haveArray=true;
                //        index=0;
                //    }
                //});
                //angular.forEach($rootScope.configTabs,function(a,b,c){
                //    if(a.name==toState.name){
                //        $rootScope.tabs=$rootScope.configTabs;
                //        $rootScope.asideFolded=true;
                //        $rootScope.haveArray=true;
                //        index=0;
                //    }
                //});
                //angular.forEach($rootScope.dealTabs,function(a,b,c){
                //    if(a.name==toState.name){
                //        $rootScope.tabs=$rootScope.dealTabs;
                //        $rootScope.asideFolded=true;
                //        $rootScope.haveArray=true;
                //        index=0;
                //    }
                //});
                //
                //if(index==1){
                //    $rootScope.haveArray=false;
                //    $rootScope.tabs=[];
                //}
            });
        }
    ]
)
    .config(
    ['$stateProvider', '$urlRouterProvider','fbInterceptor','$httpProvider','$resourceProvider',
        function ($stateProvider, $urlRouterProvider,fbInterceptor,$httpProvider,$resourceProvider) {

            $urlRouterProvider
                .otherwise('/app/workOrderAttrs');
            $stateProvider
                .state('app', {
                    abstract: true,
                    url: '/app',
                    templateUrl: 'tpl/app.html',
                    resolve: {
                        deps: ['uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    'http://172.20.2.172:8080/commonCloud/css/common.css',
                                    'http://172.20.2.172:8080/commonCloud/js/controllers/nav.js']);
                            }]
                    }
                })
                .state('app.fullscreen',  {
                    url: '/fullscreen',
                    templateUrl: 'modules/full_screen/fullscreen-test.html',
                    resolve: {
                        deps: ['uiLoad',
                            function (uiLoad) {
                                return uiLoad.load(
                                    [
                                        'modules/full_screen/css/default.css',
                                        'modules/full_screen/css/component.css',
                                        'modules/full_screen/js/fullscreen.js'
                                    ]);
                            }]
                    }
                })
                // others
                .state('lockme', {
                    url: '/lockme',
                    templateUrl: 'tpl/page_lockme.html'
                })
                .state('access', {
                    url: '/access',
                    template: '<div ui-view class="fade-in-right-big smooth"></div>'
                })
                .state('access.signin', {
                    url: '/signin',
                    templateUrl: 'tpl/page_signin.html',
                    resolve: {
                        deps: ['uiLoad',
                            function (uiLoad) {
                                return uiLoad.load(['js/controllers/signin.js']);
                            }]
                    }
                })
                .state('access.logout', {
                    url: '/logout',
                    templateUrl: 'tpl/page_signin.html',
                    resolve: {
                        deps: ['uiLoad',
                            function (uiLoad) {
                                return uiLoad.load(['js/controllers/logout.js']);
                            }]
                    }
                })
                .state('access.signup', {
                    url: '/signup',
                    templateUrl: 'tpl/page_signup.html',
                    resolve: {
                        deps: ['uiLoad',
                            function (uiLoad) {
                                return uiLoad.load(['js/controllers/signup.js']);
                            }]
                    }
                })
                .state('access.forgotpwd', {
                    url: '/forgotpwd',
                    templateUrl: 'tpl/page_forgotpwd.html'
                })
                .state('access.404', {
                    url: '/404',
                    templateUrl: 'tpl/page_404.html'
                })
                $httpProvider.interceptors.push(fbInterceptor);
	        	$resourceProvider.defaults.stripTrailingSlashes = true;
        }
    ]
);