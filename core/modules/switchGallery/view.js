(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		console.log(this.__el_container);
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();