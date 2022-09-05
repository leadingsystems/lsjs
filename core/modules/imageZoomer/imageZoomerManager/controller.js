(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
		var els_toEnhance;
		/*
		 * Look for elements to enrich with the lsjs-module and then
		 * create an instance for each element found.
		 */
		if (this.__models.options.data.el_domReference !== undefined && typeOf(this.__models.options.data.el_domReference) === 'element') {
			els_toEnhance = this.__models.options.data.el_domReference.getElements(this.__models.options.data.str_containerSelector);
		} else {
			els_toEnhance = $$(this.__models.options.data.str_containerSelector);
		}

		var obj_modules = {};
		
		Array.each(els_toEnhance, function(el_container, int_key) {
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

			var str_gallerySetName = el_container.getProperty('lsjs-data-image-zoomer-gallery-set');

			if (str_gallerySetName === null) {
				return;
			}

			if (typeof obj_modules[str_gallerySetName] === 'undefined') {
				obj_modules[str_gallerySetName] = [];
			}

			obj_modules[str_gallerySetName].push(lsjs.createModule({
				__name: 'imageZoomerInstance',
				__parentModule: this.__module,
				__useLoadingIndicator: false,
				__el_container: el_container
			}));
		}.bind(this));

		Object.each(
			obj_modules,
			function(arr_modules) {
				Array.each(
					arr_modules,
					function(obj_module, int_key) {
						obj_module.obj_nextZoomer = arr_modules.length > int_key + 1 ? arr_modules[int_key + 1] : null;
						obj_module.obj_previousZoomer = int_key > 0 ? arr_modules[int_key - 1] : null;
					}
				);
			}
		);
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.__moduleHelpers[str_moduleName] = {
	self: null,
	
	start: function(obj_options) {
		this.self = lsjs.createModule({
			__name: str_moduleName
		});
		this.self.__models.options.set(obj_options);
	}
};

})();