(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,
	el_content: null,
	els_togglers: null,
	obj_classes: {
		general: {
			standard: 'ocFlex',
			open: 'ocFlexOpen',
			closed: 'ocFlexClosed',
			// keepSticky: 'keep-sticky'
		},
		specific: {
			standard: '',
			open: '',
			closed: ''
		}
	},
	float_documentScrollY: 0,

	bln_isExternalContentSituation: false,

	start: function() {
		this.el_body = $$('body')[0];
		this.obj_classes.specific.standard = this.obj_classes.general.standard + '-' + this.__models.options.data.str_uniqueInstanceName;
		this.obj_classes.specific.open = this.obj_classes.general.open + '-' + this.__models.options.data.str_uniqueInstanceName;
		this.obj_classes.specific.closed = this.obj_classes.general.closed + '-' + this.__models.options.data.str_uniqueInstanceName;

		this.el_content = this.__module.obj_args.el_content;

		this.detectExternalContentSituation();
		this.initializeFallbackContainerIfRequired()



		/*
		 * We intentionally look for the togglers in the entire dom and not only inside the container because
		 * it must be possible to place togglers everywhere without any restrictions.
		 */
		this.els_togglers = $$(this.__models.options.data.str_ocTogglerSelector);

		if (this.bln_isExternalContentSituation) {
			let el_closeButtonToggler = this.__el_container.getElement('.close-button');
			if (typeOf(el_closeButtonToggler) === 'element') {
				this.els_togglers.push(el_closeButtonToggler);
			}
		}

		if (this.els_togglers.length === 0) {
			if (this.__models.options.data.bln_debug) {
				console.warn(str_moduleName + ': no toggler was found with selector "' + this.__models.options.data.str_ocTogglerSelector + '". This is fine as it could be intentional, but it could also indicate a misconfiguration.');
			}
		}

		this.el_body.addClass(this.obj_classes.general.standard);
		this.el_body.addClass(this.obj_classes.specific.standard);

		this.els_togglers.addEvent(
			'click',
			this.toggle.bind(this)
		);

		if (this.__models.options.data.bln_closeOnOutsideClick) {
			this.__el_container.addEvent(
				'mousedown',
				function(event) {
					if (event.target === this.__el_container) {
						this.toggle();
					}
				}.bind(this)
			);
		}
	},

	detectExternalContentSituation: function() {
		/*
		 * If el_content is an element, we know that we this ocFlex instance was started with a content element
		 * instead of a container element. That means that we need an auto-generated fallback container that must
		 * be filled with the given content.
		 */
		this.bln_isExternalContentSituation = typeOf(this.el_content) === 'element';
	},

	initializeFallbackContainerIfRequired: function() {
		if (this.bln_isExternalContentSituation) {
			let potentiallyAlreadyExistingAutoContainer = $(this.__models.options.data.str_uniqueInstanceName + '-container');
			if (typeOf(potentiallyAlreadyExistingAutoContainer) === 'element') {
				potentiallyAlreadyExistingAutoContainer.remove();
			}

			this.__el_container = this.tplPure({
				name: 'autoOcContainer',
				arg: {
					str_contentId: this.__models.options.data.str_uniqueInstanceName
				}
			}).getElement('div').inject($$('body')[0], 'bottom');
		}
	},

	moveContentFromOriginalPositionToContainer: function() {
		if (!this.bln_isExternalContentSituation) {
			return;
		}

		this.el_content._originalParent = this.el_content.parentNode;
		this.el_content._originalNextSibling = this.el_content.nextSibling;
		this.__autoElements.autoOcContainer.contentBox.appendChild(this.el_content);
	},

	moveContentFromContainerToOriginalPosition: function() {
		if (!this.bln_isExternalContentSituation) {
			return;
		}

		if (this.el_content._originalParent) {
			this.el_content._originalParent.insertBefore(this.el_content, this.el_content._originalNextSibling);
			delete this.el_content._originalParent;
			delete this.el_content._originalNextSibling;
		}
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
			this.close();
		} else {
			this.open();
		}

	},

	close: function() {
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
		// this.el_body.removeClass(this.obj_classes.general.keepSticky);

		window.setTimeout(
			this.moveContentFromContainerToOriginalPosition.bind(this),
			300
		)
		window.fireEvent('ocFlexClose', this.__models.options.data.str_uniqueInstanceName);
	},

	open: function() {
		if (typeOf(window.ocFlexCloseCurrentlyOpen) === 'function') {
			window.ocFlexCloseCurrentlyOpen();
		}

		this.moveContentFromOriginalPositionToContainer();

		window.ocFlexCloseCurrentlyOpen = this.toggle.bind(this);

		// this.el_body.addClass(this.obj_classes.general.keepSticky);

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

		window.fireEvent('ocFlexOpen', this.__models.options.data.str_uniqueInstanceName);
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();