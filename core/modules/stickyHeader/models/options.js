var obj_classdef_model = {
	name: 'options',

	data: {
		str_stickyClass: 'sticky',

		str_selectorForElementToStick: 'header',

		/*
		 * Can be set to null, which means that no space saver padding should be applied
		 */
		str_selectorForElementToSaveSpace: 'body',

		int_minScrollSpeedToShowSticky: 1,
		int_minScrollSpeedToHideSticky: 1,

		/*
		 * When scrolling up, the sticky header should disappear before reaching the original header position to
		 * make sure that switching from the sticky header to the non-sticky header doesn't look weird.
		 * If this parameter is set to 1, this means that the sticky header will disappear when reaching the
		 * non-sticky header's bottom position plus the sticky header's height * 1. If the sticky header has a very
		 * small height, a factor of 2 or more might be a good choice.
		 */
		int_factorForCalculatingPositionToHideStickyHeader: 1,

		/*
		 * If opening subnavigations etc. takes some time due to transitions, we have to make sure not to try to calculate
		 * sizes and positions to early. This parameter defines the time to wait for a recalculation and should correspond
		 * with css transition times.
		 */
		int_timeToWaitForRecalculationsAfterHeaderClickInMs: 800,

		bln_alwaysShowStickyHeader: false,
		bln_debug: false
	},

	start: function() {
	},

	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};