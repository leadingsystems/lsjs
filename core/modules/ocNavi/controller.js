(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.__moduleHelpers[str_moduleName] = {
	self: null,

	start: function(obj_options) {
		/*
		 * Look for the required container element
		 */
		var el_container = $$('[data-lsjs-component~="ocNavi"]')[0];
		if (typeOf(el_container) !== 'element') {
			console.error('ocNavi container could not be found.');
		}

		this.self = lsjs.createModule({
			__name: str_moduleName,
			__el_container: el_container
		});

		this.self.__models.options.set(obj_options);
	}
};

})();