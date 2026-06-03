var obj_classdef_model = {
	name: 'options',
	
	data: {},
	
	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 *
		 * Options:
		 *  str_msg:
		 *      the message text displayed inside the message box. Defaults to the
		 *      standard message from the lang model.
		 *
		 *  obj_buttons:
		 *      object defining the buttons shown in the message box. Each key is a
		 *      button identifier and its value is an object with:
		 *        str_label:       the button label text
		 *        bln_closeOnClick: true to close the message box when this button
		 *                          is clicked
		 *      Additional custom callbacks can be attached per button. The default
		 *      button simply closes the message box.
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