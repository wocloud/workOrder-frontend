package com.wocloud.oss.test;

import java.io.IOException;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.URISyntaxException;

import net.sf.json.JSONObject;

import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpRequest;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;


public class TestJson {

	public static void main(String args[]) throws IOException, URISyntaxException{
		String url = "http://localhost:9527/mcloud/api?response=json&command=createRole"
				+"&uuid=111111111111111124455566"
				+"&rolename=role100"
				+"&orgname=topcompany"
				+"&description=test001"
				+"&privileges=-1";
		
		url = "http://localhost:9527/mcloud/api?response=json&command=findUser"
		
				+"&username=ty_test1";
		
		
		
		
		url = "http://172.66.7.9:8585/v2/is/network/a3f1e445-37e9-419b-b3a0-8816aadfbfa1" ;
		
//		url = "http://172.66.6.105:9527/mcloud/api?&response=json&command=createRouter&name=Default01&isDefault=true";
//		
//		url = "http://172.66.6.105:9527/mcloud/api?&response=json&command=createNetwork&zoneId=2&name=DefaultNet20140723&displaytext=DefaultNet01&gateway=10.60.3.254&netmask=255.255.255.0&startip=10.60.3.1&endip=10.60.3.250&networkOfferingId=2&isDefault=true&resourcepoolid=1";
//		url = "http://172.66.6.105:9527/mcloud/api?&response=json&command=bindRouterToNetwork&virtualrouterid=fbcdda5d-4028-40b3-8c47-e0fbb29b3e57&networkId=6ebe34c8-0a8d-4bc4-9a8a-6aa1b7741d22";
//		url = "http://172.16.1.60:8585/v1/NM-xinyongyun/is/images" ;
//		url = "http://172.16.1.26:9527/mcloud/api?&response=json&command=listVirtualMachines";
//		url= "http://172.20.2.172:8080/monitorapi/monitor/topo/getDataCenterTopo";
//		url = "http://172.16.1.26:9527/mcloud/api?&response=json&&command=listHosts&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc&type=Routing";
//		url= "http://localhost:9527//mcloud/api?&response=json&command=createSecurityGroup&name=test100&description=test100";
//		url = "http://localhost:9527/mcloud/api?&response=json&command=syncX86HostInfo";
//		url = "http://localhost:9527/mcloud/api?&response=json&command=deployVirtualMachine&displayname=VM_67624994" +
//				"&ip=&osDisk=20&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc&serviceofferingid=b4ea2599-8f67-455f-8b65-de832f2f6162&templateid=0dc7ee30-9e57-4c49-8daf-a7162738d62b&zoneid=1";
//		url = "http://172.66.7.9:8585/v1/is/group-allnodes/4" ;
//		url = "http://172.66.6.105:9527/mcloud/api?response=json&command=quickDeployVirtualMachine&id=4&" +
//				"displayname=test&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc" +
//				"&vmofferingid=fdb13081-9cc3-4a9d-b7cd-c7995dce78b4&vmnum=1";
//	
//		
//		
//		url = "http://localhost:9527/mcloud/api?&response=json&command=listVirtualMachines";
//		
//		
//		
////		
//		
//		url = "http://172.16.1.60:8585/v1/is/volume/0d7b8217-c4d5-4366-becc-13e193ac7dfc" ;
//		
//		url = "http://172.20.2.172:8080/OBSMgr/useradmin/test";
//		
//		url = "http://172.20.2.172:8080/OBSMgr/obsmgr/useradmin/cloud12?pool=1";
		
		
		
//		url = "http://localhost:9527/mcloud/api?&response=json&command=deployVirtualMachineQuickly&displayname=VM_67624994" +
//				"&ip=&osDisk=20&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc" +
//				"&serviceofferingid=b4ea2599-8f67-455f-8b65-de832f2f6162" +
//				"&templateid=bdd444c1-b9a3-4937-a064-b36e6c3e3920&zoneid=1";
		
//		
//		url = "http://localhost:9527/mcloud/api?&response=json&command=deployVirtualMachine&displayname=VM_67624994" +
//				"&ip=&osDisk=20&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc&serviceofferingid=b4ea2599-8f67-455f-8b65-de832f2f6162&templateid=0dc7ee30-9e57-4c49-8daf-a7162738d62b&zoneid=1";
		
//		url = "http://172.66.6.105:9090/monitorapi/monitor/topo/getDataCenterTopo";
		
		
//		url = "http://localhost:9527/mcloud/api?response=json&command=createRouter"
//				+"&name=test&driver=vyatta";
//		url = "http://localhost:9527/mcloud/api?response=json&command=createLoadBalance"
//				+"&networkid=ce8b48bb-b468-42d3-9368-8b538a76d055&lbmethod=ROUND_ROBIN&protocol=HTTP&name=test1&driver=vyatta";
//		
//		url = "http://172.20.2.172:8080/cmdbapi/api/location/datacenter/list";
		
//		url = "http://172.16.1.26:9527/mcloud/api?command=listResourcePools";
//		
//		url = "http://172.16.1.26:9527/mcloud/api?command=listTemplates&&templatefilter=self";
//		
//		
//		
//		url = "http://localhost:9527/mcloud/api?&response=json&command=deleteRouter&id=5061aa95-e089-4026-b80d-dcb5c120ec2e" ;
		
//		url = "http://localhost:9527/mcloud/api?&response=json&command=bindRouterToNetwork&virtualRouterId=b837f5f0-58be-4fb5-aa09-d2894840cd72&networkId=ce8b3f6a-8e79-47e6-a3c6-537539a61ea9";
//		url = "http://localhost:9527/mcloud/api?command=deployVirtualMachine"
//				+"&zoneId=1"
//				+"&templateId=42"
//				+"&hypervisor=VMware"
//				+"&serviceOfferingId=37"
//		
//				+"&response=json";
		
		
//		Test.sendPost(url,"pageNumber=1&pageSize=10");
	//
//		String url = "http://localhost:9527/mcloud/api?response=json&command=createUser"
//				+"&tel=1234"
//				+"&email=t1@163.com"
//				+"&password=202cb962ac59075b964b07152d234b70"
//				+"&username=tyTest11"
//				+"&description=t1"
//				+"&roles=25";
		
//		url = "http://localhost:9527/mcloud/api?response=json&command=listPhysicalMachineOffering";
//		url = "http://localhost:9527/mcloud/api?response=json&command=listVirtualMachines&networkId=77e4a97d-db6b-4e33-9696-3d9f53f82906";
//		url = "http://172.16.1.26:9527/mcloud/api?response=json&command=createRole"
//				+"&uuid=111111111111111124455566"
//				+"&rolename=role1004"
//				+"&orgname=topcompany"
//				+"&description=test001"
//				+"&privileges=-1";
		
//		url = "http://172.66.6.113:9090/yweb/rest/role/createRole?response=json"
//				+"&uuid=111111111111111124455566"
//				+"&rolename=role1004"
//				+"&orgname=topcompany"
//				+"&description=test001"
//				+"&privileges=-1";
		
//		url = "http://172.66.6.105:9527/mcloud/api?&response=json&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc&command=quickDeployVirtualMachine&account=zhanghz&vmnum=1&vmofferingid=fdb13081-9cc3-4a9d-b7cd-c7995dce78b4";
//		url = "http://172.66.6.105:9527/mcloud/api?response=json&command=deployPhysicalMachine&name=PM_TEST_88_67572901" +
//				"&offeringid=a7468424-00f3-4bc3-80ee-8655c7dc08ac&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc&account=system"
//				;
//		url="172.66.6.105:9090/cmdbapi/api/physical/getPhysicalHostOfferingByUUID";
		
		
//		url="http://172.66.6.105:9527/mcloud/api?command=queryAsyncJobResult&jobid=f5b6108d-d2b9-4f61-990b-4649ef387e69" ;
		
		url="http://172.66.6.105:9527/mcloud/api?command=queryAsyncJobResult&jobid=88e7e2d5-0222-4ae9-a22b-970aee54b3f6" ;
		

		url = "http://localhost:9527/mcloud/api?&response=json&command=quickDeployVirtualMachine" +
				"&vmofferingid=d8403917-04ea-4357-a8aa-df1818fd82e7&resourcePoolId=b42f1000-f850-4651-80c0-fd537e1401dc" +
				"&vmnum=1&displayname=test&account=zhangkun";
		
		url="http://localhost:9527/mcloud/api?command=destroyVirtualMachine&id=153210fe-ea79-4bb9-bc36-e990d256c94e" ;
		
		url = "http://172.20.2.172:8080/wocloud.oss-3a/sys/user/listUserInfoByUName?userName=tiantian" ;
		
		url="http://localhost:9527/mcloud/api?command=updatePhysicalHostName&id=1fb8b9a1-2b0f-4dfd-84b8-6ec82a01f0db&instancename=test01" ;
		
		url="http://localhost:9527/mcloud/api?command=updateNetwork&id=7d6a501f-e8eb-403b-a799-7d12123269ab&instancename=test01" ;
		
		url = "http://172.66.6.105:9527/mcloud/api?&response=json&command=listVMStock&vmofferingid=81c2c7fb-b18b-4d45-a359-e16d3259c254&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc";
		
		url = "http://172.66.6.105:9527/mcloud/api?&response=json&name=%E8%BF%90%E7%BB%B4%E9%83%A8%E7%BD%91%E7%AE%A1%E7%9B%91%E6%8E%A7%E5%AD%98%E5%82%A8_%E9%82%A2%E9%91%AB_10174817&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc&command=createVolume" +
				"&account=ninghao&displaytext=%E8%BF%90%E7%BB%B4%E9%83%A8%E7%BD%91%E7%AE%A1%E7%9B%91%E6%8E%A7%E5%AD%98%E5%82%A8_%E9%82%A2%E9%91%AB_10174817&diskofferingid=1&size=1";
		
		url= "http://172.20.2.172:8080/OBSMgr/obsmgr/useradmin";
		
		
		url="http://172.66.6.105:9527/mcloud/api?&response=json&remoteipperfix=192.168.0.85&protocol=ip&portrangemax=" +
				"&securitygroupid=eb807314-a86e-4c9e-b198-6d94422363b3&direction=egress" +
				"&portrangemin=&command=createSecurityGroupRule&account=testxx";
		
		
		url="http://172.66.6.105:9527/mcloud/api?command=updatePhysicalHostName" +
				"&id=7c37e355-e41a-4866-a934-ba276dcb13ad&instancename=test01" ;
		
		
		
		
		url= "http://172.66.6.114:8080/OBSMGR/obsmgr/useradmin";
		
//		url = "http://172.20.2.172:8080/OBSMgr/obsmgr/useradmin/cloud12?pool=1";
//		url = "http://localhost:9527/mcloud/api?&response=json&command=deployVirtualMachine&displayname=VM_67624994" +
//				"&ip=&osDisk=20&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc" +
//				"&serviceofferingid=cc722d4e-2eb5-43af-b79a-eab10fed125d" +
//				"&templateid=bdd444c1-b9a3-4937-a064-b36e6c3e3920&zoneid=1";
//		url ="http://172.20.2.172:8080/mcloud/rest/coscallback";
//		url = "http://172.20.2.172:8080/monitorapi/monitor/perf/getVmOneHourPerfById";
		
//		url = "http://172.66.6.114:9527/mcloud/api?&response=json&command=quickDeployVirtualMachine" +
//				"&vmofferingid=d8403917-04ea-4357-a8aa-df1818fd82e7&resourcePoolId=fed39ff9-cf3f-4071-b6c5-c8556e7616d0" +
//				"&vmnum=1&displayname=test&account=zhangkun";
//		url = "http://172.66.6.114:9527/mcloud/api?&response=json&command=applyPublicIp" +
//				"&ipaddress=172.31.100.35&resourcePoolId=1";
		
		
		
//		url = "http://localhost:9527/mcloud/api?&response=json&command=deployVirtualMachine&displayname=test009_67624994" +
//				"&ip=&osDisk=20&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc&serviceofferingid=b4ea2599-8f67-455f-8b65-de832f2f6162&templateid=bdcfeb49-31e2-4514-bca5-ebe81df491f0&zoneid=1";
//		url="http://localhost:9527/mcloud/api?&response=json&bandwidthrx=11&bandwidthtx=11&virtualrouterid=23d26af1-01d1-48e8-a57f-14b897a7c3c2&command=changeBandwidth&account=online1";
//
//				url="http://localhost:9527/mcloud/api?command=queryAsyncJobResult&jobid=13148" ;
//		url = "http://localhost:9527/mcloud/api?&response=json&command=deployVirtualMachine&displayname=test009_67624994" +
//				"&ip=&osDisk=20&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc&serviceofferingid=b4ea2599-8f67-455f-8b65-de832f2f6162&templateid=bdcfeb49-31e2-4514-bca5-ebe81df491f0&zoneid=1";
		
		url = "http://172.66.7.9:8585/v2/is/network/a3f1e445-37e9-419b-b3a0-8816aadfbfa1" ;
		
		url = "http://172.66.6.114:9527/mcloud/api?&response=json&command=deployVirtualMachine&displayname=vmHZ1001-3_110278046" +
				"&ip=&osDisk=20&resourcepoolid=eef4e4ed-6849-4a81-878d-bb4d669f89f6&serviceofferingid=31f49dc4-d9e4-4211-bb8b-64685adca060&templateid=75dfc9f3-5012-48ce-a5ba-2585e30fba69&zoneid=1";
//		url="http://172.66.6.114:9527/mcloud/api?command=listResourcePools" ;
		
		url = "http://172.16.1.26:9527/mcloud/api?&response=json&command=deployVirtualMachine&displayname=test009_67624994" +
				"&ip=&osDisk=20&resourcepoolid=b42f1000-f850-4651-80c0-fd537e1401dc&serviceofferingid=b4ea2599-8f67-455f-8b65-de832f2f6162&templateid=d5884830-4758-439c-9aeb-306f8cdf2a29&zoneid=1";
//		url="http://localhost:9527/mcloud/api?command=updateNetwork&id=bc1ed109-7d8a-4dc0-83a2-48bbd85f8ea8&instancename=test01" ;
		
		
//		url="http://172.66.6.114:9527/mcloud/api?command=resetVirtualMachinePassword&id=9b1b8dec-6d6d-4db3-a1eb-c69aebfde18f&password=123456" ;
//		
//		url="http://172.66.6.114:9527/mcloud/api?command=stopVirtualMachine&id=969f088f-07a0-4b5d-afa5-5ee7bb847abf" ;
//		
//		url="http://172.66.6.114:9527/mcloud/api?command=resetVirtualMachinePassword&id=614de2fe-3530-4b8a-8754-d186e7a43ec4&password=123456" ;
//		
		url = "http://172.66.7.9:8585/v1/huhehaote/cml/monitor_data";
		
		url="http://172.20.2.172:8080/wocloud.oss-pxe/rest/deployHost";
		url="http://172.16.1.26:9527/mcloud?&command=startVirtualMachine&response=json&id=f9af75cc-8147-4af9-99fc-5bddba7e4df7&operationtype=update&logmenu=4201";
		
		url ="http://172.66.6.105:9666/wocloud.oss-pxe/rest/deployHost" ;
		ClientHttpRequest request =   
		new SimpleClientHttpRequestFactory().     
		createRequest(new URI(url), HttpMethod.POST);    
				//②设置请求头的内容类型头和内容编码（GBK）  
//		 		request.getHeaders().set("Accept", "text/plain");
//				request.getHeaders().set("Content-Type", "text/plain;charset=UTF-8");  
				request.getHeaders().set("Content-Type", "application/json;charset=utf-8");  
				//③以GBK编码写出请求内容体  
//				String jsonData = "{\"dataCenterId\":\"1\"}";  
				
//				String jsonData = "{\"type\":\"VM\",\"ids\":[\"5228cab3-e573-4b51-9e75-80820d39c45b\"]}";
				
//				String jsonData ="{\"type\":\"VM\",\"ids\":[\"83fd2afd-561b-4c56-ad2d-2f6c77941107\",\"b7d54aeb-76b5-4806-a8c8-733cb4f27458\",\"71f9a2d5-e203-4514-b975-1ce6d8343a02\",\"614de2fe-3530-4b8a-8754-d186e7a43ec4\",\"9b1b8dec-6d6d-4db3-a1eb-c69aebfde18f\",\"8637f345-c9fd-46ee-afac-1a3e10b87900\"]}";
				
//				String jsonData ="{\"templateId\": \"7\",\"ipmiIp\": \"192.168.1.2\",\"ipmiUsername\": \"admin\",\"ipmiPassword\": \"password\",\"mac\":\"aa:20:22:44:23\",\"hostName\": \"hosttest\",\"osPassword\": \"abc@123\",\"nics\": \"[{nicname:\"eth0\",ip:\"192.168.1.2\",gateway:\"192.168.1.1\",netmask:\"255.255.255.0\"}]\",\"pxeNic\":\"eth0\",\"hostUuid\": \"\",\"dns\": \"1.2.3.4\"";
//				String jsonData = "{\"name\":\"default1\",\"shared\":\"false\",\"pool_id\":\"1\"}";  
				
//				String jsonData = "{\"virtualrouterid\":\"5061aa95-e089-4026-b80d-dcb5c120ec2e\"" +
//						",\"networkid\":\"ce8b3f6a-8e79-47e6-a3c6-537539a61ea9\"}"; 
			
//				String jsonData = "allocated=1024&password=gaozzz00&pool=huhehaote&username=gaozzz";
//				
//				String jsonData = "{\"id\":\"00accd6a-e3a3-485e-8341-4881f3116774\",\"timeType\":\"DAY\",\"valueType\":\"AVG\",\"startTime\":\"2013-09-09\",\"endTime\":\"2013-09-09\",\"sessionKey\":\"123\",\"loginUser\":\"123\"}";  
//				String jsonData = "{\"id\":\"00accd6a-e3a3-485e-8341-4881f3116774\"}";  
				
				
				
//				
//				String jsonData = "{\"partial\":0,\"servers\":[{\"network_id\":\"2dc22ee5-d0e8-474b-91f4-cb4d6f7b9204\",\"flavor\":{\"cpu\":1,\"memory\":512,\"disk\":20},\"image\":\"ae2c8e9b-47b9-4e76-a668-0103ccd704f5\",\"scale\":2}]}" ;
				//④发送请求并得到响应
				String jsonData = "{"
		     +"\"templateId\": \"1\","
		     +"\"ipmiIp\": \"172.66.5.11\","
		     +"\"ipmiUsername\": \"ADMIN\","
		     +"\"ipmiPassword\": \"ADMIN\","
		     +"\"mac\":\"00:25:90:1A:F6:D8\","
		     +"\"hostName\": \"hosttest\","
		     +"\"osPassword\": \"abc@123\","
		     +"\"nics\": \"[{nicname:\\\"eth0\\\",ip:\\\"192.168.1.2\\\",gateway:\\\"192.168.1.1\\\",netmask:\\\"255.255.255.0\\\"}]\","
		     +"\"pxeNic\":\"eth0\","
		     +"\"hostUuid\": \"\","
		     +"\"dns\": \"8.8.8.8\""
		     +"}";
				
			jsonData = "{"
					 +"\"templateId\":\"1\","
					  +"\"ipmiIp\":\"172.66.5.11\","
					  +"\"ipmiUsername\":\"ADMIN\","
					  +"\"ipmiPassword\":\"ADMIN\","
					  +"\"mac\":\"00:25:90:1A:F6:D8\","
					  +"\"hostName\":\"test11\","
					  +"\"osPassword\":\"123456\","
					  +"\"nics\":\"[{gateway:\\\"192.168.1.1\\\",ip:\\\"192.168.1.125\\\",netmask:\\\"255.255.255.0\\\","
					  +"nicname:\\\"eht0\\\",dns:\\\"8.8.8.8\\\"}]\","
					  +"\"hostUuid\":\"13d595cf-118a-4a48-980d-6be477f085bd\","
					  +"\"pxeNic\":\"eth0\"}";
				
				
				System.out.println(jsonData);
				request.getBody().write(jsonData.getBytes("utf-8"));  
				ClientHttpResponse response = request.execute();
				System.out.println(response.getStatusText());  
				java.io.InputStream in = response.getBody() ;
				java.io.InputStreamReader reader = new java.io.InputStreamReader(in);
				java.io.BufferedReader breader = new java.io.BufferedReader(reader);
				String line = "" ;
				
				while( (line = breader.readLine())!=null){
					System.out.println(line);
//					JSONObject jObject = JSONObject.fromObject(line);
//					JSONObject jo = jObject.getJSONObject("finduserresponse");
//					JSONObject user = jo.getJSONObject("user");
//					System.out.println("---------------userId= "+user.getString("usercode"));
//			
//					JSONObject  jsonObject = new JSONObject(line);
//					jsonObject =(JSONObject)jsonObject.get("finduserresponse");
//			
//					jsonObject =  (JSONObject) jsonObject.get("user");
//					
//					System.out.println(jsonObject.getString("usercode"));  
				}
//				System.out.println(response.getBody()); 
				
				
				
				

	}

}
