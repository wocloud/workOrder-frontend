package com.wocloud.common.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.alibaba.fastjson.JSONObject;
import com.wocloud.common.util.http.APIHttpClient;


import com.wocloud.cas.WoCasClient;

@Controller  
@RequestMapping("") 
public class MenuController {

	private static final Logger logger = Logger.getLogger(MenuController.class);

	@Autowired
	private HttpServletRequest request;

	 /**
     * 根据当前用户获取menu List
     * @return menuJSON
     * @throws Exception
     */
    @RequestMapping(value = "/getMenu",method = RequestMethod.GET)
    public JSONObject getMenu() throws Exception
    {
        Map<String,String> map = new HashMap<String,String>();
        JSONObject obj = new JSONObject();
        String username = WoCasClient.getUserName(request);
        map.put("userName", username);
        try{
        	obj = APIHttpClient.commCall(map);
        }catch (Exception e)
        {
            e.printStackTrace();
            return obj;
        }
        return obj;
    }
    
}
