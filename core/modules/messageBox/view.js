(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		this.tplAdd({
			name: 'main'
		});

		Object.each(this.__models.options.data.obj_buttons, function (obj_buttonSettings, str_buttonLabel) {
			this.__autoElements.main['btn_' + str_buttonLabel].addEvent('click', this.callCallbackFunction.bind(this, obj_buttonSettings));
		}.bind(this));

		$$('body')[0].adopt(this.__el_container);
	},

	callCallbackFunction: function(obj_buttonSettings) {
		if (obj_buttonSettings.bln_closeOnClick === undefined || obj_buttonSettings.bln_closeOnClick) {
			var myFx = new Fx.Tween(
				this.__el_container,
					{
					duration: 200,
					link: 'cancel',
					property: 'opacity',
					onComplete: this.__module.remove.bind(this.__module)
				}
			);

			myFx.start(1,0);
		}

		if (typeOf(obj_buttonSettings.func_callback) === 'function') {
			obj_buttonSettings.func_callback();
		}
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();