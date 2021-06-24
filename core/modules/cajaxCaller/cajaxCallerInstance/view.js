(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		var str_options,
			obj_options = {},
			str_eventType;

		/*
		 * Only "form" elements and "a" elements are supported.
		 * If the container element itself is not a "form" or "a"
		 * element, we look for one of these inside the container.
		 */
		switch (this.__el_container.get('tag')) {
			case 'a':
				str_eventType = 'click';
				break;

			case 'form':
				str_eventType = 'submit';
				break;

			default:
				var el_alternativeInside = null;

				el_alternativeInside = this.__el_container.getElement('form:not(.skipCajaxCaller)');

				if (el_alternativeInside === null) {
					el_alternativeInside = this.__el_container.getElement('a:not(.skipCajaxCaller)');
				}

				if (el_alternativeInside === null) {
					return;
				}

				el_alternativeInside.setProperty('data-lsjs-cajaxCallerOptions', this.__el_container.getProperty('data-lsjs-cajaxCallerOptions'));

				this.__el_container = el_alternativeInside;

				this.start();
				return;
				break;
		}

		str_options = this.__el_container.getProperty('data-lsjs-cajaxCallerOptions');

		if (str_options) {
			obj_options = JSON.decode(str_options);
		}

		this.__models.options.set(obj_options);

		this.registerElements(this.__el_container, 'main', false);

		/* -->
		 * Prepare bound functions that are needed for events
		 */
		this.bound_makeCajaxRequest = this.makeCajaxRequest.bind(this);

		this.__el_container.addEvent(
			str_eventType,
			this.bound_makeCajaxRequest
		);
	},

	bound_makeCajaxRequest: null,
	makeCajaxRequest: function(event) {
		event.preventDefault();

		switch (this.__el_container.get('tag')) {
			case 'a':
				lsjs.loadingIndicator.__controller.show();

				new Request.cajax({
					url: this.__el_container.getProperty('href'),
					method: 'get',
					noCache: true,
					bln_doNotModifyUrl: this.__models.options.data.bln_doNotModifyUrl !== undefined && this.__models.options.data.bln_doNotModifyUrl,
					cajaxMode: this.__models.options.data.str_cajaxMode,
					data: 'cajaxRequestData=' + JSON.encode(this.__models.options.data.obj_cajaxRequestData),
					onComplete: function() {
						lsjs.loadingIndicator.__controller.hide();
					},
					onSuccess: function(els, str_html, str_script) {
						Browser.exec(str_script);
					}
				}).send();
				break;

			case 'form':
				lsjs.loadingIndicator.__controller.show();

				if (this.__el_container.getProperty('method') === 'get' || this.__el_container.getProperty('method') === 'GET') {
					console.warn('Forms using the "get" method are not yet supported by cajaxCaller. Form data will be sent as post data.')
				}

				new Request.cajax({
					url: this.__el_container.getProperty('action') ? this.__el_container.getProperty('action') : document.location,
					method: 'post',
					noCache: true,
					bln_doNotModifyUrl: this.__models.options.data.bln_doNotModifyUrl !== undefined && this.__models.options.data.bln_doNotModifyUrl,
					cajaxMode: this.__models.options.data.str_cajaxMode,
					el_formToUseForFormData: this.__el_container,
					// obj_additionalFormData: this.__models.options.data.obj_additionalFormData,
					obj_additionalFormData: {
						cajaxRequestData: JSON.encode(this.__models.options.data.obj_cajaxRequestData)
					},
					onComplete: function() {
						lsjs.loadingIndicator.__controller.hide();
					},
					onSuccess: function(els, str_html, str_script) {
						Browser.exec(str_script);
					}
				}).send();
				break;

			default:
				return;
				break;
		}
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();
