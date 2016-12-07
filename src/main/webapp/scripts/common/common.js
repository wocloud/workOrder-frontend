Dcp.namespace("Dcp.valuation");
Dcp.namespace("Dcp.biz");


Dcp.biz.apiRequest = function(cmd, params, cb) {
	Dcp.JqueryUtil.dalinReq('/pr/client?p=' + cmd, params, cb);
}
Dcp.biz.apiAsyncRequest = function(cmd, params, cb,errorCb) {
	Dcp.JqueryUtil.dalinAsyncReq('/pr/client?p=' + cmd, params, cb,errorCb);
}
Dcp.biz.getCurrentUser = function(cb,errorCb) {
	Dcp.JqueryUtil.dalinAsyncReq('/pr/getCurrentUser',null,function(data){
		//console.log(data);
		if(null!=data&&""!=data){
			var userInfo =  $.toJSON(data);				
			cb(data);
		}		
	},errorCb);
}
Date.prototype.format = function(format)
{
 var o = {
 "M+" : this.getMonth()+1, //month
 "d+" : this.getDate(),    //day
 "h+" : this.getHours(),   //hour
 "m+" : this.getMinutes(), //minute
 "s+" : this.getSeconds(), //second
 "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
 "S" : this.getMilliseconds() //millisecond
 }
 if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
 (this.getFullYear()+"").substr(4 - RegExp.$1.length));
 for(var k in o)if(new RegExp("("+ k +")").test(format))
 format = format.replace(RegExp.$1,
 RegExp.$1.length==1 ? o[k] :
 ("00"+ o[k]).substr((""+ o[k]).length));
 return format;
}