(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,
	el_header: null,

	int_currentScrollY: 0,

	obj_classes: {
		stickyElement: 'sticky-element',
		sticky: 'sticky',
		show: 'show-sticky',
		moveout: 'move-out-sticky',
		movein: 'move-in-sticky',
		subscrolling: 'sub-scrolling-sticky',
		temporarilyKeepStickyInShowPosition: 'temporarily-keep-sticky-in-show-position'
	},

	obj_spaceSaver: {
		el_spaceSaver: null,
		el_header: null,

		int_originalPaddingTop: 0,

		int_requiredPaddingTopInStickyState: 0,

		initialize: function(str_selectorForSpaceSaverElement, el_header) {
			if (typeOf(str_selectorForSpaceSaverElement) !== 'string') {
				console.error('dependency "str_selectorForSpaceSaverElement" not ok');
			}

			if (typeOf(el_header) !== 'element') {
				console.error('dependency "el_header" not ok');
			}

			this.el_header = el_header;

			this.el_spaceSaver = $$(str_selectorForSpaceSaverElement)[0];

			if (typeOf(this.el_spaceSaver) !== 'element') {
				this.el_spaceSaver = null;
			}

			window.addEvent(
				'resize',
				this.setPadding.bind(this)
			);

			this.setPadding();
		},

		setPadding: function() {
			if (!this.el_spaceSaver) {
				return;
			}

			this.el_spaceSaver.setStyle('padding-top', null);
			this.el_spaceSaver.setStyle('padding-top', parseFloat(window.getComputedStyle(this.el_spaceSaver)['padding-top']) + this.el_header.offsetHeight);
		}
	},

	obj_verticalPositionToSwitchSticky: {
		__view: null,
		el_header: null,
		el_body: null,
		obj_classes: '',
		int_timeToWaitForRecalculationsAfterHeaderClickInMs: 0,
		int_yPos: 0,
		bln_debug: false,
		el_debugPosYIndicator: null,

		initialize: function(__view, el_header, el_body, obj_classes, int_timeToWaitForRecalculationsAfterHeaderClickInMs) {
			if (typeOf(__view) !== 'object') {
				console.error('dependency "__view" not ok');
			}
			this.__view = __view;

			if (typeOf(el_header) !== 'element') {
				console.error('dependency "el_header" not ok');
			}
			this.el_header = el_header;

			if (typeOf(el_body) !== 'element') {
				console.error('dependency "el_body" not ok');
			}
			this.el_body = el_body;

			if (typeOf(obj_classes) !== 'object') {
				console.error('dependency "obj_classes" not ok');
			}
			this.obj_classes = obj_classes;

			if (typeOf(int_timeToWaitForRecalculationsAfterHeaderClickInMs) !== 'number') {
				console.error('dependency "int_timeToWaitForRecalculationsAfterHeaderClickInMs" not ok');
			}
			this.int_timeToWaitForRecalculationsAfterHeaderClickInMs = int_timeToWaitForRecalculationsAfterHeaderClickInMs;

			if (this.bln_debug) {
				this.el_debugPosYIndicator = this.__view.tplPure({name: 'debug_positionYIndicator'});
				this.el_debugPosYIndicator.inject(this.el_body, 'top');
			}

			window.addEvent(
				'resize',
				this.determinePos.bind(this)
			);

			this.el_header.addEvent(
				'click',
				function() {
					/*
					 * If opening subnavigations etc. takes some time due to transitions, we have to make sure not to try to calculate
					 * sizes and positions to early.
					 */
					window.setTimeout(
						this.determinePos.bind(this),
						this.int_timeToWaitForRecalculationsAfterHeaderClickInMs
					);
				}.bind(this)
			);

			this.determinePos();
		},

		determinePos: function() {
			this.el_body.measure(
				function() {
					var bln_needToReAddStickyClass = this.__view.check_isCurrentlySticky();
					this.el_body.removeClass(this.obj_classes.sticky);

					if (this.el_body.hasClass(this.obj_classes.show)) {
						this.el_body.addClass(this.obj_classes.temporarilyKeepStickyInShowPosition);
					}

					this.int_yPos = this.el_header.getCoordinates().top + this.el_header.scrollHeight;

					this.el_body.removeClass(this.obj_classes.temporarilyKeepStickyInShowPosition);

					if (bln_needToReAddStickyClass) {
						this.el_body.addClass(this.obj_classes.sticky);
					}
				}.bind(this)
			);

			if (this.bln_debug) {
				this.el_debugPosYIndicator.getElement('.debugPosYIndicator').setStyle('top', this.int_yPos);
			}
		}
	},

	obj_stickyHeader: {
		__view: null,
		el_header: null,
		el_body: null,
		obj_classes: '',
		int_timeToWaitForRecalculationsAfterHeaderClickInMs: 0,

		int_height: 0,

		initialize: function(__view, el_header, el_body, obj_classes, int_timeToWaitForRecalculationsAfterHeaderClickInMs) {
			if (typeOf(__view) !== 'object') {
				console.error('dependency "__view" not ok');
			}
			this.__view = __view;

			if (typeOf(el_header) !== 'element') {
				console.error('dependency "el_header" not ok');
			}
			this.el_header = el_header;

			if (typeOf(el_body) !== 'element') {
				console.error('dependency "el_body" not ok');
			}
			this.el_body = el_body;

			if (typeOf(obj_classes) !== 'object') {
				console.error('dependency "obj_classes" not ok');
			}
			this.obj_classes = obj_classes;

			if (typeOf(int_timeToWaitForRecalculationsAfterHeaderClickInMs) !== 'number') {
				console.error('dependency "int_timeToWaitForRecalculationsAfterHeaderClickInMs" not ok');
			}
			this.int_timeToWaitForRecalculationsAfterHeaderClickInMs = int_timeToWaitForRecalculationsAfterHeaderClickInMs;

			window.addEvent(
				'resize',
				this.determineSizesAndPositions.bind(this)
			);

			this.el_header.addEvent(
				'click',
				function() {
					/*
					 * If opening subnavigations etc. takes some time due to transitions, we have to make sure not to try to calculate
					 * sizes and positions to early.
					 */
					window.setTimeout(
						this.determineSizesAndPositions.bind(this),
						this.int_timeToWaitForRecalculationsAfterHeaderClickInMs
					);
				}.bind(this)
			);

			this.determineSizesAndPositions();

			this.el_header.addEventListener(
				'transitionend',
				function() {
					this.determineSizesAndPositions();
					if (this.el_body.hasClass(this.obj_classes.moveout)) {
						this.el_body.removeClass(this.obj_classes.moveout);
						this.el_body.removeClass(this.obj_classes.show);
					}
				}.bind(this)
			);
		},

		determineSizesAndPositions: function() {
			this.el_body.measure(
				function () {
					var bln_needToRemoveStickyClass = !this.__view.check_isCurrentlySticky();

					this.el_body.addClass(this.obj_classes.sticky);

					this.int_height = this.el_header.scrollHeight;

					if (bln_needToRemoveStickyClass) {
						this.el_body.removeClass(this.obj_classes.sticky);
					}
				}.bind(this)
			);
		},

		moveOffCanvas: function() {
			this.el_header.setStyle('top', this.int_height * -1);
		},

		moveInCanvas: function() {
			this.el_header.setStyle('top', null);
		}
	},

	start: function() {
		this.initializeElements();

		this.obj_spaceSaver.initialize(
			this.__models.options.data.str_selectorForElementToSaveSpace,
			this.el_header
		);

		this.obj_verticalPositionToSwitchSticky.initialize(
			this,
			this.el_header,
			this.el_body,
			this.obj_classes,
			this.__models.options.data.int_timeToWaitForRecalculationsAfterHeaderClickInMs
		);

		this.obj_stickyHeader.initialize(
			this,
			this.el_header,
			this.el_body,
			this.obj_classes,
			this.__models.options.data.int_timeToWaitForRecalculationsAfterHeaderClickInMs
		);

		this.initializeScrollListener();
		this.initializeResizingListener();
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
	},

	initializeResizingListener: function() {
		window.addEvent('resize', this.reactOnResizing.bind(this));
	},

	reactOnResizing: function() {
		this.makeUnsticky();
	},

	initializeScrollListener: function() {
		window.addEvent('scroll', this.reactOnScrolling.bind(this));
	},

	reactOnScrolling: function() {
		this.int_currentScrollY = window.getScroll().y;
		this.toggleStickyStatus();
		this.handleScrollingUp();
		this.handleScrollingDown();
	},


	toggleStickyStatus: function() {
		if (!this.check_isCurrentlySticky()) {
			if (this.int_currentScrollY > this.obj_verticalPositionToSwitchSticky.int_yPos) {
				this.makeSticky();
			}
		} else {
			if (this.int_currentScrollY <= this.obj_verticalPositionToSwitchSticky.int_yPos) {
				this.makeUnsticky();
			}
		}
	},

	handleScrollingUp: function() {
		if (lsjs.scrollAssistant.__view.str_currentDirection !== 'up') {
			return;
		}

		/*
		 * Show sticky header if the scroll speed was high enough
		 */
		if (
			lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.__models.options.data.int_minScrollSpeedToShowSticky
			|| this.int_currentScrollY <= this.obj_verticalPositionToSwitchSticky.int_yPos
		) {
			if (this.el_body.hasClass(this.obj_classes.sticky)) {
				this.showSticky();
			}
		}
	},

	handleScrollingDown: function() {
		if (lsjs.scrollAssistant.__view.str_currentDirection !== 'down') {
			return;
		}

		/*
		 * Hide sticky header if the scroll speed was high enough
		 */
		if (lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.__models.options.data.int_minScrollSpeedToHideSticky) {
			if (
				this.el_body.hasClass(this.obj_classes.sticky)
				&& this.el_body.hasClass(this.obj_classes.show)
			) {
				this.hideSticky();
			}
		}
	},

	showSticky: function(){
		this.el_body.addClass(this.obj_classes.show);
		this.el_body.removeClass(this.obj_classes.moveout);
	},

	hideSticky: function() {
		this.el_body.addClass(this.obj_classes.moveout);
		this.obj_stickyHeader.moveOffCanvas();
	},

	makeSticky: function() {
		this.el_body.addClass(this.obj_classes.sticky);
		this.obj_stickyHeader.moveOffCanvas();
	},

	makeUnsticky: function() {
		this.el_body.removeClass(this.obj_classes.sticky);
		this.el_body.removeClass(this.obj_classes.show);
		this.el_body.removeClass(this.obj_classes.moveout);
		this.obj_stickyHeader.moveInCanvas();
	},

	check_isCurrentlySticky: function() {
		return this.el_body.hasClass(this.obj_classes.sticky);
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();