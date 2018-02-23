(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		var el_renderedTemplate = this.tplPure({
			name: 'main'
		});

		$$('body')[0].adopt(el_renderedTemplate);
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();