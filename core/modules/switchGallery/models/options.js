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
		 *  bln_debug:
		 *      activates console debug logging for this module
		 *
		 *  str_containerSelector:
		 *      CSS selector to find gallery container elements that should be enriched
		 *      with the switch gallery functionality (thumbnail-based image switching)
		 *
		 *  str_uniqueInstanceName:
		 *      unique identifier for this instance, used to distinguish multiple
		 *      switchGallery instances on the same page
		 *
		 *  str_classToSetWhenModuleApplied:
		 *      CSS class added to each matched container element once the module has
		 *      been initialized on it
		 */
		this.data = {
			el_domReference: null,
			bln_debug: false,
			str_containerSelector: '[data-lsjs-component~="switchGallery"]',
			str_uniqueInstanceName: 'switchGallery',
			str_classToSetWhenModuleApplied: 'switchGalleryApplied'
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};