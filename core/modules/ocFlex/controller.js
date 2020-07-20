/*
 * -- ACTIVATION: --
 *
 * To activate this module, the following code has to be put in the app.js:
 * Note: The given selectors etc. are just examples, in this case we would
 * use ocFlex for an off-canvas navigation
 *
	 lsjs.__moduleHelpers.ocFlex.start({
		el_domReference: el_domReference,
		str_ocContainerSelector: '#oc-navigation-container',
		str_ocTogglerSelector: '.oc-navigation-toggler',
		str_uniqueInstanceName: 'oc-navigation'
	 });
 *
 * The el_domReference parameter is only required if this module initialization code is called in a cajax_domUpdate event.
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
	self: null,

	start: function(obj_options) {
		var els_container,
			el_container;

		/*
		 * Look for the required container element
		 */
		if (obj_options.el_domReference !== undefined && typeOf(obj_options.el_domReference) === 'element') {
			els_container = obj_options.el_domReference.getElements(obj_options.str_ocContainerSelector);
		} else {
			els_container = $$(obj_options.str_ocContainerSelector);
		}

		if (els_container.length === 0) {
			if (obj_options.bln_debug) {
				console.warn(str_moduleName + ': no container element found for selector "' + obj_options.str_ocContainerSelector + '"');
			}
			return;
		} else if (els_container.length > 1) {
			if (obj_options.bln_debug) {
				console.warn(str_moduleName + ': more than one container element found "' + obj_options.str_ocContainerSelector + '"');
			}
			return;
		}

		el_container = els_container[0];

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

		el_container.addClass(obj_options.str_classToSetWhenModuleApplied);

		this.self = lsjs.createModule({
			__name: str_moduleName,
			__el_container: el_container
		});

		this.self.__models.options.set(obj_options);
	}
};

})();