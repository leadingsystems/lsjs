(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,
	el_header: null,

	/*
	 * The space saver is the element to which a top padding is added to keep the space free that would normally
	 * collapse if the header element is in a fixed position.
	 */
	el_spaceSaver: null,

	obj_originalHeader: {
		obj_height: {
			int_regular: 0,
			int_expanded: 0
		},

		obj_bottomPosition: {
			obj_initial: {
				int_regular: 0,
				int_expanded: 0
			},
			obj_current: {
				int_regular: 0,
				int_expanded: 0
			}
		}
	},

	obj_stickyHeader: {
		obj_height: {
			int_regular: 0,
			int_expanded: 0
		},

		obj_bottomPosition: {
			obj_initial: {
				int_regular: 0,
				int_expanded: 0
			},
			obj_current: {
				int_regular: 0,
				int_expanded: 0
			}
		}
	},

	int_originalSpaceSaverPaddingTop: 0,

	int_currentScrollY: 0,

	bln_stickyHeaderHasReducedHeight: false,

	obj_status: {
		bln_currentlySticky: false,
		bln_stickyHeaderIsVisible: false,
	},

	obj_classes: {
		stickyElement: 'sticky-element',
		sticky: 'sticky',
		show: 'show-sticky',
		moveout: 'move-out-sticky',
		subscrolling: 'sub-scrolling-sticky',
		temporarilyKeepStickyInShowPosition: 'temporarily-keep-sticky-in-show-position'
	},

	start: function() {
		this.initializeElements();

		this.initializeTransitionEndEventListener();
		this.initializeReactionOnHeaderClick();
		this.initializeResizeListener();
		this.initializeScrollListener();

		this.initializePositionsAndSizes();
	},

	initializeElements: function() {
		this.el_body = $$('body')[0];

		this.el_header = $$(this.__models.options.data.str_selectorForElementToStick)[0];
		if (typeOf(this.el_header) !== 'element') {
			if (this.__models.options.data.bln_debug) {
				console.warn(str_moduleName + ': not exactly one element found with selector "' + this.__models.options.data.str_selectorForElementToStick + '"');
			}
			return;
		}

		this.el_header.addClass(this.obj_classes.stickyElement);

		this.el_spaceSaver = $$(this.__models.options.data.str_selectorForElementToSaveSpace)[0];
		if (typeOf(this.el_spaceSaver) !== 'element') {
			this.el_spaceSaver = null;
		}
	},

	/*
	 * When the sliding transition that moves the sticky header to the visible area is complete, certain classes must
	 * be changed and the current bottom position must be determined.
	 */
	initializeTransitionEndEventListener: function() {
		this.el_header.addEventListener(
			'transitionend',
			function() {
				this.obj_stickyHeader.obj_bottomPosition.obj_current.int_regular = this.el_header.getCoordinates().bottom;
				this.obj_stickyHeader.obj_bottomPosition.obj_current.int_expanded = this.el_header.getCoordinates().bottom + (this.obj_stickyHeader.obj_height.int_expanded - this.obj_stickyHeader.obj_height.int_regular);
				if (this.el_body.hasClass(this.obj_classes.moveout)) {
					this.el_body.removeClass(this.obj_classes.moveout);
					this.el_body.removeClass(this.obj_classes.show);
				}
			}.bind(this)
		);
	},

	/*
	 * Clicking the header might change the header's total dimensions because a dropdown submenu might
	 * be opened or something like that. That's why we have to handle this situation.
	 */
	initializeReactionOnHeaderClick: function() {
		this.el_header.addEvent(
			'click',
			this.reactOnHeaderClick.bind(this)
		);
	},

	initializeResizeListener: function() {
		window.addEvent('resize', this.reactOnResizing.bind(this));
	},

	initializeScrollListener: function() {
		window.addEvent('scroll', this.reactOnScrolling.bind(this));
	},

	initializePositionsAndSizes: function() {
		this.getCurrentPositionsAndSizes();

		if (this.el_spaceSaver !== null) {
			this.int_originalSpaceSaverPaddingTop = parseFloat(window.getComputedStyle(this.el_spaceSaver)['padding-top']);
			this.el_spaceSaver.setStyle('padding-top', this.int_originalSpaceSaverPaddingTop + this.obj_originalHeader.obj_height.int_regular);
		}
	},

	getCurrentPositionsAndSizes: function() {
		var self = this;
		this.el_body.measure(
			function() {
				/*
				 * This function must determine sizes and positions in both the sticky and non-sticky state and
				 * therefore has to simulate both situations.
				 *
				 * When this function is executed the current status might be sticky or not. Because of that, we
				 * check whether the header is currently sticky and then add and remove the sticky class accordingly.
				 */

				/*
				 * Determining the sizes in the non-sticky state. Therefore temporarily removing the sticky class if necessary.
				 */
				if (self.obj_status.bln_currentlySticky) {
					self.el_body.removeClass(self.obj_classes.sticky);
				}

				if (self.obj_status.bln_stickyHeaderIsVisible) {
					self.el_body.addClass(self.obj_classes.temporarilyKeepStickyInShowPosition);
				}

				self.obj_originalHeader.obj_height.int_regular = self.el_header.offsetHeight;
				self.obj_originalHeader.obj_height.int_expanded = self.el_header.scrollHeight;
				self.obj_originalHeader.obj_bottomPosition.obj_initial.int_regular = self.el_header.getCoordinates().bottom;
				self.obj_originalHeader.obj_bottomPosition.obj_initial.int_expanded = self.obj_originalHeader.obj_bottomPosition.obj_initial.int_regular + (self.obj_originalHeader.obj_height.int_expanded - self.obj_originalHeader.obj_height.int_regular);
				self.obj_originalHeader.obj_bottomPosition.obj_current.int_regular = self.obj_originalHeader.obj_bottomPosition.obj_initial.int_regular;
				self.obj_originalHeader.obj_bottomPosition.obj_current.int_expanded = self.obj_originalHeader.obj_bottomPosition.obj_initial.int_expanded;

				/*
				 * Determining the sizes in the sticky state. Therefore temporarily adding the sticky class.
				 */
				self.el_body.addClass(self.obj_classes.sticky);

				self.obj_stickyHeader.obj_height.int_regular = self.el_header.offsetHeight;
				self.obj_stickyHeader.obj_height.int_expanded = self.el_header.scrollHeight;
				self.obj_stickyHeader.obj_bottomPosition.obj_initial.int_regular = self.el_header.getCoordinates().bottom;
				self.obj_stickyHeader.obj_bottomPosition.obj_initial.int_expanded = self.obj_stickyHeader.obj_bottomPosition.obj_initial.int_regular + (self.obj_stickyHeader.obj_height.int_expanded - self.obj_stickyHeader.obj_height.int_regular);
				self.obj_stickyHeader.obj_bottomPosition.obj_current.int_regular = self.obj_stickyHeader.obj_bottomPosition.obj_initial.int_regular;
				self.obj_stickyHeader.obj_bottomPosition.obj_current.int_expanded = self.obj_stickyHeader.obj_bottomPosition.obj_initial.int_expanded;

				/*
				 * Making sure that the sticky class is correctly set considering whether or not the header
				 * is currently in the sticky state
				 */
				if (!self.obj_status.bln_currentlySticky) {
					self.el_body.removeClass(self.obj_classes.sticky);
				}

				if (self.obj_status.bln_stickyHeaderIsVisible) {
					self.el_body.removeClass(self.obj_classes.temporarilyKeepStickyInShowPosition);
				}

				if (self.obj_stickyHeader.obj_height.int_regular < self.obj_originalHeader.obj_height.int_regular) {
					self.bln_stickyHeaderHasReducedHeight = true;
				}

				// console.log('self.obj_originalHeader.obj_height.int_regular: '+ self.obj_originalHeader.obj_height.int_regular);
				// console.log('self.obj_originalHeader.obj_height.int_expanded: '+ self.obj_originalHeader.obj_height.int_expanded);
				// console.log('self.obj_originalHeader.obj_bottomPosition.obj_initial.int_regular: '+ self.obj_originalHeader.obj_bottomPosition.obj_initial.int_regular);
				// console.log('self.obj_originalHeader.obj_bottomPosition.obj_initial.int_expanded: '+ self.obj_originalHeader.obj_bottomPosition.obj_initial.int_expanded);
				// console.log('self.obj_originalHeader.obj_bottomPosition.obj_current.int_regular: '+ self.obj_originalHeader.obj_bottomPosition.obj_current.int_regular);
				// console.log('self.obj_originalHeader.obj_bottomPosition.obj_current.int_expanded: '+ self.obj_originalHeader.obj_bottomPosition.obj_current.int_expanded);
				// console.log('self.obj_stickyHeader.obj_height.int_regular: '+ self.obj_stickyHeader.obj_height.int_regular);
				// console.log('self.obj_stickyHeader.obj_height.int_expanded: '+ self.obj_stickyHeader.obj_height.int_expanded);
				// console.log('self.obj_stickyHeader.obj_bottomPosition.obj_initial.int_regular: '+ self.obj_stickyHeader.obj_bottomPosition.obj_initial.int_regular);
				// console.log('self.obj_stickyHeader.obj_bottomPosition.obj_initial.int_expanded: '+ self.obj_stickyHeader.obj_bottomPosition.obj_initial.int_expanded);
				// console.log('self.obj_stickyHeader.obj_bottomPosition.obj_current.int_regular: '+ self.obj_stickyHeader.obj_bottomPosition.obj_current.int_regular);
				// console.log('self.obj_stickyHeader.obj_bottomPosition.obj_current.int_expanded: '+ self.obj_stickyHeader.obj_bottomPosition.obj_current.int_expanded);
			}
		);
	},

	reactOnResizing: function() {
		if (this.el_spaceSaver !== null) {
			this.el_spaceSaver.setStyle('padding-top', this.int_originalSpaceSaverPaddingTop);
		}
		this.makeUnsticky();
		this.initializePositionsAndSizes();
	},

	reactOnHeaderClick: function() {
		/*
		 * If opening subnavigations etc. takes some time due to transitions, we have to make sure not to try to calculate
		 * sizes and positions to early.
		 */
		window.setTimeout(
			this.getCurrentPositionsAndSizes.bind(this),
			this.__models.options.data.int_timeToWaitForRecalculationsAfterHeaderClickInMs
		);
	},

	reactOnScrolling: function() {
		var float_currentStickyTopPosition = parseFloat(window.getComputedStyle(this.el_header)['top']);
		this.int_currentScrollY = window.getScroll().y;
		if (!this.obj_status.bln_currentlySticky) {
			if (
				(
					this.bln_stickyHeaderHasReducedHeight
					&& this.int_currentScrollY > this.obj_originalHeader.obj_bottomPosition.obj_initial.int_expanded
				)
				|| (
					!this.bln_stickyHeaderHasReducedHeight
					&& this.int_currentScrollY > this.obj_stickyHeader.obj_bottomPosition.obj_initial.int_expanded
				)
			) {
				this.makeSticky();
			}
		} else if (this.obj_status.bln_currentlySticky) {
			if (
				(
					this.bln_stickyHeaderHasReducedHeight
					&& this.int_currentScrollY <= this.obj_originalHeader.obj_bottomPosition.obj_initial.int_expanded
				)
				|| (
					!this.bln_stickyHeaderHasReducedHeight
					&& this.int_currentScrollY === 0
				)
			) {
				this.makeUnsticky();
			}
		}

		if (
			lsjs.scrollAssistant.__view.str_currentDirection === 'up'
		) {
			if (this.el_body.hasClass(this.obj_classes.subscrolling) && float_currentStickyTopPosition < 0) {
				this.el_header.setStyle('top', float_currentStickyTopPosition + lsjs.scrollAssistant.__view.int_lastScrollSpeed);
			}

			else if (
				this.bln_stickyHeaderHasReducedHeight
				&& this.int_currentScrollY <= this.obj_originalHeader.obj_bottomPosition.obj_initial.int_expanded + (this.obj_stickyHeader.obj_height.int_regular * this.__models.options.data.int_factorForCalculatingPositionToHideStickyHeader)
				&& this.obj_status.bln_currentlySticky
			) {
				this.hideSticky();
			}

			else if (
				lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.__models.options.data.int_minScrollSpeedToShowSticky
				|| (
					!this.bln_stickyHeaderHasReducedHeight
					&& this.int_currentScrollY <= this.obj_stickyHeader.obj_bottomPosition.obj_initial.int_expanded
				)
			) {
				this.el_body.removeClass(this.obj_classes.subscrolling);

				if (this.el_body.hasClass(this.obj_classes.sticky)) {
					this.showSticky();
				}
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
				this.obj_stickyHeader.obj_bottomPosition.obj_current.int_expanded > window.innerHeight
				|| this.el_body.hasClass(this.obj_classes.subscrolling)
			) {
				if (this.obj_stickyHeader.obj_bottomPosition.obj_current.int_expanded < window.innerHeight * 0.3) {
					if (lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.__models.options.data.int_minScrollSpeedToHideSticky) {
						this.el_body.removeClass(this.obj_classes.subscrolling);
					}
				} else {
					if (
						this.el_body.hasClass(this.obj_classes.sticky)
						&& this.el_body.hasClass(this.obj_classes.show)
					) {
						this.el_header.setStyle('top', float_currentStickyTopPosition - lsjs.scrollAssistant.__view.int_lastScrollSpeed);
						this.el_body.addClass(this.obj_classes.subscrolling);
					}
				}
			}

			else if (lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.__models.options.data.int_minScrollSpeedToHideSticky) {
				this.el_body.removeClass(this.obj_classes.subscrolling);

				if (
					this.el_body.hasClass(this.obj_classes.sticky)
					&& this.el_body.hasClass(this.obj_classes.show)
				) {
					if (!this.__models.options.data.bln_alwaysShowStickyHeader) {
						this.hideSticky();
					}
				}
			}
		}

	},

	showSticky: function() {
		this.obj_status.bln_stickyHeaderIsVisible = true;
		this.el_body.addClass(this.obj_classes.show);
		this.el_body.removeClass(this.obj_classes.moveout);
	},

	hideSticky: function() {
		this.obj_status.bln_stickyHeaderIsVisible = false;
		this.el_body.addClass(this.obj_classes.moveout);
		this.moveStickyOffCanvas();
	},

	makeSticky: function() {
		this.obj_status.bln_currentlySticky = true;
		this.el_body.addClass(this.obj_classes.sticky);
		this.moveStickyOffCanvas();
		if (this.__models.options.data.bln_alwaysShowStickyHeader) {
			/*
			 * Since moving the sticky header off canvas can take some time, waiting a few ms before showing the
			 * sticky header can be necessary to make the transition actually work.
			 */
			window.setTimeout(
				this.showSticky.bind(this),
				500
			);
		}
	},

	makeUnsticky: function() {
		this.el_body.removeClass(this.obj_classes.sticky);
		this.el_body.removeClass(this.obj_classes.show);
		this.el_body.removeClass(this.obj_classes.moveout);
		this.moveStickyInCanvas();
		this.obj_status.bln_currentlySticky = false;
	},

	moveStickyOffCanvas: function() {
		this.el_header.setStyle('top', this.obj_stickyHeader.obj_height.int_expanded * -1);
	},

	moveStickyInCanvas: function() {
		this.el_header.setStyle('top', null);
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();