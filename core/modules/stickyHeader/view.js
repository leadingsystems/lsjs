(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,
	el_sticky: null,
	el_spaceSaver: null,

	int_stickyHeight: 0,
	int_originalSpaceSaverPaddingTop: 0,

	int_currentScrollY: 0,
	int_originalBottomPositionOfStickyElement: 0,
	int_currentBottomPositionOfStickyElement: 0,

	int_minScrollSpeedToShowSticky: 25,

	bln_currentlySticky: false,
	bln_currentlyShown: false,

	obj_classes: {
		sticky: 'sticky',
		show: 'show-sticky'
	},

	start: function() {
		this.el_body = $$('body')[0];

		this.el_sticky = $$(this.__models.options.data.str_selectorForElementToStick)[0];
		if (typeOf(this.el_sticky) !== 'element') {
			if (this.__models.options.data.bln_debug) {
				console.warn(str_moduleName + ': not exactly one element found with selector "' + this.__models.options.data.str_selectorForElementToStick + '"');
			}
			return;
		}

		this.el_sticky.addClass('sticky-element');

		this.el_sticky.addEventListener(
			'transitionend',
			function() {
				this.int_currentBottomPositionOfStickyElement = this.el_sticky.getCoordinates().bottom;
			}.bind(this)
		);

		this.el_spaceSaver = $$(this.__models.options.data.str_selectorForElementToSaveSpace)[0];
		if (typeOf(this.el_spaceSaver) !== 'element') {
			if (this.__models.options.data.bln_debug) {
				console.warn(str_moduleName + ': not exactly one element found with selector "' + this.__models.options.data.str_selectorForElementToSaveSpace + '"');
			}
			return;
		}

		window.addEvent('resize', this.reactOnResizing.bind(this));
		window.addEvent('scroll', this.reactOnScrolling.bind(this));
		this.initializePositionsAndSizes();
	},

	initializePositionsAndSizes: function() {
		var self = this;

		this.el_body.measure(
			function() {
				var bln_currentlySticky = self.el_body.hasClass(self.obj_classes.sticky);
				if (bln_currentlySticky) {
					self.el_body.removeClass(self.obj_classes.sticky)
				}

				self.int_stickyHeight = self.el_sticky.offsetHeight;
				self.int_originalBottomPositionOfStickyElement = self.el_sticky.getCoordinates().bottom;

				self.int_originalSpaceSaverPaddingTop = parseFloat(window.getComputedStyle(self.el_spaceSaver)['padding-top']);

				if (bln_currentlySticky) {
					self.el_body.addClass(self.obj_classes.sticky)
				}
			}
		);
	},

	reactOnResizing: function() {
		this.makeUnsticky();
		this.initializePositionsAndSizes();
		this.reactOnScrolling();
	},

	reactOnScrolling: function() {
		this.int_currentScrollY = window.getScroll().y;
		if (!this.bln_currentlySticky) {
			if (this.int_currentScrollY > this.int_originalBottomPositionOfStickyElement) {
				this.makeSticky();
			}
		} else if (this.bln_currentlySticky) {
			if (this.int_originalBottomPositionOfStickyElement - this.int_currentScrollY >= this.int_currentBottomPositionOfStickyElement) {
				this.makeUnsticky();
			}
		}

		if (
			lsjs.scrollAssistant.__view.str_currentDirection === 'up'
			&& lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.int_minScrollSpeedToShowSticky
		) {
			this.showSticky();
		} else if (lsjs.scrollAssistant.__view.str_currentDirection === 'down') {
			this.hideSticky();
		}

	},

	showSticky: function() {
		this.bln_currentlyShown = true;
		this.el_body.addClass(this.obj_classes.show);
	},

	hideSticky: function() {
		this.bln_currentlyShown = false;
		this.el_body.removeClass(this.obj_classes.show);

	},

	makeSticky: function() {
		this.bln_currentlySticky = true;
		this.el_body.addClass(this.obj_classes.sticky);
		this.el_sticky.setStyle('top', this.int_stickyHeight * -1);
		this.el_spaceSaver.setStyle('padding-top', this.int_originalSpaceSaverPaddingTop + this.int_stickyHeight);
	},

	makeUnsticky: function() {
		this.el_body.removeClass(this.obj_classes.sticky);
		this.el_sticky.setStyle('top', null);
		this.el_spaceSaver.setStyle('padding-top', this.int_originalSpaceSaverPaddingTop);
		this.bln_currentlySticky = false;
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();