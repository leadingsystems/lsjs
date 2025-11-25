var obj_classdef_model = {
	name: 'options',

	data: {},

	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 *
         * Options:
         *  bln_useTouchBehaviourOnNonTouchDevices:
         * 		every link needs to be touched instead of just hovering over it
         *
         *  bln_followLinkOnSecondTouch:
         * 		allows the browser to follow the hyperlink on a second tap if the element is already marked as touched
         *
         *  bln_allowMultipleParallelTouches:
         * 		allows several menu branches to stay open in parallel; when false the current branch closes its
         * 		siblings/children, works for touch devices and nontouch devices
         *
         *  bln_preTouchActiveAndTrailOnStart:
         * 		automatically touches links with class 'active' or 'trail' right after initialization so their submenus
         * 		start opened
         *
         *  bln_onlyHandleTouchOnTogglerElements:
         * 		When set to true, the touch logic is restricted to elements that act as togglers.
		 *		An element is considered a toggler only if it matches one of the pseudo elements
		 *		defined in arr_pseudoElementForTogglerIdentification. If this option is false,
		 *		the touch logic will apply to all elements regardless of their pseudo elements.
		 *
         *  bln_untouchOnOutsideClick:
         * 		listens for clicks outside the navigation and removes the
         *      touched state everywhere when such a click happens
         *
         * arr_pseudoElementForTogglerIdentification:
         *		Defines the pseudo elements used to detect whether a touched element should
         *		be treated as a toggler. These selectors are only taken into account when
         *		bln_onlyHandleTouchOnTogglerElements is set to true. If an element matches
         *		any of the configured pseudo elements, it is considered a valid toggler for
         *		touch interaction handling.
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