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
			selector: '.lsZoom a img',
			func_beforeInit: null,
			func_afterInit: null,
			func_beforePositionDetection: null,
			func_afterPositionDetection: null,
			bigBoxFitsThumb: false,
			bigBoxContainerSelector: '',
			bigBoxSize: {
				x: 400,
				y: 200
			},
			bigImageUrlAttribute: 'href', // defines which attribute holds the url of the big image, defaults to href
			useAnchorElement: true, // defines whether the bigImageUrlAttribute will be checked for the image itself or it's parent anchor element 
			side: 'right', // left, right, top or bottom
			offset: {
				x: 10,
				y: 10
			} // offset in px
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};