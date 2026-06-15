var obj_classdef_model = {
	name: 'options',
	
	/*
	 * Options:
	 *  str_eventType:
	 *      the DOM event that triggers the status toggle (e.g. 'click', 'mouseenter')
	 *
	 *  str_propertyToToggle:
	 *      the HTML attribute that will be set on the element to reflect its current
	 *      status. The value cycles through arr_statusValue on each toggle.
	 *
	 *  arr_statusValue:
	 *      array of string status values to cycle through. Only strings are allowed
	 *      (use '8' instead of 8). The first value is set initially. More than two
	 *      values are supported and will be looped over in order.
	 *
	 *  str_sessionStorageKey:
	 *      if set, the current status is persisted in sessionStorage under this key
	 *      and restored on page reload
	 *
	 *  bln_resetOtherElementsWithSamePropertyToToggle:
	 *      true to reset all other statusToggler elements that use the same
	 *      str_propertyToToggle back to their initial state when this element is
	 *      toggled. Useful for exclusive toggles (e.g. only one open sub-navigation
	 *      at a time).
	 *
	 *  bln_stopEvent:
	 *      true to call event.stop() on the toggle event. Prevents default browser
	 *      behaviour (e.g. following a link). Useful when a link serves as a toggler
	 *      with JavaScript but should navigate as a fallback without JavaScript.
	 */
	data: {
		str_eventType: 'click',
		str_propertyToToggle: 'data-lsjs-statusTogglerStatus',
		arr_statusValue: ['off', 'on'],
		str_sessionStorageKey: null,
		bln_resetOtherElementsWithSamePropertyToToggle: false,
		bln_stopEvent: false
	},
	
	start: function() {
		this.__module.onModelLoaded();
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
	}
};
