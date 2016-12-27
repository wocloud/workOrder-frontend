var API_SERVICE_URL = '/wocloud-workorder-restapi';
app.service('WorkOrder.RES', ServiceWorkOrderRES);
ServiceWorkOrderRES.$inject = ['$q', '$resource', 'fakeMapping', '$rootScope'];
function ServiceWorkOrderRES($q, $resource, fakeMapping, $rootScope) {
    this.CMD = {
        ListWorkOrder    : 'listWorkOrders',
        CreateWorkOrder  : 'createWorkOrder',
        GetWorkOrder     : 'getWorkOrder',
        ListProperties   : 'listWorkOrderProperties'
    };
    //根据属性创建工单
    var api_saveWorkOrder_list = API_SERVICE_URL + '/instanceService/saveWorkorderInstanceOnly',
        res_saveWorkOrder_list = $resource(api_saveWorkOrder_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    //获取用户
    var api_user_list = API_SERVICE_URL + '/actIdUser/getActIdUserListByConditions',
        res_user_list = $resource(api_user_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    //提交工单
    var api_submitWorkOrder_list = API_SERVICE_URL + '/instanceService/submitWorkorderInstance',
        res_submitWorkOrder_list = $resource(api_submitWorkOrder_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});

    //获取查询工单初始条件
    var api_workOrder_attr_list = API_SERVICE_URL + '/workorderProperty/listWorkorderProperties',
        res_workOrder_attr_list = $resource(api_workOrder_attr_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    //签收工单
    var api_signWorkOrder_attr_list = API_SERVICE_URL + '/instanceLink/claimInstanceLink',
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
    var api_creatWorkOrder_attr_list = API_SERVICE_URL + '/instanceService/getFormPropertiesByworkorderType',
        res_creatWorkOrder_attr_list = $resource(api_creatWorkOrder_attr_list,{},{post:{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json;charset=UTF-8'
            }
        }});
    fakeMapping.scheme(api_creatWorkOrder_attr_list, {
        '':'modules/workOrder/json/create.listattr.json'
    });
    //查询当前登录人的工单类型
    var api_creatTypeCode_list = API_SERVICE_URL + '/WorkorderTypeRole/selectTypeByUserId',
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
    var api_listWorkOrder_list = API_SERVICE_URL + '/workorder/selectWorkorderTableByCondition',
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
    var api_listunWorkOrder_list = API_SERVICE_URL + '/instanceService/selectPendingInstanceListByCondition',
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
    var api_listWorkOrderById_list = API_SERVICE_URL + '/workorder/selectWorkorderInfo',
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
    var api_disposeWorkOrderById_list = API_SERVICE_URL + '/instanceLink/completeInstanceLink',
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
    var api_listMyWorkOrderById_list = API_SERVICE_URL + '/workorder/selectWorkorderInfoByMyPermision';
    this.listMyWorkOrderById=function(params){
        var task = $q.defer();
        $resource(api_listMyWorkOrderById_list).save(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    //根据linkId查询未处理工单详情
    var api_listUndoWorkOrderById_list = API_SERVICE_URL + '/workorder/selectWorkorderInfoByPendingPermision';
    this.listUndoWorkOrderById=function(params){
        var task = $q.defer();
        $resource(api_listUndoWorkOrderById_list).save(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    //根据linkId查询已处理工单详情
    var api_listProcessedWorkOrderById_list = API_SERVICE_URL + '/workorder/selectWorkorderInfoByProcessedPermision';
    this.listProcessedWorkOrderById=function(params){
        var task = $q.defer();
        $resource(api_listProcessedWorkOrderById_list).save(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    //根据linkId查询工单查看的工单详情
    var api_listAllWorkOrderById_list = API_SERVICE_URL + '/workorder/selectWorkorderInfoByAllPermision';
    this.listAllWorkOrderById=function(params){
        var task = $q.defer();
        $resource(api_listAllWorkOrderById_list).save(params, function (response) {
            task.resolve(response.toJSON());
        });
        return task.promise;
    };
    //获取工单实例的各环节处理结果
    var api_listWorkOrderProcessResultById_list = API_SERVICE_URL + '/workorder/selectInstanceLinkLog';
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
        var parameters = params==undefined ? {} : params;
        parameters.id = $rootScope.userInfo.userId;
        res_creatTypeCode_list.post(parameters, function (response) {
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
    this.removeWorkOrderById = function(params) {
        var api_deleteWorkOrderById_list = API_SERVICE_URL + '/instanceService/removeWorkorderInstance';
        var task = $q.defer();
        params.loginUserId = $rootScope.userInfo.userId;
        $resource(api_deleteWorkOrderById_list).save(params, function(response){
            task.resolve(response.toJSON());
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };

    //获取流程列表
    this.listWorkFlows = function(params){
        var api_workflow_list = API_SERVICE_URL + '/workflow/listProcessDefinition';
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
        var api_link_workOrderAndFlow = API_SERVICE_URL + '/instanceService/getProcessPicture';
        var task = $q.defer();
        $resource(api_link_workOrderAndFlow).save({"id": workorderInstanceId}, function(response){
            task.resolve(response.toJSON());
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };
    //下载附件
    this.downloadFile = function(params) {
        var api_downloadFile = API_SERVICE_URL + '/instanceLink/downloadAttachment?'+params;
        var res_downloadFile = $resource(api_downloadFile,{},{post:{
            method : 'POST',
            headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
        }});
        var task = $q.defer();
        res_downloadFile.post({}, function(response){
            task.resolve(response.toJSON());
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };
    //获取所有部门
    this.getAllDepartment = function(){
        var api_department_list = API_SERVICE_URL + '/office/getAllDepartment';
        var task = $q.defer();
        $resource(api_department_list).save({}, function(response){
            task.resolve(response.toJSON());
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };
}

/**
 * 工单属性service
 */
app.service('workOrderAttr.RES', ServiceWorkOrderAttrRES);
ServiceWorkOrderAttrRES.$inject = ['$q', '$resource', 'fakeMapping','i18nService', '$rootScope'];
function ServiceWorkOrderAttrRES($q, $resource, fakeMapping,i18nService,$rootScope) {
    i18nService.setCurrentLang("zh-cn");
    this.baseEnum = function() {
        return {
            propertyType : [ 'text', 'textarea', 'datetime', 'select']
        };
    };

    var api_workOrder = API_SERVICE_URL + '/workorderProperty/';

    this.CMD = {
        ListAttrs           : api_workOrder + 'selectWorkorderPropertiesByCondition',
        CreateOrUpdateAttr  : api_workOrder + 'saveWorkorderProperty',
        DeleteAttr          : api_workOrder + 'removeWorkorderProperty',
        GetAttr             : api_workOrder + 'selectWorkorderPropertiesByCondition',
        LinkedFlows : 'listLinkedFlow',
        IsNameUnique: 'isNameUnique'
    };

    fakeMapping.scheme(api_workOrder, {
        '@cmd:listWorkOrderAttrs'   : 'modules/workOrder/json/attr.list.json',
        '@cmd:createWorkOrderAttr'  : 'modules/workOrder/json/attr.save.json',
        '@cmd:getWorkOrderAttr'     : 'modules/workOrder/json/attr.info.json',
        '@cmd:listLinkedFlow'       : 'modules/workOrder/json/attr.linkedFlow.list.json',
        '@cmd:isNameUnique'         : 'modules/workOrder/json/isNameUnique'
    });

    this.list = function (parameters) {
        var task = $q.defer();
        var cmd = this.CMD.ListAttrs;
        var params = parameters == undefined ? {} : parameters;
        $resource(cmd).save(params, function (response) {
            task.resolve(response.toJSON().data);
        }, function(response){
            task.reject("调用失败,未获取属性列表信息!");
        });
        return task.promise;
    };

    this.create = function(params){
        var task = $q.defer();
        var cmd = this.CMD.CreateOrUpdateAttr;
        params.loginUserId = $rootScope.userInfo.userId;
        $resource(cmd).save(params,function(response){
            task.resolve(response.toJSON());
        }, function(response){
            task.reject("调用失败,属性信息更新失败!");
        });
        return task.promise;
    };

    this.removeById = function(id){
        var task = $q.defer();
        var cmd = this.CMD.DeleteAttr;
        var params = {
            "loginUserId" : $rootScope.userInfo.userId,
            "id" : id
        };
        $resource(cmd).save(params,function(response){
            task.resolve(response.toJSON());
        }, function(response){
            task.reject("调用失败,属性信息删除失败!");
        });
        return task.promise;
    };

    this.listLinkedFlow = function(key) {
        var task = $q.defer();
        var cmd = this.CMD.LinkedFlows;
        var params = key == undefined ? {} : {key: key};
        $resource(cmd).save(params, function (response) {
            task.resolve(response.toJSON().data);
        });
        return task.promise;
    };
}

/**
 * 工单类型service
 */
app.service('workOrderType.RES', ServiceWorkOrderTypeRES);
ServiceWorkOrderTypeRES.$inject = ['$q', '$resource', '$rootScope'];
function ServiceWorkOrderTypeRES($q, $resource, $rootScope) {

    //获取流程列表
    this.listWorkFlows = function(params){
        var cmd = API_SERVICE_URL + '/workflow/listProcessDefinition';
        var task = $q.defer();
        var parameters = params==undefined ? {} : params;
        $resource(cmd).save(parameters, function(response){
            task.resolve(response.data);
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };

    //绑定工单类型流程
    this.bind = function(params){
        var cmd = API_SERVICE_URL + '/workorderTypeProcess/insertOrUpdateWorkorderTypeAndProcess';
        var task = $q.defer();
        var parameters = params==undefined ? {} : params;
        params.loginUserId = $rootScope.userInfo.userId;
        $resource(cmd).save(parameters, function(response){
            task.resolve(response);
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };

    //查询工单类型与流程定义绑定关系
    this.queryRelation = function(params){
        var cmd = API_SERVICE_URL + '/workorderTypeProcess/selectWorkorderTypeAndProcessByCondition';
        var task = $q.defer();
        var parameters = params==undefined ? {} : params;
        $resource(cmd).save(parameters, function(response){
            task.resolve(response.data);
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };

    //解绑工单类型流程
    this.unbind = function(params){
        var cmd = API_SERVICE_URL + '/workorderTypeProcess/unbindWorkorderTypeProcess';
        var task = $q.defer();
        var parameters = params==undefined ? {} : params;
        params.loginUserId = $rootScope.userInfo.userId;
        $resource(cmd).save(parameters, function(response){
            task.resolve(response);
        }, function(response){
            task.reject(response);
        });
        return task.promise;
    };

    //获取全部用户组信息
    this.getGroups = function() {
        var task = $q.defer();
        var cmd=API_SERVICE_URL + '/actIdGroup/getAll';
        $resource(cmd).save({}, function(response){
            task.resolve(response);
        }, function(response){
            task.reject("调用失败,用户组信息查询失败!");
        });
        return task.promise;
    };

    //根据工单类型id获取用户组信息
    this.getGroupsByWorkOrderTypeId = function(params) {
        var task = $q.defer();
        var cmd=API_SERVICE_URL + '/WorkorderTypeRole/selectByTypeId';
        var parameters = params==undefined ? {} : params;
        $resource(cmd).save(params, function(response){
            task.resolve(response);
        }, function(response){
            task.reject("调用失败,用户组信息查询失败!");
        });
        return task.promise;
    };

    //工单类型绑定用户组信息
    this.bindWithGroups = function(params) {
        var task = $q.defer();
        var cmd=API_SERVICE_URL + '/WorkorderTypeRole/bindRoleByTypeId';
        var parameters = params==undefined ? {} : params;
        $resource(cmd).save(params, function(response){
            task.resolve(response);
        }, function(response){
            task.reject("调用失败,绑定用户组信息失败!");
        });
        return task.promise;
    };

    this.save = function(params){
        var task = $q.defer();
        var cmd = API_SERVICE_URL + '/workorderType/saveWorkorderType';
        params.loginUserId = $rootScope.userInfo.userId;
        $resource(cmd).save(params,function(response){
            task.resolve(response);
        }, function(response){
            task.reject("调用失败,属性信息更新失败!");
        });
        return task.promise;
    };

    this.removeById = function(id){
        var task = $q.defer();
        var cmd = API_SERVICE_URL + '/workorderType/removeWorkorderType';
        var params = {};
        params.loginUserId = $rootScope.userInfo.userId;
        params.id = id;
        $resource(cmd).save(params,function(response){
            task.resolve(response);
        }, function(response){
            task.reject("调用失败,属性信息删除失败!");
        });
        return task.promise;
    };

    this.list = function() {
        var task = $q.defer();
        var cmd = API_SERVICE_URL + '/workorderType/listWorkorderTypes';
        $resource(cmd).save({}, function (response) {
            task.resolve(response.data);
        });
        return task.promise;
    };

    this.listByCondition = function(params) {
        var task = $q.defer();
        var cmd = API_SERVICE_URL + '/workorderType/selectWorkorderTypesByCondition';
        var parameters = params == undefined ? {} : params;
        $resource(cmd).save(parameters, function (response) {
            task.resolve(response.data);
        });
        return task.promise;
    };
}
/**
 * 查询信息保存 service
 */
app.service('storeService',['$window',function($window){
    return {        //存储单个属性
        set: function (key, value) {
            $window.localStorage[key] = value;
        },        //读取单个属性
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },        //存储对象，以JSON格式存储
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },        //读取对象
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        delObject:function(){
            for(var key in $window.localStorage){
                delete $window.localStorage[key];
            }
            return;
        }
    }
}]);

/**
 * attr status filter
 * @returns {Function}
 * @constructor
 */
app.filter('propertyTypeFilter',PropertyTypeFilter);
function PropertyTypeFilter (){
    return function(input){
        if(input == "select") {
            return "Select";
        } else if(input == "text") {
            return "Text";
        } else if(input == "datetime") {
            return "Datetime";
        } else if(input == "textarea") {
            return "Textarea";
        }
    };
}

app.filter('status', Status);
function Status (){
    return function(input){
        if ( input == "open") {
            return  "启用";
        } else if(input == "closed") {
            return "已挂起";
        }
    };
};
app.filter('dit', dit);
function dit (){
    return function(input){
        if ( input == 1) {
            return  true;
        } else if(input == 0) {
            return false;
        }
    };
};
app.filter('priorityStatus', priorityStatus);
function priorityStatus (){
    return function(input){
        if ( input == 0) {
            return  "低";
        } else if(input == 1) {
            return "中";
        }
        else if(input == 2) {
            return "高";
        }
    };
};
app.filter('productTypeStatus', productTypeStatus);
function productTypeStatus (){
    return function(input){
        if ( input == 1001) {
            return  "云主机";
        } else if(input == 1002) {
            return "云存储";
        }
        else {
            return "其他";
        }
    };
};
app.filter('performerStatus', performerStatus);
function performerStatus (){
    return function(input){
        if ( input == 1) {
            return  "受理中";
        } else if(input == 2) {
            return "已受理";
        } else {
            return "未受理";
        }
    };
};
app.filter('workorderStatus', workorderStatus);
function workorderStatus (){
    return function(input){
        if ( input == 0) {
            return  "已保存";
        } else if(input == 1) {
            return "已提交";
        }
        else {
            return "处理完成";
        }
    };
};