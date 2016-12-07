'use strict';

/* Filters */
// need load the moment.js to use this filter. 
angular.module('app')
  .filter('fromNow', function() {
    return function(date) {
      return moment(date).fromNow();
    }
  })
  .filter('queryKey', function () {
      return function (collection, keyname) {  
          console.info(collection);  
          console.info(keyname);  
          var output = [],  
              keys = [];  
          angular.forEach(collection, function (item) {
        	  console.log(item);
              var key = item[keyname];  
              if (keys.indexOf(key) === -1) {  
                  keys.push(key);  
                  output.push(item);  
              }  
          });  
          return output;  
      }  
  });