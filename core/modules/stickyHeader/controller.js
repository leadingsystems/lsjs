(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

/*
 * Use like this:
 *
 * lsjs.__moduleHelpers.stickyHeader.start({str_stickyClass: 'sticky'});
 *
 * The object given as a parameter in this example can be omitted since the values in the example are used as default.
 */
var obj_classdef = {
	start: function() {
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.__moduleHelpers[str_moduleName] = {
	self: null,
	
	start: function(obj_options) {
		this.self = lsjs.createModule({
			__name: str_moduleName
		});
		
		this.self.__models.options.set(obj_options);
	}
};

})();