/*
 * 
 * How to use this module:
 * 
 * If you have multiple checkboxes and want to automatically add an additional
 * checkbox with which all the others can be checked and unchecked at once,
 * simply wrap all your checkboxes in one container element (e.g. a div)
 * and give this container element the class "useAutomaticSelectAllCheckbox"
 * (or whatever is defined as the str_selector property in this module's options model).
 * 
 * Now, all you have to do is to run this module to automatically apply the
 * functionality:
 * 
 * lsjs.__moduleHelpers.automaticSelectAllCheckbox.start();
 * 
 * If other checkbox groups are added to the page dynamically at a later point,
 * you can use
 * 
 * lsjs.__moduleHelpers.automaticSelectAllCheckbox.refresh();
 * 
 * in order to rescan the page and apply the functionality wherever necessary.
 * Checkbox groups which already have the functionality are automatically skipped
 * in the refresh call.
 */

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
		 * Only allow one single instance of this module to be started!
		 */
		if (this.self !== null) {
			console.error('module ' + str_moduleName + ' has already been started');
			return;
		}
		
		this.self = lsjs.createModule({
			__name: str_moduleName
		});
		
		this.self.__models.options.set(obj_options);
	},
	
	refresh: function() {
		this.self.__view.addSelectAllCheckboxes();
	}
};

})();