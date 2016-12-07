
var ebs = {
	volumeState: [],
	datatable : new com.skyform.component.DataTable(),
	hostDatatable : null,
	userListData:[],
	createCountInput : null,
	userAccountListData:[],
	init : function() {
		ebs.volumeState = {
			"pending"     :  Dict.val('key_js_unchecked','待审核'),
			"reject"      :  Dict.val('key_js_audit_refused','审核拒绝'),
			"opening"     :  Dict.val('key_js_opening','正在开通'),
			"changing"    :  Dict.val('key_js_changing','正在变更'),
			"deleting"    :  Dict.val('key_js_destorying','正在销毁'),
			"deleted"     :  Dict.val('key_js_destoryed','已销毁'),
			"running"     :  Dict.val('key_js_unmount','未挂载'),// 就绪
			"using"       :  Dict.val('key_js_mounted','已挂载'),
			"attaching"   :  Dict.val('key_js_mounting','正在挂载'),
			"unattaching" :  Dict.val('key_js_unmounting','正在卸载')
	};			 
	ebs.describeEbs();
	var inMenu;
	$("#contextMenu").bind('mouseover',function(){
		inMenu = true;
	});
	$("#contextMenu").bind('mouseout',function(){
		inMenu = false;
	});
	$("#contextMenu li").bind('click',function(e){
		$("#contextMenu").hide();
		ebs.handleLi($(this).index());					
	});
	$("body").bind('mousedown',function(){
		if(!inMenu){
			$("#contextMenu").hide();
		}
	});
	$("#createEbsA").unbind("click").bind("click", function() {
		$("#user_name").typeahead({
			source : ebs.getOwnUserAccountArr(userListData)
		});
		$("#ownUserList").typeahead({
			source : function(query, process) {
				process(ebs.userAccountListData);
			},
			matcher : function(item) {
				if ($.trim(this.query) + "" == "")  return true;
				return item.indexOf(this.query) >= 0;
			},
			updater : function(item) {
				return item;
			},
			sorter : function(items) {
				return items;
			},
			highlighter : function(item) {
				return item;
			}
		});
		if (ebs.createCountInput == null) {
			var container = $("#createCount").empty();
			ebs.createCountInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				textStyle : "width:137px"
			});
			ebs.createCountInput.render();
		}
		ebs.createCountInput.reset();
		$("#createEbsModal form")[0].reset();
		$("#slider-range-min").slider("option", "value", 10);
		$("#amount").val(10);
		ebs.setOwnUser();
		$("#tipOwnUserId").text("");
		$("#tipCreateCount").text("");
		$("#amount").text("");
		$("#createEbsModal").modal("show");
	});
	$(".dropdown-menu").bind('mouseover',function(){
		inMenu = true;
	});
	$(".dropdown-menu").bind('mouseout',function(){
		inMenu = false;
	});
	$(".dropdown-menu li").bind('click',function(e){
		ebs.handleLi($(this).index());					
	});	
	//定义一个slider能够选择弹性块存储的大小
	$( "#slider-range-min" ).slider({
		range: "min",
		value: 10,
		min: 10,
		max: 500,
		step: 10,
		slide: function( event, ui ) {
			var sp = $("#amount01").val();
			$("#amount").val(ui.value);
			ebs.calc();
		}
	});
	$( "#amount" ).val($( "#slider-range-min" ).slider( "value" ) );
	var realValue;
	$("#amount").bind("keydown",function(e){
		if (e.which == 13) { // 获取Enter键值
			e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
			realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
			$( "#slider-range-min" ).slider( "option", "value", realValue);
			$("#amount").val(realValue);			
		}
	});
	$("#amount").bind("blur",function(e){
			e.preventDefault(); 
			realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
			$( "#slider-range-min" ).slider( "option", "value", realValue);
			$("#amount").val(realValue);			
	});
	$( "#slider-range-min1" ).slider({
		range: "min",
		value: 10,
		min: realValue,
		max: 500,
		step: 10,
		slide: function( event, ui ) {			
			$("#amount1").val(ui.value);
			var sp = $("#amount01").val();
			ebs.calcChange();
		}
	});
	$( "#amount1" ).val($( "#slider-range-min1" ).slider( "value" ) );
	$("#amount1").bind("keydown",function(e){
		if (e.which == 13) { 
			e.preventDefault();
			var realValue1 = parseInt(parseInt($("#amount1").val())/10) * 10 ;
			$( "#slider-range-min1" ).slider( "option", "value", realValue1);
			$("#amount1").val(realValue1);			
		}
	});
	$("#amount1").bind("blur",function(e){
			e.preventDefault(); 
			var realValue1 = parseInt(parseInt($("#amount1").val())/10) * 10 ;
			$( "#slider-range-min1" ).slider( "option", "value", realValue1);
			$("#amount1").val(realValue1);			
	});
	$("#btnCreateEbs").bind('click',function(e){
		ebs.createEbs();
	});	
	$("#modify_save").bind('click',function(e){
		var ids = $("#ebsTable tbody input[type='checkbox']:checked");
		var instanceName = $("#modifyEbsModal  input[name='instance_name']").val();
		var comment = $("#modifyEbsModal textarea").val();
		ebs.modifyEbs($(ids[0]).val(),instanceName,comment);		
	});
	$("#mod_storageSize_save").bind('click',function(e){
		var ids = $("#ebsTable tbody input[type='checkbox']:checked");
		var storageSize = $("#amount1").val();
		ebs.modifyEbsStorageSize($(ids[0]).val(),storageSize);
	});
	$("#attach_save").bind('click',function(e){
		var ids = $("#ebsTable tbody input[type='checkbox']:checked");
		ebs.attachEbs($(ids[0]).val(),ebs.getCheckedHostIds());
	});
	$("#moreAction").addClass("disabled");
	ebs.getOwnUserList();
	$("#user_name").blur(function() {
		var account = $("#user_name").val();
		ebs.changeUserByAccount(account);
	});
},
getCheckedHostIds : function(){		
	var checkedArr = $("#hostsTable tbody input[type='checkbox']:checked");
	var volumeIds = [];
	$(checkedArr).each(function(index, item) {
		var tr = $(item).parents("tr");
		var id = $("input[type='checkbox']", $("td", tr)[0]).val();
		volumeIds.push(id);
		if (index < checkedArr.length - 1) {
		}
	});
	var hostIds = volumeIds.join(",");
	return hostIds;
},
generateTable : function(data){
	 ebs.datatable.renderByData("#ebsTable", {
			"data" : data,
			"columnDefs" : [
			     {title :  "<input type='checkbox' id='checkAll'>", name : "id"},
			     {title :  "ID", name : "id"},
			     {title :  Dict.val('key_js_service_name','服务名称'), name : "instanceName"},
			     {title :  Dict.val('key_instance_state','状态'), name : "state"},
			     {title :  Dict.val('key_js_capacity','容量')+"(GB)", name : "storageSize"},
			     {title :  Dict.val('key_instance_create_data','创建时间'), name : "createDate"},
			     {title :  Dict.val('key_js_user','用户'), name : "ownUserAccount"}
			],
			"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
				 var text = columnData[''+columnMetaData.name] || "";
				 if(columnIndex ==0) {
					 text = '<input type="checkbox" value="'+text+'">';
				 }
				 /*if (columnMetaData.title == "ID") {
					 text = "<a href='../jsp/maintain/ebsDetails.jsp?id="+text+"'>" + text + "</a>";
				 }*/
				 if (columnMetaData.name == "state") {
					 text = ebs.volumeState[text];
				 }
				 if (columnMetaData.name == "createDate") {
					 text = new Date(text).toLocaleString();
				 }
				 return text;
			}, 
			"afterRowRender" : function(rowIndex,data,tr){
				tr.attr("state", data.state).attr("comment", data.comment);
				tr.attr("ownUserId", data.ownUserId);
			},
			"afterTableRender" : function() {
				ebs.bindEvent();
			}
			}
		);
	 ebs.datatable.addToobarButton("#toolbar4tb2");
},
describeEbs : function(){
	//将自己编写的显示主机的table渲染
	Dcp.biz.apiRequest("/instance/ebs/describeEbsVolumes", null, function(data) {
		if (data.code != "0") {
			$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_searchEbs_error','查询弹性块存储发生错误')+"：" + data.msg); 
		} else {	
			ebs.generateTable(data.data);
		}
	},function onError(){
		ebs.generateTable();
	});		
},
bindEvent : function() {
	$("tbody tr").mousedown(function(e) {  
	    if (3 == e.which) {  
	             document.oncontextmenu = function() {return false;};  
	             var screenHeight = $(document).height();
	             var top = e.pageY;
	             if(e.pageY>=screenHeight/2 ) {
	             	top = e.pageY-$("#contextMenu").height();
	             }
	             $("#contextMenu").hide();  
	             $("#contextMenu").attr("style","display: block; position: absolute; top:"  
	             + top  
	             + "px; left:"  
	             + (e.pageX-180)
	             + "px; width: 180px;");  
	             $("#contextMenu").show();  
	             e.stopPropagation();
	     }
	});  
	
	$("#ebsTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
		 ebs.showOrHideOpt();
	});
	
	$("#checkAll").unbind("click").bind("click", function(e) {
		var checked = $(this).attr("checked") || false;
        $("#ebsTable input[type='checkbox']").attr("checked",checked);	 
        ebs.showOrHideOpt();
        e.stopPropagation();
	});
},
showCreateEbs : function() {
	
},
createEbs : function() {
	var isSubmit = true;
	var instanceName = $.trim($("#createInsName").val());
	var count = 1;
	var storageSize = $.trim($("#amount").val());
	var account = $("#ownUserList").val();
	var ownUserId = ebs.getOwnUserIdByAccount(account);
	$("#ownUserId, #amount, #createInsName").jqBootstrapValidation();
	if ($("#ownUserId").jqBootstrapValidation("hasErrors")) {
		$("#tipOwnUserId").text(Dict.val('key_js_user_choose','所属用户必须选择')+"！");
		isSubmit = false;
	} else {
		$("#tipOwnUserId").text("");
	}
      var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
      if(! scoreReg.exec(instanceName)) {
    	  $("#tipCreateInsName").text(Dict.val('key_js_input_hint','请输入中文,字母,数字,下划线及连接符'));
          $("#createInsName").focus();
          isSubmit = false;
      }else{
    	  $("#tipCreateInsName").text("");
      }
	
	
    if ($("#amount").jqBootstrapValidation("hasErrors")) {
    	$("#tipCreateStorageSize").text(Dict.val('key_js_capacity_size','容量必须为大于等于10')+"！");
    	$("#amount").val(10);
    	$("#slider-range-min").slider("option", "value", 10);
    	isSubmit = false;
    } else {
    	$("#tipCreateStorageSize").text("");
    }
	var countValidateResult = ebs.createCountInput.validate();
	if (countValidateResult.code == 1) {
		$("#tipCreateCount").text(countValidateResult.msg);
		isSubmit = false;
	} else {
		$("#tipCreateCount").text("");
		count = ebs.createCountInput.getValue();
	}

	if (!isSubmit) {
		return;
	}
	// TODO 加入输入合法性校验
	var params = {
			"instanceName" : instanceName,
			"count" : count,
			"storageSize" : storageSize,
			"ownUserId" : ownUserId
	};
	Dcp.biz.apiRequest("/instance/ebs/createEbsVolumes", params, function(data) {
		if (data.code == "0") {
			$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_createEbs_success','创建弹性块存储成功')+"!"); 
			$("#createEbsModal").modal("hide");
			ebs.updateDataTable();
		} else {
			$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_createEbs_failed','创建弹性块存储失败')+"：" + data.msg); 
		}
	});
},
// 修改弹性块存储名称和描述  createUserId
modifyEbs : function(id,name,comment) {		
			var params = {
					"id" : id,
					"instanceName": name,
					"comment" : comment,
					"modOrLarge" : 1
			};
			Dcp.biz.apiRequest("/instance/ebs/modifyEbsVolumeAttributes", params, function(data){
				if(data.code == "0"){
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_modifyEbs_success','修改弹性块存储信息成功')+"！"); 
					$("#modifyEbsModal").modal("hide");
					ebs.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_modifyEbs_failed','修改弹性块存储信息发生错误')+"：" + data.msg); 
				}
			});
},
//弹性块存储扩容
modifyEbsStorageSize : function(id,storageSize) {
	//只有当选中一个弹性块存储时修改名称和备注，其他情况友情提示
			var params = {
					"id" : id,
					"storageSize": storageSize,
					"modOrLarge" : 2
			};
			Dcp.biz.apiRequest("/instance/ebs/modifyEbsVolumeAttributes", params, function(data){
				if(data.code == "0"){
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_capacityAdd_success','弹性块存储扩容成功')+"！"); 
					$("#modifyEbsStorageSizeModal").modal("hide");
					ebs.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_capacityAdd_failed','弹性块存储扩容发生错误')+"：" + data.msg); 
				}
			});
},
getInstancesToAttach : function(id,ownUserId){
		var types = [];
		types.push(1);
		types.push(3);
		types.push(10);
		var typesToAttach = types.join(",");
		var params = {
				"id" : id,				
				"ownUserId" : ownUserId,
				"typesToAttach" : typesToAttach,
				"states" : "running",
				"targetOrAttached" : 1
		};
		Dcp.biz.apiRequest("/instance/ebs/describeInstanceInfos", params, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_buyState_error','查询用户已经购买的运行状态的资源发生错误')+":" + data.msg); 
			} 
			else {
				if(null != ebs.hostDatatable){
					ebs.hostDatatable.updateData(data.data);
				} else {
					ebs.hostDatatable =  new com.skyform.component.DataTable();
					ebs.attachDataTable(data.data);
				}
			}
		});
},
attachDataTable : function(data){
	ebs.hostDatatable.renderByData("#hostsTable", {
		"data" : data,
		"columnDefs" : [
		     {title : "<input type='checkbox' id='checkAll_attach'>", name : "id"},
		     {title : "ID", name : "id"},
		     {title : Dict.val('key_instance_name','名称'), name : "instanceName"}
		],
		"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
			 var text = columnData[''+columnMetaData.name] || "";
			 if(columnIndex ==0) {
				 text = '<input type="checkbox" value="'+text+'">';
			 }
			 return text;
		}
	});		
},
//挂载弹性块存储
attachEbs : function(id,hostIds) {		
			var params = {
					"id" : id,
					"hostIds": hostIds,
					"createUserId" : 6
			};
			Dcp.biz.apiRequest("/instance/ebs/attachEbsVolumes", params, function(data){
				if(data.code == "0"){
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mountEbs_success','挂载弹性块存储成功')+"！"); 
					$("#attachModal").modal("hide");
					// refresh
					ebs.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mountEbs_failed','挂载弹性块存储发生错误')+"：" + data.msg); 
				}
			});
},
// 刷新Table
updateDataTable : function() {
	Dcp.biz.apiRequest("/instance/ebs/describeEbsVolumes", null, function(data) {
		if (data.code == 0) {
			ebs.datatable.updateData(data.data);
		}
	});
},
getCheckedArr : function() {
	return $("#ebsTable tbody input[type='checkbox']:checked");
},
// 根据选中的虚拟硬盘的选择状态判断是否将修改选项置为灰色
showOrHideOpt : function() {
	var checkboxArr = $("#ebsTable tbody input[type='checkbox']:checked");
	$("#moreAction").removeClass("disabled");
	if(checkboxArr.length == 1){
		$("#moreAction").parent().find("li.beforeModify").removeClass("disabled");
		$("#moreAction").parent().find("li.beforeExpand").removeClass("disabled");
		$("#moreAction").parent().find("li.attachHost").removeClass("disabled");
	} else {
		$("#moreAction").parent().find("li.beforeModify").addClass("disabled");
		$("#moreAction").parent().find("li.beforeExpand").addClass("disabled");
		$("#moreAction").parent().find("li.attachHost").addClass("disabled");
	}
},
//获取所属用户列表
getOwnUserList : function() {
	Dcp.biz.apiRequest("/user/describeUsers", null, function(data) {
		if (data.code != "0") {
			$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_userSearch_failed','查询用户发生错误')+":"+ data.msg); 
		} else {
			userListData = data.data;
			$(userListData).each(function(index, item) {
				ebs.userAccountListData.push(item.account);
			});
		}
	});
},
// 获取所属用户account所组成的数组
getOwnUserAccountArr : function(ownUserList) {
	var ownUserAccountArr = [];
	$(ownUserList).each(function(index, item) {
		ownUserAccountArr.push(item.account);
	});
	return ownUserAccountArr;
},
setOwnUser: function(){
	$("#user_name").val($("#ownUserList option:selected").text());
},
// 根据所选择的的用户account获取对应的用户id
getOwnUserIdByAccount : function(ownUserAccount) {
	var ownUserId = "";
	$(userListData).each(function(index, item) {
		if (item.account == ownUserAccount) {
			ownUserId = item.id;
			return;
		}
	});
	return ownUserId;
},
changeUserByAccount : function(ownUserAccount) {
	$(userListData).each(function(index, item) {
		if (item.account == ownUserAccount) {
			$("#ownUserList").val(item.id);
		}
	});
},
calc : function() {
		var buycount = ebs.createCountInput.getValue();
		var count = parseInt(buycount),capacity=parseInt($("#amount").val());	
		$("#span1").html(capacity/100);
		$("#span2").html(count);
		$("#span3").html((count*capacity/100).toFixed(1));
		$("#span4").html((count*capacity*7.2).toFixed(1));		
},
calcChange : function(){
	var count1 = parseInt($("#amount01").val()),capacity1=parseInt($("#amount1").val());
	$("#span5").html(capacity1/100);
	$("#span6").html(count1);
	$("#span7").html((count1*capacity1/100).toFixed(1));
	$("#span8").html((count1*capacity1*7.2).toFixed(1));	
},	
handleLi : function(index){
	if(index==0){
		//只有当选中一个弹性块存储时修改名称和备注，其他情况友情提示
		var ids = $("#ebsTable tbody input[type='checkbox']:checked");
		if(ids.length == 1){
			var oldInstanceName = ebs.getCheckedArr().parents("tr").find("td:eq(2)").html();
			var oldComment = ebs.getCheckedArr().parents("tr").attr("comment");
			$("#modInsName").val(oldInstanceName);
			$("#modComment").val(oldComment);
			$("#modifyEbsModal").modal("show");				
		} else {
			$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_modifyEbs_again','修改只能对一个弹性块存储进行操作，请重新进行选择')+"！"); 
		}						
	}
	else if(index==1){
		var ids = $("#ebsTable tbody input[type='checkbox']:checked");				
		if(ids.length == 1){
			var ownUserId = ebs.getCheckedArr().parents("tr").attr("ownUserId");
			//显示用户可以挂载的资源
			ebs.getInstancesToAttach($(ids[0]).val(),ownUserId);	
			$("#attachModal").modal("show");
		}else {
			$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mountEbs_again','挂载只能对一个弹性块存储进行操作，请重新进行选择')+"！"); 
		}			
	}
	else if(index==2){
		//只有当选中一个弹性块存储时修改名称和备注，其他情况友情提示
		var ids = $("#ebsTable tbody input[type='checkbox']:checked");
		if(ids.length == 1){
			var state = ebs.getCheckedArr().parents("tr").find("td:eq(3)").html();
			if(state == Dict.val('key_js_unmount','未挂载')){
				$("#modifyEbsStorageSizeModal").modal("show");
			}else{
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_capacityAdd_again','扩容只能对未挂载的弹性块存储进行操作，请重新进行选择')+"！"); 
			}					
		} else {
			$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_capacityAdd_oneEbs_again','扩容只能对一个弹性块存储进行操作，请重新进行选择')+"！"); 
		}				
	}
	else if(index==3){
		var checkedArr =  ebs.getCheckedArr();
		var volumeNames = "";
		var volumeIds = [];
		$(checkedArr).each(function(index, item) {
			var tr = $(item).parents("tr");					
			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
			if(ebs.isEbsAttached(id)){
				$.growlUI(Dict.val('key_instance_hint','提示'),Dict.valParam("key_js_ebsDelete_cannot","id为"+id+"的弹性块存储已经挂载或者正在挂载主机，不能删除,请重新进行选择！",[{"name":"0","value":id}])); 
				return;
			}
			volumeNames += $($("td", tr)[2]).text();
			volumeIds.push(id);
			if (index < checkedArr.length - 1) {
				volumeNames += ",";
			}
		});
		var ebsIds = volumeIds.join(",");
		ebs.destroyDisk(ebsIds);
	}			
}, 
isEbsAttached : function(id){
	var params = {
			"diskInstanceInfoId" : id,	
			"statesStr" : "1,2,3,5,6,7"
	};
	var result = false;
	Dcp.biz.apiRequest("/instance/ebs/describeHostsRelated", params, function(data) {
		if (data.code != "0") {
			$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_searchResource_error','查询用户已经购买的关联资源发生错误')+"：" + data.msg); 
		} else {
			var array = data.data;
			if(array == null || array.length == 0) {
				
			}else{
				result = true;						
			}
		}
	});
	return result;
},
destroyDisk : function(ebsIds) {			
	var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val('key_js_destoryEbs','销毁弹性块存储'),"<h4>"+Dict.val('key_js_deleteEbs_assure','您确认要销毁弹性块吗')+"?</h4>",{
		buttons : [
			{
				name : Dict.val('key_instance_sure','确定'),
				onClick : function(){
					// 删除弹性块存储
					var params = {
							"ids" : ebsIds
					};
					Dcp.biz.apiRequest("/instance/ebs/deleteEbsVolumes", params, function(data) {
						if (data.code == 0) {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_destoryEbs_success','销毁弹性块存储成功')+"！"); 
							confirmModal.hide();
							// refresh
							ebs.updateDataTable();
						} else {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_destoryEbs_failed','销毁弹性块存储失败')+"：" + data.msg); 
						}
					});												
				},
				attrs : [
					{
						name : 'class',
						value : 'btn btn-primary'
					}
				]
			},
			{
				name : Dict.val('key_instance_cancle','取消'),
				attrs : [
					{
						name : 'class',
						value : 'btn'
						}
					],
					onClick : function(){
						confirmModal.hide();
					}
				}
			]
		});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	}	
	};

$(function(){
	ebs.init();
});

