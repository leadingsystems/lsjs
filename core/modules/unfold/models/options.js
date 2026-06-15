var obj_classdef_model = {
	name: 'options',

	data: {},

	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 *
		 * Options:
		 *  var_togglerSelector: (mandatory)
		 *      selector for the toggler element(s). If multiple elements match, they
		 *      all act as togglers. Can also be a DOM element or collection.
		 *
		 *  var_contentBoxSelector: (mandatory)
		 *      selector for the content box to fold/unfold. Only the first match is
		 *      used. Can also be a DOM element.
		 *
		 *  var_wrapperSelector:
		 *      selector for a wrapper element surrounding toggler and content. Only
		 *      the first match is used. Receives open/closed/running CSS classes.
		 *
		 *  var_closeButtonSelector:
		 *      selector for a dedicated close button. Multiple matches are supported.
		 *
		 *  bln_automaticallyCreateResizeBox:
		 *      true to automatically wrap the content box in a helper element that
		 *      handles the resizing. False to resize the content box element itself.
		 *
		 *  str_togglerEventType:
		 *      event type for toggling (default: 'click'). Can be an array with two
		 *      event types for enter/leave patterns, e.g. ['mouseenter', 'mouseleave']
		 *      or ['mouseenter', 'closeButton'].
		 *
		 *  str_initialToggleStatus:
		 *      'open' or 'closed'. Describes the element's visual state before
		 *      lsUnfold is initialized (i.e. the CSS-only state without JavaScript).
		 *
		 *  bln_toggleOnInitialization:
		 *      true to trigger a toggle immediately after initialization
		 *
		 *  bln_skipAnimationWhenTogglingOnInitialization:
		 *      true to skip the animation when toggling on initialization
		 *
		 *  str_cookieIdentifierName:
		 *      if set, the toggle status is persisted in a cookie under this name
		 *      and restored on page reload
		 *
		 *  str_initialCookieStatus:
		 *      'open' or 'closed'. Used as the initial cookie value when no cookie
		 *      exists yet.
		 *
		 *  bln_closeOnOutsideClick:
		 *      true to close the element when clicking outside of it
		 *
		 *  arr_selectorsToLimitCloseOnOutsideClick:
		 *      array of CSS selectors. If set, an outside click only closes the
		 *      element if the click target matches at least one of these selectors.
		 *
		 *  str_animationMode:
		 *      'height' or 'margin-top'. Defines which CSS property drives the
		 *      fold/unfold animation.
		 *
		 *  bln_morphPaddings:
		 *      true to also animate paddings of the resize box to/from 0. Prefer
		 *      setting padding on an inner element instead.
		 *
		 *  bln_considerWindowScrollInMarginAnimationMode:
		 *      (margin-top mode only) true to factor in the current scroll position
		 *      so the element always slides in from the viewport top.
		 *
		 *  bln_moveWithWindowScrollInMarginAnimationMode:
		 *      (margin-top mode only) true to keep the element visible while
		 *      scrolling the page.
		 *
		 *  obj_moveWithWindowScrollInMarginAnimationModeOffsets:
		 *      { top: int, bottom: int } offsets in px for the scroll-tracking
		 *      behaviour above.
		 *
		 *  str_initialDisplayType:
		 *      valid CSS display value (e.g. 'block'). Mandatory when the content
		 *      box starts with display:none, so lsUnfold knows the correct visible
		 *      display type.
		 *
		 *  var_initialHeight:
		 *      'auto', 'measure', 'getStyle' or an integer (px). Determines how the
		 *      unfolded height is calculated. 'auto' is recommended for dynamic
		 *      content (also set height:auto in CSS).
		 *
		 *  int_heightOffset:
		 *      positive or negative pixel offset added to the calculated unfold height
		 *
		 *  int_widthOffset:
		 *      positive or negative pixel offset added to the calculated unfold width
		 *
		 *  str_classOpen:
		 *      CSS class applied to wrapper, toggler and resize box in open state
		 *
		 *  str_classClosed:
		 *      CSS class applied to wrapper, toggler and resize box in closed state
		 *
		 *  str_classRunning:
		 *      CSS class applied during the fold/unfold animation
		 *
		 *  bln_useLogging:
		 *      true to activate development logging in the console
		 *
		 *  str_classUseLsUnfold:
		 *      CSS class added to wrapper and close button to indicate that lsUnfold
		 *      is active. Useful for CSS selectors that only show a toggler when
		 *      JavaScript is available.
		 *
		 *  obj_morphOptions:
		 *      Mootools Fx.Morph options object. Default: { duration: 250, link: 'ignore' }
		 */
		this.data = {
			var_togglerSelector: '#whateverToggler',
			var_contentBoxSelector: '#whateverContentBox',
			var_wrapperSelector: null,
			var_closeButtonSelector: null,
			bln_automaticallyCreateResizeBox: true,
			str_togglerEventType: 'click',
			str_initialToggleStatus: 'open',
			bln_toggleOnInitialization: false,
			bln_skipAnimationWhenTogglingOnInitialization: false,
			str_cookieIdentifierName: '',
			str_initialCookieStatus: '',
			bln_closeOnOutsideClick: false,
			arr_selectorsToLimitCloseOnOutsideClick: [],
			str_animationMode: 'height',
			bln_morphPaddings: false,
			bln_considerWindowScrollInMarginAnimationMode: false,
			bln_moveWithWindowScrollInMarginAnimationMode: false,
			obj_moveWithWindowScrollInMarginAnimationModeOffsets: {
				top: 0,
				bottom: 0
			},
			str_initialDisplayType: null,
			var_initialHeight: 'auto',
			int_heightOffset: 0,
			int_widthOffset: 0,
			str_classOpen: 'lsUnfoldOpen',
			str_classClosed: 'lsUnfoldClosed',
			str_classRunning: 'lsUnfoldRunning',
			bln_useLogging: false,
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