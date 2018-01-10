(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	
	start: function() {
		this.tplReplace({
			name: 'main'
		});
	},
	
	show: function() {
		this.__el_container.addClass('show');
		new Fx.Morph(this.__el_container, {
			duration: 100
		})
		.start({
			'opacity': 1
		});
	},
	
	hide: function(bln_resetText) {
		new Fx.Morph(this.__el_container, {
			duration: 300,
			onComplete: function() {
				this.__el_container.removeClass('show');
				if (bln_resetText) {
					this.resetText();
				}
			}.bind(this)
		})
		.start({
			'opacity': 0
		});
	},
	
	overwriteText: function(str_deviantText) {
		this.__autoElements.main.loadingText.setProperty('html', str_deviantText);
	},
	
	resetText: function() {
		this.__autoElements.main.loadingText.setProperty('html', this.__models.lang.data.standardText);
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();