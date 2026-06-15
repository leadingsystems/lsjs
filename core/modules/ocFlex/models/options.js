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
		 *      optional DOM element used as search scope for selectors. Only required
		 *      if module initialization happens inside a cajax_domUpdate event handler.
		 *      When null, the entire document is searched.
		 *
		 *  bln_debug:
		 *      activates console warnings for missing elements or configuration problems
		 *
		 *  str_ocContainerSelector:
		 *      CSS selector for the off-canvas container element. Must match exactly one
		 *      element. Cannot be used together with str_ocContentSelector.
		 *
		 *  str_ocTogglerSelector:
		 *      CSS selector for the toggler element(s) that open/close the off-canvas
		 *      container. May match multiple elements.
		 *
		 *  str_ocContentSelector:
		 *      CSS selector for an element holding content that should be dynamically
		 *      moved to an auto-generated oc container when it is being opened and moved
		 *      back to its original position when the container is being closed. Must match
		 *      exactly one element. Cannot be used together with str_ocContainerSelector.
		 *
		 *  str_uniqueInstanceName:
		 *      each instance of this module must have a unique name to ensure that CSS
		 *      classes applied to wrapper elements (e.g. body) are specific. This allows
		 *      stylesheets to distinguish which of possibly multiple ocFlex instances is
		 *      currently open, closed or running.
		 *
		 *  str_classToSetWhenModuleApplied:
		 *      CSS class added to the container element once the module has been
		 *      initialized on it
		 *
		 *  bln_closeOnOutsideClick:
		 *      when true, clicking outside the off-canvas container automatically closes it
		 */
		this.data = {
			el_domReference: null,
			bln_debug: false,
			str_ocContainerSelector: '',
			str_ocTogglerSelector: '',
			str_ocContentSelector: '',
			str_uniqueInstanceName: '',
			str_classToSetWhenModuleApplied: 'ocFlexApplied',
			bln_closeOnOutsideClick: true
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};