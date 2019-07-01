/*
 *
 * How to use this module:
 *
 * Just add the following line to your app.js:
 *
 * lsjs.__moduleHelpers.touchDetector.start({});
 *
 * As soon as the user touches for the first time, the body class "user-is-touching" will be set.
 * This class is being used e.g. by the touchNavi module and, of course, can also be used for anything else.
 */

(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	bound_touchStartListener: null,
	bound_tabListener: null,
	bound_mouseListener: null,

	start: function() {
		this.bound_touchStartListener = this.touchStartListener.bind(this);
		this.bound_tabListener = this.tabListener.bind(this);
		this.bound_mouseListener = this.mouseListener.bind(this);

        window.addEvent(
            'touchstart',
            this.bound_touchStartListener
        );

        window.addEvent(
            'keydown',
            this.bound_tabListener
        );
    },

	touchStartListener: function() {
        $$('body')[0].addClass('user-is-touching');
        window.removeEvent('touchstart', this.bound_touchStartListener);
	},

	tabListener: function() {
        $$('body')[0].addClass('user-is-tabbing');
        window.removeEvent('keydown', this.bound_tabListener);

        window.addEvent(
            'mousedown',
            this.bound_mouseListener
        );
	},

	mouseListener: function() {
        $$('body')[0].removeClass('user-is-tabbing');
        window.removeEvent('mousedown', this.bound_mouseListener);

        window.addEvent(
            'keydown',
            this.bound_tabListener
        );
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