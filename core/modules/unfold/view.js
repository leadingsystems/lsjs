(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	bound_onToggleEvent: null,
	bound_closeOnOutsideClick: null,
	bound_closeOnCloseButtonClick: null,
	
	interval_scrollPositionChecker: null,
	
	els_toggler: null,
	el_resizeBox: null,
	el_contentBox: null,
	el_wrapper: null,
	els_closeButton: null,
	
	var_initialHeight: null,
	obj_initialPaddings: {
		'top': 0,
		'right': 0,
		'bottom': 0,
		'left': 0
	},
	str_initialDisplayType: null,
	int_windowScrollY: 0,
		
	obj_morph: null,
	obj_morphSkipAnimation: null,
	obj_morph_slideToScrollPosition: null,
	
	obj_startStyles: {},
	obj_endStyles: {},
	obj_morphParams: {},
	
	str_toggleStatus: 'open',
	str_togglerEventTypeToUse: 'click',
	
	bln_skipAnimation: false,
	
	start: function() {
		/* -->
		 * Prepare bound functions that are needed for events
		 */
		this.bound_onToggleEvent = this.onToggleEvent.bind(this);
		this.bound_closeOnOutsideClick = this.closeOnOutsideClick.bind(this);
		this.bound_closeOnCloseButtonClick = this.closeOnCloseButtonClick.bind(this);
		/*
		 * <--
		 */
		
		/*
		 * Determine the event type to start with. If the given option value is
		 * a string, this event will be used. If it's an array, which means that
		 * two values should be switched, we start using the first array value.
		 */
		this.str_togglerEventTypeToUse =	typeOf(this.__models.options.data.str_togglerEventType) === 'array'
										?	this.__models.options.data.str_togglerEventType[0]
										:	this.__models.options.data.str_togglerEventType;
		
		/*
		 * Preparing the DOM elements to use. toggler and closeButton can also be
		 * a collection of elements.
		 */
		this.els_toggler = typeOf(this.__models.options.data.var_togglerSelector) === 'element' || typeOf(this.__models.options.data.var_togglerSelector) === 'null' ? this.__models.options.data.var_togglerSelector : $$(this.__models.options.data.var_togglerSelector);
		this.el_wrapper = typeOf(this.__models.options.data.var_wrapperSelector) === 'element' || typeOf(this.__models.options.data.var_wrapperSelector) === 'null' ? this.__models.options.data.var_wrapperSelector : $$(this.__models.options.data.var_wrapperSelector)[0];
		this.els_closeButton = typeOf(this.__models.options.data.var_closeButtonSelector) === 'element' || typeOf(this.__models.options.data.var_closeButtonSelector) === 'null' ? this.__models.options.data.var_closeButtonSelector : $$(this.__models.options.data.var_closeButtonSelector);
		this.el_contentBox = typeOf(this.__models.options.data.var_contentBoxSelector) === 'element' || typeOf(this.__models.options.data.var_contentBoxSelector) === 'null' ? this.__models.options.data.var_contentBoxSelector : $$(this.__models.options.data.var_contentBoxSelector)[0];
		
		/*
		 * Don't do anything without a toggler element and a resizeBox element.
		 */
		if (
				this.els_toggler === undefined || this.els_toggler === null
			||	this.el_contentBox === undefined || this.el_contentBox === null
		) {
			if (this.__models.options.data.bln_useLogging) {
				console.error('required elements missing:');
				console.log('this.els_toggler', this.els_toggler);
				console.log('this.el_contentBox', this.el_contentBox);
				console.log('this.__models.options.data', this.__models.options.data);
			}
			return;
		}
		
		this.str_toggleStatus = this.__models.options.data.str_initialToggleStatus;
		
		if (this.__models.options.data.bln_automaticallyCreateResizeBox) {
			/*
			 * Create a resizeBox and wrap the given content box in it. The
			 * newly created resizeBox is then used for the morph.
			 */
			this.el_resizeBox = new Element('div.lsUnfoldResizeBox').wraps(this.el_contentBox);
			this.el_resizeBox.setStyles({
				height: 'auto',
				overflow: 'hidden',
				display: this.__models.options.data.str_initialToggleStatus === 'open' ? 'block' : 'none'
			});
		} else {
			/*
			 * Don't create a new element but insead use the given contentBox
			 * directly for the morph.
			 */
			this.el_resizeBox = this.el_contentBox;
		}
		
		/*
		 * Determining the intial height
		 */
		if (this.__models.options.data.var_initialHeight === 'getStyle') {
			this.var_initialHeight = this.el_resizeBox.getStyle('height');
		} else if (this.__models.options.data.var_initialHeight === 'measure') {
			this.var_initialHeight = this.getResizeBoxHeight();
		} else {
			this.var_initialHeight = this.__models.options.data.var_initialHeight;
		}
		
		/*
		 * Determining the initial paddings
		 */
		this.obj_initialPaddings = this.el_resizeBox.measure(function() {
			var obj_paddings,
				obj_dimensions;
				
				obj_dimensions = this.getDimensions({computeSize: true});
				obj_paddings = {
					'top': obj_dimensions['padding-top'],
					'right': obj_dimensions['padding-right'],
					'bottom': obj_dimensions['padding-bottom'],
					'left': obj_dimensions['padding-left']
				};
				
				return obj_paddings;
		});
		
		/*
		 * Determining the initial display type ('block', 'inline-block' etc.)
		 */
		this.str_initialDisplayType =
			(
					this.__models.options.data.str_initialDisplayType !== undefined
				&&	this.__models.options.data.str_initialDisplayType !== null
			)
			?	this.__models.options.data.str_initialDisplayType
			:	this.el_resizeBox.getStyle('display');
		
		/*
		 * Preparing the morph effect for folding/unfolding the resizeBox
		 */
		this.obj_morph = new Fx.Morph(this.el_resizeBox, this.__models.options.data.obj_morphOptions);
		var obj_morphOptionsSkipAnimation = this.__models.options.data.obj_morphOptions;
		obj_morphOptionsSkipAnimation.duration = 0;
		this.obj_morphSkipAnimation =  new Fx.Morph(this.el_resizeBox, obj_morphOptionsSkipAnimation);
		
		/*
		 * Preparing the morph effect for sliding to the scroll position
		 */
		this.obj_morph_slideToScrollPosition = new Fx.Morph(this.el_resizeBox, {
			'duration': 1000,
			'link': 'cancel'
		});
		
		/* -->
		 * Adding a class to the wrapper and the closeButton (if existing),
		 * indicating that lsUnfold is being used.
		 */
		if (this.el_wrapper !== undefined && this.el_wrapper !== null) {
			this.el_wrapper.addClass(this.__models.options.data.str_classUseLsUnfold);
		}
		
		if (this.els_closeButton !== undefined && this.els_closeButton !== null) {
			this.els_closeButton.addClass(this.__models.options.data.str_classUseLsUnfold);
		}
		/*
		 * <--
		 */
		
		/*
		 * Add the event to the toggler
		 */
		this.els_toggler.addEvent(this.str_togglerEventTypeToUse, this.bound_onToggleEvent);
		
		/*
		 * Make sure classes are set correctly
		 */
		this.adjustClasses();
		
		/*
		 * Toggle directly on initialization, if the corresponding flag is set
		 */
		if (this.__models.options.data.bln_toggleOnInitialization) {
			if (this.__models.options.data.bln_skipAnimationWhenTogglingOnInitialization) {
				this.bln_skipAnimation = true;
			}
			this.els_toggler.fireEvent(this.str_togglerEventTypeToUse);
			if (this.__models.options.data.bln_skipAnimationWhenTogglingOnInitialization) {
				this.bln_skipAnimation = false;
			}
		}
		
		this.considerStatusFromCookie();
	},
	
	considerStatusFromCookie: function() {
		if (!this.__models.options.data.str_cookieIdentifierName) {
			return;
		}
		
		if (
				Cookie.read(this.__models.options.data.str_cookieIdentifierName) !== 'open'
			&&	Cookie.read(this.__models.options.data.str_cookieIdentifierName) !== 'closed'
		) {
			Cookie.write(this.__models.options.data.str_cookieIdentifierName, this.__models.options.data.str_initialCookieStatus ? this.__models.options.data.str_initialCookieStatus : this.str_toggleStatus);
		}
		if (this.str_toggleStatus != Cookie.read(this.__models.options.data.str_cookieIdentifierName)) {
			this.bln_skipAnimation = true;
			this.els_toggler.fireEvent(this.str_togglerEventTypeToUse);
			this.bln_skipAnimation = false;
		}		
	},
	
	onToggleEvent: function(event) {
		/*
		 * If an event is given, we want to prevent the default action,
		 * i.e. to prevent a hyperlink to be followed because if a hyperlinked
		 * anchor is used as the toggler, its link is considered the "fallback
		 * action" if javascript is not active.
		 */
		if (event !== undefined) {
			event.preventDefault();
		}
		
		/*
		 * If the element is currently being unfolded/morphed, we don't
		 * accept another toggle.
		 */
		if (this.obj_morph.isRunning()) {
			return;
		}
		
		/*
		 * The function called here makes sure that the correct toggle event
		 * is active. This is important because if two different event types
		 * are given, they need to be switched (mouseenter -> mouseout -> mouseenter ...)
		 */
		this.updateTogglerEventTypeToUse();
		
		/*
		 * Adding the element classes indicating that the morph is currently running
		 */
		if (this.el_wrapper !== undefined && this.el_wrapper !== null) {
			this.el_wrapper.addClass(this.__models.options.data.str_classRunning);
		}
		this.el_resizeBox.addClass(this.__models.options.data.str_classRunning);
		this.els_toggler.addClass(this.__models.options.data.str_classRunning);
		
		/*
		 * Call the function to either open or close the resizeBox,
		 * depending on the current toggle status.
		 */
		if (this.str_toggleStatus === 'closed') {
			this.openResizeBox();
		} else {
			this.closeResizeBox();
		}
	},
	
	/*
	 * This function makes sure that the correct toggle event is active.
	 * This is important because if two different event types are given,
	 * they need to be switched (mouseenter -> mouseout -> mouseenter ...)
	 */
	updateTogglerEventTypeToUse: function() {
		/*
		 * If the given togglerEventType is not an array, we don't have to
		 * do anything, because only one single event type is given and
		 * there's nothing to switch.
		 */
		if (typeOf(this.__models.options.data.str_togglerEventType) !== 'array') {
			return;
		}
		
		/*
		 * If the event type needs to be switched, we first have to remove the
		 * currently existing event listener, because it listens for the previous
		 * event type.
		 */
		this.els_toggler.removeEvent(this.str_togglerEventTypeToUse, this.bound_onToggleEvent);
		
		/*
		 * Determine which event type to use now.
		 */
		this.str_togglerEventTypeToUse = this.__models.options.data.str_togglerEventType[0] === this.str_togglerEventTypeToUse ? this.__models.options.data.str_togglerEventType[1] : this.__models.options.data.str_togglerEventType[0];
		
		/*
		 * Adding the new event listener for the determined event type.
		 */
		this.els_toggler.addEvent(this.str_togglerEventTypeToUse, this.bound_onToggleEvent);
	},
	
	/*
	 * Opening the resizeBox
	 */
	openResizeBox: function() {
		/*
		 * Determine the height that the opened resizeBox needs to have
		 */
		var int_endHeight = this.getResizeBoxHeight();
		
		/*
		 * Adding the event to listen for the outside click if necessary
		 */
		if (this.__models.options.data.bln_closeOnOutsideClick) {
			window.addEvent('click', this.bound_closeOnOutsideClick);
		}
		
		/*
		 * Adding the event to listen for the close button click if necessary
		 */
		if (this.els_closeButton) {
			this.els_closeButton.addEvent('click', this.bound_closeOnCloseButtonClick);
		}
		
		/*
		 * If the window scroll position needs to be considered, it is stored
		 * here for future reference.
		 */
		if (this.__models.options.data.bln_considerWindowScrollInMarginAnimationMode) {
			this.int_windowScrollY = window.getScroll().y;
		}
		
		/*
		 * Adding the offset to the element's target height
		 */
		int_endHeight += this.__models.options.data.int_heightOffset;
		
		/*
		 * Resetting the styles which have to be applied before starting the morph
		 * and the parameters for the morph effect.
		 */
		this.obj_startStyles = {};
		this.obj_morphParams = {};
		
		/*
		 * Different styles and morph parameters have to be used depending on
		 * the animation mode
		 */
		switch (this.__models.options.data.str_animationMode) {
			case 'height':
				/*
				 * When opening, we start with 0 height and we set the initial
				 * display type to make the element visible because before, it
				 * was set to display: none.
				 */
				this.obj_startStyles = {
					'height': 0,
					'display': this.str_initialDisplayType
				};
				
				/*
				 * We morph the element's height from 0 to the end height
				 */
				this.obj_morphParams = {
					'height': [0, int_endHeight]
				};
				
				/*
				 * After the morph effect, we set the initial height value, which
				 * is necessary to make sure that the resizeBox can be set to
				 * auto to allow it to grow flexibly with its content. Otherwise
				 * even if the resizeBox started with height: auto, it would have
				 * a fixed height value after the morph.
				 */
				this.obj_endStyles = {
					'height': this.var_initialHeight
				};
				break;
			
			case 'margin-top':
				/*
				 * When opening, we start with a negative margin that is as big
				 * as the determined element's height. We add the window scroll
				 * position, which might be 0 if the flag indicating that the
				 * scroll position should be considered is not set. If the scroll
				 * position should be considered, the window scroll position added
				 * here makes sure, that the margin where the morph begins positions
				 * the element right outside the window.
				 * 
				 * We also set the initial display type to make the element
				 * visible because before, it was set to display: none.
				 */
				this.obj_startStyles = {
					'margin-top': this.int_windowScrollY + (int_endHeight * -1),
					'display': this.str_initialDisplayType
				};
				
				/*
				 * We morph the element's margin-top from the negative margin
				 * (as big as the element's height) to margin-top 0. To both values
				 * we add the window scroll position which is either a positive
				 * value or 0 if the window scroll position should not be considered.
				 */
				this.obj_morphParams = {
					'margin-top': [this.int_windowScrollY + (int_endHeight * -1), this.int_windowScrollY + 0]
				};				
				break;
		}
		
		/*
		 * If the paddings should also be morphed, we have to adjust the morphParams
		 * as well as the startStyles and endStyles accordingly.
		 */
		if (this.__models.options.data.bln_morphPaddings) {
			this.obj_morphParams['padding-top'] = [0, this.obj_initialPaddings.top];
			this.obj_morphParams['padding-bottom'] = [0, this.obj_initialPaddings.bottom];

			this.obj_startStyles['padding-top'] = 0;
			this.obj_startStyles['padding-bottom'] = 0;

			this.obj_endStyles['padding-top'] = this.obj_initialPaddings.top;
			this.obj_endStyles['padding-bottom'] = this.obj_initialPaddings.bottom;
		}
		
		/*
		 * We apply the startStyles ...
		 */
		this.el_resizeBox.setStyles(this.obj_startStyles);
		
		/*
		 * ... and then we start the morph effect.
		 */
		if (this.bln_skipAnimation) {
			this.obj_morphSkipAnimation.start(this.obj_morphParams);
		} else {
			this.obj_morph.start(this.obj_morphParams);
		}
	},
	
	/*
	 * Closing the resize box
	 */
	closeResizeBox: function() {
		/*
		 * We have to determine the element's current height before starting
		 * the closing morph because with an auto height the element's height
		 * might have changed.
		 */
		var int_beginHeight = this.getResizeBoxHeight();
		
		/*
		 * We don't want any unnecessary event listeners, so we remove the listener
		 * for the click event on the outside click
		 */
		window.removeEvent('click', this.bound_closeOnOutsideClick);
		
		/*
		 * Adding the offset to the element's determined height
		 */
		int_beginHeight += this.__models.options.data.int_heightOffset;
		
		/*
		 * Resetting the startSTyles and morphParams
		 */
		this.obj_startStyles = {};
		this.obj_morphParams = {};
		
		/*
		 * Different styles and morph parameters have to be used depending on
		 * the animation mode
		 */
		switch (this.__models.options.data.str_animationMode) {
			case 'height':
				/*
				 * When closing, we morph from the element's current height to 0
				 */
				this.obj_morphParams = {
					'height': [int_beginHeight, 0]
				};
				
				/*
				 * After the morph, we set the inital height value to make sure
				 * that a subsequent call to openResizeBox() can determine the
				 * element's correct height. We also set display: none to make
				 * sure that the element is hidden.
				 */
				this.obj_endStyles = {
					'height': this.var_initialHeight,
					'display': 'none'
				};
				break;
			
			case 'margin-top':
				/*
				 * When opening, we morph from a zero margin to a negative margin
				 * as big as the element's height. To both values
				 * we add the window scroll position which is either a positive
				 * value or 0 if the window scroll position should not be considered.
				 */
				this.obj_morphParams = {
					'margin-top': [this.el_resizeBox.getStyle('margin-top').toInt(), this.el_resizeBox.getStyle('margin-top').toInt() - int_beginHeight]
				};
				
				/*
				 * After the morph we set display: none to make
				 * sure that the element is hidden.
				 */
				this.obj_endStyles = {
					'display': 'none'
				};
				break;
		}
		
		/*
		 * If the paddings should also be morphed, we have to adjust the morphParams
		 * as well as the startStyles and endStyles accordingly.
		 */
		if (this.__models.options.data.bln_morphPaddings) {
			this.obj_morphParams['padding-top'] = [this.obj_initialPaddings.top, 0];
			this.obj_morphParams['padding-bottom'] = [this.obj_initialPaddings.bottom, 0];

			this.obj_startStyles['padding-top'] = this.obj_initialPaddings.top;
			this.obj_startStyles['padding-bottom'] = this.obj_initialPaddings.bottom;

			this.obj_endStyles['padding-top'] = 0;
			this.obj_endStyles['padding-bottom'] = 0;
		}
		
		/*
		 * We apply the start styles ...
		 */
		this.el_resizeBox.setStyles(this.obj_startStyles);
		
		/*
		 * ... and then we start the morph effect.
		 */
		if (this.bln_skipAnimation) {
			this.obj_morphSkipAnimation.start(this.obj_morphParams);
		} else {
			this.obj_morph.start(this.obj_morphParams);
		}
	},
	
	/*
	 * We keep the current toggle status (open or closed) in a variable and
	 * with this function, we toggle the status. This function gets called
	 * after the morph has finisehd.
	 */
	toggleStatus: function() {
		if (this.str_toggleStatus === 'open') {
			this.str_toggleStatus = 'closed';			
		} else {
			this.str_toggleStatus = 'open';			
		}
		
		if (this.__models.options.data.str_cookieIdentifierName) {
			Cookie.write(this.__models.options.data.str_cookieIdentifierName, this.str_toggleStatus);
		}
	},
	
	/*
	 * The styles to apply after finishing the morph are stored in a variable
	 * and these styles are being applied with this function.
	 */
	setEndStyles: function() {
		this.el_resizeBox.setStyles(this.obj_endStyles);
		
		/*
		 * Reset the end styles so that the end styles of the opening morph
		 * will not be used with the closing morph if the closing morph doesn't
		 * explicitly define end styles.
		 */
		this.obj_endStyles = {};
	},
	
	adjustClasses: function() {
		if (!this.obj_morph.isRunning()) {
			/*
			 * Remove the running class from the elements
			 */
			if (this.el_wrapper !== undefined && this.el_wrapper !== null) {
				this.el_wrapper.removeClass(this.__models.options.data.str_classRunning);
			}
			this.el_resizeBox.removeClass(this.__models.options.data.str_classRunning);
			this.els_toggler.removeClass(this.__models.options.data.str_classRunning);
		}

		switch (this.str_toggleStatus) {
			case 'open':
				/*
				 * Setting the classes indicating the current status
				 */
				if (this.el_wrapper !== undefined && this.el_wrapper !== null) {
					this.el_wrapper.removeClass(this.__models.options.data.str_classClosed);
					this.el_wrapper.addClass(this.__models.options.data.str_classOpen);
				}
				this.el_resizeBox.removeClass(this.__models.options.data.str_classClosed);
				this.el_resizeBox.addClass(this.__models.options.data.str_classOpen);
				this.els_toggler.removeClass(this.__models.options.data.str_classClosed);
				this.els_toggler.addClass(this.__models.options.data.str_classOpen);
				break;
			
			case 'closed':
				/*
				 * Setting the classes indicating the current status
				 */
				if (this.el_wrapper !== undefined && this.el_wrapper !== null) {
					this.el_wrapper.removeClass(this.__models.options.data.str_classOpen);
					this.el_wrapper.addClass(this.__models.options.data.str_classClosed);
				}
				this.el_resizeBox.removeClass(this.__models.options.data.str_classOpen);
				this.el_resizeBox.addClass(this.__models.options.data.str_classClosed);
				this.els_toggler.removeClass(this.__models.options.data.str_classOpen);
				this.els_toggler.addClass(this.__models.options.data.str_classClosed);
				break;
		}
	},
	
	/*
	 * Things to do when the morph is completed
	 */
	onMorphComplete: function() {
		this.adjustClasses();
		switch (this.str_toggleStatus) {
			case 'open':
				/*
				 * Set the interval for sliding to the scroll position if necessary
				 */
				if (this.__models.options.data.bln_moveWithWindowScrollInMarginAnimationMode) {
					this.interval_scrollPositionChecker = setInterval(this.slideToScrollPosition.bind(this), 100);
				}
				break;
			
			case 'closed':
				/*
				 * Clear the interval for sliding to the scroll position if necessary
				 */
				if (this.__models.options.data.bln_moveWithWindowScrollInMarginAnimationMode) {
					if (this.interval_scrollPositionChecker !== null) {
						clearInterval(this.interval_scrollPositionChecker);
					}
				}
				break;
		}
	},
	
	/*
	 * This function slides the resizeBox to the current scroll position, using
	 * a quite complex logic to determine what the correct position is, if the
	 * resizeBox is bigger than the window.
	 * 
	 * It is very important, that scrolling the window allows the user to also
	 * scroll to the top and bottom of the resizeBox so that he is able to see
	 * its full content.
	 */
	slideToScrollPosition: function() {
		var morph_options = {},
			int_slideTarget,
			str_edgeToSlideTo,
			obj_windowCoordinates,
			obj_elementCoordinates,
			obj_elementCoordinatesWithOffset;
		
		/*
		 * Don't start a new animation if the scroll position has not changed
		 * since the last time that this function has been called.
		 */
		if (window.getScroll().y === this.int_windowScrollY) {
			return;
		}
		
		/*
		 * Store the current position
		 */
		this.int_windowScrollY = window.getScroll().y;
		
		obj_windowCoordinates = {
			'top': window.getScroll().y,
			'bottom': window.getScroll().y + window.getSize().y,
			'width': window.getSize().x,
			'height': window.getSize().y
		};

		obj_elementCoordinates = this.el_resizeBox.getCoordinates();
		obj_elementCoordinatesWithOffset = obj_elementCoordinates;
		obj_elementCoordinatesWithOffset.height = obj_elementCoordinatesWithOffset.height + this.__models.options.data.obj_moveWithWindowScrollInMarginAnimationModeOffsets.top + this.__models.options.data.obj_moveWithWindowScrollInMarginAnimationModeOffsets.bottom;
		obj_elementCoordinatesWithOffset.top -= this.__models.options.data.obj_moveWithWindowScrollInMarginAnimationModeOffsets.top;
		obj_elementCoordinatesWithOffset.bottom -= this.__models.options.data.obj_moveWithWindowScrollInMarginAnimationModeOffsets.bottom;
		
		
		if (obj_elementCoordinatesWithOffset.height <= obj_windowCoordinates.height) {
			/*
			 * The element including its offsets is smaller than or equal the window.
			 * This means that no scrolling is required for the user to see its
			 * full content. In this situation, we slide the element to its
			 * top position.
			 */
			str_edgeToSlideTo = 'top';
		} else {
			/*
			 * The element including its offsets is bigger than the window.
			 * Scrolling is required for the user to see its full content.
			 */
			if (obj_elementCoordinatesWithOffset.top > obj_windowCoordinates.top && obj_elementCoordinatesWithOffset.top < obj_windowCoordinates.bottom) {
				/*
				 * The element's top edge is visible
				 */
				str_edgeToSlideTo = 'top';
			} else if (obj_elementCoordinatesWithOffset.bottom > obj_windowCoordinates.top && obj_elementCoordinatesWithOffset.bottom < obj_windowCoordinates.bottom) {
				/*
				 * The element's bottom edge is visible
				 */
				str_edgeToSlideTo = 'bottom';
			} else {
				/*
				 * None of the element's edges is visible
				 */
				if (obj_elementCoordinatesWithOffset.bottom < obj_windowCoordinates.top) {
					/*
					 * The complete element is above the window's top edge, so we
					 * slide to the element's bottom edge
					 */
					str_edgeToSlideTo = 'bottom';
				} else if (obj_elementCoordinatesWithOffset.top > obj_windowCoordinates.bottom) {
					/*
					 * The complete element is below the window's top edge, so we
					 * slide to the element's top edge
					 */
					str_edgeToSlideTo = 'top';
				} else {
					/*
					 * The element must be higher than the screen and the visible
					 * screen is right between the element's top and bottom edge.
					 * In this situation, we don't slide anywhere which allows the
					 * user to actually scroll to the top and bottom of the element
					 * and to see its full content.
					 */
					str_edgeToSlideTo = 'none';
				}
			}
		}
		
		if (str_edgeToSlideTo === 'top') {
			int_slideTarget = this.int_windowScrollY + this.__models.options.data.obj_moveWithWindowScrollInMarginAnimationModeOffsets.top;
		} else if (str_edgeToSlideTo === 'bottom') {
			int_slideTarget = (this.int_windowScrollY - (obj_elementCoordinatesWithOffset.height - obj_windowCoordinates.height));
		} else {
			// don't slide anywhere
			return;
		}
				
		morph_options[this.__models.options.data.str_animationMode] = int_slideTarget;
		this.obj_morph_slideToScrollPosition.start(morph_options);
	},
	
	/*
	 * Closing the element with a click outside the wrapper element
	 */
	closeOnOutsideClick: function(event) {
		var bln_clickedInside = false;
		
		/*
		 * Ignore the click if the morph is running because we don't want
		 * the resizeBox to be closed before it is even completely open.
		 */
		if (this.obj_morph.isRunning()) {
			return;
		}

		/* -->
		 * Don't close if the click was inside, which is the case if the
		 * event.target itself or one of its parents is either el_resizeBox
		 * or el_wrapper
		 */
		if (event.target === this.el_resizeBox || event.target === this.el_wrapper) {
			bln_clickedInside = true;
		}

		Array.each(event.target.getParents(), function(el_parent) {
			if (el_parent === this.el_resizeBox || el_parent === this.el_wrapper) {
				bln_clickedInside = true;
			}
		}.bind(this));

		if (bln_clickedInside) {
			return;
		}
		/*
		 * <--
		 */
		
		/*
		 * Call the onToggleEvent function which actually closes the resizeBox
		 */
		this.onToggleEvent();
	},
	
	/*
	 * Close the resizeBox if the close button is clicked.
	 */
	closeOnCloseButtonClick: function() {
		/*
		 * Ignore the click if the morph is running because we don't want
		 * the resizeBox to be closed before it is even completely open.
		 */
		if (this.obj_morph.isRunning()) {
			return;
		}

		/*
		 * Call the onToggleEvent function which actually closes the resizeBox
		 */
		this.onToggleEvent();
	},
	
	/*
	 * This function determines the resizeBox's height and also considers the
	 * element's box-sizing, which requires the element's padding and border to
	 * be subtracted (content-box) or not (border-box).
	 */
	getResizeBoxHeight: function() {
		var obj_dimensions,
			int_height;
	
		obj_dimensions = this.el_resizeBox.getDimensions({computeSize: true});
		int_height = obj_dimensions.height;
		
		if (this.el_resizeBox.getStyle('box-sizing') !== 'border-box') {
			int_height = int_height - obj_dimensions['padding-top'] - obj_dimensions['padding-bottom'] - obj_dimensions['border-top-width'] - obj_dimensions['border-bottom-width'];
		}
		
		return int_height;
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();