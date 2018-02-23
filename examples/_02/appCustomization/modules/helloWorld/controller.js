(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
		console.log('customized controller works in module "' + str_moduleName + '"');
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

})();