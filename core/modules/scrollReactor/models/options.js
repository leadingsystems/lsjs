var obj_classdef_model = {
	name: 'options',

	/*
	 * Options:
	 *  arr_reactions:
	 *      array of reaction objects. Each reaction defines scroll-position-based
	 *      callbacks. A reaction object supports the following properties:
	 *
	 *      int_scrollPositionTop:
	 *          upper scroll threshold in pixels (default: 100)
	 *
	 *      int_scrollPositionBottom:
	 *          lower scroll threshold in pixels (default: 300)
	 *
	 *      func_reactionCrossingTop:
	 *          callback fired when scrolling past the top threshold
	 *
	 *      func_reactionCrossingBottom:
	 *          callback fired when scrolling past the bottom threshold
	 *
	 *      func_reactionBetween:
	 *          callback fired while the scroll position is between the two thresholds
	 *
	 *      obj_reactOn:
	 *          controls which scroll directions trigger each callback.
	 *          { str_crossingTop: 'both', str_crossingBottom: 'both',
	 *            str_between: 'both' }
	 *          Possible values: 'up', 'down', 'both', 'none'
	 *
	 *      obj_reactTimes:
	 *          limits how many times each callback fires.
	 *          { int_crossingTop: 0, int_crossingBottom: 0, int_between: 0 }
	 *          0 means unlimited; any positive integer counts down to zero and then
	 *          sets the corresponding obj_reactOn value to 'none'.
	 *
	 *      arr_elementSelectorsInvolved:
	 *          array of CSS selectors. If set, the reaction is skipped when none
	 *          of the referenced elements exist in the DOM.
	 */
	data: {
		arr_reactions: []
	},
	
	start: function() {
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};