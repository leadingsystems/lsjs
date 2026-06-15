var obj_classdef_model = {
	name: 'options',

	data: {},

	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 *
		 * Options:
		 *  var_naviSelector:
		 *      CSS selector or DOM element for the navigation element whose submenus
		 *      should span the full width of the navigation container. Must match
		 *      exactly one element.
		 *
		 *  int_offsetLeft:
		 *      additional left offset in pixels applied to each submenu's positioning.
		 *      Positive values move the submenu further to the left, negative values
		 *      move it to the right.
		 *
		 *  int_offsetRight:
		 *      additional right offset in pixels applied to each submenu's positioning.
		 *      Positive values move the submenu further to the right, negative values
		 *      move it to the left.
		 *
		 *  bln_onlyFirstLevel:
		 *      true to apply the full-width behaviour only to first-level submenus
		 *      (.level_1 > .submenu). False to apply it to all nested submenus.
		 */
		this.data = {
			var_naviSelector: null,
			int_offsetLeft: 0,
			int_offsetRight: 0,
			bln_onlyFirstLevel: false
		};
	},

	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};