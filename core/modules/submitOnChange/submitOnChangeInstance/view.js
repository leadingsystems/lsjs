(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_form: null,
	el_btn_submit: null,

	start: function() {
		this.el_form = this.__el_container.getParent('form');
		this.el_btn_submit = this.el_form.getElement('[type="submit"]');

		if (typeOf(this.el_form) !== 'element') {
			console.warn('No parent form could be found for: ', this.__el_container);
			return;
		}

		if (typeOf(this.el_btn_submit) === 'element') {
			this.el_btn_submit.destroy();
		}

		this.__el_container.addEvent(
			'change',
			function() {
				this.el_form.submit();
			}.bind(this)
		)

	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();