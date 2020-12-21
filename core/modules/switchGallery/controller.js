/*
 * -- ACTIVATION: --
 *
 * To activate this module, the following code has to be put in the app.js:
 * Note: More options are available (see obj_options of moduleHelper)
 *
	lsjs.__moduleHelpers.switchGallery.start({});
 *
 *
 *
 *
 * -- FUNCTIONALITY AND USAGE: --
 *
 * FIXME: ADD DOCUMENTATION
 */

(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.__moduleHelpers[str_moduleName] = {
	obj_instances: {},

	obj_options: {
		el_domReference: null, // only required if this module initialization code is called in a cajax_domUpdate event.
		bln_debug: false, // true to activate debug logging
		str_containerSelector: '[data-lsjs-component~="switchGallery"]',
		str_uniqueInstanceName: 'switchGallery',
		str_classToSetWhenModuleApplied: 'switchGalleryApplied'
	},

	start: function(obj_options) {
		var els_container;

		Object.merge(this.obj_options, obj_options);

		if (this.obj_instances[this.obj_options.str_uniqueInstanceName] === undefined) {
			this.obj_instances[this.obj_options.str_uniqueInstanceName] = [];
		}

		/*
		 * Look for container elements
		 */
		if (this.obj_options.el_domReference !== undefined && typeOf(this.obj_options.el_domReference) === 'element') {
			els_container = this.obj_options.el_domReference.getElements(this.obj_options.str_containerSelector);
		} else {
			els_container = $$(this.obj_options.str_containerSelector);
		}

		Array.each(
			els_container,
			function(el_container) {
				/* ->
                 * Make sure not to handle an element more than once
                 */
				if (!el_container.retrieve('alreadyHandledBy_' + str_moduleName)) {
					el_container.store('alreadyHandledBy_' + str_moduleName, true);
				} else {
					return;
				}
				/*
                 * <-
                 */

				el_container.addClass(this.obj_options.str_classToSetWhenModuleApplied);

				var obj_instance = lsjs.createModule({
					__name: str_moduleName,
					__el_container: el_container
				});

				obj_instance.__models.options.set(this.obj_options);

				this.obj_instances[this.obj_options.str_uniqueInstanceName].push(obj_instance);
			}.bind(this)
		);
	}
};

})();