angular.module('app')
    .config(
    ['$stateProvider', '$urlRouterProvider','fbInterceptor','$httpProvider','$resourceProvider',
        function ($stateProvider, $urlRouterProvider,fbInterceptor,$httpProvider,$resourceProvider) {

            $stateProvider
                .state('app.workOrderAttrs', {
                    url: '/workOrderAttrs',
                    templateUrl: 'modules/workOrder/attrs.html',
                    controller: 'WorkOrderAttrsViewCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load([
                                    'modules/workOrder/js/workOrderRES.js',
                                    'modules/workOrder/js/attributes.js']);
                            }]
                    }
                })
                .state('app.workOrderTypes', {
                    url: '/workOrderTypes',
                    templateUrl: 'modules/workOrder/types.html',
                    controller: 'WorkOrderTypesViewCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load([
                                    'modules/workOrder/js/workOrderRES.js',
                                    'modules/workOrder/js/types.js']);
                            }]
                    }
                })
                .state('app.workOrderAttrInfo', {
                    url: '/workOrderAttrInfo?key',
                    templateUrl: 'modules/workOrder/attr.info.html',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load([
                                    'modules/workOrder/js/workOrderRES.js',
                                    'modules/workOrder/js/attributes.js']);
                            }]
                    }
                })
                //.state('app.workOrderAttrLinked', {
                //    url: '/workOrderAttrLinked?key',
                //    templateUrl: 'modules/workOrder/attr.linked.html',
                //    resolve: {
                //        deps: ['$ocLazyLoad',
                //            function( $ocLazyLoad ){
                //                return $ocLazyLoad.load(['modules/workOrder/js/attributes.js']);
                //            }]
                //    }
                //})
                .state('app.myWorkOrder', {
                    url: '/myWorkOrder',
                    templateUrl: 'modules/workOrder/myWorkOrder.html',
                    controller: 'MyWorkOrderCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load([
                                    'modules/workOrder/js/workOrderRES.js',
                                    'modules/workOrder/js/myWorkOrder.js']);
                            }]
                    }
                })
                .state('app.workOrderCreateOrUpdate', {
                    url: '/workOrderCreateOrUpdate',
                    controller:'WorkOrderCreateOrUpdateCtrl',
                    templateUrl: 'modules/workOrder/workOrder.create.html',
                    params : {'id' : null, 'linkId': null},
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load('angularFileUpload').then(
                                    function(){
                                        return $ocLazyLoad.load([
                                            'modules/workOrder/js/workOrderRES.js',
                                            'modules/workOrder/js/myWorkOrder.js'
                                        ]);
                                    }
                                );
                            }]
                    }
                })
                .state('app.lkworkOrder', {
                    url: '/lkworkOrder',
                    templateUrl: 'modules/workOrder/lkWorkOrder.html',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load([
                                    'modules/workOrder/js/workOrderRES.js',
                                    'modules/workOrder/js/lkworkOrder.js']);
                            }]
                    }
                })
                .state('app.mgworkOrder', {
                    url: '/mgworkOrder',
                    params:{id:null},
                    controller:'MGworkOrder',
                    templateUrl: 'modules/workOrder/mgWorkOrder.html',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load('angularFileUpload').then(
                                    function(){
                                        return $ocLazyLoad.load([
                                            'modules/workOrder/js/workOrderRES.js',
                                            'modules/workOrder/js/mgWorkOrder.js'
                                        ]);
                                    }
                                );
                            }]
                    }
                })
                .state('app.workOrderInfo', {
                    url: '/workOrderInfo',
                    params:{'id':null, 'flag':null},
                    controller:'WorkOrderInfo',
                    templateUrl: 'modules/workOrder/workOrderInfo.html',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load([
                                    'modules/workOrder/js/workOrderRES.js',
                                    'modules/workOrder/js/workOrderInfo.js']);
                            }]
                    }
                })
                .state('app.unworkOrder', {
                    url: '/unworkOrder',
                    templateUrl: 'modules/workOrder/unWorkOrder.html',
                    controller: 'UnWorkOrderViewCtrl',
                    params:{'workorderTypeId':null},
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load([
                                    'modules/workOrder/js/workOrderRES.js',
                                    'modules/workOrder/js/unworkOrder.js'
                                ]);
                            }]
                    }
                })
                .state('app.disworkOrder', {
                    url: '/disworkOrder',
                    templateUrl: 'modules/workOrder/disWorkOrder.html',
                    controller: 'DisWorkOrderViewCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function( $ocLazyLoad ){
                                return $ocLazyLoad.load([
                                    'modules/workOrder/js/workOrderRES.js',
                                    'modules/workOrder/js/disworkOrder.js']);
                            }]
                    }
                });
            $httpProvider.interceptors.push(fbInterceptor);
            $resourceProvider.defaults.stripTrailingSlashes = true;
        }
    ]
);