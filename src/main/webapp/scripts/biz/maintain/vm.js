function validateInstanceName(input){
	var result = {
		status : true
	};
	if ($.trim("" + $(input).val()) != '') {
		var instanceName = $.trim("" + $(input).val());
		for(var i=0; i<VM.userVMInfoListData.length; i++){
			if(instanceName==VM.userVMInfoListData[i]){
				result.msg = Dict.val('key_js_name_duplicated_error','实例名称不允许重复')+"！";
				result.status = false;
				break;
			}
		}
	}
	return result;
};
function validateUser(input) {
	var result = {
		status : true
	};
	if ($.trim("" + $(input).val()) == '') {
		result.msg = Dict.val('key_js_input_user','请填写所属用户')+"！";
		result.status = false;
	} else {
		var userId = VM.getOwnUserIdByAccount($.trim("" + $(input).val()));
		if (userId == null || userId == "") {
			result.msg = Dict.val('key_js_user_error','所属用户不正确')+"！";
			result.status = false;
		}
	}
	return result;
};
function validateApplyCount(input) {
	var result = {
		status : true
	};
	if ($.trim("" + $(input).val()) == '') {
		result.msg = Dict.val('key_js_input_apply_quantity','请填写申请数量')+"！";
		result.status = false;
	} else if (Number($.trim("" + $(input).val())) < 0
			|| isNaN(Number($.trim("" + $(input).val())))) {
		result.msg = Dict.val('key_js_input_quantity_right','请正确填写数量值')+"！";
		result.status = false;
	}
	return result;
};
var VM = {
	wizard : null,
	modifyVMNameModal : null,
	modifyVMConfigurationModal : null,
	instanceName : null,
	checkedCheckbox : null,
	inMenu : null,
	datatable : null,
	infoData : [],
	VMState : [],
	serviceOfferingsData : [],
	//to fix bug [3098]
	serviceOfferingsDataById : [],
	userListData : [],
	userAccountListData : [],
	userVMInfoListData : [],
	networksData : [],
	createCountInput : null,
	bizTypeData : null,
	//-----------------新增挂载参数 应用于挂在信息展现 start-----------------------
	attachVolumnDataTable :null,
	//-----------------新增挂载参数 应用于挂在信息展现 end-----------------------
	init : function() {
		VM.inMenu = false; // 用于判断鼠标当前是否在下拉操作框中即$("#contextMenu")和$("#dropdown-menu")
		VM.checkedCheckbox = null;
		VM.instanceName = null;
		VM.VMState = {
				"pending"        :   Dict.val('key_js_unchecked','待审核'),
				"reject"         :   Dict.val('key_js_audit_refused','审核拒绝'),
				"opening"        :   Dict.val('key_js_opening','正在开通'),
				"changing"       :   Dict.val('key_js_changing','正在变更'),
				"deleting"       :   Dict.val('key_js_destorying','正在销毁'),
				"deleted"        :   Dict.val('key_js_destoryed','已销毁'),
				"running"        :   Dict.val('key_js_runing','运行中'),
				"using"          :   Dict.val('key_js_using','正在使用'),
				"attaching"      :   Dict.val('key_js_mounting','正在挂载'),
				"unattaching"    :   Dict.val('key_js_unmounting','正在卸载'),
				"stopping"       :   Dict.val('key_js_shuting_down','正在关机'),
				"starting"       :   Dict.val('key_js_start','正在开机'),
				"resetting"     :   Dict.val('key_js_restarting','正在重启'),	
				"error"          :   Dict.val('key_js_error','操作失败'),
				"closed"         :   Dict.val('key_js_shuted_down','已关机'),
				"backuping"      :   Dict.val('key_js_backuping','正在备份'),
				"restoreing"     :   Dict.val('key_js_restoring_snapshot','正在恢复快照'),
				"snapshotDeling" :   Dict.val('key_js_deleting_snapshot','正在删除快照')
		};
		VM.getBizTypeList();
		$("#checkAll").attr("checked", false);
		$("#tbody2 input[type='checkbox']").attr("checked", false);
		$("#moreAction").addClass("disabled");
		$("#dropdown-menu").unbind('mouseover').bind('mouseover', function() {
			VM.inMenu = true;
		});
		$("#dropdown-menu").unbind('mouseout').bind('mouseout', function() {
			VM.inMenu = false;
		});
		$("#dropdown-menu li").unbind('click').bind('click', function(e) {
			if (!$(this).hasClass("disabled"))
				VM.onOptionSelected($(this).index());
		});
		// 刷新
		$("#updateData").unbind().click(
				function() {
					Dcp.biz.apiRequest("/instance/vm/describeInstances", {},function(data) {
						VM.datatable.updateData(data.data);
					});
					return false;
				});
		// 新建
		$("a#createVM").unbind().click(VM.createVM);
		VM.describleVM();
		
		VM.getTemplateList();
		VM.getOwnUserList();
		VM.getServiceOfferings();
		VM.getNetworkDefaultList();
		// 再创建一台虚拟机
		$(".create-another-server").click(function() {
			VM.wizard.reset();
			$(".wizard-back").hide();
		});
		$(".im-done").click(function() {
			VM.wizard.close();
		});
		$("#btnBackupSave").unbind("click").bind("click", function() {
			VM.backupVolume();
		});
		
		
	},
	// 新建
	createVM : function() {
		$("#instance_name").val('');
		$("#tipName").html('');
		$("#ownUserAccount").val('');
		if (VM.wizard == null) {
			VM.wizard = new com.skyform.component.Wizard("#wizard-createVM");
			VM.wizard.onLeaveStep = function(from, to) {
			// #3102 在向导的第一页隐藏【上一步】按钮
			   if(0 == to) {
				   $(".wizard-back").hide();
			   }else{
				   $(".wizard-back").show();
			   }
			};
			VM.wizard.onToStep = function(from, to) {
				// 基本信息
				if(2 == to) {
					var width = $("#bizType").width();
					width += 3;
					$("#ownUserAccount").css("width",width);
					$("#instance_name").css("width",width);
					// #3101 解决IE8浏览器，运维管理平台，新建云主机的时候，选择用户的时候，没有提示输入空格显示所有用户字样
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
					    }).blur();
					}
					//加载当前用户名下的所有未销毁云主机，验证是否重名
					$("#ownUserAccount").focus();
				}
				// 资源池信息
				if(4 == to) {
					var instanceName = $("#instance_name").val();
					var count = VM.createCountInput.getValue();
					var titleht = $("#headthree").html();
					var titlehf = $("#headfive").html();
					var nicsConfigObj = $("#nicsconfig");
					var tabObjStr = "";
					var tabHeadStr = "<ul id=\"mytab\" class=\"nav nav-tabs\">";
					var tabContentStr = "<div class=\"tab-content\">";
					var i=1;
					for(i=1; i<= count; i++) {
						var tabtitle = instanceName + "_" + i;
						tabContentStr += "<div class=\"tab-pane";
						if(1==i) {
							tabContentStr += " active";
						}
						tabContentStr += "\" id=\"home"+i+"\">";
						
						tabContentStr += "<h3 id=\"headthree\">"+titleht+"</h3>";
						
						tabContentStr += "<div class=\"cardNum\">";
								tabContentStr += "<h5 style=\"margin-left: 0px\" id=\"headfive\">";
								tabContentStr += titlehf;
								tabContentStr += "</h5>";
								//to fix bug [3426]
								tabContentStr += "<div class=\"options\">";
									tabContentStr += "<div class=\"types-options network-options selected\" data-value=\"1\" title=\""+tabtitle+"\">1</div>";
									tabContentStr += "<div class=\"types-options network-options \" data-value=\"2\" title=\""+tabtitle+"\">2</div>";
									tabContentStr += "<div class=\"types-options network-options \" data-value=\"3\" title=\""+tabtitle+"\">3</div>";
									tabContentStr += "<div class=\"types-options network-options \" data-value=\"4\" title=\""+tabtitle+"\">4</div>";
								tabContentStr += "</div>";
						tabContentStr += "</div>";
						tabContentStr += "<div class=\"wizard-input-section\">";
							tabContentStr += "<table class=\"network table\" id=\""+tabtitle+"\"  style=\"width:570px\">";
								tabContentStr += "<thead>";
									tabContentStr += "<tr>";
									tabContentStr += "</tr>";
								tabContentStr += "</thead>";
							tabContentStr += "</table>";
						tabContentStr += "</div>";
					tabContentStr += "</div>";
						tabHeadStr += "<li";
						if(1 == i) {
							tabHeadStr += " class=\"active\"";
						}
						tabHeadStr += "><a href=\"#home"+i+"\" data-toggle=\"tab\">"+tabtitle+"</a></li>";
					}
					tabHeadStr += "</ul>";
					tabContentStr += "</div>";
					var contenobj = tabHeadStr + tabContentStr;
					var content = $(contenobj);
					nicsConfigObj.text("");
					content.appendTo(nicsConfigObj);
					$(".options .types-options.network-options").unbind().click(
							function() {
							    var selStr = ".options .types-options.network-options[title="+$(this).attr("title")+"]";
								$(selStr).removeClass("selected");
								$(this).addClass("selected");
								VM.changeNetwork($(this).attr("title"),$(this).attr("data-value"));
							});
					// 默认显示1个网卡
					var c =0;
					for(c=1; c<=count; c++) {
						var _subMidIdStr = instanceName+"_"+c;
						var _selStr = ".options .types-options.network-options[title="+_subMidIdStr+"].selected";
						var _netNum = $(_selStr).attr("data-value");
						VM.changeNetwork(_subMidIdStr,_netNum);
						// 渲染样式
						var divIdSel = "#home"+c;
						$(divIdSel).css("left","30px");
						// 三级标题
						var heSel = divIdSel + " > h3";
						$(heSel).css("font-size","21px").css("line-height","30px").css("margin-bottom","2px").css("margin-top","0").css("color","inherit");
						// 五级标题
						var hfSel =  divIdSel + " > h5";
						$(hfSel).css("font-size","14px").css("line-height","20px").css("font-weight","400px").css("color","inherit");
					}
					
				}
				
			};
			VM.wizard.onFinish = function(from, to) {
				VM.createVMPost(VM.wizard);
			};
		}
		VM.wizard.reset();
		VM.wizard.render();
		$(".wizard-back").hide();
		$(".options .types-options.cpu-options").unbind().click(function() {
			$(".options .types-options.cpu-options ").removeClass("selected");
			$(this).addClass("selected");
		});
		$(".options .types-options.memory-options").unbind().click(
				function() {
					$(".options .types-options.memory-options ").removeClass("selected");
					$(this).addClass("selected");
				});
		$("div.osList").unbind().click(function() {
			$("div.osList").removeClass("selected");
			$(this).addClass("selected");
		});
		$("#ownUserAccount").typeahead({
			source : function(query, process) {
				process(VM.userAccountListData);
			},
			// # 2906   pre-scrollable  style="max-height: 200px;"
			items: 9998,
			menu: '<ul class="typeahead dropdown-menu"></ul>',
			matcher : function(item) {
				if ($.trim(this.query) + "" == "")
					return true;
				return item.indexOf(this.query) >= 0;
			},
			updater : function(item) {
				VM.userVMInfoListData = [];
				$(VM.infoData).each(function(index, i){
					if(item==$(i).attr("ownUserName")){
						var instanceName = $(i).attr("instanceName");
						VM.userVMInfoListData.push(instanceName);
					}
				});
				return item;
			},
			sorter : function(items) {
				return items;
			},
			highlighter : function(item) {
				return item;
			}
		});
		// 带+-的输入框
		if (VM.createCountInput == null) {
			var container = $("#createCount").empty();
			VM.createCountInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				// max : 1,
				defaultValue : 1,
				textStyle : "width:122px;height:21px;"
			});
			VM.createCountInput.render();
		}
		VM.createCountInput.reset();
		var cpuarr = VM.getCpuArr();
		VM.getCpuList();
		VM.getMemoryList(cpuarr[0]);
		VM.getClusterList();
	},
	// 创建虚拟机
	createVMPost : function(wizard) { 
		var oSDesc = $(".osList.selected span").text();
		var templateid = $(".osList.selected span").attr("value");
		var instanceName = $("#instance_name").val();
		var count = VM.createCountInput.getValue();
		var account = $("#ownUserAccount").val();
		var cpuNum = $(".cpu-options.selected").attr("data-value");
		var memorySize = $(".memory-options.selected").attr("data-value");
		var serviceofferingid = VM.getServiceOfferingId(cpuNum, memorySize);
		var ownUserId = VM.getOwnUserIdByAccount(account);
		var clusterId = $("#clusterList").val();
		var hostId = $("#hostList").val();
		var businessNameId = $("#bizType").val();//黑龙江二期   业务名称
		var nicsNumList = new Array();
		var nicsList = new Array();
		var n = 1;
		for(n=1; n<=count; n++) {
			var nicsArray = new Array();
			var subMidIdStr = instanceName+"_"+n;
			var selStr = ".options .types-options.network-options[title="+subMidIdStr+"].selected";
			var netNum = $(selStr).attr("data-value");
			var netNumData = {
					"netNum" : netNum
			};
			for ( var i = 1; i <= netNum; i++) {
				var vlan = $("#vlan-options-" + subMidIdStr + i).val();
				var ip = $("#ip-options-" + subMidIdStr + i).val();
				var vlandata = {
						"eVlanId" : vlan,
						"ip" : ip
				};
				nicsArray.push(vlandata);
			}
			nicsList.push(nicsArray);
			nicsNumList.push(netNumData);
		}
		// TODO 加入输入合法性校验
		var params = {
			"instanceName" : instanceName,
			"count" : count,
			"templateid" : templateid,
			"oSDesc" : oSDesc,
			"serviceofferingid" : serviceofferingid,
			"cpuNum" : cpuNum,
			"memorySize" : memorySize,
			"ownUserId" : ownUserId,
			"account" : account,
			"nicsList" : nicsList,
			"clusterId" : clusterId,
			"hostId" : hostId,
			"bizType" : businessNameId,
			"ownUserId" : ownUserId,
			"nicsNumList" : nicsNumList
		};
		Dcp.biz.apiRequest("/instance/vm/runInstances", params, function(data) {
			if (data.code == "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_create_vm_success','创建云主机成功')+"！");
				wizard.markSubmitSuccess();
				VM.describleVM();
				return true;
			} else {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_create_vm_failed','创建云主机失败')+"：" + data.msg);
				wizard.markSubmitError();
			}
		});
	},
	describleVM : function() {
		Dcp.biz.apiRequest("/instance/vm/describeInstances", {},
				function(dataa) {
					if(!dataa) {return};
					if (dataa.code != "0") {
						$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_search_vDisk_error','查询虚拟硬盘发生错误')+"：" + data.msg);
					} else {
						VM.infoData=dataa.data;
						VM.renderDataTable(dataa.data);
					}
				});
	},
	// 获取OS模板列表
	getTemplateList : function() {
		var params = {
			"id" : 0
		};
		Dcp.biz.apiRequest("/instance/vm/listTemplates", params,function(data) {
			if(!data){return};
			if (data.code != "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_search_osTemplate','查询OS模板发生错误')+"：" + data.msg);
			} else {
				var listtemplates = data.data;
				$(listtemplates).each(
						function(index, item) {
							var osList = "<div class='osList '>"
									+ "  <span value=" + item.id
									+ " class='text-left'><a href='#'>"
									+ item.name + "</a> </span>"
									+ "  </p>" + "</div>";
							$("#ostemplates").append(osList);
							if (index == 0) {
								$("div.osList").addClass("selected");
							}
						});
			}
		});
	},
	// 获取计算服务列表
	getServiceOfferings : function() {	
		var params = {
			"id" : 0
		};
		Dcp.biz.apiRequest("/instance/vm/listServiceOfferings", params,
				function(data) {
					if(!data){return};
					if (data.code != "0") {
						$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_search_computer_service_error','查询计算服务发生错误')+"：" + data.msg);
					} else {
						serviceOfferingsData = data.data;
					}
				});
	},
	//to fix bug [3098]
	getServiceOfferingsById : function() {
		//alert($("#virtualmachineid").val());
		var params = {
			"id" : 0,
			"virtualmachineid" : $("#virtualmachineid").val()
		};
		Dcp.biz.apiRequest("/instance/vm/listServiceOfferings", params,
				function(data) {
					if (data.code != "0") {
						$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_search_computer_service_error','查询计算服务发生错误')+"：" + data.msg);
					} else {
						serviceOfferingsDataById = data.data;
					}
				});
	},
	
	// 获取计算服务cpu数组
	getCpuArr : function() {
		var cpuArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (-1 == $.inArray(item.cpunumber, cpuArr)) {
				cpuArr.push(item.cpunumber);
			}
		});
		return cpuArr;
	},
	//to fix bug [3098]
	getCpuArrById : function() {
		var cpuArr = [];
		$(serviceOfferingsDataById).each(function(index, item) {
			if (-1 == $.inArray(item.cpunumber, cpuArr)) {
				cpuArr.push(item.cpunumber);
			}
		});
		return cpuArr;
	},
	
	// 获取计算服务cpu列表
	getCpuList : function() {
		var cpuArr = VM.getCpuArr();
		$("#cpu-options").empty();
		$(cpuArr).each(function(index, item) {
					var cpu_option = "<div onClick=\"VM.getMemoryList("
							+ item
							+ ")\" class=\"types-options cpu-options \" data-value="
							+ item + ">" + item + Dict.val('key_instance_core','核')+"</div>";
					$("#cpu-options").append(cpu_option);
					if (index == 0) {
						$("div.cpu-options").addClass("selected");
					}
		});
		$(".options .types-options.cpu-options").click(function() {
			$(".options .types-options.cpu-options ").removeClass("selected");
			$(this).addClass("selected");
		});
	},
	// 获取计算服务内存数组
	getMemoryArr : function(cpuNumber) {
		var memoryArr = [];
		var momorySize = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (cpuNumber == item.cpunumber && -1 == $.inArray(item.memory,momorySize)) {
				memoryArr.push(item);
				momorySize.push(item.memory);
			}
		});
		
		
		return memoryArr;
	},
	// 获取计算服务内存列表
	getMemoryList : function(cpuNumber) {
		var memoryArr = VM.getMemoryArr(cpuNumber);
		$("#memory-options").empty();
		$(memoryArr).each(function(index, item) {
							if (cpuNumber == item.cpunumber) {
								var memory_option = "";
								var memorySize = item.memory;
								if (memorySize >= 1024) {
									memorySize = memorySize / 1024;
									memory_option = "<div class=\"types-options memory-options \" data-value="
											+ item.memory
											+ "  >"
											+ memorySize
											+ "G</div>";
								} else {
										memory_option = "<div class=\"types-options memory-options \" data-value="
												+ item.memory
												+ "  >"
												+ memorySize
												+ "M</div>";
								}
									$("#memory-options").append(memory_option);
								if (index == 0) {
									$("div.memory-options").addClass("selected");
								}
							}
						});
		$(".options .types-options.memory-options").click(
				function() {
					$(".options .types-options.memory-options ").removeClass("selected");
					$(this).addClass("selected");
				});
	},
	// 获取计算服务id
	getServiceOfferingId : function(cpuNumber, memory) {
		var serviceOfferingId = 0;
		$(serviceOfferingsData).each(function(index, item) {
			if (cpuNumber == item.cpunumber && memory == item.memory) {
				serviceOfferingId = item.id;
			}
		});
		
		return serviceOfferingId;
	},
	// 获取所属用户列表
	getOwnUserList : function() {
		Dcp.biz.apiRequest("/user/describeUsers", null, function(data) {
			if(!data) {return};
			if (data.code != "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_userSearch_failed','查询用户发生错误')+"：" + data.msg);
			} else {
				userListData = data.data;
				$(userListData).each(function(index, item) {
					VM.userAccountListData.push(item.account);
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
	getNetworksArr : function() {
		var params = {
			"id" : 0,
			"isdefault" : 0,
		};
		Dcp.biz.apiRequest("/instance/vm/listNetworks", params, function(data) {
			if(!data) {return};
			if (data.code != "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_vlan_error','查询网卡vlan发生错误')+"："+ data.msg);
			} else {
				networksData = data.data;
			}
		});
	},
	// 获取默认网卡VLAN数组
	getNetworksDefaultArr : function() {
		var networkArr = [];
		if (typeof (networksData) === 'undefined' || networksData == null
				|| networksData.length == 0) {
			VM.getNetworksArr();
		}
		$(networksData).each(function(index, item) {
			if (item.isdefault == "null" || item.isdefault == "true") {
				networkArr.push(item);
			}
		});
		return networkArr;
	},
	// 获取非默认网卡VLAN数组
	getNetworksOtherArr : function() {
		var networkArr = [];
		if (typeof (networksData) === 'undefined' || networksData == null
				|| networksData.length == 0) {
			VM.getNetworksArr();
		}
		$(networksData).each(function(index, item) {
			if (item.isdefault == "null" || item.isdefault == "false") {
				networkArr.push(item);
			}
		});
		return networkArr;
	},
	// 多虚拟机-默认网卡列表
	getNetworkDefaultList : function(subIdStr, num) {
		var networkDefaultArr = VM.getNetworksDefaultArr();
		if (num >= 2) {
			networkDefaultArr = VM.getNetworksOtherArr();
		}
		$("#vlan-options-" + subIdStr + num).empty();
		$(networkDefaultArr).each(
				function(index, item) {
					var vlan_option = "<option value=" + item.id + ">"+ item.vlan + "</option>";
					$("#vlan-options-" + subIdStr + num).append(vlan_option);
				});
	},
	// 多虚拟机 addressId:存放网卡的列表,netWorkNum:有几块网卡
	changeNetwork : function(addressId,netWorkNum) {
		var adressId = "#" + addressId;
		$(adressId).empty();
		$(adressId).append("<thead>");
		for ( var i = 1; i <= netWorkNum; i++) {
			var vlanip = "<tr>"
					+ "<th>"+Dict.val('key_js_network','网卡')
					+ i
					+ " VLAN："
					+ "<select  name='vlan' onchange='VM.getIpAddressesByNetWorkList("
					+ addressId+","+i + ")'  id='vlan-options-" + addressId + i
					+ "' style='width:100px'>" + "</select>" + "</th>"
					+ "<th>IP：" + "<select  name='vlan'  id='ip-options-" + addressId + i
					+ "' style='width:150px'>" + "</select>" + "</th>";
			$(adressId).append(vlanip);
			VM.getNetworkDefaultList(addressId,i);
			VM.getIpAddressesByNetWorkList(addressId,i);
		}
		$(adressId).append("<thead>");
	},
	// 获取IP数组
	getIpAddressesByNetWorkArr : function(networkId) {
		var IpAddressesArr = [];
		var params = {
			"networkId" : networkId
		};
		Dcp.biz.apiRequest("/instance/vm/listIpAddressesByNetWork", params,
				function(data) {
					if (data.code != "0") {
						$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_search_Ip_error','查询网卡IP发生错误')+"：" + data.msg);
					} else {
						IpAddressesArr = data.data;
					}
				});
		return IpAddressesArr;
	},
	// 多虚拟机-获取IP列表
	getIpAddressesByNetWorkList : function(subIdStr,num) {
	    if('object' == typeof(subIdStr)) {
	    	subIdStr = subIdStr.id;
	    }
		var networkIdstr = $("#vlan-options-" + subIdStr + num).val();
		var ipAddressesArr = VM.getIpAddressesByNetWorkArr(networkIdstr);
		$("#ip-options-" + subIdStr + num).empty();
		$("#ip-options-" + subIdStr + num).append("<option value='' selected='selected'>"+Dict.val("key_js_choose_hint","请选择")+"</option>");
		$(ipAddressesArr).each(function(index, item) {
			var vlan_option = "<option value=" + item.ipaddress + ">"+ item.ipaddress + "</option>";
			$("#ip-options-" + subIdStr + num).append(vlan_option);
		});
	},
	// 获取CLUSTER数组
	getClusterArr : function(id, hypervisor) {
		var clusterArr = [];
		var params = {
			"id" : id,
			"hypervisor" : hypervisor
		};
		Dcp.biz.apiRequest("/instance/vm/listCluster", params, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_search_cluster_error','查询CLUSTER发生错误')+"：" + data.msg);
			} else {
				clusterArr = data.data;
			}
		});
		return clusterArr;
	},
	// 获取Host数组
	getHostsArr : function(id, clusterId) {
		var hostsArr = [];
		var params = {
			"id" : id,
			"clusterId" : clusterId
		};
		Dcp.biz.apiRequest("/instance/vm/listHosts", params, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_search_host_error','查询主机发生错误')+"：" + data.msg);
			} else {
				hostsArr = data.data;
			}
		});
		return hostsArr;
	},
	// 获取CLUSTER列表
	getClusterList : function() {
		$("#clusterList").empty();
		$("#clusterList").append("<option value='0' selected='selected'>"+Dict.val("key_js_choose_hint","请选择")+"</option>");
		var id = 0;
		var hypervisor = "";
		var clusterArr = VM.getClusterArr(id, hypervisor);
		$(clusterArr).each(function(index, item) {
			var vlan_option = "<option value=" + item.id + ">"+ item.name + "</option>";
			$("#clusterList").append(vlan_option);
		});
		$("#clusterList").trigger("change", VM.getHostList());
	},
	// 获取Host列表
	getHostList : function() {
		$("#hostList").empty();
		$("#hostList").append("<option value='0' selected='selected'>"+Dict.val("key_js_choose_hint","请选择")+"</option>");
		var id = 0;
		var clusterId = $("#clusterList").val();
		if (clusterId == null || clusterId == "0") {
			return;
		}
		var hostsArr = VM.getHostsArr(id, clusterId);
		$(hostsArr).each(function(index, item) {
			var vlan_option = "<option value=" + item.id + ">"+ item.name + "</option>";
			$("#hostList").append(vlan_option);
		});
	},
	renderDataTable : function(data) {
		if(VM.datatable !=null){
			VM.datatable.updateData(data);
			return
		}
		VM.datatable = new com.skyform.component.DataTable();
		//added by shixianzhi 2014-01-23  用于定义鼠标移入移出云主机IPVlan信息区域的触发事件
		var ipVlanJson = {};
		var IDS = [];
		
		VM.datatable
				.renderByData(
						"#tbody2",// 要渲染的table所在的jQuery选择器
						{
							"data" : data, // 要渲染的数据选择器
							/**
							 * 下面是对自己数据的描述,数组中有多少个数据就代表着有多少列
							 */
							"columnDefs" : [
									{
										title : '<input type="checkbox" name="all" id="checkAll">',
									}, {
										title : 'ID',
										name : 'id' // 对应数据列中的哪个字段？
									}, {
										title : Dict.val('key_instance_name','名称'),
										name : 'instanceName'
									}, {
										title : Dict.val('key_instance_state','状态'),
										name : 'state',
										attrs : [ {// 给标题加属性
													  name : '_id',
													  value : 'status'
												  },
												  {
													  name:"style",
													  value:"min-width:60px"
												  }
										]
									}, {
										title : Dict.val('key_instance_bizType','业务名称'),
										name : 'bizType',
										attrs:[
										       {name:"style",value:"min-width:60px"}
										       ]
									}, {
										title : 'IP(Vlan)',
										name : 'vethAdaptorIPs',
										attrs:[
										       {name:"style",value:"max-width:160px"}
										       ]
									}, {
										title : Dict.val('key_instance_create_data','创建时间'),
										name : 'createDate'
									}, {
										title : Dict.val('key_instance_user','所属用户'),
										name : 'ownUserName',
										attrs:[
										       {name:"style",value:"min-width:80px"}
										       ]
									}, {
										title : Dict.val('key_js_config_info','配置信息'),
										attrs:[
										       {name:"style",value:"min-width:300px"}
										       ]
									} ],
							"iDisplayLength" : 15,
							"onColumnRender" : function(columnIndex,
									columnMetaData, columnData) {
								var text = columnData['' + columnMetaData.name]|| "";
								if (columnIndex == 0) {
									text = '<input type="checkbox" name="check" id='+ columnData.id + '>';
								}
								/*if (columnMetaData.title == "ID") {
									 text = "<a href='../jsp/maintain/vmDetails.jsp?id="+text+"'>" + text + "</a>";
								 }*/
								if (columnMetaData.name == 'bizType') {
									try{
										text = VM.BizType(columnData.bizType);
									} catch (e){}
								}
								if (columnIndex == 3) {
									if (null == columnData.optState) {
										try {
											var state = eval('VM.VMState.'+ columnData.state);
											if (state != null)
												text = eval('VM.VMState.'+ columnData.state);
										} catch (e) {
										}
									} else {
										try {
											var state = eval('VM.VMState.'+ columnData.optState);
											if (state != null)
												text = eval('VM.VMState.'+ columnData.optState);
										} catch (e) {
										}
									}
								} else if (columnIndex == 5) {
									try {
										if (null != columnData.vethAdaptorIPs) {
											var ips = columnData.vethAdaptorIPs.split(",");
											text = "";
											for ( var i = 0; i < ips.length; i++) {
												var _ipv = ips[i];
												if("-(-)" == _ipv) {
													_ipv = " ";
												}
												text += _ipv + "</br>";
											}
											//added by shixianzhi 2014-01-23  用于定义鼠标移入移出云主机IPVlan信息区域的触发事件
											IDS.push('0'+columnData.id);
											ipVlanJson['0'+columnData.id] = text;
											text = text.split("(")[0];
											text = '<div id='+'0'+columnData.id+'>' + text + '</div>';
										}else{
											var text = "";
											IDS.push('0'+columnData.id);
											ipVlanJson['0'+columnData.id] = text;
											text = '<div id='+'0'+columnData.id+'>' + text + '</div>';
										}
											
									} catch (e) {
									}
								} else if (columnIndex == 6) {
									try {
										var obj = eval('(' + "{Date: new Date("
												+ columnData.createDate + ")}"
												+ ')');
										var dateValue = obj["Date"];
										text = dateValue.format('yyyy-MM-dd hh:mm:ss');
									} catch (e) {
									}
								} else if (columnIndex == 8) {
									try {
										var memoryText = "";
										var memory_M = columnData.memorySize;
										if(memory_M >= 1024) {
											memory_M = memory_M/1024;
											memory_M = Math.round(parseFloat(memory_M) * 10) / 10;
											memoryText = memory_M + "G";
										}else{
											memoryText = memory_M + "M";
										}
										/* *****************************************************************************/
										var appendText = columnData.cpuNum +Dict.val('CPU','CPU')+ "," + memoryText+","
										+ columnData.vethAdaptorNum+Dict.val("key_js_network","网卡")+","+columnData.osDesc;
										text =text + appendText;
									} catch (e) {

									}
								}
								return text;
							},
							"afterRowRender" : function(rowIndex, data, tr) {
								tr.attr("id",data.id);
								tr.attr("instanceName", data.instanceName);
								tr.attr("bizType", data.bizType);
								tr.attr("cpuNum", data.cpuNum);
								tr.attr("memorySize", data.memorySize);
								VM.bindEventForTr(rowIndex, data, tr);
							},
							"afterTableRender" : function() {
								var allCheckedBox = $("#tbody2 tbody input[type='checkbox']:checked");								
								if (allCheckedBox.length == 0){
									$("#checkAll[type='checkbox']").removeAttr("checked");   
									$("#moreAction").addClass("disabled");
								} 								
								if (allCheckedBox.length > 0){
									$("#checkAll[type='checkbox']").attr("checked",true);   
									$("#moreAction").removeClass("disabled");
								}
								
								//added by shixianzhi 2014-01-23  用于定义鼠标移入移出云主机IPVlan信息区域的触发事件 
								for(var i=0; i<IDS.length; i++){
									$("#"+IDS[i]+"").popover({
										'content'  :	ipVlanJson[""+ IDS[i] +""],
										'placement' :	'top',
										'trigger'   :	'manual'
									});
									$("#"+IDS[i]+"").mouseover(function(){
										$(this).popover("show");
									});
									$("#"+IDS[i]+"").mouseout(function(){
										$(this).popover("hide");
									});
								}
								
								VM.bindEvent();
							}

						});
		
		/*$("#0156").popover({
			'content'  :	ipVlanJson['0156'],
			'placement' :	'top',
			'trigger'   :	'manual'
		});
		$("#0156").mouseover(function(){
			$("#0156").popover("show");
		});
		$("#0156").mouseout(function(){
			$("#0156").popover("hide");
		});*/
		
		VM.datatable.addToobarButton("#toolbar4tbl");
	},
	bindEventForTr : function(rowIndex, data, tr) {
		//alert(data.eInstanceId);
		$(tr).attr("state", data.optState || data.state);
		$(tr).attr("name", data.instanceName);
		$(tr).attr("ownUserId", data.ownUserId);
		
		$(tr).unbind().mousedown(
				
				function(e) {
					if (3 == e.which) {
						//to fix bug [3098]
						$("#virtualmachineid").val(data.eInstanceId)
						VM.getServiceOfferingsById();
						$("#tbody2 input[type='checkbox']").attr("checked", false);
						$("#checkAll").attr("checked", false);
						tr.find("input[type='checkbox']").attr("checked", true);
						VM.checkedCheckbox = tr.find("td")[1].innerHTML;
						$("#moreAction").removeClass("disabled");
						document.oncontextmenu = function() {
							return false;
						};
						var screenHeight = $(document).height();
						var top = e.pageY;
						if (e.pageY >= screenHeight / 2) {
							top = e.pageY - $("#contextMenu").height();// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
						}
						$("#contextMenu").hide();
						$("#contextMenu").attr("style", "display: block; position: absolute; top:"+ top + "px; left:" + (e.pageX)+ "px; width: 180px;");
						$("#contextMenu").show();
						e.stopPropagation();
						VM.checkSelected(this);
					}
				});
		$(tr).click(function() {
			VM.checkboxClick(tr);
		});
	},
	bindEvent : function() {
		
		
		
		// 为table的右键菜单添加监听事件
		$("#contextMenu").unbind().bind('mouseover', function() {
			VM.inMenu = true;
		});
		$("#contextMenu").unbind().bind('mouseout', function() {
			VM.inMenu = false;
		});
		$("#contextMenu li").unbind().bind('mousedown', function(e) {
			$("#contextMenu").hide();
			if (!$(this).hasClass("disabled"))
				VM.onOptionSelected($(this).index());
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!VM.inMenu) {
				$("#contextMenu").hide();
			}
		});
		// 更改配置中添加点击div的效果
		$(".types-item .inner").unbind().click(function() {
			$(".types-item .inner span").removeClass("selected");
			$(this).find("span").addClass("selected");
		});
		$(".options .types-options.cpu-options").unbind().click(function() {
			$(".options .types-options.cpu-options ").removeClass("selected");
			$(this).addClass("selected");
		});
		$(".options .types-options.memory-options").unbind().click(function() {
			$(".options .types-options.memory-options ").removeClass("selected");
			$(this).addClass("selected");
		});
		$("div.osList").unbind().click(function() {
			$("div.osList").removeClass("selected");
			$(this).addClass("selected");
		});
		$("#checkAll").unbind().click(function(e) {
			e.stopPropagation();
			var checked = $(this).attr("checked") || false;
			$("#tbody2 input[type='checkbox']").attr("checked", checked);
			if ($("#tbody2 input[type='checkbox']:checked").length == 0) {
				$("#moreAction").addClass("disabled");
				VM.checkedCheckbox = null;
			} else {
				VM.checkSelected();
			}
		});
		// 挂载虚拟硬盘
		$("#attach_confirm").unbind("click").bind("click", function() {
			VM.attachVdiskVolume();
		});
	},
	checkboxClick : function(tr) {
		if ($("#tbody2 input[type='checkbox']:checked").length == 0) {
			$("#moreAction").addClass("disabled");
			VM.checkedCheckbox = "";
		} else
		{
			VM.checkSelected();
		}
	},
	checkSelected : function(rightClick) {
		
 
		
		$("#moreAction").removeClass("disabled");
		$("#moreAction").parent().find("li").removeClass("disabled");
		$("#moreAction").parent().find("li").unbind();
		$("#contextMenu li").unbind().bind('mousedown', function(e) {
			$("#contextMenu").hide();
			if (!$(this).hasClass("disabled"))
				VM.onOptionSelected($(this).index());
		});
		$("#dropdown-menu li").unbind('click').bind('click', function(e) {
			if (!$(this).hasClass("disabled"))
				VM.onOptionSelected($(this).index());
		});
		var numIsOneflag = true;
		var isStopedflag = false;
		var isRunningflag = false;
		var containsOtherflag = false;
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");
		if (allCheckedBox.length > 1) {
			numIsOneflag = false;
		}
		for ( var i = 0; i < allCheckedBox.length; i++) {
			var currentCheckBox = $(allCheckedBox[i]);
			if (i == 0) {
				VM.instanceName = currentCheckBox.parents("tr").attr("name");
				VM.checkedCheckbox = currentCheckBox.parents("tr").find("td")[1].innerHTML;
			} else {
				VM.instanceName += ","+ currentCheckBox.parents("tr").attr("name");
				VM.checkedCheckbox += ","+ currentCheckBox.parents("tr").find("td")[1].innerHTML;
			}
			if ($(allCheckedBox[i]).parents("tr").attr("state") == "closed")
				isStopedflag = true;
			else if ($(allCheckedBox[i]).parents("tr").attr("state") == "running")
				isRunningflag = true;
			else
				containsOtherflag = true;
		}
		if (!!!numIsOneflag) {
			VM.leftClickInterrupt($("#moreAction").parent().find("li#changeVM"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_modify_vmInfo_only','只能同时修改一个云主机的信息'));
			VM.leftClickInterrupt($("#moreAction").parent().find("li#changeEquipment"),Dict.val('key_instance_hint','提示'), Dict.val('key_js_modify_vmConfig_only','只能同时修改一个云主机的配置'));
			VM.leftClickInterrupt($("#moreAction").parent().find("li#loadVdisk"), Dict.val('key_instance_hint','提示'), Dict.val('key_js_mount_vDisk_only','只能同时为一个云主机加载虚拟硬盘'));
		}
		if (!!isRunningflag) {
			VM.leftClickInterrupt($("#moreAction").parent().find("li#openVM"),Dict.val('key_instance_hint','提示'), Dict.val('key_js_vmChoosed_runing','选中的云主机正在运行'));
			VM.leftClickInterrupt($("#moreAction").parent().find("li#changeEquipment"), Dict.val('key_instance_hint','提示'), Dict.val('key_js_shut_down_vm_first','必须首先关闭云主机'));
		}
		if (!!isStopedflag) {
			VM.leftClickInterrupt($("#moreAction").parent().find("li#closeVM"),Dict.val('key_instance_hint','提示'), Dict.val('key_js_vm_shut_down','选中的云主机已经关闭'));
			VM.leftClickInterrupt(
			$("#moreAction").parent().find("li#reopenVM"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_vm_shut_down','选中的云主机已经关闭'));
		}
		if (!!containsOtherflag) {
			VM.leftClickInterrupt($("#moreAction").parent().find("li#openVM"),Dict.val('key_instance_hint','提示'), Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			VM.leftClickInterrupt($("#moreAction").parent().find("li#closeVM"),Dict.val('key_instance_hint','提示'), Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			VM.leftClickInterrupt($("#moreAction").parent().find("li#reopenVM"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			VM.leftClickInterrupt($("#moreAction").parent().find("li#loadVdisk"), Dict.val('key_instance_hint','提示'), Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			VM.leftClickInterrupt($("#moreAction").parent().find("li#changeEquipment"), Dict.val('key_instance_hint','提示'), Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			$("#moreAction").parent().find("li#destroyVM").addClass("disabled");
		}
		var hidCount = 0;
		var li = $("#moreAction").parent().find("li");
		for ( var ii = 0; ii < li.length; ii++) {
			if ($(li[ii]).css('display') == "none")
				hidCount++;
		}
		if (hidCount > 6) {
			$("#moreAction").addClass("disabled");
		}
		// 修改右键弹出框
		$("#contextMenu").find("li").removeClass("disabled");
		if ($(rightClick).attr("state") == 'running') {
			VM.leftClickInterrupt($("#contextMenu").find("li.openVM"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_vmChoosed_runing','选中的云主机正在运行'));
			VM.leftClickInterrupt($("#contextMenu").find("li.changeEquipment"),Dict.val('key_instance_hint','提示'), Dict.val('key_js_shut_down_vm_first','必须首先关闭云主机'));
			VM.instanceName = $(rightClick).attr("name");
		} else if ($(rightClick).attr("state") == 'closed') {
			VM.leftClickInterrupt($("#contextMenu").find("li.closeVM"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_vm_shut_down','选中的云主机已经关闭'));
			VM.leftClickInterrupt($("#contextMenu").find("li.reopenVM"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_vm_shut_down','选中的云主机已经关闭'));
			VM.instanceName = $(rightClick).attr("name");
		} else {
			VM.leftClickInterrupt($("#contextMenu").find("li.openVM"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			VM.leftClickInterrupt($("#contextMenu").find("li.closeVM"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			VM.leftClickInterrupt($("#contextMenu").find("li.reopenVM"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			VM.leftClickInterrupt($("#contextMenu").find("li.loadVdisk"), Dict.val('key_instance_hint','提示'),Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			VM.leftClickInterrupt($("#contextMenu").find("li.changeEquipment"),Dict.val('key_instance_hint','提示'), Dict.val('key_js_vm_unOperate','云主机为不可操作状态'));
			$("#contextMenu").find("li.destroy").addClass("disabled");
			VM.instanceName = $(rightClick).attr("name");
		}
	},
	leftClickInterrupt : function(obj, title, str) {
		obj.addClass("disabled");
		obj.unbind().mousedown(function(e) {
			if (1 == e.which) {
				$.growlUI(title, str);
			}
		});
	},
	onOptionSelected : function(index) {
		{
			if (index == 0) {
				VM.modifyVMName(); // 修改
			} else if (index == 1) { // 启动
				VM.openVM();
			} else if (index == 2) {
				VM.closeVM(); // 关机
			} else if (index == 3) {
				VM.reopenVM(); // 重启
			} else if (index == 4) {
				VM.describeVDisk();
			} else if (index == 5) {
				VM.modifyVMConfiguration();
			} else if (index == 6) {
				VM.destroyVM(); // 销毁
			}
		}
	},
	//获取bizType列表
	getBizTypeList : function(){
		$("#bizType option").remove();
		var param = {
			"type"  : "COMBOX_BIZ_TYPE",
			"url"	: skyformoptURL + "/sysParameters/getParamCommentByKey.action"	
		};
		Dcp.biz.apiRequest('/parameters/getDicTypeAndComment', param, function(datas) {
			if(!datas) {return};
			if(datas.code="0"){
				VM.bizTypeData = datas.data;
				var nn = VM.bizTypeData.value;
				nn = nn.split('|');
				var comment = VM.bizTypeData.comment;
				comment = comment.split('|');
				for(var i=0; i < nn.length; i++){
					$("#bizType").append("<option value='" + nn[i] + "'>" + comment[i] + "</option>");
				}
			}
		});
	},
	//将bizType的value转换成comment
	BizType : function(bizTypeValue){
		var value = VM.bizTypeData.value.split("|");
		var comment = VM.bizTypeData.comment.split("|");
		var text = '';
		$(value).each(function(index, item){
			if(item == bizTypeValue){
				text = comment[index];
			}
		});
		return text;
	},
	getCheckedArr :function() {
		return $("#tbody2 tbody input[type='checkbox']:checked");
	},
	modifyVMName : function(id) {
		var content_en = '<div class="modal-body"> <form> <fieldset><font size="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			+ Dict.val("key_instance_name","名称") +'：</font>'
			+ '<input type="text" name="instance_name" id="updateName" maxlength="32"><font color=\'red\'>*</font><br/>'
			+ '<font size="4">'+Dict.val("key_instance_bizType","业务名称")
			+'：</font><select class="select" id="updateBizType"></select><font color=\'red\'>*</font> <br/>'
			+ '<font size="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Dict.val("key_instance_desc","描述")+'：</font>'
			+'<textarea cols="15" rows="2" id="updateComment" maxlength="100"></textarea> <br/><font size="2" color="red">*'
			+Dict.val("key_instance_input_hint","为必填项")+'</font></fieldset></form></div>';
		var content_zh = '<div class="modal-body"> <form> <fieldset><font size="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			+ Dict.val("key_instance_name","名称") +'：</font>'
			+ '<input type="text" name="instance_name" id="updateName" maxlength="32"><font color=\'red\'>*</font><br/>'
			+ '<font size="4">'+Dict.val("key_instance_bizType","业务名称")
			+'：</font><select class="select" id="updateBizType"></select><font color=\'red\'>*</font> <br/>'
			+ '<font size="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Dict.val("key_instance_desc","描述")+'：</font>'
			+'<textarea cols="15" rows="2" id="updateComment" maxlength="100"></textarea> <br/><font size="2" color="red">*'
			+Dict.val("key_instance_input_hint","为必填项")+'</font></fieldset></form></div>';
	if(Dict.val("key_instance_name","名称")=="名称"){
		if (VM.modifyVMNameModal == null) {
			VM.modifyVMNameModal = new com.skyform.component.Modal( new Date().getTime(), Dict.val('key_js_modify_vm','修改云主机'), content_zh,
					{
						beforeShow : function(){
							var oldName = VM.getCheckedArr().parents("tr").attr("instanceName");
							var oldBizType = VM.getCheckedArr().parents("tr").attr("bizType");
							var id = VM.getCheckedArr().parents("tr").attr("id");
							var parameter = {
									"id" : id
							};
							Dcp.biz.apiRequest("/instance/vm/queryDescriotion/"+id,parameter, function(data) {
								if(data.code == "0" ){
									$("#updateComment").val( data.data );
								}
							});
							$("#updateName").val(oldName);
							$("#updateBizType option").remove();
							var data = VM.bizTypeData;
							var nn = data.value;
							nn = nn.split('|');
							var comment = data.comment;
							comment = comment.split('|');
							for(var i=0; i < nn.length; i++){
								if(nn[i]==oldBizType){
									$("#updateBizType").append("<option value='" + nn[i] + "' selected='selected'>" + comment[i] + "</option>");
								}else {
									$("#updateBizType").append("<option value='" + nn[i] + "'>" + comment[i] + "</option>");
								}
							}
						},
						buttons : [
							{
								name : Dict.val('key_instance_sure','确定'),
								onClick : function() {
									var value = $("#updateName")[0].value;
									if (value == null || value == "") {
										alert(Dict.val('key_js_vm_name_null','云主机名称不能为空'));
										return;
									}
									//added by shixianzhi fix bug #3428
									var value1 = $.trim(value+"");
									if (value1 == null || value1 == ""){
										alert(Dict.val('key_js_vm_name_null','云主机名称不能为空'));
										return;
									};
									
									//added by shixianzhi fix bug #3382
									var oldName1 = VM.getCheckedArr().parents("tr").attr("instanceName");
									if(value==oldName1){
										//do nothing
									}else{
										var vmNameList = [];
										$(VM.infoData).each(function(index, i){
											var instanceName = $(i).attr("instanceName");
											vmNameList.push(instanceName);
										});
										for(var i=0; i<vmNameList.length; i++){
											var instanceName = vmNameList[i];
											if(value==instanceName){
												alert(Dict.val('key_js_name_duplicated_error','实例名称不允许重复'));
												return;
											}
										}
									}
									
									var parameter = {
										"id" : VM.checkedCheckbox,
										"instanceName" : $("#updateName")[0].value,
										"bizType" : $("#updateBizType").val(),
										"comment" : $("#updateComment")[0].value
									};
									
									
									Dcp.biz.apiRequest("/instance/vm/modifyInstanceAttributes",parameter, function(data) {
										$.growlUI(Dict.val('key_instance_hint','提示'),Dict.val('key_modify_success','修改成功'));});
									VM.modifyVMNameModal.hide();
									$("#updateData").click();
								},
								attrs : [ {
									name : 'class',
									value : 'btn btn-primary'
								} ]
							}, {
								name : Dict.val('key_instance_cancle','取消'),
								attrs : [ {
									name : 'class',
									value : 'btn'
								} ],
								onClick : function() {
									VM.modifyVMNameModal.hide();
								}
							} ]
				});

			var upwidth = $("#updateBizType").width();
			$("#updateBizType").css("width",(upwidth+9));
			$("#updateName").css("width",upwidth);
			$("#updateComment").css("width",upwidth);
		}
	}else{
		if (VM.modifyVMNameModal == null) {
			VM.modifyVMNameModal = new com.skyform.component.Modal( new Date().getTime(), Dict.val('key_js_modify_vm','修改云主机'), content_en,
					{
						beforeShow : function(){
							var oldName = VM.getCheckedArr().parents("tr").attr("instanceName");
							var oldBizType = VM.getCheckedArr().parents("tr").attr("bizType");
							var id = VM.getCheckedArr().parents("tr").attr("id");
							var parameter = {
									"id" : id
							};
							Dcp.biz.apiRequest("/instance/vm/queryDescriotion/"+id,parameter, function(data) {
								if(data.code == "0" ){
									$("#updateComment").val( data.data );
								}
							});
							$("#updateName").val(oldName);
							$("#updateBizType option").remove();
							var data = VM.bizTypeData;
							var nn = data.value;
							nn = nn.split('|');
							var comment = data.comment;
							comment = comment.split('|');
							for(var i=0; i < nn.length; i++){
								if(nn[i]==oldBizType){
									$("#updateBizType").append("<option value='" + nn[i] + "' selected='selected'>" + comment[i] + "</option>");
								}else {
									$("#updateBizType").append("<option value='" + nn[i] + "'>" + comment[i] + "</option>");
								}
							}
						},
						buttons : [
							{
								name : Dict.val('key_instance_sure','确定'),
								onClick : function() {
									var value = $("#updateName")[0].value;
									if (value == null || value == "") {
										alert(Dict.val('key_js_modified_name','请输入修改后的名称'));
										return;
									}
									//added by shixianzhi fix bug #3428
									var value1 = $.trim(value+"");
									if (value1 == null || value1 == ""){
										alert(Dict.val('key_js_modified_name','请输入修改后的名称'));
										return;
									};
									//added by shixianzhi fix bug #3382
									var oldName1 = VM.getCheckedArr().parents("tr").attr("instanceName");
									if(value==oldName1){
										//什么都不做
									}else{
										var vmNameList = [];
										$(VM.infoData).each(function(index, i){
											var instanceName = $(i).attr("instanceName");
											vmNameList.push(instanceName);
										});
										for(var i=0; i<vmNameList.length; i++){
											var instanceName = vmNameList[i];
											if(value==instanceName){
												alert(Dict.val('key_js_name_duplicated_error','实例名称不允许重复'));
												return;
											}
										}
									}
									
									var parameter = {
										"id" : VM.checkedCheckbox,
										"instanceName" : $("#updateName")[0].value,
										"bizType" : $("#updateBizType").val(),
										"comment" : $("#updateComment")[0].value
									};
									Dcp.biz.apiRequest("/instance/vm/modifyInstanceAttributes",parameter, function(data) {
										$.growlUI(Dict.val('key_instance_hint','提示'),Dict.val('key_modify_success','修改成功'));});
									VM.modifyVMNameModal.hide();
									$("#updateData").click();
								},
								attrs : [ {
									name : 'class',
									value : 'btn btn-primary'
								} ]
							}, {
								name : Dict.val('key_instance_cancle','取消'),
								attrs : [ {
									name : 'class',
									value : 'btn'
								} ],
								onClick : function() {
									VM.modifyVMNameModal.hide();
								}
							} ]
				});

			var upwidth = $("#updateBizType").width();
			$("#updateBizType").css("width",(upwidth+9));
			$("#updateName").css("width",upwidth);
			$("#updateComment").css("width",upwidth);
		}
		
	}
		VM.modifyVMNameModal.show();
	},
	getMemoryListForchange : function(cpuNumber){
	// #3088  新建与修改配置云主机界面CPU与内存显示不一致的问题，注释掉ss的判断条件
		var memoryArr = VM.getMemoryArr(cpuNumber);
		$("#myModal006change .memory .options").empty();
		$(memoryArr).each(function(index, item) {
							if (cpuNumber == item.cpunumber) {
								var memory_option = "";
								var memorySize = item.memory;
								if (memorySize >= 1024) {
									memorySize = memorySize / 1024;
									memory_option = "<div class=\"types-options memory-options \" data-value="
											+ item.memory
											+ "  >"
											+ memorySize
											+ "G</div>";
								} else {
										memory_option = "<div class=\"types-options memory-options \" data-value="
												+ item.memory
												+ "  >"
												+ memorySize
												+ "M</div>";
								}
								$("#myModal006change .memory .options").append(memory_option);
								if (index == 0) {
									$("div.memory-options").addClass("selected");
								}
							}
						});
		$("#myModal006change .memory .options .types-options.memory-options").click(
				function() {
					$("#myModal006change .memory .options .types-options.memory-options ").removeClass("selected");
					$(this).addClass("selected");
				});
	},
	modifyVMConfiguration : function(id) {

		VM.getServiceOfferingsById();
		VM.getServiceOfferingId();
		if (VM.modifyVMConfigurationModal == null) {
			//TODO
			//组装cpu memory 信息
			var cpu_option ="";
			//to fix bug [3098]
			var cpuArr = VM.getCpuArrById();
			$(cpuArr).each(function(index, item) {
				if (index == 0) {
					cpu_option += "<div onClick=\"VM.getMemoryListForchange("+ item+ ")\" class=\"types-options cpu-options selected\" data-value="+ item + ">" + item + Dict.val('key_instance_core','核')+"</div>";
				}else{
					cpu_option += "<div onClick=\"VM.getMemoryListForchange("+ item+ ")\" class=\"types-options cpu-options \" data-value="+ item + ">" + item + Dict.val('key_instance_core','核')+"</div>";
				}
				
	        });
			VM.modifyVMConfigurationModal = new com.skyform.component.Modal(
					new Date().getTime(),
					Dict.val('key_instance_host_config','更改主机的配置'),
					'<div class="modal-body" class="hide" id="myModal006change"><form><fieldset><div class="cpu">'
					+'<h5 style="margin-left: 0px">CPU</h5><div class="options">'+cpu_option
					+'</div></div><div class="memory"><h5>'
					+Dict.val("key_instance_memory","内存")+'</h5><div class="options">'
					+'</div></div></fieldset></form></div>',
					{
						buttons : [
							{
								name : Dict.val('key_instance_sure','确定'),
								onClick : function() {
									// #3100 变更相同配置不可以变更
									var old_cpu = VM.getCheckedArr().parents("tr").attr("cpuNum");
									var old_memory = VM.getCheckedArr().parents("tr").attr("memorySize");
									
									var cpu = $("#myModal006change").find(".cpu .selected").attr("data-value");
									var memory = $("#myModal006change").find(".memory .selected").attr("data-value");
									// 判断是否可以进行变更
									if(null != old_cpu && null != old_memory && old_cpu == cpu && old_memory == memory) {
										var old_memory_gm = "";
										var new_memory = "";
										if(old_memory >= 1024) {
											old_memory_gm = old_memory/1024;
											old_memory_gm = Math.round(parseFloat(old_memory_gm) * 10) / 10;
											old_memory_gm = old_memory_gm + "G";
										}else{
											old_memory_gm = old_memory + "M";
										}
										if(memory >= 1024) {
											new_memory = memory/1024;
											new_memory = Math.round(parseFloat(new_memory) * 10) / 10;
											new_memory = new_memory + "G";
										}else{
											new_memory = memory + "M";
										}
										var errmesg = Dict.val("key_js_hint_cpu1","提示：CPU变更前为[")+old_cpu+Dict.val("key_js_hint_cpu2","核],变更后为[")+cpu+Dict.val("key_js_hint_cpu3","核];内存变更前为[")+old_memory_gm+Dict.val("key_js_hint_cpu4","],变更后为[")+new_memory+Dict.val("key_js_hint_cpu5","]没有可进行变更的配置信息！");
										// 没有变更
										alert(errmesg);
										return;
									}
									var eServiceId = VM.getServiceOfferingId(cpu,memory);
									var parameter = {
										"id" : VM.checkedCheckbox,
										"cpuNum" : cpu,
										"memorySize" : memory,
										"eServiceId" : eServiceId
									};
									Dcp.biz.apiRequest("/instance/vm/modifyInstanceAttributes",parameter, function(data) {
														$.growlUI(Dict.val('key_instance_hint','提示'),Dict.val('key_operater_success','操作成功'));
													});
									VM.modifyVMConfigurationModal.hide();
									$("#updateData").click();
								},
								attrs : [ {
									name : 'class',
									value : 'btn btn-primary'
								} ]
							}, {
								name : Dict.val('key_instance_cancle','取消'),
								attrs : [ {
									name : 'class',
									value : 'btn'
								} ],
								onClick : function() {
									VM.modifyVMConfigurationModal.hide();
								}
						} ]
					});
			
			$("#myModal006change .cpu .options .types-options.cpu-options").click(function() {
				$("#myModal006change .cpu .options .types-options.cpu-options ").removeClass("selected");
				$(this).addClass("selected");
			});
			VM.getMemoryListForchange(cpuArr[0]);
		}
		VM.modifyVMConfigurationModal.show();
		$("#myModal006change").find(".options .types-options.cpu-options").click(
			function() {
				$("#myModal006change").find(".options .types-options.cpu-options ").removeClass("selected");
				$(this).addClass("selected");
				cpu = $(this).attr("data-value");
			});
		$("#myModal006change").find(".options .types-options.memory-options").click(
				function() {
					$("#myModal006change").find(".options .types-options.memory-options ").removeClass("selected");
					$(this).addClass("selected");
					memory = $(this).attr("data-value");
				});
	},
	destroyVM : function(id) {
		//获取当前页面选中的实例信息
		var names = "";
			VM.getCheckedInfo().each(function(i,v){
			   if(i==0){
			     names += $(v).parent().parent().attr("name");
			   }else{
			     names += ","+$(v).parent().parent().attr("name");
			   }
			});
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(),
				Dict.val("key_destory_vm","销毁云主机"),
				"<h4>"+Dict.val("key_js_destory_assure","您确认要销毁")+"&nbsp" +names + "?</h4>",
				{
					buttons : [
							{
								name : Dict.val('key_instance_sure','确定'),
								onClick : function() {
									Dcp.biz.apiRequest("instance/vm/terminateInstances/"
											+ VM.checkedCheckbox
												+ "/ok",{},
											function(data) {
												if(data.code!='0'){
													var errorMsg = data.msg;
													if(null != errorMsg && errorMsg.indexOf("[") == 0 && errorMsg.indexOf("]") > 1  ) {
														errorMsg = Dict.val('key_instance_destory_backup_no','以下ID号的云主机有备份不允许销毁') + errorMsg;
													}
													$.growlUI(Dict.val('key_instance_hint','提示'),errorMsg);
												}else{
													$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_operater_success','操作成功'));
													$("#updateData").click();
												}
									});
									confirmModal.hide();
							},
							attrs : [ {
								name : 'class',
								value : 'btn btn-primary'
							} ]
							}, {
								name : Dict.val('key_instance_cancle','取消'),
								attrs : [ {
									name : 'class',
									value : 'btn'
								} ],
								onClick : function() {
									confirmModal.hide();
								}
							} ]
				});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	closeVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
			new Date().getTime(), Dict.val('key_js_shut_down_vm','关闭云主机'), "<h4>"+Dict.val('key_js_shutDown_assure','您确认要关机吗')+"?</h4>", {
				buttons : [
					{
						name : Dict.val('key_instance_sure','确定'),
						onClick : function() {Dcp.biz.apiRequest("/instance/vm/stopInstances/"+ VM.checkedCheckbox, {},
								function(data) {
									$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_operater_success','操作成功'));
								});
						confirmModal.hide();
						$("#updateData").click();
					},
					attrs : [ {
						name : 'class',
						value : 'btn btn-primary',
					}
					]
				}, {
					name : Dict.val('key_instance_cancle','取消'),
					attrs : [ {
						name : 'class',
						value : 'btn'
					} ],
					onClick : function() {
						confirmModal.hide();
					}
				} ]
			});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.setTop(40);
		confirmModal.show();
	},
	openVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), Dict.val('key_start_vm','开启云主机'), "<h4>"+Dict.val('key_js_start_assure','您确认要开机吗')+"?</h4>", {
					buttons : [
						{
							name : Dict.val('key_instance_sure','确定'),
							onClick : function() {
								Dcp.biz.apiRequest("/instance/vm/startInstances/"+ VM.checkedCheckbox, {},function(data) {
									$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_operater_success','操作成功'));
								});
								confirmModal.hide();
								$("#updateData").click();
							},
							attrs : [ {
								name : 'class',
								value : 'btn btn-primary'
							} ]
						}, {
							name : Dict.val('key_instance_cancle','取消'),
							attrs : [ {
								name : 'class',
								value : 'btn'
							} ],
							onClick : function() {
								confirmModal.hide();
							}
						} ]
				});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.setTop(40);
		confirmModal.show();
	},
	reopenVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
			new Date().getTime(), Dict.val('key_js_vm_restart','重启云主机'), "<h4>"+Dict.val('key_js_restart_assure','您确认要重启吗')+"?</h4>", {
				buttons : [
				{
					name : Dict.val('key_instance_sure','确定'),
					onClick : function() {
						Dcp.biz.apiRequest("/instance/vm/restartInstances/"
							+ VM.checkedCheckbox, {},function(data) {
								$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_operater_success','操作成功'));
							});
						confirmModal.hide();
						$("#updateData").click();
					},
					attrs : [ {
							name : 'class',
							value : 'btn btn-primary'
						} ]
					}, {
						name : Dict.val('key_instance_cancle','取消'),
						attrs : [ {
							name : 'class',
							value : 'btn'
						} ],
						onClick : function() {
							confirmModal.hide();
						}
					} ]
		});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.setTop(40);
		confirmModal.show();
	},
	test : function() {
		var value = $("#updateName")[0].value;
		var commentvalue = $("#updateComment")[0].value;
		if (value == null || value == "") {
			alert(Dict.val('key_js_modified_name','请输入修改后的名称'));
		}
		if (value.length > 32) {
			alert(Dict.val('key_js_name_length','名称不能大于32个字符'));
		}
		if (commentvalue.length > 100) {
			alert(Dict.val('key_js_desc_length','描述不能大于100个字符'));
		}
	},
	// 显示虚拟硬盘备份MODAL
	showBackupVMModal : function() {
		$("#backupVolumeId").val(VM.checkedCheckbox);
		$("#backupVolumeName").val(VM.instanceName);
		$("#backupModal").modal("show");
	},
	//查询属于同一个用户下的可用(可挂载)虚拟硬盘信息   
	describeVDisk : function(){
		var vmId = VM.getCheckedInfo().attr("id");
		var ownUserId = VM.getCheckedInfo().parents("tr").attr("ownUserId");
		var params = {
				"id" : vmId,
				"targetOrAttached" : 1,
				"typesToAttach" : 2,
				"states" : "running",
				"ownUserId" : ownUserId
		};
		Dcp.biz.apiRequest("/instance/ebs/describeInstanceInfos", params, function(datas) {
			if (datas.code != "0") {
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_search_vm_error','查询可用虚拟硬盘发生错误')+"：" + datas.msg); 
			} else if(datas.data.length == 0){
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_no_vdisk_use','没有可用的虚拟硬盘')+"！"); 
		    } else {
		    	$("#myModal002").modal("show");
				if(null != VM.attachVolumnDataTable){
					VM.attachVolumnDataTable.updateData(datas.data);
				} else {
					VM.attachVolumnDataTable =  new com.skyform.component.DataTable();
					VM.attachDataTable(datas.data);
				}
			}
		});
	},
	//展现可挂载的虚拟硬盘信息 
	attachDataTable : function(data) {
		 VM.attachVolumnDataTable.renderByData("#mytable", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : '<input type="checkbox" name="all" id="checkAll1" style="width:25px">', name : "id"},
				     {title : "ID", name : "id"},
				     {title : Dict.val('key_instance_name','名称'), name : "instanceName"}
				],
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 //added by shixianzhi fix bug #3752
					 if(columnIndex ==0) {
						 text = "&nbsp<input type='checkbox' name='ownUserId' value=' "+text+" ' style='width:25px'>&nbsp&nbsp&nbsp" +
						 		"&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" +
						 		"&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
					 }
					 if(columnIndex ==1){
						 text = text + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" +
						 		"&nbsp&nbsp&nbsp";
					 }
					 
					 return text;
				},
				"afterRowRender" : function(index,data,tr){
					if(index == 0) {
						$(tr).find("input[type='radio']").attr("checked", "checked");
					}
				},
				//added by shixianzhi fix bug #3394
				"afterTableRender" : function() {
					$("#checkAll1").unbind().click(function(e) {
						var checked = $("#checkAll1").attr("checked") || false;
						$("#mytable input[type='checkbox']").attr("checked", checked);
					});
				}
			}
		);
	},
	//获得选中状态的云主机标签
	getCheckedInfo : function(){
		return $("#tbody2 tbody input[type='checkbox']:checked");
	},
	//云主机挂载虚拟硬盘逻辑
	attachVdiskVolume : function(){
		//获取虚拟硬盘挂载界面被选中虚拟硬盘的信息
		var checkedArr = $("#mytable input[type='checkbox']:checked");
		if (checkedArr.length != 0) {
			VM.volumeIds = "";
		}
		$(checkedArr).each(function(index, item) {
			VM.volumeIds += $.trim($(item).val());
			if (index < checkedArr.length - 1) {
				VM.volumeIds += ",";
			}
		});
		//获取云主机列表界面中被选中的云主机的信息
		var vmId = VM.getCheckedInfo().attr("id");
		//执行挂载操作
		var vdiskVolumeIds = VM.volumeIds;
		var params = {
				"volumeIds" : vdiskVolumeIds,
				"vmId" : vmId
		};
		Dcp.biz.apiRequest("/instance/vdisk/attachVdiskVolumes", params, function(data){
			if(data.code == "0"){
				$.growlUI(Dict.val('key_instance_hint','提示'), Dict.val('key_js_mount_vDisk_success','挂载虚拟硬盘成功')+"！"); 
				VM.describleVM();
			} else {
				$.growlUI(Dict.val('key_instance_hint','提示'), data.msg);
			}
			$("#myModal002").modal("hide");
		});
	}
	 
};
$(function() {
	VM.init();
});
