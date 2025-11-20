var obj_classdef_model = {
	name: 'options',

	data: {},

	start: function() {
        /*
         * Initializing the options in the data object with default values which
         * can later be overwritten when the "set" method is called with other options
         *
         * Options:
         *  bln_useTouchBehaviourOnNonTouchDevices (true): adds class 'bln_useTouchBehaviourOnNonTouchDevices' and opens the submenu only after a click
         *  bln_followLinkOnSecondTouch: ???
         *  bln_allowMultipleParallelTouches: ???
         *  bln_allowMultipleParallelTouches: zwei Menüs simultan offen
         *  bln_preTouchActiveAndTrailOnStart: Navigation nach dem Laden der Seite offen
         *  bln_onlyHandleTouchOnTogglerElements: ???
         *  bln_untouchOnOutsideClick: ???
         */
		this.data = {
			var_touchableHyperlinkSelector: 'li > .submenu',
			str_classToSetForTouchedElements: 'touched',
			bln_useTouchBehaviourOnNonTouchDevices: false,
			bln_followLinkOnSecondTouch: false,
			bln_allowMultipleParallelTouches: true,
			bln_preTouchActiveAndTrailOnStart: true,
			bln_onlyHandleTouchOnTogglerElements: true,
			bln_untouchOnOutsideClick: false,
			arr_pseudoElementForTogglerIdentification: ['before', 'after']
		};
	},

	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};