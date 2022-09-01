/*
 * 
 * How to use this module:
 * 
 * With this functionality you can automatically add plus/minus buttons to numeric input fields.
 * When pressed, these increase or decrease the value of the input field
 * by the value specified in "Step" up to the respective limit value.
 * To activate the function simply provide the input fields with the class "useNumberStepper".
 * 
 * Now, all you have to do is to run this module to automatically apply the
 * functionality:
 * 
 * lsjs.__moduleHelpers.numberStepper.start();
 * 
 * If other Input Type=number groups are added to the page dynamically at a later point,
 * you can use
 * 
 * lsjs.__moduleHelpers.numberStepper.refresh();
 * 
 * in order to rescan the page and apply the functionality wherever necessary.
 * Input Type=number groups which already have the functionality are automatically skipped
 * in the refresh call.
 *
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
			console.warn('module ' + str_moduleName + ' has already been started');
			return;
		}
		
		this.self = lsjs.createModule({
			__name: str_moduleName
		});
		
		this.self.__models.options.set(obj_options);
	},
	
	refresh: function() {
		this.self.__view.addNumberStepperFunction();
	}
};

})();