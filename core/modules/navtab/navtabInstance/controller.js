(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
	},
	
	activateStartLabel: function() {
		Array.each(this.__view.__autoElements.main.navtabLabel.filter('.start'), function(el_startLabel) {
			el_startLabel.activate();
		});
	},
	
	gotoPrev: function() {
		var numTabs = this.__view.__autoElements.main.navtabLabel.length;
		var currentTabKey = this.__models.status.data.currentTabKey;
		var newTabKey = currentTabKey - 1;
		
		if (newTabKey < 0) {
			newTabKey = numTabs - 1;
		}

		this.__view.__autoElements.main.navtabLabel[newTabKey].fireEvent('click');
	},
	
	gotoNext: function(bln_useClick) {
		bln_useClick = bln_useClick != undefined ? bln_useClick : false;
		
		var numTabs,
			currentTabKey,
			newTabKey;
		
		numTabs = this.__view.__autoElements.main.navtabLabel.length;
		
		if (!this.__module.__parentModule.__models.options.data.autoplayRandomOrder || bln_useClick) {
			currentTabKey = this.__models.status.data.currentTabKey;
			newTabKey = currentTabKey + 1;
			if (newTabKey > numTabs - 1) {
				newTabKey = 0;
			}
		} else {
			newTabKey = Number.random(0, numTabs - 1);
		}
		
		/*
		 * If the gotoNext function is called by clicking on the next button, the autoplay
		 * has to stop, i.e. a real click on the next label has to be performed because
		 * this stops the autoplay, whereas just activating the next tab doesn't.
		 */
		if (bln_useClick) {
			this.__view.__autoElements.main.navtabLabel[newTabKey].fireEvent('click');
		} else {
			this.__view.__autoElements.main.navtabLabel[newTabKey].activate();
		}
	},
	
	startAutoplay: function() {
		this.__models.status.set_autoplayStatus(true);
		
		this.__view.__autoElements.main.navtabLabel[this.__models.status.data.currentTabKey].activate();
		
		if (this.__view.__autoElements.main.btn_play) {
			this.__view.__autoElements.main.btn_play.addClass('active');
		}
		if (this.__view.__autoElements.main.btn_stop) {
			this.__view.__autoElements.main.btn_stop.removeClass('active');
		}
	},
	
	stopAutoplay: function() {
		window.clearTimeout(this.__models.status.data.int_currentTimeout);
		
		this.__models.status.set_autoplayStatus(false);
		
		if (this.__view.__autoElements.main.btn_play) {
			this.__view.__autoElements.main.btn_play.removeClass('active');
		}
		if (this.__view.__autoElements.main.btn_stop) {
			this.__view.__autoElements.main.btn_stop.addClass('active');
		}
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

})();