(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
		lsjs[str_moduleName] = this.__view;
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.createModule({
	__name: str_moduleName
});

})();