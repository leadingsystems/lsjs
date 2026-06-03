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
		 *  navtabContainerSelector:
		 *      CSS selector to find navtab container elements. A navtab provides
		 *      tabbed navigation where clicking a tab shows associated content.
		 *
		 *  defaultAutoplayStatus:
		 *      true if tabs should automatically cycle through their content on start
		 *
		 *  autoplayDelay:
		 *      time in milliseconds between automatic tab switches in autoplay mode
		 *
		 *  autoplayRandomOrder:
		 *      true to cycle through tabs in random order during autoplay
		 *
		 *  stopAutoplayOnMouseenter:
		 *      true to pause autoplay when the pointer enters the navtab container
		 *
		 *  startAutoplayOnMouseleave:
		 *      true to resume autoplay when the pointer leaves the navtab container
		 *
		 *  tweenOutOptions:
		 *      Mootools Fx options for the outgoing (hiding) tab animation.
		 *      See http://mootools.net/docs/core/Fx/Fx
		 *
		 *  tweenInOptions:
		 *      Mootools Fx options for the incoming (showing) tab animation.
		 *      See http://mootools.net/docs/core/Fx/Fx
		 *
		 *  cssClassForShow:
		 *      CSS class applied to the currently visible tab content
		 *
		 *  cssClassForHide:
		 *      CSS class applied to hidden tab content
		 */
		this.data = {
			el_domReference: null,
			navtabContainerSelector: '[data-lsjs-component~="navtab"]',
			defaultAutoplayStatus: false,
			autoplayDelay: 2000,
			autoplayRandomOrder: false,
			stopAutoplayOnMouseenter: false,
			startAutoplayOnMouseleave: false,
			tweenOutOptions: {
				transition: Fx.Transitions.Quad.easeIn,
				duration: 1000
			},
			tweenInOptions: {
				transition: Fx.Transitions.Quad.easeIn,
				duration: 1000
			},
			cssClassForShow: 'navtabContentShow',
			cssClassForHide: 'navtabContentHide'
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};