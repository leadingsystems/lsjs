var obj_classdef_model = {
	name: 'loadingCounter',
	
	data: {
		numLoading: 0
	},

	start: function() {
		this.__module.onModelLoaded();
	},
	
	increase: function() {
		this.data.numLoading++;
	},
	
	decrease: function() {
		if (this.data.numLoading > 0) {
			this.data.numLoading--;
		}
	},
	
	getNumLoading: function() {
		return this.data.numLoading;
	}
};