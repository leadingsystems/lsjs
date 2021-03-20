var obj_classdef_model = {
	name: 'options',

	data: {
		str_selectorForElementToStick: 'header',

		/*
		 * The sticky header script uses "position: absolute" and "position: fixed" for the header. If the header is
		 * originally positioned relatively or statically, it is probably necessary to apply a padding to an element in
		 * order to make sure that the space that was used by the header won't collapse which would cause the following
		 * content to "jump".
		 *
		 * Can be set to null, which means that no space saver padding should be applied, e.g. in situations where the
		 * layout originally already positions the header absolutely.
		 */
		str_selectorForElementToSaveSpace: 'body',

		int_minScrollSpeedToShowSticky: 1,
		int_minScrollSpeedToHideSticky: 1,

		/*
		 * If opening subnavigations etc. takes some time due to transitions, we have to make sure not to try to calculate
		 * sizes and positions to early. This parameter defines the time to wait for a recalculation and should correspond
		 * with css transition times.
		 */
		int_timeToWaitForRecalculationsAfterHeaderClickInMs: 800,

		bln_alwaysShowStickyHeader: false,

		bln_untouchEverythingInHeaderAfterHidingSticky: true,

		/*
		 * Distance in pixels between the vertical position where stickyness starts and where it ends
		 */
		int_stickyStartEndDistance: 100,

		/*
		 * Set to true for helpful debugging output
		 */
		bln_debug: false
	},

	start: function() {
	},

	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};