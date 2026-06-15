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
		 *      CSS selector to find elements that should be enriched with image zoom
		 *      functionality. Each matched element becomes a zoomable image.
		 *
		 *  float_minZoomFactor:
		 *      the minimum zoom level. If set to null, the minimum zoom factor is
		 *      determined automatically based on the image and container dimensions.
		 *
		 *  float_maxZoomFactor:
		 *      the maximum zoom level. A value of 1 means the image can be zoomed to its
		 *      native resolution. Values greater than 1 allow zooming beyond native size.
		 *
		 *  float_zoomFactorStep:
		 *      the increment/decrement for each zoom step (e.g. mouse wheel or pinch)
		 *
		 *  str_attributeToIdentifyGallerySets:
		 *      if elements found with str_containerSelector share the same value for this
		 *      HTML attribute, they are grouped into a gallery set. The zoomer then allows
		 *      navigating between images in the same set (previous/next).
		 *
		 *  bln_showConsoleWarnings:
		 *      true to log warnings in the developer console (e.g. when elements are not
		 *      found or configuration issues occur)
		 */
		this.data = {
			el_domReference: null,
			str_containerSelector: '.lsjs-image-zoomer',
			float_minZoomFactor: null,
			float_maxZoomFactor: 1,
			float_zoomFactorStep: 0.1,
			str_attributeToIdentifyGallerySets: 'lsjs-data-image-zoomer-gallery-set',
			bln_showConsoleWarnings: true
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};