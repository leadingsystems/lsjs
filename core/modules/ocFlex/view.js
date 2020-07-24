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
			closed: 'ocFlexClosed',
			keepSticky: 'keep-sticky'
		},
		specific: {
			standard: '',
			open: '',
			closed: ''
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
			if (this.__models.options.data.bln_debug) {
				console.warn(str_moduleName + ': at least one toggler item is required but none was found with selector "' + this.__models.options.data.str_ocTogglerSelector + '"');
			}
			return;
		}

		this.el_body.addClass(this.obj_classes.general.standard);
		this.el_body.addClass(this.obj_classes.specific.standard);

		this.els_togglers.addEvent(
			'click',
			this.toggle.bind(this)
		);
	},

	toggle: function(event) {
		if (event !== undefined) {
			/*
             * The toggler might be a hyperlink which should only be followed if JS isn't active.
             * Therefore we stop the click event.
             */
			event.stop();
		}

		if (this.el_body.hasClass(this.obj_classes.specific.open)) {
			window.ocFlexCloseCurrentlyOpen = null;

			this.el_body.addClass(this.obj_classes.general.closed);
			this.el_body.removeClass(this.obj_classes.general.open);
			this.el_body.addClass(this.obj_classes.specific.closed);
			this.el_body.removeClass(this.obj_classes.specific.open);
			this.__el_container.addClass('closed');
			this.__el_container.removeClass('open');
			this.els_togglers.addClass('closed');
			this.els_togglers.removeClass('open');
			document.documentElement.scrollTop = this.float_documentScrollY;
			this.el_body.setStyle('top', null);
			this.el_body.removeClass(this.obj_classes.general.keepSticky);

		} else {
			if (typeOf(window.ocFlexCloseCurrentlyOpen) === 'function') {
				window.ocFlexCloseCurrentlyOpen();
			}

			window.ocFlexCloseCurrentlyOpen = this.toggle.bind(this);

			this.el_body.addClass(this.obj_classes.general.keepSticky);

			this.float_documentScrollY = document.documentElement.scrollTop;

			this.el_body.setStyle('top', this.float_documentScrollY * -1);

			this.el_body.removeClass(this.obj_classes.general.closed);
			this.el_body.addClass(this.obj_classes.general.open);
			this.el_body.removeClass(this.obj_classes.specific.closed);
			this.el_body.addClass(this.obj_classes.specific.open);
			this.__el_container.removeClass('closed');
			this.__el_container.addClass('open');
			this.els_togglers.removeClass('closed');
			this.els_togglers.addClass('open');
		}
	},
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();