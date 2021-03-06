var mic = {
	volumeState: [],
	userAccountListData : [],
	datatable : new com.skyform.component.DataTable(),
	init : function() {
		mic.volumeState = {
					"pending"     :  Dict.val('key_js_unchecked','待审核'),
					"reject"      :  Dict.val('key_js_audit_refused','审核拒绝'),
					"opening"     :  Dict.val('key_js_opening','正在开通'),
					"starting"    :  Dict.val('key_js_starting','正在启动'),
					"restarting"  :  Dict.val('key_js_restarting','正在重启'),				
					"stopping"    :  Dict.val('key_js_shuting_down','正在关机'),
					"changing"    :  Dict.val('key_js_changing','正在变更'),
					"deleting"    :  Dict.val('key_js_destorying','正在销毁'),
					"deleted"     :  Dict.val('key_js_destoryed','已销毁'),
					"running"     :  Dict.val('key_js_unmount','未挂载'),// 就绪
					"using"       :  Dict.val('key_js_mounted','已挂载'),
					"attaching"   :  Dict.val('key_js_mounting','正在挂载'),
					"unattaching" :  Dict.val('key_js_unmounting','正在卸载')
		};			
		mic.describemic();
		mic.datatable.addToobarButton("#toolbar4tb2");
		mic.getOwnUserList();
		//更多操作中的下拉菜单添加监听事件。
		$(".dropdown-menu").bind('mouseover',function(){
			inMenu = true;
		});		
		$(".dropdown-menu").bind('mouseout',function(){
			inMenu = false;
		});
		$(".dropdown-menu li").bind('click',function(e){
			handleLi($(this).index());					
		});	
		//选择cpu，内存，磁盘
		$(".options .types-options.cpu-options").click(function() {
			$(".options .types-options.cpu-options ").removeClass("selected");
			$(this).addClass("selected");
		});	
		$(".options .types-options.memory-options").click(function() {
			$(".options .types-options.memory-options ").removeClass("selected");
			$(this).addClass("selected");
		});
		$(".options .types-options.disk-options").click(function() {
			$(".options .types-options.disk-options ").removeClass("selected");
			$(this).addClass("selected");
			
		});			
		//修改mic
		$("#modify_save").bind('click',function(e){
			var ids = $("#micTable tbody input[type='checkbox']:checked");
			var instanceName = $("#modifymicModal  input[name='instance_name']").val();
			var comment = $("#modifymicModal textarea").val();
			mic.modifymic($(ids[0]).val(),instanceName,comment);		
		});
		//mic扩容
		$("#mod_storageSize_save").bind('click',function(e){
			var ids = $("#micTable tbody input[type='checkbox']:checked");
			var storageSize = $("#amount1").val();
			mic.modifymicStorageSize($(ids[0]).val(),storageSize);
		});
		//挂载
		$("#attach_save").bind('click',function(e){
			var ids = $("#micTable tbody input[type='checkbox']:checked");
			mic.attachmic($(ids[0]).val(),mic.getCheckedHostIds());
		});
		//新建小型机
		$("#createMinicom").click(function() {
			var wizard = new com.skyform.component.Wizard($("#wizard-demo"));		
			wizard.onLeaveStep = function(from, to){};
			wizard.onToStep = function(from, to) {};
			wizard.onFinish = function(from,to) {				
				mic.createmic();
				wizard.close();
			};
			wizard.render();
		});		
		$("#ownUserList").typeahead({
			source : function(query, process) {
				process(mic.userAccountListData);
			},
			matcher : function(item) {
				if ($.trim(this.query) + "" == "")
					return true;
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
		
	},
	getOwnUserList : function() {
		Dcp.biz.apiRequest("/user/describeUsers", null, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_userSearch_failed','查询用户发生错误')+"：" + data.msg); 
			} else {
				userListData = data.data;
				$(userListData).each(function(index, item) {
					mic.userAccountListData.push(item.account);
				});
			}
		});
	},	
	setOwnUser: function(){
		$("#micUser").val($("#ownUserList option:selected").text());
	},
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
	// 创建小型机
	createmic : function() {
		var cpuNumber = $(".cpu-options.selected").attr("data-value");
		var memoryNumber = $(".memory-options.selected").attr("data-value");
		var diskNumber = $(".disk-options.selected").attr("data-value");			 			
		var instanceName = $("#micName").val();
		var userName = $("#ownUserList").val();		
		var ownUserId = mic.getOwnUserIdByAccount(userName);
		var ipAddress = $("#ipaddress1").val() + "." + $("#ipaddress2").val() + "." + $("#ipaddress3").val() + "." + $("#ipaddress4").val();		
		var micType = $("#micTab .active a").html();
		// TODO 加入输入合法性校验
		var params = {
				"cpuNumber"    : cpuNumber,
				"memoryNumber" : memoryNumber,
				"storageSize"  : diskNumber,
				"instanceName" : instanceName,
				"userName"     : userName,	
				"createUserId" : ownUserId,	
				"ownUserId"    : ownUserId,		
				"ipAddress"    : ipAddress,	
				"micType"      : micType,	
				"count"        : "1"
		};
		Dcp.biz.apiRequest("/instance/MiniComputer/createMiniComputer", params, function(data) {
			if (data.code == "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_createMic_success','创建小型机成功')+"！"); 
				$("#createMinicom").modal("hide");
				mic.updateDataTable();
			} else {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_createMic_failed','创建小型机失败')+"：" + data.msg); 
			}
		});
	},
	describemic : function(){
		Dcp.biz.apiRequest("/instance/MiniComputer/describeMiniComputer", null, function(data) {			                
			if (data.code != "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_searchMic_error','查询小型机发生错误')+"：" + data.msg); 
			} else {				
				 mic.datatable.renderByData("#micTable", {
					"data" : data.data,
					"columnDefs" : [
					     {title : "<input type='checkbox' id='checkAll'>", name : "instanceId"},
					     {title : "ID", name : "instanceId"},
					     {title : Dict.val('key_js_service_name','服务名称'), name : "instanceName"},
					     {title : Dict.val('key_instance_state','状态'), name : "state"},
					     {title : Dict.val('key_js_config_info','配置信息'), name : "storageSize"},
					     {title : Dict.val('key_instance_create_data','创建时间'), name : "createTime"},
					     {title : Dict.val('key_js_user','用户'), name : "userName"}
					],
					"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnIndex ==0) {
							 text = '<input type="checkbox" value="'+text+'">';
						 }
						 if (columnMetaData.title == "ID") {
							 text = "<a href='micDetails.jsp?id="+text+"'>" + text + "</a>";
						 }
						 if (columnMetaData.name == "state") {
							 text = mic.volumeState[text];
						 }
						 if (columnMetaData.name == "createTime") {
							 text = new Date(text).toLocaleString();
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex,data,tr){
						tr.attr("state", data.state);
					},
					"afterTableRender" : function() {
					}
					}
				);
			}
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
	// 修改弹性块存储名称和描述  createUserId??????
	modifymic : function(id,name,comment) {		
				var params = {
						"id" : id,
						"instanceName": name,
						"comment" : comment,
						"modOrLarge" : 1
				};
				Dcp.biz.apiRequest("/instance/mic/modifymicVolumeAttributes", params, function(data){
					if(data.code == "0"){
						$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_modifyEbs_success','修改弹性块存储信息成功')+"！"); 
						$("#modifymicModal").modal("hide");
						mic.updateDataTable();
					} else {
						$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_modifyEbs_failed','修改弹性块存储信息发生错误')+":" + data.msg); 
					}
				});
	},
	//弹性块存储扩容
	modifymicStorageSize : function(id,storageSize) {
		//只有当选中一个弹性块存储时修改名称和备注，其他情况友情提示
		var params = {
				"id" : id,
				"storageSize": storageSize,
				"modOrLarge" : 2
		};
		Dcp.biz.apiRequest("/instance/mic/modifymicVolumeAttributes", params, function(data){
			if(data.code == "0"){
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_capacityAdd_success','弹性块存储扩容成功')+"！"); 
					$("#modifymicStorageSizeModal").modal("hide");
						mic.updateDataTable();
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
			Dcp.biz.apiRequest("/instance/mic/describeInstanceInfos", params, function(data) {
				if (data.code != "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_buyState_error','查询用户已经购买的运行状态的资源发生错误')+"：" + data.msg); 
				} else {
					var tbl_host = new com.skyform.component.DataTable().renderByData("#hostsTable", {
						"data" : data.data,
						"columnDefs" : [
						     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
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
						}
					);
				}
			});
	},
	//挂载弹性块存储
	attachmic : function(id,hostIds) {		
		var params = {
				"id" : id,
				"hostIds": hostIds,
				"createUserId" : 6
		};
		Dcp.biz.apiRequest("/instance/mic/attachmicVolumes", params, function(data){
			if(data.code == "0"){
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mountEbs_success','挂载弹性块存储成功')+"！"); 
				$("#attachModal").modal("hide");
				mic.updateDataTable();
			} else {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mountEbs_failed','挂载弹性块存储发生错误')+"：" + data.msg); 
			}
		});
	},
	// 刷新Table
	updateDataTable : function() {
		Dcp.biz.apiRequest("/instance/MiniComputer/describeMiniComputer", null, function(data) {
			if (data.code == 0) {
				mic.datatable.updateData(data.data);
			}
		});
	},
	getCheckedArr : function() {
		return $("#micTable tbody input[type='checkbox']:checked");
	}
	};
	function calc() {
		//随着slider的变化 价格部分作出相应的变化
			var count = parseInt($("#amount01").val()),capacity=parseInt($("#amount").val());	
			$("#span1").html(capacity/100);
			$("#span2").html(count);
			$("#span3").html((count*capacity/100).toFixed(1));
			$("#span4").html((count*capacity*7.2).toFixed(1));		
		};
		function calcChange(){
			var count1 = parseInt($("#amount01").val()),capacity1=parseInt($("#amount1").val());
			$("#span5").html(capacity1/100);
			$("#span6").html(count1);
			$("#span7").html((count1*capacity1/100).toFixed(1));
			$("#span8").html((count1*capacity1*7.2).toFixed(1));	
		};		
		var inMenu;
		$(function(){
				$("#contextMenu").bind('mouseover',function(){
					inMenu = true;
				});
				$("#contextMenu").bind('mouseout',function(){
					inMenu = false;
				});
				$("#contextMenu li").bind('click',function(e){
					$("#contextMenu").hide();
					handleLi($(this).index());					
				});
				$("body").bind('mousedown',function(){
					if(!inMenu){
						$("#contextMenu").hide();
					}
				});
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
	             + top+ "px; left:" + (e.pageX-180)+ "px; width: 180px;");  
	             $("#contextMenu").show();  
	             e.stopPropagation();
			     } 
		});  
		$("#selectAllmic").click(function(event){
			var checked = $(this).attr("checked")||false;                                                                                                                                    
			$("#tmic input[type='checkbox']").attr("checked",checked);
		}); 
		$("#selectAll").click(function(event){
			var checked = $(this).attr("checked")||false;
			$("#tall input[type='checkbox']").attr("checked",checked);
		});
			
	});
	   	 function handleLi(index){	   		 	   		 	   		 
			if(index==0){}
			else if(index==1){}
			else if(index==2){ openMiniComputer();	}
			else if(index==3){ closeMiniComputer(); }	
			else if(index==4){ reopenMiniComputer(); }
		} 
		function reopenMiniComputer() {
			var checkedArr =  mic.getCheckedArr();
			var volumeIds = [];
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");					
				var id = $(checkedArr[index]).val();
				volumeIds.push(id);
			});
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val('key_mic_shut_down','小型机关机'),"<h4>"+Dict.val('key_js_restartMic_assure','您确认要重启所选小型机吗')+"?</h4>",{
			buttons : [
			{
				name : Dict.val('key_instance_sure','确定'),
				onClick : function(){								 
					var micIds = volumeIds.join(",");
					Dcp.biz.apiRequest("/instance/MiniComputer/restartMiniComputer/" + micIds, {}, function(data) {
						if (data.code == 0) {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mic_restart_success','小型机重启成功')+"！"); 
							confirmModal.hide();									
							mic.updateDataTable();
						} else {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mic_restart_failed','小型机重启失败')+"：" + data.msg); 
						}
					});												
				},
					attrs : [{
							name : 'class',
							value : 'btn btn-primary'
						}]
				},{
					name : Dict.val('key_instance_cancle','取消'),
					attrs : [{
							name : 'class',
							value : 'btn'
						}],
					onClick : function(){
						confirmModal.hide();
					}
				}
			]
		});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	}		   	 
		function openMiniComputer() {
			var checkedArr =  mic.getCheckedArr();
			var volumeIds = [];
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");					
				var id = $(checkedArr[index]).val();
				volumeIds.push(id);
			});
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val('key_mic_shut_down','小型机关机'),"<h4>"+Dict.val('key_js_mic_start_assure','您确认要启动所选小型机吗')+"?</h4>",{
			buttons : [
				{
					name : Dict.val('key_instance_sure','确定'),
					onClick : function(){								 
						var micIds = volumeIds.join(",");
						Dcp.biz.apiRequest("/instance/MiniComputer/startMiniComputer/" + micIds, {}, function(data) {
							if (data.code == 0) {
								$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mic_start_success','小型机启动成功')+"！"); 
								confirmModal.hide();									
								mic.updateDataTable();
							} else {
								$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mic_start_failed','小型机启动失败')+"：" + data.msg); 
							}
						});												
					},
					attrs : [{
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
	function closeMiniComputer() {
		var checkedArr =  mic.getCheckedArr();
		var volumeIds = [];
		$(checkedArr).each(function(index, item) {
			var tr = $(item).parents("tr");					
			var id = $(checkedArr[index]).val();
			volumeIds.push(id);
		});
						
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val('key_mic_shut_down','小型机关机'),"<h4>"+Dict.val('key_js_mic_close_assure','您确认要关闭所选小型机吗')+"?</h4>",{
			buttons : [
				{
				name : Dict.val('key_instance_sure','确定'),
				onClick : function(){								 
					var micIds = volumeIds.join(",");
					Dcp.biz.apiRequest("/instance/MiniComputer/stopMiniComputer/" + micIds, {}, function(data) {
						if (data.code == 0) {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mic_shutdown_success','小型机关机成功')+"！"); 
							confirmModal.hide();									
							mic.updateDataTable();
						} else {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mic_shutdown_failed','小型机关机失败')+"：" + data.msg); 
						}
					});												
				},
				attrs : [
					{
						name : 'class',
						value : 'btn btn-primary'
					}
				]
			},{
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
 	function validateApplyCount(input) {
		var result = {status : true};
		if($.trim(""+$(input).val()) == '') {
			result.msg = Dict.val('key_js_input_apply_quantity','请填写申请数量')+"！";
			result.status = false;
		}
		else if(Number($.trim(""+$(input).val()))<0||isNaN(Number($.trim(""+$(input).val())))){
			result.msg = Dict.val('key_js_input_quantity_right','请正确填写数量值')+"！";
			result.status = false;
		}
		return result;
	}
	function validateUser(input){
		var result = {status : true};
		if($.trim(""+$(input).val()) == '') {
			result.msg = Dict.val('key_js_input_user','请填写所属用户')+"！";
			result.status = false;
		}
		return result;			
	}			
	$(function() {
		mic.init();
		
	}); 	 
