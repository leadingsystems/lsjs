var obj_classdef_model = {
	name: 'options',
	
	data: {},
	
	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 *
		 * Options:
		 *  str_selector:
		 *      CSS selector to find checkbox groups that should receive a "select all"
		 *      checkbox. When the "select all" checkbox is toggled, all checkboxes in
		 *      the group are checked or unchecked accordingly.
		 *
		 *  str_appliedClass:
		 *      CSS class added to each matched element once the module has been
		 *      initialized on it
		 */
		this.data = {
			str_selector: '.useAutomaticSelectAllCheckbox',
			str_appliedClass: 'automaticSelectAllCheckboxApplied'
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};