var obj_classdef_model = {
	name: 'options',
	
	/*
	 * Options (set via data-lsjs-cajaxCallerOptions attribute in HTML):
	 *  str_cajaxMode:
	 *      the CAJAX update mode. 'updateCompletely' replaces the entire target
	 *      area with the server response.
	 *
	 *  obj_cajaxRequestData:
	 *      object sent with the AJAX request as serialized JSON. Populated from the
	 *      data-lsjs-cajaxCallerOptions attribute on the DOM element. Typical
	 *      properties:
	 *        requestedElementClass: CSS class of the Contao element to request
	 *        requestedElementID:    ID of the Contao element to request
	 *        custom:                object with arbitrary key-value pairs for
	 *                               additional request parameters
	 *      IMPORTANT: Values must not be predefined here; they come from the HTML.
	 *
	 *  bln_doNotModifyUrl:
	 *      (not preset, set via data-lsjs-cajaxCallerOptions) when true, the
	 *      browser URL is not updated after the AJAX request completes
	 */
	data: {
		str_cajaxMode: 'updateCompletely',
		obj_cajaxRequestData: {}
	},
	
	start: function() {
		this.__module.onModelLoaded();
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
	}
};