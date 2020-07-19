(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,
	els_togglers: null,
	obj_classes: {
		general: {
			standard: 'ocFlex',
			open: 'ocFlexOpen',
			closed: 'ocFlexClosed'
		},
		specific: {
			standard: 'ocFlex',
			open: 'ocFlexOpen',
			closed: 'ocFlexClosed'
		}
	},
	float_documentScrollY: 0,

	start: function() {
		this.el_body = $$('body')[0];

		this.obj_classes.specific.standard = this.obj_classes.general.standard + '-' + this.__models.options.data.str_uniqueInstanceName;
		this.obj_classes.specific.open = this.obj_classes.general.open + '-' + this.__models.options.data.str_uniqueInstanceName;
		this.obj_classes.specific.closed = this.obj_classes.general.closed + '-' + this.__models.options.data.str_uniqueInstanceName;

		/*
		 * We intentionally look for the togglers in the entire dom and not only inside the container because
		 * it must be possible to place togglers everywhere without any restrictions.
		 */
		this.els_togglers = $$(this.__models.options.data.str_ocTogglerSelector);

		if (this.els_togglers.length === 0) {
			console.error(str_moduleName + ': at least one toggler item is required but none was found with selector "' + this.__models.options.data.str_ocTogglerSelector + '"');
			return;
		}

		this.el_body.addClass(this.obj_classes.general.standard);
		// this.el_body.addClass(this.obj_classes.general.closed);
		this.el_body.addClass(this.obj_classes.specific.standard);
		// this.el_body.addClass(this.obj_classes.specific.closed);
		this.__el_container.addClass('closed');
		this.els_togglers.addClass('closed');

		this.els_togglers.addEvent(
			'click',
			this.toggle.bind(this)
		);
	},

	toggle: function() {
		if (this.el_body.hasClass(this.obj_classes.specific.open)) {
			window.setTimeout(
				function() {
					document.documentElement.scrollTop = this.float_documentScrollY;
				}.bind(this),
				5
			);

			this.el_body.addClass(this.obj_classes.general.closed);
			this.el_body.removeClass(this.obj_classes.general.open);
			this.el_body.addClass(this.obj_classes.specific.closed);
			this.el_body.removeClass(this.obj_classes.specific.open);
			this.__el_container.addClass('closed');
			this.__el_container.removeClass('open');
			this.els_togglers.addClass('closed');
			this.els_togglers.removeClass('open');
		} else {
			if (this.el_body.hasClass(this.__models.options.data.str_stickyBodyClass)) {
				/*
				 * Maintain the body's sticky class if necessary.
				 */
				window.setTimeout(
					function() {
						this.el_body.addClass(this.__models.options.data.str_stickyBodyClass);
					}.bind(this),
					this.__models.options.data.int_stickyBodyClassRestorationDelay
				);
			}

			this.float_documentScrollY = document.documentElement.scrollTop;

			this.el_body.removeClass(this.obj_classes.general.closed);
			this.el_body.addClass(this.obj_classes.general.open);
			this.el_body.removeClass(this.obj_classes.specific.closed);
			this.el_body.addClass(this.obj_classes.specific.open);
			this.__el_container.removeClass('closed');
			this.__el_container.addClass('open');
			this.els_togglers.removeClass('closed');
			this.els_togglers.addClass('open');
		}
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();