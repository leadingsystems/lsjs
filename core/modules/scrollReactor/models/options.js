var obj_classdef_model = {
	name: 'options',
	
	data: {
		arr_reactions: []
	},
	
	start: function() {
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};