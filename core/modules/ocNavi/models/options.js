var obj_classdef_model = {
	name: 'options',
	
	data: {},
	
	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 */
		this.data = {
			str_togglerSelector: '#lsOcNaviToggler',
			str_naviSelector: '#lsOcNavi',
			str_contentSelector: ''
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};