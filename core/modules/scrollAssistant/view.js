(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,

	obj_classes: {
		scrollingDown: 'scrolling-down',
		scrollingUp: 'scrolling-up',
		wide: 'scrolling-beyond-'
	},

	str_currentDirection: 'none',

	int_currentScrollY: 0,
	int_lastScrollY: 0,
	int_scrollDistanceInThisDirection: 0,

	start: function() {
		this.el_body = $$('body')[0];
		window.addEvent('scroll', this.handleScrolling.bind(this));
	},

	handleScrolling: function() {
		this.determineScrollPositionAndDirection();
		this.setBodyClass();
	},

	setBodyClass: function() {
		if (this.str_currentDirection === 'down') {
			this.el_body.addClass(this.obj_classes.scrollingDown);
			this.el_body.removeClass(this.obj_classes.scrollingUp);
		} else if (this.str_currentDirection === 'up') {
			this.el_body.removeClass(this.obj_classes.scrollingDown);
			this.el_body.addClass(this.obj_classes.scrollingUp);
		} else {
			this.el_body.removeClass(this.obj_classes.scrollingDown);
			this.el_body.removeClass(this.obj_classes.scrollingUp);
		}
	},

	determineScrollPositionAndDirection: function() {
		var str_lastDirection = this.str_currentDirection;

		this.int_currentScrollY = window.getScroll().y;

		var int_distance = Math.abs(this.int_lastScrollY - this.int_currentScrollY);

		if (this.int_currentScrollY === 0) {
			this.str_currentDirection = 'none';
		} else if (this.int_currentScrollY > this.int_lastScrollY) {
			this.str_currentDirection = 'down';
		} else if (this.int_currentScrollY < this.int_lastScrollY) {
			this.str_currentDirection = 'up';
		}

		if (this.str_currentDirection !== str_lastDirection) {
			this.int_scrollDistanceInThisDirection = int_distance;
		} else {
			this.int_scrollDistanceInThisDirection += int_distance;
		}

		this.int_lastScrollY = this.int_currentScrollY;
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();