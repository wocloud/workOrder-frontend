app.service('MyWorkOrder.RES', ServiceMyWorkOrderRES);
ServiceMyWorkOrderRES.$inject = ['$q', '$resource', 'fakeMapping', '$rootScope'];
function ServiceMyWorkOrderRES($q, $resource, fakeMapping, $rootScope) {
    this.CMD = {
        ListWorkOrder    : 'listWorkOrders',
        CreateWorkOrder  : 'createWorkOrder',
        GetWorkOrder     : 'getWorkOrder',
        ListProperties   : 'listWorkOrderProperties'
    };
    //根据属性创建工单
    var api_saveWorkOrder_list = '/wocloud-workorder-restapi/instanceService/saveWorkorderInstanceOnly',
        res_saveWorkOrder_list = $resource(api_saveWorkOrder_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    //获取用户
    var api_user_list = '/wocloud-workorder-restapi/actIdUser/getActIdUserListByConditions',
        res_user_list = $resource(api_user_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    //提交工单
    var api_submitWorkOrder_list = '/wocloud-workorder-restapi/instanceService/submitWorkorderInstance',
        res_submitWorkOrder_list = $resource(api_submitWorkOrder_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});

    //获取查询工单初始条件
    var api_workOrder_attr_list = '/wocloud-workorder-restapi/workorderProperty/listWorkorderProperties',
        res_workOrder_attr_list = $resource(api_workOrder_attr_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    //签收工单
    var api_signWorkOrder_attr_list = '/wocloud-workorder-restapi/instanceLink/claimInstanceLink',
        res_signWorkOrder_attr_list = $resource(api_signWorkOrder_attr_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    fakeMapping.scheme(api_signWorkOrder_attr_list, {
        '':'modules/workOrder/json/attr.isNameUnique.json'
    });
    //查询创建工单属性
    var api_creatWorkOrder_attr_list = '/wocloud-workorder-restapi/instanceService/getFormPropertiesByworkorderType',
        res_creatWorkOrder_attr_list = $resource(api_creatWorkOrder_attr_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    fakeMapping.scheme(api_creatWorkOrder_attr_list, {
        '':'modules/workOrder/json/create.listattr.json'
    });
    //查询工单类型
    var api_creatTypeCode_list = '/wocloud-workorder-restapi/workorderType/listWorkorderTypes',
        res_creatTypeCode_list = $resource(api_creatTypeCode_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    fakeMapping.scheme(api_creatTypeCode_list, {
        '':'modules/workOrder/json/create.listattr.json'
    });
    //获取工单级别
    var api_creatPriority_list = '/listapi_creatPriority_list',
        res_creatPriority_list = $resource(api_creatPriority_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    fakeMapping.scheme(api_creatPriority_list, {
        '':'modules/workOrder/json/priority_list.json'
    });
    //获取工单产品分类
    var api_creatProduct_list = '/listapi_creatProduct_list',
        res_creatProduct_list = $resource(api_creatProduct_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    fakeMapping.scheme(api_creatProduct_list, {
        '':'modules/workOrder/json/product_list.json'
    });
    //根据条件查询工单
    var api_listWorkOrder_list = '/wocloud-workorder-restapi/workorder/selectWorkorderTableByCondition',
        res_listWorkOrder_list = $resource(api_listWorkOrder_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    fakeMapping.scheme(api_listWorkOrder_list, {
        '':'modules/workOrder/json/list_work_order.json'
    });
    //查询未处理工单
    var api_listunWorkOrder_list = '/wocloud-workorder-restapi/instanceService/selectPendingInstanceListByCondition',
        res_listunWorkOrder_list = $resource(api_listunWorkOrder_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    fakeMapping.scheme(api_listunWorkOrder_list, {
        '':'modules/workOrder/json/list_work_order.json'
    });
    //根据linkId查询工单
    var api_listWorkOrderById_list = '/wocloud-workorder-restapi/workorder/selectWorkorderInfo',
        res_listWorkOrderById_list = $resource(api_listWorkOrderById_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    fakeMapping.scheme(api_listWorkOrderById_list, {
        '':'modules/workOrder/json/mgwork_event.json'
    });
    //处理工单
    var api_disposeWorkOrderById_list = '/wocloud-workorder-restapi/instanceLink/completeInstanceLink',
        res_disposeWorkOrderById_list = $resource(api_disposeWorkOrderById_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});

    fakeMapping.scheme(api_workOrder_attr_list, {
        ''   : 'modules/workOrder/json/property.list.json'
    });
    this.list_create_attr=function(params){
        var task = $q.defer();
        res_creatWorkOrder_attr_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    this.dispose=function(params){
        var task = $q.defer();
        res_disposeWorkOrderById_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    this.listUser=function(params){
        var task = $q.defer();
        res_user_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };

    this.listById=function(params){
        var task = $q.defer();
        res_listWorkOrderById_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    //根据linkId查询我的工单详情
    var api_listMyWorkOrderById_list = '/wocloud-workorder-restapi/workorder/selectWorkorderInfoByMyPermision';
    this.listMyWorkOrderById=function(params){
        var task = $q.defer();
        $resource(api_listMyWorkOrderById_list).save(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    //根据linkId查询未处理工单详情
    var api_listUndoWorkOrderById_list = '/wocloud-workorder-restapi/workorder/selectWorkorderInfoByPendingPermision';
    this.listUndoWorkOrderById=function(params){
        var task = $q.defer();
        $resource(api_listUndoWorkOrderById_list).save(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    //根据linkId查询已处理工单详情
    var api_listProcessedWorkOrderById_list = '/wocloud-workorder-restapi/workorder/selectWorkorderInfoByProcessedPermision';
    this.listProcessedWorkOrderById=function(params){
        var task = $q.defer();
        $resource(api_listProcessedWorkOrderById_list).save(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    //根据linkId查询工单查看的工单详情
    var api_listAllWorkOrderById_list = '/wocloud-workorder-restapi/workorder/selectWorkorderInfoByAllPermision';
    this.listAllWorkOrderById=function(params){
        var task = $q.defer();
        $resource(api_listAllWorkOrderById_list).save(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    //获取工单实例的各环节处理结果
    var api_listWorkOrderProcessResultById_list = '/wocloud-workorder-restapi/workorder/selectInstanceLinkLog';
    this.listWorkOrderProcessResultById=function(params){
        var task = $q.defer();
        $resource(api_listWorkOrderProcessResultById_list).save(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    this.sign=function(params){
        var task = $q.defer();
        res_signWorkOrder_attr_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    this.list_typeCode=function(params){
        var task = $q.defer();
        res_creatTypeCode_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };

    this.list_priority=function(params){
        var task = $q.defer();
        res_creatPriority_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };

    this.list_ProductType=function(params){
        var task = $q.defer();
        res_creatProduct_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    this.list_work=function(params){
        var task = $q.defer();
        res_listWorkOrder_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    this.list_unwork=function(params){
        params.performerId = $rootScope.userInfo.userId;
        var task = $q.defer();
        res_listunWorkOrder_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    this.list_attr=function(params){
        var task = $q.defer();
        res_workOrder_attr_list.post(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };

    /*this.create = function(params){
        var task = $q.defer();
        res_createWorkOrder_list.post(params,function(response){
            task.resolve(response.toJSON());
        });
        return task.promise;
    };*/
    this.save = function(params){
        var task = $q.defer();
        res_saveWorkOrder_list.post(params,function(response){
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    this.submit = function(params){
        params.ownerId = $rootScope.userInfo.userId;
        var task = $q.defer();
        res_submitWorkOrder_list.post(params,function(response){
            task.resolve(response.toJSON());
        });
        return task.promise;
    };

    //获取流程列表
    this.listWorkFlows = function(params){
        var api_workflow_list = '/wocloud-workorder-restapi/workflow/listProcessDefinition';
        var task = $q.defer();
        var parameters = params==undefined ? {} : params;
        $resource(api_workflow_list).save(parameters, function(response){
            task.resolve(response.toJSON());
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };

    //获取工单实例当前环节流程图
    this.getProcessPicture = function(workorderInstanceId){
        var api_link_workOrderAndFlow = '/wocloud-workorder-restapi/instanceService/getProcessPicture';
        var task = $q.defer();
        $resource(api_link_workOrderAndFlow).save({"id": workorderInstanceId}, function(response){
            task.resolve(response.toJSON());
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };
}