(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,
	els_togglers: null,
	obj_classes: {
		general: 'ocFlex',
		standard: '',
		open: '',
		closed: ''
	},
	float_documentScrollY: 0,

	start: function() {
		this.el_body = $$('body')[0];

		this.obj_classes.standard = this.obj_classes.general + '-' + this.__models.options.data.str_uniqueInstanceName;
		this.obj_classes.open = this.obj_classes.general + 'Open-' + this.__models.options.data.str_uniqueInstanceName;
		this.obj_classes.closed = this.obj_classes.general + 'Closed-' + this.__models.options.data.str_uniqueInstanceName;

		/*
		 * We intentionally look for the togglers in the entire dom and not only inside the container because
		 * it must be possible to place togglers everywhere without any restrictions.
		 */
		this.els_togglers = $$(this.__models.options.data.str_ocTogglerSelector);

		if (this.els_togglers.length === 0) {
			console.error(str_moduleName + ': at least one toggler item is required but none was found with selector "' + this.__models.options.data.str_ocTogglerSelector + '"');
			return;
		}

		this.el_body.addClass(this.obj_classes.general);
		this.el_body.addClass(this.obj_classes.standard);
		this.el_body.addClass(this.obj_classes.closed);
		this.__el_container.addClass('closed');

		this.els_togglers.addEvent(
			'click',
			this.toggle.bind(this)
		);
	},

	toggle: function() {
		if (this.el_body.hasClass(this.obj_classes.closed)) {
			this.float_documentScrollY = document.documentElement.scrollTop;

			this.el_body.removeClass(this.obj_classes.closed);
			this.el_body.addClass(this.obj_classes.open);
			this.__el_container.removeClass('closed');
			this.__el_container.addClass('open');
		} else {
			document.documentElement.scrollTop = this.float_documentScrollY;

			this.el_body.addClass(this.obj_classes.closed);
			this.el_body.removeClass(this.obj_classes.open);
			this.__el_container.addClass('closed');
			this.__el_container.removeClass('open');
		}
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();