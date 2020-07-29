(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	arr_preparedReactions: [],

	str_currentDirection: 'down',

	int_currentScrollY: 0,
	int_lastScrollY: 0,

	obj_currentReaction: null,

	obj_defaultReaction: {
		func_reactionCrossingTop: function() {
			console.log('default reaction crossing top ' + this.str_currentDirection);
		},
		func_reactionCrossingBottom: function() {
			console.log('default reaction crossing bottom ' + this.str_currentDirection);
		},
		func_reactionBetween: function() {
			console.log('default reaction ' + this.str_currentDirection + ' between ' + this.obj_currentReaction.int_scrollPositionTop + ' and ' + this.obj_currentReaction.int_scrollPositionBottom);
		},
		int_scrollPositionTop: 100,
		int_scrollPositionBottom: 300,
		obj_reactOn: {
			str_crossingTop: 'both', // up, down, both, none
			str_crossingBottom: 'both', // up, down, both, none
			str_between: 'both' // up, down, both, none
		},

		/*
		 * Defines how many times the reactio for a specific scroll event will be performed.
		 * 0 means no limit at all; any integer value will be counted down to zero and then the
		 * corresponding obj_reactOn value will be set to 'none'
		 */
		obj_reactTimes: {
			int_crossingTop: 0,
			int_crossingBottom: 0,
			int_between: 0
		},

		/*
		 * If the elements involved in the reaction are stated here,
		 * the reaction will be dismissed if none of the elements are
		 * present during initialization
		 */
		arr_elementSelectorsInvolved: [],

		bln_aboveScrollPositionTop: true,
		bln_aboveScrollPositionBottom: true,
		bln_crossedScrollPositionTop: false,
		bln_crossedScrollPositionBottom: false
	},
	
	start: function() {
		this.initializeReactor();
		window.addEvent('resize', this.initializeReactor.bind(this));
		window.addEvent('scroll', this.react.bind(this));
	},

	initializeReactor: function() {
		this.prepareReactions();

		// console.log('this.arr_preparedReactions', this.arr_preparedReactions);
		// console.log('this.__models.options.data.arr_reactions', this.__models.options.data.arr_reactions);

		/*
		 * Make sure to call the react function once in the beginning even if no scroll event has been
		 * triggered because if a page is being opened by an external link using an anchor, the page is being
		 * loaded in an already scrolled position but no scroll event is being triggered.
		 */
		this.react();
	},

	prepareReactions: function() {
		this.arr_preparedReactions = [];

		/*
		 * ->
		 * Only clone and further prepare reactions whose involved elements exist
		 */
		Array.each(this.__models.options.data.arr_reactions, function(obj_reaction) {
			var obj_defaultReaction = Object.clone(this.obj_defaultReaction);
			obj_reaction = Object.merge(obj_defaultReaction, obj_reaction);

			if (!this.check_involvedElementsExist(obj_reaction)) {
				return;
			}

			this.arr_preparedReactions.push(obj_reaction);
		}.bind(this));
		/*
		 * <-
		 */

		Array.each(this.arr_preparedReactions, function(obj_reaction) {
			obj_reaction.func_reactionCrossingTop = obj_reaction.func_reactionCrossingTop.bind(this);
			obj_reaction.func_reactionCrossingBottom = obj_reaction.func_reactionCrossingBottom.bind(this);
			obj_reaction.func_reactionBetween = obj_reaction.func_reactionBetween.bind(this);
		}.bind(this));
	},

	check_involvedElementsExist: function(obj_reaction) {
		/*
		 * If no selectors for involved elements are given, we assume that everything that's required for the
		 * reaction exists and therefore return true.
		 */
		if (obj_reaction.arr_elementSelectorsInvolved.length == 0) {
			return true;
		}

		var bln_elementsExist = false;

		Array.some(obj_reaction.arr_elementSelectorsInvolved, function(str_selector) {
			var els_elementsInvolved = $$(str_selector);

			if (typeOf(els_elementsInvolved) === 'elements' && els_elementsInvolved.length > 0) {
				bln_elementsExist = true;
				return true;
			}
		});

		return bln_elementsExist;
	},

	react: function() {
		this.determineScrollPositionAndDirection();

		// console.log('this.str_currentDirection', this.str_currentDirection);

		Array.each(this.arr_preparedReactions, function (obj_reaction) {
			this.determineReactionRelatedScrollPosition(obj_reaction);
			this.processReaction(obj_reaction);
		}.bind(this));
	},

	determineReactionRelatedScrollPosition: function(obj_reaction) {
		if (obj_reaction.obj_reactOn.str_crossingTop !== 'none' || obj_reaction.obj_reactOn.str_between !== 'none') {
			var bln_aboveScrollPositionTop = this.int_currentScrollY < obj_reaction.int_scrollPositionTop;
			if (obj_reaction.bln_aboveScrollPositionTop !== bln_aboveScrollPositionTop) {
				obj_reaction.bln_crossedScrollPositionTop = true;
				obj_reaction.bln_aboveScrollPositionTop = bln_aboveScrollPositionTop;
			}
		}

		if (obj_reaction.obj_reactOn.str_crossingBottom !== 'none' || obj_reaction.obj_reactOn.str_between !== 'none') {
			var bln_aboveScrollPositionBottom = this.int_currentScrollY < obj_reaction.int_scrollPositionBottom;
			if (obj_reaction.bln_aboveScrollPositionBottom !== bln_aboveScrollPositionBottom) {
				obj_reaction.bln_crossedScrollPositionBottom = true;
				obj_reaction.bln_aboveScrollPositionBottom = bln_aboveScrollPositionBottom;
			}
		}
	},

	determineScrollPositionAndDirection: function() {
		this.int_currentScrollY = window.getScroll().y;
		if (this.int_currentScrollY > this.int_lastScrollY) {
			this.str_currentDirection = 'down';
		} else if (this.int_currentScrollY < this.int_lastScrollY) {
			this.str_currentDirection = 'up';
		}
		this.int_lastScrollY = this.int_currentScrollY;
	},

	processReaction: function(obj_reaction) {
		this.obj_currentReaction = obj_reaction;

		// console.log(obj_reaction);

		if (obj_reaction.bln_crossedScrollPositionTop) {
			if (obj_reaction.obj_reactOn.str_crossingTop === 'both' || obj_reaction.obj_reactOn.str_crossingTop === this.str_currentDirection) {
				if (obj_reaction.obj_reactTimes.int_crossingTop > 0) {
					obj_reaction.obj_reactTimes.int_crossingTop--;
					if (obj_reaction.obj_reactTimes.int_crossingTop === 0) {
						obj_reaction.obj_reactOn.str_crossingTop = 'none';
					}
				}
				obj_reaction.func_reactionCrossingTop();
			}
		}

		if (obj_reaction.bln_crossedScrollPositionBottom) {
			if (obj_reaction.obj_reactOn.str_crossingBottom === 'both' || obj_reaction.obj_reactOn.str_crossingBottom === this.str_currentDirection) {
				if (obj_reaction.obj_reactTimes.int_crossingBottom > 0) {
					obj_reaction.obj_reactTimes.int_crossingBottom--;
					if (obj_reaction.obj_reactTimes.int_crossingBottom === 0) {
						obj_reaction.obj_reactOn.str_crossingBottom = 'none';
					}
				}
				obj_reaction.func_reactionCrossingBottom();
			}
		}

		if (!obj_reaction.bln_aboveScrollPositionTop && obj_reaction.bln_aboveScrollPositionBottom) {
			if (obj_reaction.obj_reactOn.str_between === 'both' || obj_reaction.obj_reactOn.str_between === this.str_currentDirection) {
				if (obj_reaction.obj_reactTimes.int_between> 0) {
					obj_reaction.obj_reactTimes.int_between--;
					if (obj_reaction.obj_reactTimes.int_between === 0) {
						obj_reaction.obj_reactOn.str_between = 'none';
					}
				}
				obj_reaction.func_reactionBetween();
			}
		}

		obj_reaction.bln_crossedScrollPositionTop = false;
		obj_reaction.bln_crossedScrollPositionBottom = false;

		this.obj_currentReaction = null;
	}

};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();