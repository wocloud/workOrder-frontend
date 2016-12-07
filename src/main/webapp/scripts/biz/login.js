$(function(){
	$("#username").focus();
	$("#loginSubmit").click(function(){	
			Login.login();			
	});	
	//为回车键绑上登陆事件
	$("body").bind("keydown",function(e){
	   if(e.keyCode==13){
	    	Login.login();
	    }
	    else    return;
	});
	$('body :input').blur(
		function() {
			// 验证帐号
			if ($(this).is('#username')) {
				if($.trim(this.value).length < 1 ){
		    		$("#nameMsg").addClass("onError").html("*"+Dict.val('key_js_login_userNull', '用户名不能为空'));
		    	}				
			}
			// 验证密码
			if ($(this).is('#password')) {
				if($.trim(this.value).length < 1 ){
					$("#pwdMsg").addClass("onError").html("*"+Dict.val('key_js_login_pwdNull','密码不能为空'));
		    	}				
			}
			// 验证验证码
//			if($("#loginSubmit").attr("state")!=="0"){
//				if ($(this).is('#captcha')) {
//					if($.trim(this.value).length < 1 ){
//						$("#capMsg").addClass("onError").html("*"+Dict.val('key_js_login_imageNull','验证码不能为空'));
//			    	}				
//				}
//			}
			
		});
	$('body :input').focus(
			function() {
				// 验证帐号
				if ($(this).is('#username')) {
					if($.trim(this.value).length < 1 ){
			    		$("#nameMsg").removeClass("onError").html("");
			    	}				
				}
				// 验证密码
				if ($(this).is('#password')) {
					if($.trim(this.value).length < 1 ){
			    		$("#pwdMsg").removeClass("onError").html("");
			    		$("#logMsg").removeClass("onError");
			    	}				
				}
				// 验证验证码
//				if($("#loginSubmit").attr("state")!=="0"){
//					if ($(this).is('#captcha')) {
//						if($.trim(this.value).length < 1 ){
//				    		$("#capMsg").removeClass("onError").html("");
//				    	}		
//			        }
//				}
				
			});
});

var Login = {
	    login: function(){
//	    	window.location.href = "../index.jsp";
//	    	return;
	    	$("body :input").trigger('blur');
	        var loginName = $("#username").val();
	        var loginPass = $("#password").val();
	        var loginCap = $("#captcha").val();
	        if (loginName.length < 1) {
	            $("#username").val("");
	            $("#nameMsg").addClass("onError").html("*"+Dict.val('key_js_login_userNull','用户名不能为空'));
	        }
	        if (loginPass.length < 1) {
	        	$("#password").val("");
	        	$("#pwdMsg").addClass("onError").html("*"+ Dict.val('key_js_login_pwdNull','密码不能为空'));
	        }
//	        if (loginCap.length < 1) {
//	        	$("#captcha").val("");
//	        	$("#capMsg").addClass("onError").html("*"+Dict.val('key_js_login_imageNull','验证码不能为空'));
//	        	return;
//	        }
	        var back = false;
			back = Login.valite();
			if (!back) {
				return;
			}
	        var data = {
	        		username: loginName,
	        		password: loginPass,
	        		command: "login",
	        		response: "json",
	        		domain:"/"
            };
            //return;
	        $.ajax({
	    		url : "../pr/login",
	    	    data : data,
	    	    type : "POST",
	    	    dataType:'json',
	    	    async : false,
	    	    success : function(state) {
		        	if(state == 1){
		        		//登陆成功
		        		window.location.href = "../index.jsp";
		        		return;
//					}else if(state == -1){
//						//登陆失败
//						alert(Dict.val('key_js_login_admin','只允许管理员登陆'));
//						$("#password").val("");
//						$("#username").val("");
//						$("#username").focus();
//						window.location.href = "/skyform-admin/jsp/login.jsp";

					}   
		        	else if(state == 0){
						//登陆失败
						$("#logMsg").addClass("onError").html("*"+Dict.val('key_js_login_name_pwd','请输入正确的用户名和密码'));
						$("#password").val("");
						$("#password").focus();
					}   
		        	else if(state == 2){
						$("#password").val("");
						$("#password").focus();
						$("#logMsg").addClass("onError").html("*"+Dict.val('key_js_login_invalid','该用户尚未生效,请先去邮箱激活后再登陆'));
		        	}
	    	    },
	    	    error    : function() {
	    			$("#logMsg").addClass("onError").html("*"+Dict.valParam("key_js_login_alert", "Sorry,Your Request" + url + "Fail,Please Contact System Administrator", [{"name" : "0", "value" : url}]));
	    		}
	    	 });
	        
	    },
	    valite : function() {
           // return true;
	    	var numError = $('.onError').length;
			if (numError) {
				return false;
			}
			else {	
				var ret = true;
				return ret;
				$.ajax({
					url : "../pr/verifyCode",
					type : 'POST',
					data : {
						code : $("#captcha").val()
					},
					async : false,
					dataType : 'json',
					success : function(state) {
						var stateX = state+"";
						if (stateX == "false") {
							$("#capMsg").addClass("onError").html("*"+Dict.val('key_js_image_error','验证码输入错误'));
							changeImg();
							$("#captcha").val("");
							
						}
						// 验证码session超时
						else if (stateX == "timeout") {
							$("#capMsg").addClass("onError").html("*"+Dict.val('key_js_login_overtime','操作超时，请重新输入验证码')+"!");
							changeImg();
							$("#captcha").val("");
						}	
						else 
							ret =  true;
					}
				});
				return ret;
			}			
		}
};
