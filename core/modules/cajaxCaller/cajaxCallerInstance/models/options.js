var obj_classdef_model = {
	name: 'options',
	
	data: {
		str_cajaxMode: 'updateCompletely',

		obj_cajaxRequestData: {
			/*
			 * This object has to be filled using the data-lsjs-cajaxCallerOptions parameter in the DOM element to be
			 * enhanced by this module.
			 * IMPORTANT: Values must not be predefined here!
			 *
			requestedElementClass: 'requestedClass',
			requestedElementID: 'requestedId',
			custom: {
				testkey1: 'value1',
				testkey2: 'value2'
			}
			*/
		}
	},
	
	start: function() {
		this.__module.onModelLoaded();
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
	}
};