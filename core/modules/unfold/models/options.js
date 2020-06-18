var obj_classdef_model = {
	name: 'options',
	
	data: {},
	
	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 */
		this.data = {
			/*
			 * Mandatory.
			 * 
			 * The selector for the toggler. If the selector matches multiple elements,
			 * they all will be used. Can also be a DOM element or a collection of DOM elements.
			 */
			var_togglerSelector: '#whateverToggler',

			/*
			 * Mandatory.
			 * 
			 * The selector for the resize box. Only the first matched element will
			 * be used. Can also be a DOM element.
			 */
			var_contentBoxSelector: '#whateverContentBox',

			/*
			 * Optional.
			 * 
			 * The selector for the wrapper. Only the first matched element will
			 * be used. Can also be a DOM element.
			 */
			var_wrapperSelector: null,

			/*
			 * Optional.
			 * 
			 * The selector for a specific close button. If the selector
			 * matches multiple elements, they all will be used. Can also be a
			 * DOM element or a collection of DOM elements.
			 */
			var_closeButtonSelector: null,

			/*
			 * Optional.
			 * 
			 * True, if the content box should be automatically wrapped in another
			 * element, that's being resized instead of the given content box itself.
			 * 
			 * False, if no new element should be created and if the content box itself
			 * should be resized when folding/unfolding
			 */
			bln_automaticallyCreateResizeBox: true,

			/*
			 * Optional.
			 * 
			 * Defines, which events are used to toggle the unfold effect.
			 * All event type values for the Mootools addEvent function are possible.
			 * Also, an array holding two event types can be given. In this case,
			 * the two event types will be switched, which makes mouseenter/mouseleave
			 * or mouseover/mouseout possible.
			 * 
			 * If the only way to close the element should be the click on a special
			 * close button or an outside click, the second event in the array can be
			 * 'closeButton'. Actually, every non-existing can be used, because the
			 * only way that this event can be triggered is by explicitly calling it,
			 * which happens in case of a close button click or outside click.
			 * 
			 * Examples: ['mouseenter', 'mouseleave'] or ['mouseenter', 'closeButton'] etc.
			 */
			str_togglerEventType: 'click',

			/*
			 * Optional.
			 * Possible values: 'open' or 'closed'.
			 * 
			 * Defines, whether the element is already opened when instantiating the
			 * effect. Please note that this value refers to the element's status
			 * before the lsUnfold effect is initialized. This means that an element
			 * that, without active javascript, would be displayed as open because
			 * of its css styles needs this value set to 'open' even if (with active
			 * javascript and lsUnfold applied) it will be closed instantly using
			 * the options 'bln_toggleOnInitialization' and 'bln_skipAnimationWhenTogglingOnInitialization'
			 * or the option 'str_initialCookieStatus'.
			 */
			str_initialToggleStatus: 'open',

			/*
			 * Optional.
			 * Boolean.
			 * 
			 * True if the element should be morphed right after initialization
			 * (simulating an automatic toggle).
			 */
			bln_toggleOnInitialization: false,

			/*
			 * Optional.
			 * Boolean.
			 * 
			 * True if the animation should be skipped when the element is being
			 * toggled on initialization
			 */
			bln_skipAnimationWhenTogglingOnInitialization: false,

			/*
			 * Optional.
			 * 
			 * If set, this name will be used to store the toggle status in a cookie
			 * and then later restore it on page reload
			 */
			str_cookieIdentifierName: '',

			/*
			 * Optional.
			 * 
			 * If set to either closed or open, this value is used as the initial
			 * cookie status if the cookie doesn't exist yet.
			 */
			str_initialCookieStatus: '',

			/*
			 * Optional.
			 * Boolean.
			 * 
			 * True if a click outside the unfolded element should close it
			 */
			bln_closeOnOutsideClick: false,

			/*
			 * Optional.
			 * Possible values: 'height', 'margin-top'
			 * 
			 * The animation mode defines which css property is used to unfold
			 * the resizeBox.
			 */
			str_animationMode: 'height',

			/*
			 * Optional.
			 * Boolean.
			 * 
			 * True, if the paddings of the resizeBox should also be morphed to
			 * and from 0. Please keep in mind, that it is much better not to have
			 * a padding on the resizeBox at all but instead set the padding to an
			 * element inside the resizeBox.
			 */
			bln_morphPaddings: false,

			/*
			 * Optional.
			 * Boolean.
			 * 
			 * When using the animation mode "margin-top" the resizeBox is probably
			 * hidden outside the window using a negative margin. Unfolding the element
			 * means morphing from the negative margin to zero margin.
			 * 
			 * Using this flag, the current window scroll position can be considered,
			 * so that the element will not morph from its negative margin to zero margin
			 * but to the scroll position as a positive margin, which means that the 
			 * element still moves inside the screen from the top, no matter what
			 * the current scroll position is.
			 */
			bln_considerWindowScrollInMarginAnimationMode: false,

			/*
			 * Optional.
			 * Boolean.
			 * 
			 * If the animation mode "margin-top" has been usde to slide the element
			 * in from the top, this flag can be used to make sure, that the element
			 * stays visible even if the user scrolls the window.
			 */
			bln_moveWithWindowScrollInMarginAnimationMode: false,

			/*
			 * Optional.
			 * Object
			 * 
			 * If bln_moveWithWindowScrollInMarginAnimationMode is true, then the
			 * element stays in its position when the window is being scrolled. However,
			 * if the element is higher then the visible screen/window, it will be scrolled
			 * up and down until its top or bottom edge is inside the visible area.
			 * The offsets that can be defined in this object will be considered when
			 * determining whether the top or bottom edge is in the visible area.
			 * Example: A bottom value of 10 means that when scrolling down, the element
			 * will move up until its bottom edge is 10 px inside the visible area.
			 */
			obj_moveWithWindowScrollInMarginAnimationModeOffsets: {
				/*
				 * Integer
				 * 
				 * The offset in px without unit.
				 */
				top: 0,

				/*
				 * Integer
				 * 
				 * The offset in px without unit.
				 */
				bottom: 0
			},

			/*
			 * Optional, if the resizeBox starts opened.
			 * Mandatory, if the resizeBox starts closed.
			 * 
			 * Can be any valid value for the css property "display" (e.g. "block",
			 * "inline-block" etc.). This option needs to be set, if the element
			 * to resize starts with "display: none;" in which case lsUnfold would
			 * not be able to determine the correct display type to use for the
			 * visible/unfolded state of the element.
			 */
			str_initialDisplayType: null,

			/*
			 * Optional.
			 * Possible values: 'measure', 'getStyle', 'auto' or the height in
			 * pixels without unit, e.g. 150
			 * 
			 * The initial height value can either be given directly (var_initalHeight: 'auto',
			 * var_initalHeight: 150) or it can be determined using the getStyle method
			 * (var_initalHeight: 'getStyle') or it can be determined using the
			 * getDimensions method (var_initalHeight: 'measure').
			 * 
			 * In most cases, it's best not to use 'measure' or 'getStyle' because
			 * it's not always easy to understand what the expected result should be.
			 * 
			 * If the resizeBox should be able to adapt its size dynamically (e.g.
			 * because its content can grow), the value 'auto' should be set and it
			 * is also important do define 'height: auto;' in the stylesheet for this
			 * element as well, if the resizeBox starts opened.
			 */
			var_initialHeight: 'auto',

			/*
			 * Optional.
			 * Integer.
			 * 
			 * When lsUnfold determines the size to which the element should be unfolded,
			 * it is sometimes necessary to manipulate that value by adding a positive
			 * or negative offset.
			 */
			int_heightOffset: 0,

			/*
			 * Optional.
			 * Integer.
			 *
			 * When lsUnfold determines the size to which the element should be unfolded,
			 * it is sometimes necessary to manipulate that value by adding a positive
			 * or negative offset.
			 */
			int_widthOffset: 0,

			/*
			 * Optional.
			 * 
			 * The class to add to the wrapper, the toggler and the resizeBox when
			 * the status is open.
			 */
			str_classOpen: 'lsUnfoldOpen',

			/*
			 * Optional.
			 * 
			 * The class to add to the wrapper, the toggler and the resizeBox when
			 * the status is closed.
			 */
			str_classClosed: 'lsUnfoldClosed',

			/*
			 * Optional.
			 * 
			 * The class to add to the wrapper, the toggler and the resizeBox when
			 * the status is running.
			 */
			str_classRunning: 'lsUnfoldRunning',

			/*
			 * For development purposes you can activate a logging in the console
			 */
			bln_useLogging: false,

			/*
			 * Optional.
			 * 
			 * The class to add to the wrapper and close button to indicate that lsUnfold is
			 * used with this element. This can be used in a css selector in order to only
			 * display a toggler button if the element can actually be toggled.
			 */
			str_classUseLsUnfold: 'useLsUnfold',

			obj_morphOptions: {
				'duration': 250,
				'link': 'ignore'
			}
		};
	},
	
	set: function(obj_options) {
		/*
		 * The user calls this function in order to override our default values.
		 * 
		 * After that we add our onComplete function (not before, because it must
		 * not be overridden) and in the onComplete function we make a call to
		 * the onComplete function possibly given as a user argument.
		 */
		Object.merge(this.data, obj_options);
		
		this.data.obj_morphOptions.onComplete = function() {
			this.__view.setEndStyles();
			this.__view.toggleStatus();
			this.__view.onMorphComplete();
			if (
					obj_options.obj_morphOptions !== undefined
				&&	obj_options.obj_morphOptions.onComplete !== undefined
				&&	typeOf(obj_options.obj_morphOptions.onComplete) === 'function'
			) {
				obj_options.obj_morphOptions.onComplete();
			}
		}.bind(this);
		
		this.__module.onModelLoaded();
	}
};