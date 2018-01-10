var obj_classdef_model = {
	name: 'options',
	
	data: {},
	
	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 */
		this.data = {
			str_msg: this.__models.lang.data.str_standardMessage,
			obj_buttons: {
				default: {
					str_label: this.__models.lang.data.str_defaultButtonText,
					bln_closeOnClick: true
				}
			}
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};