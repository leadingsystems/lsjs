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

		str_sessionStorageKey: null,

		/*
		 * If this option is set to true, if one status toggler element is clicked all other status toggler elements
		 * which use the same property to toggle (see the "str_propertyToToggle" option), will be set to their
		 * initial state. Example: You have some navigation elements and each one should open a sub-navigation on click.
		 * If one sub-navigation is opened, all others should be closed. This can be achieved by using the same
		 * property to toggle for all elements and the setting this option to true.
		 */
		bln_resetOtherElementsWithSamePropertyToToggle: false,

		/*
		 * With this option set to true, the event used to toggle will be stopped. This means that if an e.g. anchor
		 * element is used as a toggler and this option is set to true, the link will not be followed. This can be used
		 * if with activated javascript an element should be used as a toggler but with deactivated javascript a
		 * link should be followed as a fallback
		 */
		bln_stopEvent: false
	},
	
	start: function() {
		this.__module.onModelLoaded();
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
	}
};
