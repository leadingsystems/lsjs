var obj_classdef_model = {
	name: 'options',

	data: {
		str_stickyClass: 'sticky',
		int_offset: 0,
		int_scrollDistanceToReappear: 0
	},

	start: function() {
	},

	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};