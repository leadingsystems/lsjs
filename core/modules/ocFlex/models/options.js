var obj_classdef_model = {
	name: 'options',
	
	data: {},
	
	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 */
		this.data = {
			el_domReference: null,
			bln_debug: false, // true to activate debug logging
			str_ocContainerSelector: '', // This selector must only match exactly one element
			str_ocTogglerSelector: '', // This selector may match multiple elements

			/*
			 * Each instance of this module must have a unique instance name to make sure that classes
			 * that will be applied to wrapper elements (e.g. the body) are really specific because it is
			 * important for stylesheets to know which of possibly multiple ocFlex elements is currently
			 * being open or closed or running
			 */
			str_uniqueInstanceName: '',
			str_classToSetWhenModuleApplied: 'ocFlexApplied'
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};