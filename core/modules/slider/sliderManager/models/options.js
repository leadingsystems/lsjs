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
		 *  str_containerSelector:
		 *      CSS selector to find elements that should be turned into sliders. Each
		 *      matched element's direct children become individual slides.
		 *
		 *  bln_lastSlideFilled:
		 *      if true and the last slide does not have enough content to fill the
		 *      visible area, the slider only scrolls to the point where the visible area
		 *      is still completely filled (prevents empty space on the right)
		 *
		 *  bln_mouseDragOnNonTouchDeviceActive:
		 *      true if the slider's drag-to-slide functionality should be active on
		 *      non-touch devices (mouse dragging)
		 *
		 *  float_minDragToSlide:
		 *      defines how far the user must drag before moving to the next slide.
		 *      Values between 0 and 1 are interpreted as a factor of the visible slider
		 *      width; values greater than 1 are interpreted as absolute pixel values.
		 *
		 *  float_slidingAnimationDuration:
		 *      duration in seconds for the sliding animation when moving between slides.
		 *      Decimal values are allowed.
		 *
		 *  bln_autoplayActive:
		 *      true if the slider should automatically cycle through slides
		 *
		 *  bln_autoplayStartInstantly:
		 *      true if autoplay should begin playing immediately; false if it starts
		 *      in a paused state
		 *
		 *  int_autoplayInterval:
		 *      time in milliseconds between automatic slide transitions
		 *
		 *  bln_autoplayPauseOnHover:
		 *      true if autoplay should pause when the pointer hovers over the slider
		 *
		 *  bln_dotNavigationActive:
		 *      true if a dot navigation (slide indicator dots) should be rendered
		 *
		 *  str_dotNavigationPosition:
		 *      'top' or 'bottom' to define where the dot navigation is placed in the DOM
		 *      relative to the slider
		 *
		 *  bln_dotNavigationUseImagesIfPossible:
		 *      true if the dots should be replaced with preview images (thumbnails) when
		 *      image content is available in the slides
		 *
		 *  int_dotNavigationMaxNumberOfSlides:
		 *      maximum number of slides for which the dot navigation is shown. If the
		 *      slider has more slides than this value, no dot navigation is rendered.
		 *
		 *  bln_showConsoleWarnings:
		 *      true if warnings should be logged in the developer console
		 */
		this.data = {
			el_domReference: null,
			str_containerSelector: '.lsjs-slider',
			bln_lastSlideFilled: true,
			bln_mouseDragOnNonTouchDeviceActive: true,
			float_minDragToSlide: 0.1,
			float_slidingAnimationDuration: 0.4,
			bln_autoplayActive: true,
			bln_autoplayStartInstantly: false,
			int_autoplayInterval: 4000,
			bln_autoplayPauseOnHover: true,
			bln_dotNavigationActive: true,
			str_dotNavigationPosition: 'bottom',
			bln_dotNavigationUseImagesIfPossible: true,
			int_dotNavigationMaxNumberOfSlides: 10,
			bln_showConsoleWarnings: true
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};