var VdiskVolume = { 
		attachVolumnDataTable  : null,
		volumeState: [],
		confirmModal : null,
		infoList : null,
		instanceNameList : [],
		ownUserAccountList : [],
		bizTypeData	: null,
		createCountInput : null,
		datatable : new com.skyform.component.DataTable(),
		init : function() {
			VdiskVolume.volumeState = {
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
					"snapshotDeling" :   Dict.val('key_js_deleting_snapshot','正在删除快照'),
					// #3401 创建虚拟硬盘失败，在运维管理平台中没有状态显示,应显示操作失败
					"error"          :   Dict.val('key_js_error','操作失败')
			};
			VdiskVolume.getBizTypeList();
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
					VdiskVolume.onOptionSelected($(this).index());
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
			//annotation by shixianzhi fix bug #3329 2014-01-21
			/*var realValue;
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
			});*/
			
			//为table的右键菜单添加监听事件
			$("#contextMenu").bind('mouseover',function(){
				inMenu = true;
			});		
			$("#contextMenu").bind('mouseout',function(){
				inMenu = false;
			});
			$("#contextMenu li").unbind().bind('mousedown', function(e) {
				$("#contextMenu").hide();
				if (!$(this).hasClass("disabled"))
					VdiskVolume.onOptionSelected($(this).index());
			});
			$("body").unbind('mousedown').bind('mousedown', function() {
				if (!inMenu) {
					$("#contextMenu").hide();
				}
			});
			// 新建虚拟硬盘
			$("#btnCreateVdiskVolume").click(VdiskVolume.createVdiskVolume);
			// 查询虚拟硬盘列表
			VdiskVolume.describeVdiskVolumes();
		},
		onOptionSelected : function(index) {
			if(index == 0){
				$("#tipModifyInstanceName").text('');
				var oldInstanceName = VdiskVolume.getCheckedArr().parents("tr").attr("instanceName");
				var oldComment = VdiskVolume.getCheckedArr().parents("tr").attr("comment");
				var oldBizType = VdiskVolume.getCheckedArr().parents("tr").attr("bizType");
				$("#modifyVolumeName").val(oldInstanceName);
				$("#modifyVolumeComment").val(oldComment);
				$("#bizTypeHtml option").remove();
				if(VdiskVolume.bizTypeData != null){
					var nn = VdiskVolume.bizTypeData.value;
					nn = nn.split('|');
					var comment = VdiskVolume.bizTypeData.comment;
					comment = comment.split('|');
					for(var i=0; i < nn.length; i++){
						if(oldBizType == nn[i]){
							$("#bizTypeHtml").append("<option value='" + nn[i] + "' selected='selected'>" + comment[i] + "</option>");
						} else {
							$("#bizTypeHtml").append("<option value='" + nn[i] + "'>" + comment[i] + "</option>");
						}
					}
				}
				$("#modifyDiskModal").modal("show");
			} else if(index == 1){
				VdiskVolume.describeVM();
			} else if(index == 2){
				VdiskVolume.showDeleteVdiskVolume();
			}/* else if (index == 3) {
				VdiskVolume.showBackupVolumeModal();
			} else if (index == 4) {
				VdiskVolume.showVolumeSnapshotModal();
			}		*/
		},
		showDeleteVdiskVolume : function() {
			var checkedArr =  VdiskVolume.getCheckedArr();
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
			// #3049 运维管理平台，选择第一个未挂载的虚拟硬盘删除的时候，提示是否删除虚拟硬盘A,删除成功后，再删除第二个虚拟硬盘的时候，提示仍为是否删除虚拟硬盘A，第二个虚拟硬盘也删除不成功
			// 注释掉，让确认框每次都新建
		// if(VdiskVolume.confirmModal == null) {
			VdiskVolume.confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val('key_js_destory_vDisk','销毁虚拟硬盘'),"<h4>"+Dict.val('key_js_destory_assure','您确认要销毁')+"&nbsp"+volumeNames + "?</h4>",{
				buttons : [
					{
					name : Dict.val('key_instance_sure','确定'),
					onClick : function(){
					// 删除虚拟硬盘
					var vdiskVolumeIds = volumeIds.join(",");
					Dcp.biz.apiRequest("/instance/vdisk/deleteVdiskVolumes", {"ids" : vdiskVolumeIds}, function(data) {
						if (data.code == 0) {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_destory_vDisk_success','销毁虚拟硬盘成功')+"！"); 
							VdiskVolume.confirmModal.hide();
							VdiskVolume.updateDataTable();
						} else {
							$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_destory_vDisk_success','销毁虚拟硬盘失败')+":" + data.msg); 
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
						VdiskVolume.confirmModal.hide();
					}
				}
				]
			});
		// }
		
		VdiskVolume.confirmModal.setWidth(300).autoAlign();
		// #3050 删除虚拟硬盘时确认提示框显示过高的问题修改
		VdiskVolume.confirmModal.setTop(50);
		VdiskVolume.confirmModal.show();
	},
		// 创建虚拟硬盘
		createVdiskVolume : function() {
			var isSubmit = true;
			var instanceName = $.trim($("#createInstanceName").val());
			var count = 1;
			var storageSize = $.trim($("#createStorageSize").val());
			var ownUserAccount = $.trim($("#ownUserAccount").val());
			var businessNameId = $("#bizType").val();
			// 验证
			$("#createCount, #createStorageSize").jqBootstrapValidation();
			
			//added by shixianzhi fix bug #3329 2014-02-07
			var storage = $.trim($("#createStorageSize").val());
			if(parseInt(storage) < 10) {
				$("#createStorageSize").val(10);
			} else if(parseInt(storage) > 500){
				$("#createStorageSize").val(500);
			}
			var realValue1 = parseInt(parseInt($("#createStorageSize").val())/10) * 10 ;
			$( "#slider-range-min" ).slider( "option", "value", realValue1);
			$("#createStorageSize").val(realValue1);	
			
			var ownUserValidateFlag = false;
			$(VdiskVolume.ownUserAccountList).each(function(i, item) {
				if (ownUserAccount == item) {
					ownUserValidateFlag = true;
					return;
				}
			});
			if (!ownUserValidateFlag) {
				$("#tipOwnUserAccount").text(Dict.val("key_not_empty","这里不能为空!")+"！");
				isSubmit = false;
			} else {
				$("#tipOwnUserAccount").text("");
			}
			var countValidateResult = VdiskVolume.createCountInput.validate();
			if (countValidateResult.code == 1) {
				$("#tipCreateCount").text(countValidateResult.msg);
				isSubmit = false;
			} else {
				$("#tipCreateCount").text("");
				count = VdiskVolume.createCountInput.getValue();
			}
		    if ($("#createStorageSize").jqBootstrapValidation("hasErrors")) {
		    	$("#tipCreateStorageSize").text(Dict.val('key_js_capacity_size','容量必须为大于等于10')+"！");
		    	$("#createStorageSize").val(10);
		    	$("#slider-range-min").slider("option", "value", 10);
		    	isSubmit = false;
		    } else {
		    	$("#tipCreateStorageSize").text("");
		    }
		    var flag = true;
			if (!isSubmit) {
				return;
			} else {
				flag = VdiskVolume.validateInstanceName(instanceName, null);
			}
			if(!flag)	return;
			var params = {
					"instanceName" : instanceName,
					"count" : count,
					"storageSize" : storageSize,
					"ownUserAccount" : ownUserAccount,
					"bizType" : businessNameId
			};
			Dcp.biz.apiRequest("/instance/vdisk/createVdiskVolumes", params, function(data) {
				if (data.code == "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_create_vDisk_success','创建虚拟硬盘成功')+"！"); 
					$("#createModal").modal("hide");
					VdiskVolume.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_create_vDisk_failed','创建虚拟硬盘失败')+"：" + data.msg); 
				}
			});
		},
		//查询COMBOX_BIZ_TYPE
		getBizTypeList : function(){
			$("#bizType option").remove();
			var param = {
				"type"  : "COMBOX_BIZ_TYPE",
				"url"	: skyformoptURL + "/sysParameters/getParamCommentByKey.action"	
			};
			Dcp.biz.apiRequest('/parameters/getDicTypeAndComment', param, function(datas) {
				if(datas.code="0"){
					VdiskVolume.bizTypeData = datas.data;
					var nn = VdiskVolume.bizTypeData.value;
					nn = nn.split('|');
					var comment = VdiskVolume.bizTypeData.comment;
					comment = comment.split('|');
					for(var i=0; i < nn.length; i++){
						$("#bizType").append("<option value='" + nn[i] + "'>" + comment[i] + "</option>");
					}
				}
			});
		},
		//将bizType的value转换成comment
		BizType : function(bizTypeValue){
			var value = VdiskVolume.bizTypeData.value.split("|");
			var comment = VdiskVolume.bizTypeData.comment.split("|");
			var text = '';
			$(value).each(function(index, item){
				if(item == bizTypeValue){
					text = comment[index];
				}
			});
			return text;
		},
		// 查询虚拟硬盘列表
		describeVdiskVolumes : function() {
			Dcp.biz.apiRequest("/instance/vdisk/describeVdiskVolumes", null, function(data) {
				if (data.code != "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_search_vDisk_error','查询虚拟硬盘发生错误')+"：" + data.msg); 
				} else {
					VdiskVolume.infoList = data.data;
					VdiskVolume.renderDataTable(data.data);
				}
			});
		},
		renderDataTable : function(data) {
			VdiskVolume.datatable.renderByData("#volumeTable", {
					"data" : data,
					"iDisplayLength": 15,
					"columnDefs" : [
					     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
					     {title : "ID", name : "id"},
					     {title : Dict.val('key_js_service_name','服务名称'), name : "instanceName"},
					     {title : Dict.val('key_instance_state','状态'), name : "state"},
					     {title : Dict.val('key_instance_bizType','业务名称'), name : "bizType",attrs:[{name:"style",value:"min-width:100px"}]},
					     {title : Dict.val('key_js_application_host','应用主机'), name : "attachedHostName"},
					     {title : Dict.val('key_js_capacity','容量')+"(GB)", name : "storageSize"},
					     {title : Dict.val('key_instance_create_data','创建时间'), name : "createDate"},
					     {title : Dict.val('key_js_user','用户'), name : "ownUserAccount",attrs:[{name:"style",value:"min-width:100px"}]}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnIndex ==0) {
							 text = '<input type="checkbox" value="'+text+'">';
						 }
						 /*if (columnMetaData.title == "ID") {
							 text =  text ;
						 }*/
						 if (columnMetaData.name == "state") {
							 if (columnData.optState == null || columnData.optState == "") {
								 text = VdiskVolume.volumeState[text];
							 } else {
								 text = VdiskVolume.volumeState[columnData.optState];
							 }
							 // #3401 创建虚拟硬盘失败，在运维管理平台中没有状态显示,应显示操作失败
							 if(null == text || "" == text) {
								 text = VdiskVolume.volumeState["error"];
							 }
						 }
						 if (columnMetaData.name == "bizType") {
							 text=VdiskVolume.BizType(columnData.bizType);
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
						tr.attr("ownUserAccount", data.ownUserAccount);
						tr.attr("bizType", data.bizType);
						tr.attr("instanceName", data.instanceName);
					},
					"afterTableRender" : function() {											
						var allCheckedBox = $("#volumeTable tbody input[type='checkbox']:checked");						
						if (allCheckedBox.length == 0){
							$("#checkAll[type='checkbox']").removeAttr("checked");   
							$("#moreAction").addClass("disabled");
						} 						
						if (allCheckedBox.length > 0){
							$("#checkAll[type='checkbox']").attr("checked",true);  
							$("#moreAction").removeClass("disabled");
						} 						
						VdiskVolume.bindEvent();
					}
				}
			);
			VdiskVolume.datatable.addToobarButton("#disktoolbar");
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
			             + (e.pageX)
			             + "px; width: 180px;");  
			             $("#contextMenu").show();  
			             e.stopPropagation();
			             var state = $(this).attr("state");
			             var optState = $(this).attr("optState");
			             // 如果不是非就绪状态，则将删除选项和挂载到主机以及快照管理选项置为不可用灰色
			             if (state == "running" && (optState == undefined || optState == "")) {
			            	 $("#contextMenu").find("li.deleteVm").removeClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").removeClass("disabled");
			             	 //$("#contextMenu").find("li.volumeSnapshot").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.deleteVm").addClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").addClass("disabled");
			             	 //$("#contextMenu").find("li.volumeSnapshot").addClass("disabled");
			             }
			             // 如果不是就绪和已挂载状态，则将备份置为不可用
			            /* if ((state == "running" || state == "using") && (optState == undefined || optState == "")) {
			            	 $("#contextMenu").find("li.backupVolume").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.backupVolume").addClass("disabled");
			             }*/
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			             VdiskVolume.showOrHideModifyOpt();
						 VdiskVolume.showOrHideAttachOpt();
						 VdiskVolume.showOrHideDeleteOpt();
						// VdiskVolume.showOrHideBackupAndRecoveryOpt();
			     } 
			}); 
			$("#checkAll").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#volumeTable input[type='checkbox']").attr("checked",checked);	 
		        VdiskVolume.showOrHideModifyOpt();
		        VdiskVolume.showOrHideAttachOpt();
		        VdiskVolume.showOrHideDeleteOpt();
		       // VdiskVolume.showOrHideBackupAndRecoveryOpt();
		        e.stopPropagation();
			});
			$("#volumeTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				 VdiskVolume.showOrHideModifyOpt();
				 VdiskVolume.showOrHideAttachOpt();
				 VdiskVolume.showOrHideDeleteOpt();
				 //VdiskVolume.showOrHideBackupAndRecoveryOpt();
			});
			$("#btnRefresh").unbind("click").bind("click", function() {
				VdiskVolume.updateDataTable();
			});
			// 挂载虚拟硬盘
			$("#attach_save").unbind("click").bind("click", function() {
				VdiskVolume.attachVdiskVolume();
			});
			// 修改虚拟硬盘名称和描述
			$("#modify_save").unbind("click").bind("click", function() {
				VdiskVolume.modifyVdiskVolume();
			});
			$("#createVdiskVolume").unbind("click").bind("click", function() {
				VdiskVolume.ownUserAccountList = VdiskVolume.getOwnUserAccountList();
				var typeahead = $("#ownUserAccount").typeahead({
	    			source : function(query,process){
	    				process(VdiskVolume.ownUserAccountList);
	    			},
	    			matcher : function(item) {
	    				if($.trim(this.query)+"" == "") return true;
	    				return item.indexOf(this.query) >= 0;
	    			},
	    			// #3048  pre-scrollable   style="max-height: 200px;"
	    			items: 9998,
	    			menu: '<ul class="typeahead dropdown-menu"></ul>',
	    			updater : function(item) {
	    				VdiskVolume.getInstanceNameList(item);
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
				if (VdiskVolume.createCountInput == null) {
					var container = $("#createCount").empty();
					VdiskVolume.createCountInput = new com.skyform.component.RangeInputField(container, {
						min : 1,
						defaultValue : 1,
						textStyle : "width:145px;height:23px;"
					});
					VdiskVolume.createCountInput.render();
					VdiskVolume.createCountInput.showErrorMsg = function(msg) {};
					VdiskVolume.createCountInput.hideErrorMsg = function() {};
				}
				VdiskVolume.createCountInput.reset();
				var combox = VdiskVolume.getBizTypeList();
				$("#createModal form")[0].reset();
				$("#slider-range-min").slider("option", "value", 10);
				$("#createStorageSize").val(10);
				$("#tipOwnUserAccount").text("");
				$("#tipOwnUserId").text("");
				$("#tipCreateInstanceName").text("");
				$("#tipCreateCount").text("");
				$("#tipCreateStorageSize").text("");
				var isRight = 'placeholder' in document.createElement('input');
				if(!isRight) {
					$('[placeholder]').keydown(function(event) {
						var input = $(this);
						if (input.val() == input.attr('placeholder')) {
							input.val('');
							input.removeClass('placeholder');
						}
				    }).blur(function() {
				        var input = $(this);
				        var input_val = $.trim(input.val());
				        if (input_val == '' || input.val() == input.attr('placeholder')) {
				            input.val(input.attr('placeholder'));
				            input.addClass('placeholder');
				        }
				    });
					var my_input = $("#ownUserAccount");
					my_input.val(my_input.attr('placeholder'));
				}
				// ------------------解决宽度没对齐-----------------------------------
				var width = $("#bizType").width();
				width -= 13;
				$("#ownUserAccount").css("width",width+13).css("height",25);
				$("#createInstanceName").css("width",width+13).css("height",25);
				$("#createCount").css("width",width+25);
				$("#createStorageSize").css("width",width+13).css("height",25);
				// ---------------------------------------------------------------
				$("#createModal").css("top","10px");
				$("#createModal").modal("show");
				
				//annotation by shixianzhi fix bug #3329 2014-02-07
				//新建虚拟硬盘时，限制手动输入容量在10--500G以内
				/*$("#createStorageSize").keyup(function(){
					var storage = $.trim($("#createStorageSize").val());
					if(parseInt(storage) < 10) {
						$("#createStorageSize").val(10);
					} else if(parseInt(storage) > 500){
						$("#createStorageSize").val(500);
					}
				});*/
			});
		},
		getInstanceNameList : function(account){
			VdiskVolume.instanceNameList = [];
			$(VdiskVolume.infoList).each(function(index, i){
				if(account == $(i).attr("ownUserAccount") && $(i).attr("state") != 'deleted'){
					var instanceName = $(i).attr("instanceName");
					VdiskVolume.instanceNameList.push(instanceName);
				}
			});
		},
		//验证重名问题：同一用户下未销毁的 不可重名
		validateInstanceName : function(newName, oldName) {
			var flag = true;
			if (newName != '') {
				for(var i=0; i<VdiskVolume.instanceNameList.length; i++){
					if(newName == VdiskVolume.instanceNameList[i] && oldName != VdiskVolume.instanceNameList[i]){
						if(oldName == null){
							$("#tipCreateInstanceName").html(Dict.val('key_js_name_duplicated_error','实例名称不允许重复') + " !");
						} else {
							$("#tipModifyInstanceName").html(Dict.val('key_js_name_duplicated_error','实例名称不允许重复') + " !");
						}
						flag = false;
						break;
					} else {
						$("#tipCreateInstanceName").text('');
						$("#tipModifyInstanceName").text('');
					}
				}
			}
			return flag;
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
			Dcp.biz.apiRequest("/instance/vdisk/describeVdiskVolumes", null, function(data) {
				if (data.code == 0) {
					VdiskVolume.infoList = data.data;
					VdiskVolume.datatable.updateData(data.data);
				}
				$("#moreAction").addClass("disabled");
			});
		},
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
		// 根据选中的虚拟硬盘的状态判断是否将挂载到主机选项置为不可用
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
		// 根据选中的虚拟硬盘的状态判断是否将删除选项置为不可用
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
		//显示该所属用户下的可用云主机
		describeVM : function() {
			var volumeId = VdiskVolume.getCheckedArr().parents("tr").attr("id");
			var ownUserId = VdiskVolume.getCheckedArr().parents("tr").attr("ownUserId");
			var params = {
					"id" : volumeId,
					"targetOrAttached" : 1,
					"typesToAttach" : 1,
					"states" : "running,closed",
					"ownUserId" : ownUserId
			};
			Dcp.biz.apiRequest("/instance/ebs/describeInstanceInfos", params, function(datas) {
				if (datas.code != "0") {
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_search_vm_error','查询可用云主机发生错误')+"：" + datas.msg); 
				} else if(datas.data.length == 0){
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_no_vm_use','没有可用的云主机')+"！"); 
			    } else {
			    	$("#vmModal").modal("show");
					if(null != VdiskVolume.attachVolumnDataTable){
						VdiskVolume.attachVolumnDataTable.updateData(datas.data);
					} else {
						VdiskVolume.attachVolumnDataTable =  new com.skyform.component.DataTable();
						VdiskVolume.attachDataTable(datas.data);
					}
				}
			});
		},
		attachDataTable : function(data) {
			 VdiskVolume.attachVolumnDataTable.renderByData("#vmTable", {
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
		// 修改虚拟硬盘名称和描述
		modifyVdiskVolume : function() {
			// 验证
			var flag = true;
			if (jQuery.trim($("#modifyVolumeName").val()) == '') {
				$("#tipModifyInstanceName").text(Dict.val('key_js_vDisk_name_null','虚拟硬盘名称不能为空'));
				flag = false;
			} else {
				var ownUserAccount = VdiskVolume.getCheckedArr().parents("tr").attr("ownUserAccount");
				VdiskVolume.getInstanceNameList(ownUserAccount);
				var oldName = VdiskVolume.getCheckedArr().parents("tr").attr("instanceName");
				flag = VdiskVolume.validateInstanceName($("#modifyVolumeName").val(), oldName);
			}
			if(!flag)	return;
			var params = {
				"id" : VdiskVolume.getCheckedArr().val(),
				"instanceName": $("#modifyVolumeName").val(),
				"bizType" : $("#bizTypeHtml").val(),
				"comment" : $("#modifyVolumeComment").val()
			};
			Dcp.biz.apiRequest("/instance/vdisk/modifyVdiskVolumeAttributes", params, function(data){
				if(data.code == "0"){
					$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_modify_vDiskInfo_success','修改虚拟硬盘信息成功')+"！"); 
					VdiskVolume.updateDataTable();
				} else {
					$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
				}
				$("#modifyDiskModal").modal("hide");
			});
		},
		// 挂载虚拟硬盘
		attachVdiskVolume : function(){
			var checkedArr =  VdiskVolume.getCheckedArr();
			if (checkedArr.length != 0) {
				VdiskVolume.volumeIds = "";
			}
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				VdiskVolume.volumeIds += $("input", $("td", tr)[0]).val();
				if (index < checkedArr.length - 1) {
					VdiskVolume.volumeIds += ",";
				}
			});
			var vdiskVolumeIds = VdiskVolume.volumeIds;
			var vmId = $("#vmTable input[type='radio']:checked").val();
			var params = {
					"volumeIds" : vdiskVolumeIds,
					"vmId" : vmId
			};
			Dcp.biz.apiRequest("/instance/vdisk/attachVdiskVolumes", params, function(data){
					if(data.code == "0"){
						$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mount_vDisk_success','挂载虚拟硬盘成功')+"！"); 
						VdiskVolume.updateDataTable();
					} else {
						$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
					}
					$("#vmModal").modal("hide");
				});
		},
};
$(function() {	
	VdiskVolume.init();
});
