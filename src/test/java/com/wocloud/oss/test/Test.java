package com.wocloud.oss.test;

public class Test {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		String str ="[{\"ip\":\"192.168.1.125\",\"gateway\":\"192.168.1.1\",\"netmask\":\"255.255.255.0\",\"nicname\":\"test\",\"dns\":\"8.8.8.8\"}]";
		str = str.replaceAll("\"", "");
		str = str.replaceAll(":", ":\\\\\"");
		str = str.replaceAll(",", "\\\\\",");
		str = str.replaceAll("}", "\\\\\"}");
		System.out.println(str);
	}

}
