package com.wocloud.common.util.http;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import com.alibaba.fastjson.JSONObject;


public class APIHttpClient {
	static Log logger = LogFactory.getLog(APIHttpClient.class);
	static String url = "http://172.20.2.172:8080/commonCloud/pr/getMenu" ;
	// 通用调用
	public static JSONObject commCall(Map params) {

		logger.debug(params);

		StringBuilder sb = new StringBuilder("");

		try {

			DefaultHttpClient httpClient = new DefaultHttpClient();

			HttpGet getRequest = new HttpGet(dealURL(url, params));
			/*
			 * getRequest.addHeader("accept", "application/json;charset=UTF-8");
			 * getRequest.addHeader("content-type",
			 * "application/json;charset=UTF-8");
			 */
			logger.info("开始调用:" + getRequest.getURI());
			HttpResponse response = httpClient.execute(getRequest);
			logger.info("结束调用:" + getRequest.getURI());
			if (response.getStatusLine().getStatusCode() != 200) {
			}

			BufferedReader br = new BufferedReader(new InputStreamReader((response.getEntity().getContent()), "UTF-8"));

			String output = "";

			logger.debug("Output from Server .... \n");
			while ((output = br.readLine()) != null) {
				logger.debug(output);
				sb.append(output);
			}

			logger.debug("结果：" + sb.toString());

			httpClient.getConnectionManager().shutdown();

		} catch (ClientProtocolException e) {

			e.printStackTrace();
		
		} catch (IOException e) {

			e.printStackTrace();

		}
		return JSONObject.parseObject(sb.toString());

	}
	public static String dealURL(String url, Map params) {

		if (params.isEmpty())
			return url;

		StringBuilder sb = new StringBuilder(url);
		sb.append("?");
		Set keyset = params.keySet();
		Iterator it = keyset.iterator();
		while (it.hasNext()) {
			String key = (String) it.next();
			String value = new String();
			if (params.get(key) instanceof String) {
				value = (String) params.get(key);
			} else if (params.get(key) instanceof Integer) {
				value = Integer.toString((Integer) params.get(key));
			} else {

			}
			sb.append("&").append(key).append("=").append(value);
		}

		String ret = sb.toString().replaceAll(" ", "%20");
		logger.info("拼装后的URL：" + ret);
		// TestExam.setHttpurl(ret);
		return ret;
	}
	public static void main(String[] args){
		HashMap map = new HashMap();
		map.put("userName", "alladmin");
		APIHttpClient.commCall(map);
	}
}
