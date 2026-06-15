var obj_classdef_model = {
	name: 'options',
	
	data: {},
	
	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 *
		 * Options:
		 *  el_domReference:
		 *      optional DOM element used as search scope for the selector. Only required
		 *      if module initialization happens inside a cajax_domUpdate event handler.
		 *      When null, the entire document is searched.
		 *
		 *  str_selector:
		 *      CSS selector to find elements that should be enriched with element folder
		 *      functionality. An element folder allows collapsing/expanding sections of
		 *      content with a toggler element (accordion-like behaviour). Each matched
		 *      element receives its own elementFolderInstance.
		 *
		 *  str_classToSetWhenModuleApplied:
		 *      CSS class added to each matched element once the module has been
		 *      initialized on it
		 */
		this.data = {
			el_domReference: null,
			str_selector: '[data-lsjs-component~="elementFolder"]',
			str_classToSetWhenModuleApplied: 'elementFolderApplied'
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};