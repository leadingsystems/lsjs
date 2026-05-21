var obj_classdef_model = {
	name: 'options',

	/*
	 * Options:
	 *  str_selectorForElementToStick:
	 *      CSS selector for the element that should become sticky (typically the header)
	 *
	 *  str_selectorForElementToSaveSpace:
	 *      CSS selector for an element that receives compensating padding to prevent
	 *      content from jumping when the header switches to absolute/fixed positioning.
	 *      Set to null if the layout already positions the header absolutely.
	 *
	 *  int_minScrollSpeedToShowSticky:
	 *      minimum upward scroll speed (pixels per frame) required before the sticky
	 *      header becomes visible
	 *
	 *  int_minScrollSpeedToHideSticky:
	 *      minimum downward scroll speed (pixels per frame) required before the sticky
	 *      header is hidden again
	 *
	 *  int_timeToWaitForRecalculationsAfterHeaderClickInMs:
	 *      time in ms to wait before recalculating sizes/positions after a click in the
	 *      header. Should correspond with CSS transition durations (e.g. opening
	 *      subnavigations).
	 *
	 *  bln_stickyOnly:
	 *      true if the header should always be sticky and the non-sticky state should
	 *      never occur
	 *
	 *  bln_alwaysShowStickyHeader:
	 *      true if the sticky header should be visible without the need to scroll upwards
	 *
	 *  bln_untouchEverythingInHeaderAfterHidingSticky:
	 *      when true, expanded subnavigations and similar elements inside the header are
	 *      collapsed (untouched) whenever the sticky header is hidden
	 *
	 *  int_stickyStartEndDistance:
	 *      distance in pixels between the vertical scroll position where stickiness
	 *      starts and where it ends (hysteresis to prevent flickering)
	 *
	 *  bln_debug:
	 *      set to true for helpful debugging output in the console
	 */
	data: {
		str_selectorForElementToStick: 'header',
		str_selectorForElementToSaveSpace: 'body',
		int_minScrollSpeedToShowSticky: 1,
		int_minScrollSpeedToHideSticky: 1,
		int_timeToWaitForRecalculationsAfterHeaderClickInMs: 800,
		bln_stickyOnly: false,
		bln_alwaysShowStickyHeader: false,
		bln_untouchEverythingInHeaderAfterHidingSticky: true,
		int_stickyStartEndDistance: 150,
		bln_debug: false
	},

	start: function() {
	},

	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};