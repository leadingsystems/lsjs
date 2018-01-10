(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
		if (this.__view === undefined || this.__view === null) {
			console.error('The loading indicator\'s view is not available in its controller.js! Please make sure that controller.js is loaded after all the other module scripts (templates.js, view.js, model.js)');
		}
		
		lsjs[str_moduleName] = this.__module;
		window.addEvent('domready', function() {
			$$('body')[0].adopt(this.__module.__el_container);
		}.bind(this));
	},
	
	show: function(str_deviantText) {
		if (str_deviantText !== undefined && str_deviantText !== null) {
			this.overwriteText(str_deviantText);
		}
		
		this.__models.loadingCounter.increase();
		if (this.__models.loadingCounter.getNumLoading() === 1) {
			this.__view.show();
		}
	},
	
	hide: function(bln_resetText) {
		bln_resetText = bln_resetText !== undefined && bln_resetText;
		
		this.__models.loadingCounter.decrease();
		if (this.__models.loadingCounter.getNumLoading() === 0) {
			this.__view.hide(bln_resetText);
		} else if (bln_resetText) {
			this.resetText();
		}
	},
	
	overwriteText: function(str_deviantText) {
		if (str_deviantText === undefined || str_deviantText === null) {
			console.info('no deviant text given as argument');
			return;
		}
		
		this.__view.overwriteText(str_deviantText);
	},
	
	resetText: function() {
		this.__view.resetText();
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.createModule({
	__name: str_moduleName
});

})();