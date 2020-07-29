(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
		lsjs[str_moduleName] = this.__module;

		this.initializeScrollPositionKeeper();
	},

	initializeScrollPositionKeeper: function() {
		window.addEvent('domready', function() {
			Array.each($$('.onClickToScrollPosition'), function(el) {
				el.addEvent('click', function() {
					this.getLSFEScrollOffset();
				}.bind(this));
			}.bind(this));
		}.bind(this));

		window.addEvent('load', function() {
			this.scrollToLSFEOffset();
		}.bind(this));
	},
	
	/**
	 * Saves the current vertical page offset in a cookie which causes
	 * the page to scroll to that vertical position on the next page load.
	 */
	getLSFEScrollOffset: function() {
		Cookie.write('LSFE_PAGE_OFFSET', window.getScroll().y);
	},
	
	/**
	 * This function scrolls to a vertical page offset if it has been
	 * saved previously in a cookie
	 */
	scrollToLSFEOffset: function() {
		var LSFE_PAGE_OFFSET = Cookie.read('LSFE_PAGE_OFFSET');
		if (LSFE_PAGE_OFFSET === undefined || LSFE_PAGE_OFFSET === null) {
			return;
		}
		window.scrollTo(null, parseInt(LSFE_PAGE_OFFSET));
		Cookie.dispose('LSFE_PAGE_OFFSET');
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.__moduleHelpers[str_moduleName] = {
	self: null,

	start: function() {
		this.self = lsjs.createModule({
			__name: str_moduleName
		});
	}
};

})();