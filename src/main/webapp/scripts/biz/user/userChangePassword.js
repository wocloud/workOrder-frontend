//fix bug 3310
var currentUserId = 0;
$(function() {
	$.ajaxSetup({
		cache : false
	});//设置jQuery ajax缓存
	currentUserId = $("#currentUserId").val();
	$("#password").focus();
	$('#setPassword :input').blur(function(){
		if ($(this).is('#oPassword')) {
			if (valiter.isNull(this.value) || this.value.length < 8||$.trim(this.value).length>32) {
				var errorMsg = "*"+Dict.val('key_js_changepwd_num','8-32位密码');
				$("#oPwdMsg").addClass("onError").html(errorMsg);
			}
			else checkPassword(function(ret){				
				if(null==ret){
					$("#oPwdMsg").addClass("onError").html(errorMsg);
				}    	
		    	else {
		    		var errorMsg = "*"+Dict.val('key_js_changpwd_matchNot','与原密码不符');
		    		var list = ret.data;
		        	if(null== ret.data||ret.data.length == 0){
		        		$("#oPwdMsg").addClass("onError").html(errorMsg);
		    		}
		        	else {
		    			$("#oPwdMsg").removeClass("onError").empty();
		    		}
		    	}
			});
		}
		// 验证登入密码 
		if ($(this).is('#password')) {					
			if (valiter.isNull(this.value) || this.value.length < 8||$.trim(this.value).length>32) {
				var errorMsg = "*"+ Dict.val('key_js_changepwd_num','8-32位密码');
				$("#pwdMsg").addClass("onError").html(errorMsg);
			}else if ((!valiter.isNull($("#rePassword").val()))
					&& this.value != $("#rePassword").val()) {
				var errorMsg = "*"+ Dict.val('key_js_changpwd_sure_error','确认密码与登录密码不一致');
				$("#rePwdMsg").addClass("onError").html(errorMsg);
				$("#rePwdMsg").val("");
			}
			else {
				$("#pwdMsg").removeClass("onError").empty();
			}
		}
		// 验证确认密码
		if ($(this).is('#rePassword')) {					
			if (valiter.isNull(this.value) || this.value.length < 8||$.trim(this.value).length>32) {
				var errorMsg = "*"+Dict.val('key_js_changepwd_num','8-32位密码');
				$("#rePwdMsg").addClass("onError").html(errorMsg);
			} else if ((!valiter.isNull(this.value))
					&& this.value != $("#password").val()) {
				var errorMsg = "*"+ Dict.val('key_js_changpwd_sure_error','确认密码与登录密码不一致');
				$("#rePwdMsg").addClass("onError").html(errorMsg);
			}
			else {
				$("#rePwdMsg").removeClass("onError").empty();
			}
		}
	});	
	$("#pwdSave").click(function(){
		savePassword();
	});
	
	$(".pwdReset").click(function(){
		reset();
	})
});
function savePassword(){	
	$("#setPassword :input").trigger('blur');

	var numError = $("#setPassword .onError").length;
	if (numError) {
		return ;
	}
	var data = {id:currentUserId,password:$("#password").val()};	
	Dcp.biz.apiAsyncRequest("/user/modifyUser", data,
			function(data) {
    	state = data.code;
    	if(state == 0){
    		reset();
    		successModal.show();
		}
    	else if(state == 1){
    		failModal.show();
    	}
	}); 	
};
function reset() {	
    	$("#setPassword .password").each(function() {
    		$(this).val('');
    	});	
    	$(".icon-lock").removeClass("onError").empty();
    	$(".msg").removeClass("onError").empty();	
}
function checkPassword(callback){
	var data = {id:currentUserId,password:$("#oPassword").val()};	
	Dcp.biz.apiAsyncRequest("/user/describeUsersInfo", data,
			function(ret) {
			callback(ret);
	}); 	
}
successModal = new com.skyform.component.Modal("successModal","<h4>"+Dict.val('key_js_changpwd_info','信息')+"</h4>","<span class='text-success'><h3>"+Dict.val('key_js_changpwd_success','密码修改成功')+"！<h3></span>",{
	buttons : [
	           {name:Dict.val('key_instance_close','关闭'),onClick:function(){	        	   
	        	   successModal.hide();	    				        	   
	           },attrs:[{name:'class',value:'btn'}]}
	           ],
     afterHidden : function(){
   		if(successModal.afterHidden && typeof successModal.afterHidden == 'function') {
   			successModal.afterHidden();
   		}
   	}           
});
failModal = new com.skyform.component.Modal("failModal","<h4>"+Dict.val('key_js_changpwd_info','信息')+"</h4>","<span class='text-error'><h3>"+Dict.val('key_js_changpwd_failed','密码修改失败')+"！<h3></span>",{
	buttons : [
	           {name:Dict.val('key_instance_close','关闭'),onClick:function(){	        	   
	        	   failModal.hide();	    				        	   
	           },attrs:[{name:'class',value:'btn'}]}
	           ],
     afterHidden : function(){
   		if(failModal.afterHidden && typeof failModal.afterHidden == 'function') {
   			failModal.afterHidden();
   		}
   	}           
});
