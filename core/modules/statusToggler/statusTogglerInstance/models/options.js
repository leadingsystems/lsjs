var obj_classdef_model = {
	name: 'options',
	
	data: {
		str_eventType: 'click',
		str_propertyToToggle: 'data-lsjs-statusTogglerStatus',

		/*
		 * Important: Only string values are allowed as status values. If a status should be 8, it has to be defined as '8'.
		 * The first value in this array is the value that will be set initially.
		 * It is possible to define more than two status values in which case they will be looped over.
		 */
		arr_statusValue: ['off', 'on'],

		str_sessionStorageKey: null
	},
	
	start: function() {
		this.__module.onModelLoaded();
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
	}
};