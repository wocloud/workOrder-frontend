Dcp.JqueryUtil.dalinReq = function(url, paramObj, sucsCb) {
	$.ajax({
		url : Dcp.getContextPath() +url,
	    data : paramObj,
	    type : "POST",
	    dataType:'json',
	    async : false,
	    success : function(rs) {
	    	sucsCb(rs);
	    },
	    error : function(error) {
	    	if (error && error.status && error.status == 403) {	// session 过期
	    		window.alert(Dict.val('key_js_reLogin_sesion_expired', '对不起，您的会话已过期，请重新登录'));
	    		window.parent.location = CONTEXT_PATH + "/jsp/login.jsp";
	    	} else {
	    		alert(Dict.valParam("key_js_login_alert", "对不起, 您的请求[" + url + "]失败, 请尽快联系管理员处理", [{"name" : "0", "value" : url}]));
	    	}
		}
	 });
};
Dcp.JqueryUtil.dalinAsyncReq = function(url, paramObj, sucsCb,errorCb) {
	$.ajax({
		url : Dcp.getContextPath() +url,
	    data : paramObj,
	    type : "POST",
	    dataType:'json',
	    async : true,
	    success : function(rs) {
	    	sucsCb(rs);
	    },
	    error : errorCb || function(error) {
	    	if (error && error.status && error.status == 403) {	// session 过期
	    		window.alert(Dict.val('key_js_reLogin_sesion_expired', '对不起，您的会话已过期，请重新登录'));
	    		window.parent.location = CONTEXT_PATH + "/jsp/login.jsp";
	    	} else {
	    		if(window.console) 
	    			console.error( Dict.valParam("key_js_login_alert", "对不起, 您的请求[" + url + "]失败, 请尽快联系管理员处理", [{"name" : "0", "value" : url}]) );
	    	}
		}
	 });
};
Dcp.JqueryUtil.dalinReqByGet = function(url, sucsCb) {
	$.ajax({
		type     : "GET",
		url      : Dcp.getContextPath() + url,
		datatype : "json", //设置获取的数据类型为json
		timeout  : 5000,
		async    : false,
		global   : false,
		success  : function(data) {
			sucsCb(data);
		},
		error    : function() {
			//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
			alert( Dict.valParam("key_js_login_alert", "对不起, 您的请求[" + url + "]失败, 请尽快联系管理员处理", [{"name" : "0", "value" : url}]) );
		}
	});
};


Dcp.JqueryUtil.setCombo = function(url, selectId, sucsCb) {
	Dcp.JqueryUtil.dalinReqByGet(url, function(data) {
		if (Dcp.util.isBlank(data)) {
			//alert(selectId + '下拉框取值为空');
			Dict.valParam("key_drop_down_empty", selectId + " 下拉框取值为空", [{"name" : "0", "value" : selectId}]);
		} else {
			
		}
	});
};
