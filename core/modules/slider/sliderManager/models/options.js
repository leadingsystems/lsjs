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

			str_sliderContainerSelector: '.lsSlider',

			/*
			 * If the last slide doesn't have enough content to fill the slider's visible area, only slide to the point where the whole visible area is still filled
			 */
			bln_lastSlideFilled: true,

			/*
			 * This value defines how far the user has to drag a slide in order to actually move to the next slide.
			 * Decimal values between 0 and 1 are interpreted as a factor multiplied with the visible slider width
			 * whereas any number greater than 1 is interpreted as an absolute pixel value
			 */
			float_minDragToSlide: 0.1,

            /*
             * This value defines how many seconds the sliding animation (i.e. moving from one slide to another) takes.
             * Decimal values are allowed.
             */
            float_slidingAnimationDuration: 0.4,

            /*
             * True if the autoplay functionality should be used
             */
            bln_autoplayActive: true,

            /*
             * The time in milliseconds between to slides in autoplay mode
             */
            int_autoplayInterval: 5000,

            /*
             * True if autoplay should pause when the pointer hovers the slider
             */
            bln_autoplayPauseOnHover: true
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};