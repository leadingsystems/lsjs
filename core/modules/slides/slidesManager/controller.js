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
			els_toEnhance = this.__models.options.data.el_domReference.getElements(this.__models.options.data.contentSelector);
		} else {
			els_toEnhance = $$(this.__models.options.data.contentSelector);
		}
		
		Array.each(els_toEnhance, function(el_container) {
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

			lsjs.createModule({
				__name: 'slidesInstance',
				__parentModule: this.__module,
				__useLoadingIndicator: false,
				__el_container: el_container
			});
		}.bind(this));
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