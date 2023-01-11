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

			str_containerSelector: '.lsjs-image-zoomer',

			/*
			 * If this parameter is set to null, the minimum zoom factor will be determined automatically
			 */
            float_minZoomFactor: null,

            float_maxZoomFactor: 1,

            float_zoomFactorStep: 0.1,

			/*
			 * If the elements found with str_containerSelector have this attribute all elements with the same value
			 * for this attribute will be considered to belong together and therefore the zoomer allows to jump from
			 * one zoomed image to the previous or next in the gallery set.
			 */
			str_attributeToIdentifyGallerySets: 'lsjs-data-image-zoomer-gallery-set',

            /*
             * True if warnings should be logged in the developer console
             */
            bln_showConsoleWarnings: true
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};