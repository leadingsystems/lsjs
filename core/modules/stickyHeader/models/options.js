var obj_classdef_model = {
	name: 'options',

	data: {
		str_stickyClass: 'sticky',

		str_selectorForElementToStick: 'header',
		str_selectorForElementToSaveSpace: 'body',

		bln_debug: false
	},

	start: function() {
	},

	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};