
var obs = {
		attachVolumnDataTable  : null,
		volumeState: [],
		confirmModal : null,
		ownUserAccountList : [],
		datatable : new com.skyform.component.DataTable(),
		init : function() {
			obs.volumeState = {
					"pending"        :   Dict.val('key_js_unchecked','待审核'),
					"reject"         :   Dict.val('key_js_audit_refused','审核拒绝'),
					"opening"        :   Dict.val('key_js_opening','正在开通'),
					"changing"       :   Dict.val('key_js_changing','正在变更'),
					"deleting"       :   Dict.val('key_js_destorying','正在销毁'),
					"deleted"        :   Dict.val('key_js_destoryed','已销毁'),
					"running"        :   Dict.val('key_js_running','就绪'),
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
					obs.onOptionSelected($(this).index());
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
					obs.onOptionSelected($(this).index());					
				}
			});
			$("body").bind('mousedown',function(){
				if(!inMenu){
					$("#contextMenu").hide();
				}
			});
			// 新建对象存储
			$("#btnCreateVdiskVolume").click(obs.createObsVolume);
				// 查询对象存储列表
				obs.describeObsVolumes();
		},
		onOptionSelected : function(index) {
			if(index == 0){
				var oldInstanceName = obs.getCheckedArr().parents("tr").find("td:eq(2)").html();
				var oldComment = obs.getCheckedArr().parents("tr").attr("comment");
				$("#modifyVolumeName").val(oldInstanceName);
				$("#modifyVolumeComment").val(oldComment);
				$("#modifyDiskModal").modal("show");
			}else if(index == 1){
				obs.showDeleteVdiskVolume();
			}	
		},
		showDeleteVdiskVolume : function() {
			var checkedArr =  obs.getCheckedArr();
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
		if(obs.confirmModal == null) {
			obs.confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val('key_js_destory_obs','销毁对象存储'),"<h4>"+Dict.val('key_js_destory_assure','您确认要销毁')+"&nbsp"+volumeNames + "?</h4>",{
				buttons : [
					{
					name : Dict.val('key_instance_sure','确定'),
					onClick : function(){
					// 删除对象存储
					var vdiskVolumeIds = volumeIds.join(",");
					Dcp.biz.apiRequest("/instance/obs/deleteObsVolumes", {"ids" : vdiskVolumeIds}, function(data) {
						if (data.code == 0) {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_destory_obs_success','销毁对象存储成功')+"！"); 
							obs.confirmModal.hide();
							obs.updateDataTable();
						} else {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_destory_obs_failed','销毁对象存储失败')+":" + data.msg); 
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
						obs.confirmModal.hide();
					}
				}
				]
			});
		}
		obs.confirmModal.setWidth(300).autoAlign();
		obs.confirmModal.show();
	},
		// 创建对象存储
		createObsVolume : function() {
			var isSubmit = true;
			var instanceName = $.trim($("#createInstanceName").val());
			var count = 1;
			var storageSize = $.trim($("#createStorageSize").val());
			var ownUserAccount = $.trim($("#ownUserAccount").val());
			// 验证
			$("#createStorageSize").jqBootstrapValidation();
			var ownUserValidateFlag = false;
			$(obs.ownUserAccountList).each(function(i, item) {
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
					"userName" : ownUserAccount
			};
			Dcp.biz.apiRequest("/instance/obs/createObsVolumes", params, function(data) {
				if (data.code == "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_create_obs_success','创建对象存储成功')+"！"); 
					$("#createModal").modal("hide");
					obs.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_create_obs_failed','创建对象存储失败')+"：" + data.msg); 
				}
			});
		},
		// 查询对象存储列表
		describeObsVolumes : function() {
			Dcp.biz.apiRequest("/instance/obs/describeObsVolumes", null, function(data) {
				if (data.code != "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_search_vDisk_error','查询对象存储发生错误')+"：" + data.msg); 
				} else {
					obs.renderDataTable(data.data);
				}
			});
		},
		renderDataTable : function(data) {
			obs.datatable.renderByData("#volumeTable", {
					"data" : data,
					"iDisplayLength": 15,
					"columnDefs" : [
					     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
					     {title : "ID", name : "id"},
					     {title : Dict.val('key_js_service_name','服务名称'), name : "instanceName"},
					     {title : Dict.val('key_instance_state','状态'), name : "state"},
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
								 text = obs.volumeState[text];
							 } else {
								 text = obs.volumeState[columnData.optState];
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
						obs.bindEvent();
					}
				}
			);
			obs.datatable.addToobarButton("#disktoolbar");
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
			             } else {
			            	 $("#contextMenu").find("li.deleteVm").addClass("disabled");
			             }
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			             obs.showOrHideModifyOpt();
						 obs.showOrHideDeleteOpt();
			     } 
			}); 
			$("#checkAll").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#volumeTable input[type='checkbox']").attr("checked",checked);	 
		        obs.showOrHideModifyOpt();
		        obs.showOrHideDeleteOpt();
		        e.stopPropagation();
			});
			$("#volumeTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				 obs.showOrHideModifyOpt();
				 obs.showOrHideDeleteOpt();
			});
			$("#btnRefresh").unbind("click").bind("click", function() {
				obs.updateDataTable();
			});
			// 修改对象存储名称和描述
			$("#modify_save").unbind("click").bind("click", function() {
				obs.modifyVdiskVolume();
			});
			$("#createVdiskVolume").unbind("click").bind("click", function() {
				obs.ownUserAccountList = obs.getOwnUserAccountList();
				var typeahead = $("#ownUserAccount").typeahead({
	    			source : function(query,process){
	    				process(obs.ownUserAccountList);
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
				$("#createModal form")[0].reset();
				$("#slider-range-min").slider("option", "value", 10);
				$("#createStorageSize").val(10);
				$("#tipOwnUserAccount").text("");
				$("#tipOwnUserId").text("");
				$("#tipCreateStorageSize").text("");
				$("#createModal").modal("show");
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
			Dcp.biz.apiRequest("/instance/obs/describeObsVolumes", null, function(data) {
				if (data.code == 0) {
					obs.datatable.updateData(data.data);
				}
				$("#moreAction").addClass("disabled");
			});
		},
		// 根据选中的对象存储的个数判断是否将修改选项置为灰色
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
		// 根据选中的对象存储的状态判断是否将删除选项置为不可用
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
		getCheckedArr :function() {
			return $("#volumeTable tbody input[type='checkbox']:checked");
		},
		// 修改对象存储名称和描述
		modifyVdiskVolume : function() {
			// 验证
			$("#modifyVolumeName").jqBootstrapValidation();
			if ($("#modifyVolumeName").jqBootstrapValidation("hasErrors")) {
				$("#tipModifyVolumeName").text(Dict.val('key_js_vDisk_name_null','对象存储名称不能为空')+"！");
				return;
			} else {
				$("#tipModifyVolumeName").text("");
			}
			var params = {
				"id" : obs.getCheckedArr().val(),
				"instanceName": $("#modifyVolumeName").val(),
				"comment" : $("#modifyVolumeComment").val()
			};
			Dcp.biz.apiRequest("/instance/obs/modifyVdiskVolumeAttributes", params, function(data){
				if(data.code == "0"){
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_modify_vDiskInfo_success','修改对象存储信息成功')+"！"); 
					obs.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
				}
				$("#modifyDiskModal").modal("hide");
			});
		}
};
$(function() {	
	obs.init();
});
