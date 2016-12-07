
var nas = {
		attachVolumnDataTable  : null,
		volumeState: [],
		confirmModal : null,
		ownUserAccountList : [],
		createCountInput : null,
		datatable : new com.skyform.component.DataTable(),
		init : function() {
			nas.volumeState = {
					"pending"        :   Dict.val('key_js_unchecked','待审核'),
					"reject"         :   Dict.val('key_js_audit_refused','审核拒绝'),
					"opening"        :   Dict.val('key_js_opening','正在开通'),
					"changing"       :   Dict.val('key_js_changing','正在变更'),
					"deleting"       :   Dict.val('key_js_destorying','正在销毁'),
					"deleted"        :   Dict.val('key_js_destoryed','已销毁'),
					"running"        :   Dict.val('key_js_unmount','未挂载'),
					"using"          :   Dict.val('key_js_mounted','已挂载'),
					"attaching"      :   Dict.val('key_js_mounting','正在挂载'),
					"unattaching"    :   Dict.val('key_js_unmounting','正在卸载'),
					"backuping"      :   Dict.val('key_js_backuping','正在备份'),
					"restoreing"     :   Dict.val('key_js_restoring_snapshot','正在恢复快照'),
					"snapshotDeling" :   Dict.val('key_js_deleting_snapshot','正在删除快照')
			};
			//更多操作...中的下拉菜单添加监听事件
			var inMenu = false;
			$(".dropdown-menu").bind('mouseover',function(){
				inMenu = true;
			});		
			$(".dropdown-menu").bind('mouseout',function(){
				inMenu = false;
			});
			$("#dropdown li").bind('click',function(e){
				$("#dropdown-menu").hide();
				if (!$(this).hasClass("disabled")) {
					nas.onOptionSelected($(this).index());
				}
			});	
			//定义一个slider能够选择硬盘的大小
			$( "#slider-range-min" ).slider({
				range: "min",
				value: 10,
				min: 10,
				max: 500,
				step: 10,
				slide: function( event, ui ) {
					var sp = $("#createCount").val();
					$("#createStorageSize").val(ui.value);
				}
			});
			$( "#createStorageSize" ).val($( "#slider-range-min" ).slider( "value" ) );
			var realValue;
			$("#createStorageSize").bind("keydown",function(e){
				if (e.which == 13) { // 获取Enter键值
					e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
					realValue = parseInt(parseInt($("#createStorageSize").val())/10) * 10 ;
					$( "#slider-range-min" ).slider( "option", "value", realValue);
					$("#createStorageSize").val(realValue);			
				}
			});
			$("#createStorageSize").bind("blur",function(e){
					e.preventDefault(); 
					realValue = parseInt(parseInt($("#createStorageSize").val())/10) * 10 ;
					$( "#slider-range-min" ).slider( "option", "value", realValue);
					$("#createStorageSize").val(realValue);			
			});
			//为table的右键菜单添加监听事件
			$("#contextMenu").bind('mouseover',function(){
				inMenu = true;
			});		
			$("#contextMenu").bind('mouseout',function(){
				inMenu = false;
			});
			$("#contextMenu li").bind('click',function(e){
				$("#contextMenu").hide();
				// 如果选项是灰色不可用的
				if (!$(this).hasClass("disabled")) {
					nas.onOptionSelected($(this).index());					
				}
			});
			$("body").bind('mousedown',function(){
				if(!inMenu){
					$("#contextMenu").hide();
				}
			});
			// 新建文件存储
			$("#btnCreateVdiskVolume").click(nas.createFsVolumes);
				// 查询文件存储列表
				nas.describeFsVolumes();
		},
		onOptionSelected : function(index) {
			if(index == 0){
				var oldInstanceName = nas.getCheckedArr().parents("tr").find("td:eq(2)").html();
				var oldComment = nas.getCheckedArr().parents("tr").attr("comment");
				$("#modifyVolumeName").val(oldInstanceName);
				$("#modifyVolumeComment").val(oldComment);
				$("#modifyDiskModal").modal("show");
			} else if(index == 1){
				nas.describeVM();
			} else if(index == 2){
				nas.showDeleteVdiskVolume();
			} else if (index == 3) {
				nas.showBackupVolumeModal();
			} else if (index == 4) {
				nas.showVolumeSnapshotModal();
			}		
		},
		showDeleteVdiskVolume : function() {
			var checkedArr =  nas.getCheckedArr();
			var volumeNames = "";
			var volumeIds = [];
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				volumeNames += $($("td", tr)[2]).text();
				var id = $("input[type='checkbox']", $("td", tr)[0]).val();
				volumeIds.push(id);
				if (index < checkedArr.length - 1) {
					volumeNames += ",";
				}
			});
		if(nas.confirmModal == null) {
			nas.confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val('key_js_destory_nas','销毁文件存储'),"<h4>"+Dict.val('key_js_destory_assure','您确认要销毁') +"&nbsp"+ volumeNames + "?</h4>",{
				buttons : [
					{
					name : Dict.val('key_instance_sure','确定'),
					onClick : function(){
					// 删除文件存储
					var vdiskVolumeIds = volumeIds.join(",");
					Dcp.biz.apiRequest("/instance/nas/deleteFsVolumes", {"ids" : vdiskVolumeIds}, function(data) {
						if (data.code == 0) {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_destory_nas_success','销毁文件存储成功')+"！"); 
							nas.confirmModal.hide();
							nas.updateDataTable();
						} else {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_destory_nas_failed','销毁文件存储失败')+":" + data.msg); 
						}
						});
					},
					attrs : [ {
							name : 'class',
							value : 'btn btn-primary'
						}]
					},
					{
						name : Dict.val('key_instance_cancle','取消'),
						attrs : [{
							name : 'class',
							value : 'btn'
						}],
						onClick : function(){
						nas.confirmModal.hide();
					}
				}
				]
			});
		}
		nas.confirmModal.setWidth(300).autoAlign();
		nas.confirmModal.show();
	},
		// 创建文件存储
	createFsVolumes : function() {
			var isSubmit = true;
			var instanceName = $.trim($("#createInstanceName").val());
			var count = 1;
			var storageSize = $.trim($("#createStorageSize").val());
			var ownUserAccount = $.trim($("#ownUserAccount").val());
			// 验证
			$("#createCount, #createStorageSize").jqBootstrapValidation();
			var ownUserValidateFlag = false;
			$(nas.ownUserAccountList).each(function(i, item) {
				if (ownUserAccount == item) {
					ownUserValidateFlag = true;
					return;
				}
			});
			if (!ownUserValidateFlag) {
				$("#tipOwnUserAccount").text(Dict.val('key_js_user_invalid','所属用户无效')+"！");
				isSubmit = false;
			} else {
				$("#tipOwnUserAccount").text("");
			}
			var countValidateResult = nas.createCountInput.validate();
			if (countValidateResult.code == 1) {
				$("#tipCreateCount").text(countValidateResult.msg);
				isSubmit = false;
			} else {
				$("#tipCreateCount").text("");
				count = nas.createCountInput.getValue();
			}
		    if ($("#createStorageSize").jqBootstrapValidation("hasErrors")) {
		    	$("#tipCreateStorageSize").text(Dict.val('key_js_capacity_size','容量必须为大于等于10')+"！");
		    	$("#createStorageSize").val(10);
		    	$("#slider-range-min").slider("option", "value", 10);
		    	isSubmit = false;
		    } else {
		    	$("#tipCreateStorageSize").text("");
		    }
			if (!isSubmit) {
				return;
			}
			var params = {
					"instanceName" : instanceName,
					"count" : count,
					"storageSize" : storageSize,
					"ownUserAccount" : ownUserAccount
			};
			Dcp.biz.apiRequest("/instance/nas/createFsVolumes", params, function(data) {
				if (data.code == "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_create_nas_success','创建文件存储成功')+"！"); 
					$("#createModal").modal("hide");
					nas.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_create_nas_failed','创建文件存储失败')+"：" + data.msg); 
				}
			});
		},
		// 查询文件存储列表
		describeFsVolumes : function() {
			Dcp.biz.apiRequest("/instance/nas/describeFsVolumes", null, function(data) {
				if (data.code != "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_search_vDisk_error','查询文件存储发生错误')+"：" + data.msg); 
				} else {
					nas.renderDataTable(data.data);
				}
			});
		},
		renderDataTable : function(data) {
			nas.datatable.renderByData("#volumeTable", {
					"data" : data,
					"iDisplayLength": 15,
					"columnDefs" : [
					     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
					     {title : "ID", name : "id"},
					     {title : Dict.val('key_js_service_name','服务名称'), name : "instanceName"},
					     {title : Dict.val('key_instance_state','状态'), name : "state"},
					     {title : Dict.val('key_js_application_host','应用主机'), name : "attachedHostName"},
					     {title : Dict.val('key_js_capacity','容量')+"(GB)", name : "storageSize"},
					     {title : Dict.val('key_instance_create_data','创建时间'), name : "createDate"},
					     {title : Dict.val('key_js_user','用户'), name : "ownUserAccount"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnIndex ==0) {
							 text = '<input type="checkbox" value="'+text+'">';
						 }
						 if (columnMetaData.title == "ID") {
							 text = "<a href='#'>" + text + "</a>";
						 }
						 if (columnMetaData.name == "state") {
							 if (columnData.optState == null || columnData.optState == "") {
								 text = nas.volumeState[text];
							 } else {
								 text = nas.volumeState[columnData.optState];
							 }
						 }
						 if (columnMetaData.name == "createDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("id", data.id);
						tr.attr("state", data.state);
						tr.attr("comment", data.comment);
						tr.attr("optState", data.optState);
						tr.attr("ownUserId", data.ownUserId);
					},
					"afterTableRender" : function() {
						$("#volumeTable input[type='checkbox']").attr("checked", false);
						$("#moreAction").addClass("disabled");
						nas.bindEvent();
					}
				}
			);
			nas.datatable.addToobarButton("#disktoolbar");
		},
		bindEvent : function() {
			$("tbody tr").mousedown(function(e) {  
			    if (3 == e.which) {  
			             document.oncontextmenu = function() {return false;};  
			             var screenHeight = $(document).height();
			             var top = e.pageY;
			             if(e.pageY >= screenHeight / 2) {
			             	top = e.pageY - $("#contextMenu").height();
			             }
			             $("#contextMenu").hide();  
			             $("#contextMenu").attr("style","display: block; position: absolute; top:"  
			             + top  
			             + "px; left:"  
			             + (e.pageX-180)
			             + "px; width: 180px;");  
			             $("#contextMenu").show();  
			             e.stopPropagation();
			             var state = $(this).attr("state");
			             var optState = $(this).attr("optState");
			             // 如果不是非就绪状态，则将删除选项和挂载到主机以及快照管理选项置为不可用灰色
			             if (state == "running" && (optState == undefined || optState == "")) {
			            	 $("#contextMenu").find("li.deleteVm").removeClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").removeClass("disabled");
			             	$("#contextMenu").find("li.volumeSnapshot").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.deleteVm").addClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").addClass("disabled");
			             	 $("#contextMenu").find("li.volumeSnapshot").addClass("disabled");
			             }
			             // 如果不是就绪和已挂载状态，则将备份置为不可用
			             if ((state == "running" || state == "using") && (optState == undefined || optState == "")) {
			            	 $("#contextMenu").find("li.backupVolume").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.backupVolume").addClass("disabled");
			             }
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			             nas.showOrHideModifyOpt();
						 nas.showOrHideAttachOpt();
						 nas.showOrHideDeleteOpt();
						 nas.showOrHideBackupAndRecoveryOpt();
			     } 
			}); 
			$("#checkAll").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#volumeTable input[type='checkbox']").attr("checked",checked);	 
		        nas.showOrHideModifyOpt();
		        nas.showOrHideAttachOpt();
		        nas.showOrHideDeleteOpt();
		        nas.showOrHideBackupAndRecoveryOpt();
		        e.stopPropagation();
			});
			$("#volumeTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				 nas.showOrHideModifyOpt();
				 nas.showOrHideAttachOpt();
				 nas.showOrHideDeleteOpt();
				 nas.showOrHideBackupAndRecoveryOpt();
			});
			$("#btnRefresh").unbind("click").bind("click", function() {
				nas.updateDataTable();
			});
			// 挂载文件存储
			$("#attach_save").unbind("click").bind("click", function() {
				nas.attachVdiskVolume();
			});
			// 修改文件存储名称和描述
			$("#modify_save").unbind("click").bind("click", function() {
				nas.modifyVdiskVolume();
			});
			$("#createVdiskVolume").unbind("click").bind("click", function() {
				nas.ownUserAccountList = nas.getOwnUserAccountList();
				var typeahead = $("#ownUserAccount").typeahead({
	    			source : function(query,process){
	    				process(nas.ownUserAccountList);
	    			},
	    			matcher : function(item) {
	    				if($.trim(this.query)+"" == "") return true;
	    				return item.indexOf(this.query) >= 0;
	    			},
	    			updater : function(item) {
	    				return item;
	    			},
	    			sorter : function(items){
	    				return items;
	    			},
	    			highlighter : function(item){
	    				return item;
	    			}
	    		});
				// 带+-的输入框
				if (nas.createCountInput == null) {
					var container = $("#createCount").empty();
					nas.createCountInput = new com.skyform.component.RangeInputField(container, {
						min : 1,
						defaultValue : 1,
						textStyle : "width:137px"
					});
					nas.createCountInput.render();
					nas.createCountInput.showErrorMsg = function(msg) {};
					nas.createCountInput.hideErrorMsg = function() {};
				}
				nas.createCountInput.reset();
				$("#createModal form")[0].reset();
				$("#slider-range-min").slider("option", "value", 10);
				$("#createStorageSize").val(10);
				$("#tipOwnUserAccount").text("");
				$("#tipOwnUserId").text("");
				$("#tipCreateCount").text("");
				$("#tipCreateStorageSize").text("");
				$("#createModal").modal("show");
			});
			$("#btnBackupSave").unbind("click").bind("click", function() {
				nas.backupVolume();
			});
		},
		// 获取所属用户账户列表
		getOwnUserAccountList : function() {
			var ownUserAccountList = [];
			Dcp.biz.apiRequest("/user/describeUsers", null, function(data) {
				if (data.code == "0") {
					$(data.data).each(function(index, item) {
						ownUserAccountList.push(item.account);
					});
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_search_userList_exception','查询所属用户列表发生异常')+"：" + data.msg); 
				}
			});
			return ownUserAccountList;
		},
		// 刷新Table
		updateDataTable : function() {
			Dcp.biz.apiRequest("/instance/nas/describeFsVolumes", null, function(data) {
				if (data.code == 0) {
					nas.datatable.updateData(data.data);
				}
				$("#moreAction").addClass("disabled");
			});
		},
		// 根据选中的文件存储的个数判断是否将修改选项置为灰色
		showOrHideModifyOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#moreAction").addClass("disabled");
			} else if(checkboxArr.length == 1){
				$("#moreAction").parent().find("li.beforeModify").removeClass("disabled");
			} else {
				$("#moreAction").parent().find("li.beforeModify").addClass("disabled");
			}
		},
		// 根据选中的文件存储的状态判断是否将挂载到主机选项置为不可用
		showOrHideAttachOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#moreAction").addClass("disabled");
			} else {
				$("#moreAction").removeClass("disabled"); 
				var hideAttach = false;
				var ownUser = $(checkboxArr[0]).parents("tr").attr("ownUserId");
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					var optState = $(item).parents("tr").attr("optState");
					if (state != "running") {
						hideAttach = true;
						return;
					} else  {
						if (optState != undefined && optState != "") {
							hideAttach = true;
							return;
						}
					}
					if ($(item).parents("tr").attr("ownUserId") != ownUser) {
						hideAttach = true;
						return;
					} 
				});
			    if (!hideAttach) {
			    	$("#moreAction").parent().find("li.attachVm").removeClass("disabled");
			    } else {
			    	$("#moreAction").parent().find("li.attachVm").addClass("disabled");
			    }
			}
		},
		// 根据选中的文件存储的状态判断是否将删除选项置为不可用
		showOrHideDeleteOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#moreAction").addClass("disabled");
			} else {
				$("#moreAction").removeClass("disabled"); 
				var hideDelete = false;
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					var optState = $(item).parents("tr").attr("optState");
					if (state != "running") {
						hideDelete = true;
						return;
					} else  {
						if (optState != undefined && optState != "") {
							hideDelete = true;
							return;
						}
					}
				});
			    if (!hideDelete) {
			    	$("#moreAction").parent().find("li.deleteVm").removeClass("disabled");
			    } else {
			    	$("#moreAction").parent().find("li.deleteVm").addClass("disabled");
			    }
			}
		},
		// 根据选中的文件存储的状态判断是否将备份和快照管理置为不可用
		showOrHideBackupAndRecoveryOpt : function() {
			var checkboxArr = nas.getCheckedArr();
			if (checkboxArr.length == 0) {
				$("#moreAction").addClass("disabled");
			} else if (checkboxArr.length > 1) {
				$("#moreAction").removeClass("disabled");
				$("#moreAction").parent().find("li.backupVolume").addClass("disabled");
				$("#moreAction").parent().find("li.volumeSnapshot").addClass("disabled");
			} else {
				$("#moreAction").removeClass("disabled");
				// 根据状态判断
				var state = $(checkboxArr[0]).parents("tr").attr("state");
				var optState = $(checkboxArr[0]).parents("tr").attr("optState");
				if ((state == "running" || state == "using") && (optState == undefined || optState == "")) {
					$("#moreAction").parent().find("li.backupVolume").removeClass("disabled");
				} else {
					$("#moreAction").parent().find("li.backupVolume").addClass("disabled");
				}
				if (state == "running" && (optState == undefined || optState == "")) {
					$("#moreAction").parent().find("li.volumeSnapshot").removeClass("disabled");
				} else {
					$("#moreAction").parent().find("li.volumeSnapshot").addClass("disabled");
				}
			}
		},
		getCheckedArr :function() {
			return $("#volumeTable tbody input[type='checkbox']:checked");
		},
		//显示该所属用户下的可用云主机
		describeVM : function() {
			var volumeId = nas.getCheckedArr().parents("tr").attr("id");
			var ownUserId = nas.getCheckedArr().parents("tr").attr("ownUserId");
			var params = {
					"id" : volumeId,
					"targetOrAttached" : 1,
					"typesToAttach" : 1,
					"states" : "running",
					"ownUserId" : ownUserId
			};
			Dcp.biz.apiRequest("/instance/ebs/describeInstanceInfos", params, function(datas) {
				if (datas.code != "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_search_vm_error','查询可用云主机发生错误')+"：" + datas.msg); 
				} else if(datas.data.length == 0){
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_no_vm_use','没有可用的云主机')+"！"); 
			    } else {
			    	$("#vmModal").modal("show");
					if(null != nas.attachVolumnDataTable){
						nas.attachVolumnDataTable.updateData(datas.data);
					} else {
						nas.attachVolumnDataTable =  new com.skyform.component.DataTable();
						nas.attachDataTable(datas.data);
					}
				}
			});
		},
		attachDataTable : function(data) {
			 nas.attachVolumnDataTable.renderByData("#vmTable", {
					"data" : data,
					"pageSize": 5,
					"columnDefs" : [
					     {title : "", name : "id"},
					     {title : "ID", name : "id"},
					     {title : Dict.val('key_instance_name','名称'), name : "instanceName"}
					],
					"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnIndex ==0) {
							 text = "<input type='radio' name='ownUserId' value=' "+text+" '>";
						 }
						 return text;
					},
					"afterRowRender" : function(index,data,tr){
						if(index == 0) {
							$(tr).find("input[type='radio']").attr("checked", "checked");
						}
					}					
				}
			);
		},
		// 修改文件存储名称和描述
		modifyVdiskVolume : function() {
			// 验证
			$("#modifyVolumeName").jqBootstrapValidation();
			if ($("#modifyVolumeName").jqBootstrapValidation("hasErrors")) {
				$("#tipModifyVolumeName").text(Dict.val('key_js_vDisk_name_null','文件存储名称不能为空')+"！");
				return;
			} else {
				$("#tipModifyVolumeName").text("");
			}
			var params = {
				"id" : nas.getCheckedArr().val(),
				"instanceName": $("#modifyVolumeName").val(),
				"comment" : $("#modifyVolumeComment").val(),
				"modOrLarge" : 1
			};
			Dcp.biz.apiRequest("/instance/nas/modifyFsVolumeAttributes", params, function(data){
				if(data.code == "0"){
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_modify_vDiskInfo_success','修改文件存储信息成功')+"！"); 
					nas.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
				}
				$("#modifyDiskModal").modal("hide");
			});
		},
		// 挂载文件存储
		attachVdiskVolume : function(){
			var checkedArr =  nas.getCheckedArr();
			if (checkedArr.length != 0) {
				nas.volumeIds = "";
			}
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				nas.volumeIds += $("input", $("td", tr)[0]).val();
				if (index < checkedArr.length - 1) {
					nas.volumeIds += ",";
				}
			});
			var vdiskVolumeIds = nas.volumeIds;
			var vmId = $("#vmTable input[type='radio']:checked").val();
			var params = {
					"volumeIds" : vdiskVolumeIds,
					"vmId" : vmId
			};
			Dcp.biz.apiRequest("/instance/nas/attachVdiskVolumes", params, function(data){
					if(data.code == "0"){
						$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mount_vDisk_success','挂载文件存储成功')+"！"); 
						nas.updateDataTable();
					} else {
						$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
					}
					$("#vmModal").modal("hide");
				});
		},
		// 显示文件存储备份MODAL
		showBackupVolumeModal : function() {
			var checkedArr =  nas.getCheckedArr();
			var tr = $(checkedArr[0]).parents("tr");
			var volumeName = $($("td", tr)[2]).text();
			var volumeId = $("input[type='checkbox']", $("td", tr)[0]).val();
			$("#backupVolumeId").val(volumeId);
			$("#backupVolumeName").val(volumeName);
			$("#backupModal").modal("show");
		},
		// 文件存储备份
		backupVolume : function() {
			var params = {
				"id" : $("#backupVolumeId").val(),
				"comment" : $.trim($("#backupVolumeComment").val())
			};
			Dcp.biz.apiRequest("/instance/nas/backupVolume", params, function(data) {
				if (data.code == "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_vDisk_backup_success','备份文件存储成功')+"！"); 
					nas.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
				}
				$("#backupModal").modal("hide");
			});
		},
		// 文件存储快照管理
		showVolumeSnapshotModal : function() {
			var checkedArr =  nas.getCheckedArr();
			var tr = $(checkedArr[0]).parents("tr");
			var volumeName = $($("td", tr)[2]).text();
			var volumeId = $("input[type='checkbox']", $("td", tr)[0]).val();
			$("#recoveryVolumeId").val(volumeId);
			$("#recoveryVolumeName").val(volumeName);
			nas.renderVolumeUserSnapshotList(volumeId);
		},
		// 渲染快照列表
		renderVolumeUserSnapshotList : function(volumeId) {
			var params = {
				"instanceInfoId" : volumeId,
				"state" : 0
			};
			Dcp.biz.apiRequest("/instance/nas/describeVolumeSnapshot", params, function(data) {
				if (data.code == "0") {
					var snapshotList = data.data;
					var container = $("#volumeSnapshotTable tbody").empty();
					if (snapshotList.length == 0) {
						container.append("<tr><td colspan='4'>"+Dict.val('key_js_vDisk_no_snapshot','此文件存储无可用快照')+"</td></tr>");
					} else {
						$(snapshotList).each(function(i, item) {
							var dom = "";
							dom = $("<tr>" +
								"<td>" + item.id + "</td>" +"<td>" + (new Date(item.createDt).format("yyyy-MM-dd hh:mm:ss")) + "</td>" +
								"<td>" + item.comment + "</td>" +"<td>" +
								"<a href='javascript:void(0);' class='icon-refresh' title="+Dict.val('key_js_restore','恢复')+"></a>&nbsp;&nbsp;" +
								"<a href='javascript:void(0);' class='icon-remove' title="+Dict.val('key_instance_delete','删除')+"></a>" +
								"</td>" +
							"</tr>");
							dom.find(".icon-refresh").unbind("click").bind("click", function() {
								nas.recoverySnapshot(volumeId, item.id);
							});
							dom.find(".icon-remove").unbind("click").bind("click", function() {
								nas.deleteSnapshot(volumeId, item.id);							
							});
							container.append(dom);
						});
					}
					$("#snapshotModal").modal("show");
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
				}
			});
		},
		// 文件存储快照恢复
		recoverySnapshot : function(volumeId, userSnapshotId) {
			var container = $("#snapshotModal");
			$(".userSnapshotlistBody", container).addClass("hide");
			$(".userSnapshotlistFooter", container).addClass("hide");
			$(".deleteOrRecoveryUserSnapshotBody", container).find("h4").html(Dict.val('key_js_restore_snapshot','你确认要恢复快照吗')+"？");
			$(".deleteOrRecoveryUserSnapshotBody", container).removeClass("hide");
			$(".deleteOrRecoveryUserSnapshotFooter", container).removeClass("hide");
			// 确认恢复
			$("#btnDeleteOrRecoverySnapshotSave", container).unbind("click").bind("click", function() {
				var params = {
					"id" : volumeId,
					"userSnapshotId" : userSnapshotId
				};
				Dcp.biz.apiRequest("/instance/nas/recoveryVolumeSnapshot", params, function(data) {
					$(".deleteOrRecoveryUserSnapshotBody", container).addClass("hide");
					$(".deleteOrRecoveryUserSnapshotFooter", container).addClass("hide");
					$(".userSnapshotlistBody", container).removeClass("hide");
					$(".userSnapshotlistFooter", container).removeClass("hide");
					if (data.code == "0") {
						$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_restore_snapshot_success','恢复快照成功')+"！");
						$("#snapshotModal").modal("hide");
						nas.updateDataTable();
					} else {
						$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
					}
				});
			});
			// 取消恢复
			$("#btnDeleteOrRecoverySnapshotCancel", container).unbind("click").bind("click", function() {
				$(".deleteOrRecoveryUserSnapshotBody", container).addClass("hide");
				$(".deleteOrRecoveryUserSnapshotFooter", container).addClass("hide");
				$(".userSnapshotlistBody", container).removeClass("hide");
				$(".userSnapshotlistFooter", container).removeClass("hide");
			});
		},
		// 文件存储快照删除
		deleteSnapshot : function(volumeId, userSnapshotId) {
			var container = $("#snapshotModal");
			$(".userSnapshotlistBody", container).addClass("hide");
			$(".userSnapshotlistFooter", container).addClass("hide");
			$(".deleteOrRecoveryUserSnapshotBody", container).find("h4").html(Dict.val('key_js_delete_snapshot_assure','你确认要删除快照吗')+"？");
			$(".deleteOrRecoveryUserSnapshotBody", container).removeClass("hide");
			$(".deleteOrRecoveryUserSnapshotFooter", container).removeClass("hide");
			$("#btnDeleteOrRecoverySnapshotSave", container).unbind("click").bind("click", function() {
			var params = {
				"id" : volumeId,
				"userSnapshotId" : userSnapshotId
			};
			Dcp.biz.apiRequest("/instance/nas/deleteVolumeSnapshot", params, function(data) {
				$(".deleteOrRecoveryUserSnapshotBody", container).addClass("hide");
				$(".deleteOrRecoveryUserSnapshotFooter", container).addClass("hide");
				$(".userSnapshotlistBody", container).removeClass("hide");
				$(".userSnapshotlistFooter", container).removeClass("hide");
				if (data.code == "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_delete_snapshot_success','删除快照成功')+"！");
					$("#snapshotModal").modal("hide");
					nas.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
				}
				});
			});
			// 取消删除
			$("#btnDeleteOrRecoverySnapshotCancel", container).unbind("click").bind("click", function() {
				$(".deleteOrRecoveryUserSnapshotBody", container).addClass("hide");
				$(".deleteOrRecoveryUserSnapshotFooter", container).addClass("hide");
				$(".userSnapshotlistBody", container).removeClass("hide");
				$(".userSnapshotlistFooter", container).removeClass("hide");
			});
		}
};
$(function() {	
	nas.init();
});
