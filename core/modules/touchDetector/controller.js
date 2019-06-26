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

	start: function() {
		this.bound_touchStartListener = this.touchStartListener.bind(this);

        window.addEvent(
            'touchstart',
            this.bound_touchStartListener
        );
    },

	touchStartListener: function() {
        console.log('touching');
        $$('body')[0].addClass('user-is-touching');
        window.removeEvent('touchstart', this.bound_touchStartListener);
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