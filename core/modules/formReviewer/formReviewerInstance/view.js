(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	els_allFormFields: null,

	start: function() {
		this.getAllFormFields();
		if (this.els_allFormFields.length > 0) {
			this.initializeOpenCloseFunctionality();
		}
	},

	getAllFormFields: function() {
		this.els_allFormFields = new Elements();
		Array.prototype.push.apply(this.els_allFormFields, this.__el_container.getElements('input'));
		Array.prototype.push.apply(this.els_allFormFields, this.__el_container.getElements('select'));
		Array.prototype.push.apply(this.els_allFormFields, this.__el_container.getElements('textarea'));
	},

	initializeOpenCloseFunctionality: function() {
		var el_renderedTogglerTemplate = this.tplPure({
			name: 'editToggler'
		});

		el_renderedTogglerTemplate.inject(this.__el_container, 'top');



		/*
		 * Close or open the form initially, based on whether or not data is valid
		 */
		if (
			this.__el_container.getProperty('data-misc-close-form-initially') == '1'
			&&	this.__el_container.getElement('.error') === null
		) {
			this.closeForm();
		}

		this.__autoElements.editToggler.openFormToggler.addEvent(
			'click',
			this.openForm.bind(this)
		)
	},

	closeForm: function() {
		this.els_allFormFields.setProperty('disabled', true);
		this.__el_container.addClass('formClosed');
	},

	openForm: function() {
		this.els_allFormFields.setProperty('disabled', false);
		this.__el_container.removeClass('formClosed');
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();