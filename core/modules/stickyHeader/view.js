(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,
	el_sticky: null,
	el_spaceSaver: null,

	int_stickyHeight: 0,
	int_stickyHeightWithChildren: 0,
	int_originalSpaceSaverPaddingTop: 0,

	int_currentScrollY: 0,
	int_originalBottomPositionOfStickyElement: 0,
	int_originalBottomPositionOfStickyElementWithChildren: 0,
	int_currentBottomPositionOfStickyElement: 0,
	int_currentBottomPositionOfStickyElementWithChildren: 0,

	int_minScrollSpeedToShowSticky: 17,
	int_minScrollSpeedToHideSticky: 10,

	bln_currentlySticky: false,
	bln_currentlyShown: false,

	obj_classes: {
		sticky: 'sticky',
		show: 'show-sticky',
		moveout: 'move-out-sticky',
		subscrolling: 'sub-scrolling-sticky'
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
				this.int_currentBottomPositionOfStickyElementWithChildren = this.el_sticky.getCoordinates().bottom + (this.int_stickyHeightWithChildren - this.int_stickyHeight);
				if (this.el_body.hasClass(this.obj_classes.moveout)) {
					this.el_body.removeClass(this.obj_classes.moveout);
					this.el_body.removeClass(this.obj_classes.show);
				}
			}.bind(this)
		);

		/*
		 * Clicking the header might change the header's total dimensions because a dropdown submenu might
		 * be opened or something like that. That's why we have to handle this situation.
		 */
		this.el_sticky.addEvent(
			'click',
			this.reactOnHeaderClick.bind(this)
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
				self.int_stickyHeight = self.el_sticky.offsetHeight;
				self.int_stickyHeightWithChildren = self.el_sticky.scrollHeight;
				self.int_originalBottomPositionOfStickyElement = self.el_sticky.getCoordinates().bottom;
				self.int_originalBottomPositionOfStickyElementWithChildren = self.int_originalBottomPositionOfStickyElement + (self.int_stickyHeightWithChildren - self.int_stickyHeight);
				self.int_currentBottomPositionOfStickyElement = self.int_originalBottomPositionOfStickyElement;
				self.int_currentBottomPositionOfStickyElementWithChildren = self.int_originalBottomPositionOfStickyElementWithChildren;

				self.int_originalSpaceSaverPaddingTop = parseFloat(window.getComputedStyle(self.el_spaceSaver)['padding-top']);
			}
		);

		this.el_spaceSaver.setStyle('padding-top', this.int_originalSpaceSaverPaddingTop + this.int_stickyHeight);
	},

	reactOnResizing: function() {
		this.el_spaceSaver.setStyle('padding-top', this.int_originalSpaceSaverPaddingTop);
		this.makeUnsticky();
		this.initializePositionsAndSizes();
	},

	reactOnHeaderClick: function() {
		this.int_stickyHeightWithChildren = this.el_sticky.scrollHeight;
		this.int_originalBottomPositionOfStickyElementWithChildren = this.int_originalBottomPositionOfStickyElement + (this.int_stickyHeightWithChildren - this.int_stickyHeight);
		this.int_currentBottomPositionOfStickyElement = this.el_sticky.getCoordinates().bottom;
		this.int_currentBottomPositionOfStickyElementWithChildren = this.el_sticky.getCoordinates().bottom + (this.int_stickyHeightWithChildren - this.int_stickyHeight);
	},

	reactOnScrolling: function() {
		this.int_currentScrollY = window.getScroll().y;
		if (!this.bln_currentlySticky) {
			if (this.int_currentScrollY > this.int_originalBottomPositionOfStickyElementWithChildren) {
				this.makeSticky();
			}
		} else if (this.bln_currentlySticky) {
			if (this.int_currentScrollY === 0) {
				this.makeUnsticky();
			}
		}

		if (
			lsjs.scrollAssistant.__view.str_currentDirection === 'up'
			&& (
				lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.int_minScrollSpeedToShowSticky
				|| this.int_currentScrollY <= this.int_originalBottomPositionOfStickyElementWithChildren
			)
		) {
			this.el_body.removeClass(this.obj_classes.subscrolling);

			if (this.el_body.hasClass(this.obj_classes.sticky)) {
				this.showSticky();
			}
		}

		else if (lsjs.scrollAssistant.__view.str_currentDirection === 'down') {
			/*
			 * If there is either actually still a way to sub-scroll (as indicated by the position vs. window height
			 * comparison) or if we're at least currently right in the middle of sub-scrolling (as indicated by the
			 * given css-class), we don't want the sticky header to be hidden. But if there's in fact no more
			 * sub-scrolling possible, we only remove the sub-scrolling class so that the next scrolling event
			 * can hide the sticky header.
			 */
			if (
				this.int_currentBottomPositionOfStickyElementWithChildren > window.innerHeight
				|| this.el_body.hasClass(this.obj_classes.subscrolling)
			) {
				if (this.int_currentBottomPositionOfStickyElementWithChildren < window.innerHeight) {
					if (lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.int_minScrollSpeedToHideSticky) {
						this.el_body.removeClass(this.obj_classes.subscrolling);
					}
				} else {
					if (
						this.el_body.hasClass(this.obj_classes.sticky)
						&& this.el_body.hasClass(this.obj_classes.show)
					) {
						this.el_sticky.setStyle('top', parseFloat(window.getComputedStyle(this.el_sticky)['top']) - lsjs.scrollAssistant.__view.int_lastScrollSpeed);
						this.el_body.addClass(this.obj_classes.subscrolling);
					}
				}
			}

			else if (lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.int_minScrollSpeedToHideSticky) {
				this.el_body.removeClass(this.obj_classes.subscrolling);

				if (
					this.el_body.hasClass(this.obj_classes.sticky)
					&& this.el_body.hasClass(this.obj_classes.show)
				) {
					this.hideSticky();
				}
			}
		}

	},

	showSticky: function() {
		this.bln_currentlyShown = true;
		this.el_body.addClass(this.obj_classes.show);
		this.el_body.removeClass(this.obj_classes.moveout);
	},

	hideSticky: function() {
		this.bln_currentlyShown = false;
		this.el_body.addClass(this.obj_classes.moveout);
		this.moveStickyOffCanvas();
	},

	makeSticky: function() {
		this.bln_currentlySticky = true;
		this.el_body.addClass(this.obj_classes.sticky);
		this.moveStickyOffCanvas();
	},

	makeUnsticky: function() {
		this.el_body.removeClass(this.obj_classes.sticky);
		this.el_body.removeClass(this.obj_classes.show);
		this.el_body.removeClass(this.obj_classes.moveout);
		this.moveStickyInCanvas();
		this.bln_currentlySticky = false;
	},

	moveStickyOffCanvas: function() {
		this.el_sticky.setStyle('top', this.int_stickyHeightWithChildren * -1);
	},

	moveStickyInCanvas: function() {
		this.el_sticky.setStyle('top', null);
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();