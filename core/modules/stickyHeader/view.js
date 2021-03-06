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
		subscrolling: 'subscrolling-sticky',
		subscrollingPreparingForMoveout: 'subscrolling-sticky-preparing-for-moveout',
		temporarilyKeepStickyInShowPosition: 'temporarily-keep-sticky-in-show-position'
	},

	obj_spaceSaver: {
		el_spaceSaver: null,
		el_header: null,

		int_originalPaddingTop: 0,

		int_requiredPaddingTopInStickyState: 0,

		initialize: function(str_selectorForSpaceSaverElement, el_header) {
			if (str_selectorForSpaceSaverElement !== null && typeOf(str_selectorForSpaceSaverElement) !== 'string') {
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
		int_yPosStart: 0,
		int_yPosEnd: 0,
		int_startEndDistance: 0,
		bln_debug: false,
		el_debugPosYIndicator: null,

		initialize: function(__view, el_header, el_body, obj_classes, int_timeToWaitForRecalculationsAfterHeaderClickInMs, int_startEndDistance, bln_debug) {
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

			if (typeOf(int_startEndDistance) !== 'number') {
				console.error('dependency "int_startEndDistance" not ok');
			}
			this.int_startEndDistance = int_startEndDistance;

			if (typeOf(bln_debug) !== 'boolean') {
				console.error('dependency "bln_debug" not ok');
			}
			this.bln_debug = bln_debug;

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
			var int_yPosEndToResetAfterCalculation = 0;
			if (
				this.__view.__models.options.data.bln_untouchEverythingInHeaderAfterHidingSticky
				&& this.int_yPosEnd > 0
			) {
				/*
				 * If the header is going to be untouched after hiding sticky, the expanded height of the
				 * header is only relevant for the position to start stickyness but the position to end
				 * it should not be changed. Since calculating the start position requires the end position
				 * to be calculated first, we memorize the current end position and reset ist after
				 * the calculation.
				 */
				int_yPosEndToResetAfterCalculation = this.int_yPosEnd;
			}

			this.el_body.measure(
				function() {
					var bln_needToReAddStickyClass = this.__view.check_isCurrentlySticky();
					this.el_body.removeClass(this.obj_classes.sticky);

					if (this.el_body.hasClass(this.obj_classes.show)) {
						this.el_body.addClass(this.obj_classes.temporarilyKeepStickyInShowPosition);
					}

					/*
					 * We have to make sure not to add a negative top position if the calculation is
					 * executed when the header is pulled out of the viewport.
					 */
					var float_currentTopPosition = this.el_header.getCoordinates().top;
					if (float_currentTopPosition < 0 ) {
						float_currentTopPosition = 0;
					}

					this.int_yPosEnd = float_currentTopPosition + this.el_header.scrollHeight;
					this.int_yPosStart = this.int_yPosEnd + this.int_startEndDistance;

					this.el_body.removeClass(this.obj_classes.temporarilyKeepStickyInShowPosition);

					if (bln_needToReAddStickyClass) {
						this.el_body.addClass(this.obj_classes.sticky);
					}
				}.bind(this)
			);

			if (int_yPosEndToResetAfterCalculation > 0) {
				this.int_yPosEnd = int_yPosEndToResetAfterCalculation;
			}

			if (this.bln_debug) {
				this.el_debugPosYIndicator.getElement('.debugPosYIndicatorStart').setStyle('top', this.int_yPosStart);
				console.log('debugPosYIndicatorStart: ' + this.int_yPosStart);

				this.el_debugPosYIndicator.getElement('.debugPosYIndicatorStop').setStyle('top', this.int_yPosEnd);
				console.log('debugPosYIndicatorStop: ' + this.int_yPosEnd);
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
						function() {
							this.determineSizesAndPositions;
							this.__view.handleSubscrolling();
						}.bind(this),
						this.int_timeToWaitForRecalculationsAfterHeaderClickInMs
					);
				}.bind(this)
			);

			this.determineSizesAndPositions();

			this.el_header.addEventListener(
				'transitionend',
				function() {
					if (this.el_body.hasClass(this.obj_classes.moveout)) {
						this.__view.untouchHeaderIfNecessary();
					}

					this.determineSizesAndPositions();

					if (this.el_body.hasClass(this.obj_classes.moveout)) {
						this.el_body.removeClass(this.obj_classes.moveout);
						this.el_body.removeClass(this.obj_classes.show);
						this.el_body.removeClass(this.obj_classes.subscrollingPreparingForMoveout);
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
			this.__models.options.data.int_timeToWaitForRecalculationsAfterHeaderClickInMs,
			this.__models.options.data.int_stickyStartEndDistance,
			this.__models.options.data.bln_debug
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

		if (this.__models.options.data.bln_stickyOnly) {
			this.makeSticky();
			this.showSticky();
		}
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
		this.handleSubscrolling();
		this.handleScrollingUp();
		this.handleScrollingDown();
	},

	handleSubscrolling: function() {
		if (
			this.check_isCurrentlySticky()
			&& this.check_isCurrentlyShowingStickyHeader()
			&& this.obj_stickyHeader.int_height > window.innerHeight
		) {
			this.startSubscrolling();
		} else {
			this.stopSubscrolling();
		}
	},

	startSubscrolling: function() {
		if (this.check_isCurrentlySubscrolling() || this.el_body.hasClass(this.obj_classes.moveout)) {
			/*
			 * Do nothing if we're already in subscrolling mode or if the sticky header is moving out at this moment.
			 */
			return;
		}

		this.el_header.setStyle('position', 'absolute');
		this.el_header.setStyle('top', this.int_currentScrollY);
		this.el_body.addClass(this.obj_classes.subscrolling);
	},

	stopSubscrolling: function() {
		if (!this.check_isCurrentlySubscrolling()) {
			/*
			 * Do nothing if we're already not in subscrolling mode.
			 */
			return;
		}

		this.el_header.setStyle('position', null);
		this.el_header.setStyle('top', null);
		this.el_body.removeClass(this.obj_classes.subscrolling);
	},

	toggleStickyStatus: function() {
		if (!this.check_isCurrentlySticky()) {
			if (this.int_currentScrollY > this.obj_verticalPositionToSwitchSticky.int_yPosStart) {
				this.makeSticky();
			}
		} else {
			if (this.int_currentScrollY <= this.obj_verticalPositionToSwitchSticky.int_yPosEnd) {
				if (lsjs.scrollAssistant.__view.str_currentDirection !== 'down') {
					this.makeUnsticky();
				}
			}
		}
	},

	handleScrollingUp: function() {
		if (lsjs.scrollAssistant.__view.str_currentDirection !== 'up') {
			return;
		}

		if (
			!this.check_isCurrentlySubscrolling()
			&& this.obj_stickyHeader.int_height > window.innerHeight
		) {
			/*
			 * If we're currently not in subscrolling mode but we know that the sticky header is higher than the
			 * viewport, we don't want to show the sticky header when scrolling up because sliding in such a big
			 * header seems a bit strange and there doesn't seem to be a way to do it well.
			 */
			return;
		}


		if (this.check_isCurrentlySubscrolling()) {
			if (this.el_header.getCoordinates().top > this.int_currentScrollY) {
				this.el_header.setStyle('top', this.int_currentScrollY);
			}
			return;
		}

		/*
		 * Show sticky header if the scroll speed was high enough
		 */
		if (
			lsjs.scrollAssistant.__view.int_lastScrollSpeed > this.__models.options.data.int_minScrollSpeedToShowSticky
			|| this.int_currentScrollY <= this.obj_verticalPositionToSwitchSticky.int_yPosEnd
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

		if (this.check_isCurrentlySubscrolling()) {
			var int_yPositionToStopSubscrolling = window.innerHeight * 0.7;
			if (this.int_currentScrollY + int_yPositionToStopSubscrolling < this.el_header.getCoordinates().top + this.obj_stickyHeader.int_height) {
				/*
				 * We don't want the sticky header to disappear unless it is scrolled up to a certain point
				 */
				return;
			} else {
				if (!this.check_isCurrentlyPreparingForSubscrollingMoveout()) {
					this.prepareForSubscrollingMoveout();
					/*
					 * A small delay is required here to make sure that browsers can handle the position change correctly
					 * before starting the transition to move the sticky header out of the viewport
					 */
					window.setTimeout(
						function() {
							this.stopSubscrolling();
							this.hideSticky();
						}.bind(this),
						10
					);
				}
				return;
			}
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

	prepareForSubscrollingMoveout: function() {
		if (this.check_isCurrentlyPreparingForSubscrollingMoveout()) {
			return;
		}

		this.el_body.addClass(this.obj_classes.subscrollingPreparingForMoveout);
		// console.log(this.el_header.getCoordinates().top);
		// console.log(this.int_currentScrollY);
		// console.log(this.el_header.getCoordinates().top - this.int_currentScrollY);
		var int_yPosToSetFixedTopPositionTo =  this.el_header.getCoordinates().top - this.int_currentScrollY;
		this.el_header.setStyle('top', int_yPosToSetFixedTopPositionTo);
		this.el_header.setStyle('position', null);
	},

	showSticky: function(){
		this.el_body.addClass(this.obj_classes.show);
		this.el_body.removeClass(this.obj_classes.moveout);
	},

	hideSticky: function() {
		if (this.__models.options.data.bln_alwaysShowStickyHeader) {
			return;
		}
		this.el_body.addClass(this.obj_classes.moveout);
		this.obj_stickyHeader.moveOffCanvas();
	},

	makeSticky: function() {
		this.el_body.addClass(this.obj_classes.sticky);
		this.untouchHeaderIfNecessary();
		this.obj_stickyHeader.moveOffCanvas();

		if (
			this.__models.options.data.bln_alwaysShowStickyHeader
			&& (
				this.obj_stickyHeader.int_height <= window.innerHeight
				|| this.__models.options.data.bln_untouchEverythingInHeaderAfterHidingSticky
			)
		) {
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
		if (this.__models.options.data.bln_stickyOnly) {
			return;
		}

		this.untouchHeaderIfNecessary();
		this.el_body.removeClass(this.obj_classes.sticky);
		this.el_body.removeClass(this.obj_classes.show);
		this.el_body.removeClass(this.obj_classes.moveout);
		this.stopSubscrolling();
		this.obj_stickyHeader.moveInCanvas();
	},

	check_isCurrentlySticky: function() {
		return this.el_body.hasClass(this.obj_classes.sticky);
	},

	check_isCurrentlyShowingStickyHeader: function() {
		return this.el_body.hasClass(this.obj_classes.show);
	},

	check_isCurrentlySubscrolling: function() {
		return this.el_body.hasClass(this.obj_classes.subscrolling);
	},

	check_isCurrentlyPreparingForSubscrollingMoveout: function() {
		return this.el_body.hasClass(this.obj_classes.subscrollingPreparingForMoveout);
	},

	untouchHeaderIfNecessary: function() {
		if (this.__models.options.data.bln_untouchEverythingInHeaderAfterHidingSticky) {
			var els_touchedHeaderElements = this.el_header.getElements('.touched');
			if (typeOf(els_touchedHeaderElements) !== 'elements' || els_touchedHeaderElements.length === 0) {
				/*
				 * Nothing to untouch, so just return
				 */
				return;
			}

			/*
			 * If we fire clicks an all elements with the touched class, we could trigger
			 * the transition which would fold expanded elements. Unfortunately, we have
			 * a click event listener on the header which doesn't seem to be okay with it!
			 */
			els_touchedHeaderElements.fireEvent('click');
			/*
			 * If we didn't want collapsing subnavigations to be transitioned, we could simply
			 * remove the touched classes instead of firing click events.
			 */
			// els_touchedHeaderElements.removeClass('touched');

			window.setTimeout(
				function() {
					this.obj_verticalPositionToSwitchSticky.determinePos();
					this.obj_stickyHeader.determineSizesAndPositions();
				}.bind(this),
				this.__models.options.data.int_timeToWaitForRecalculationsAfterHeaderClickInMs
			);
			// this.__view.handleSubscrolling();
		}
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();