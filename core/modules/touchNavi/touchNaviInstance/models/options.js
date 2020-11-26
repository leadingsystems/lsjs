var obj_classdef_model = {
	name: 'options',

	data: {},

	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 */
		this.data = {
			var_touchableHyperlinkSelector: 'li > .submenu',
			str_classToSetForTouchedElements: 'touched',
			bln_useTouchBehaviourOnNonTouchDevices: false,
			bln_followLinkOnSecondTouch: false,
			bln_allowMultipleParallelTouches: true,
			bln_preTouchActiveAndTrailOnStart: true,
			bln_onlyHandleTouchOnTogglerElements: true,
			arr_pseudoElementForTogglerIdentification: ['before', 'after']
		};
	},

	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};