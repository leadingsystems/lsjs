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
			navtabContainerSelector: '[data-lsjs-component~="navtab"]', // the selector for the dom element containing the navtab
			defaultAutoplayStatus: false, // true if the autoplay should start automatically
			autoplayDelay: 2000, // the time between to tabs in autoplay mode (milliseconds)
			autoplayRandomOrder: false, // use a random tab order in autoplay mode

			stopAutoplayOnMouseenter: false, // does just what the option name suggests
			startAutoplayOnMouseleave: false, // does just what the option name suggests

			tweenOutOptions: { // the mootools Fx options (see http://mootools.net/docs/core/Fx/Fx)
				transition: Fx.Transitions.Quad.easeIn,
				duration: 1000
			},

			tweenInOptions: { // the mootools Fx options (see http://mootools.net/docs/core/Fx/Fx)
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