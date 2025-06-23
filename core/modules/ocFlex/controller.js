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
	self: {},

	start: function(obj_options) {
		var el_containerOrContent;

		if (obj_options.str_ocContainerSelector && obj_options.str_ocContentSelector) {
			if (obj_options.bln_debug) {
				console.warn(str_moduleName + ': "str_ocContainerSelector" and "str_ocContentSelector" cannot be used at the same time');
			}
			return;
		}

		if (obj_options.str_ocContainerSelector) {
			el_containerOrContent = this.getContainerOrContentElement(obj_options.el_domReference, obj_options.str_ocContainerSelector, obj_options.bln_debug);
		} else if (obj_options.str_ocContentSelector) {
			el_containerOrContent = this.getContainerOrContentElement(obj_options.el_domReference, obj_options.str_ocContentSelector, obj_options.bln_debug);
		}

		if (el_containerOrContent === null) {
			if (obj_options.bln_debug) {
				console.warn(str_moduleName + ': unable to start');
			}
			return;
		}

		this.self[obj_options.str_uniqueInstanceName] = lsjs.createModule({
			__name: str_moduleName,
			__el_container: obj_options.str_ocContainerSelector ? el_containerOrContent : null,
			el_content: obj_options.str_ocContentSelector ? el_containerOrContent : null
		});

		this.self[obj_options.str_uniqueInstanceName].__models.options.set(obj_options);

		el_containerOrContent.addClass(this.self[obj_options.str_uniqueInstanceName].__models.options.data.str_classToSetWhenModuleApplied);
	},

	getContainerOrContentElement: function(el_domReference, selector, bln_debug) {
		var els_containerOrContent,
			el_containerOrContent;

		/*
		 * Look for the required element
		 */
		if (el_domReference !== undefined && typeOf(el_domReference) === 'element') {
			els_containerOrContent = el_domReference.getElements(selector);
		} else {
			els_containerOrContent = $$(selector);
		}

		if (els_containerOrContent.length === 0) {
			if (bln_debug) {
				console.warn(str_moduleName + ': no element found for selector "' + selector + '"');
			}
			return null;
		} else if (els_containerOrContent.length > 1) {
			if (bln_debug) {
				console.warn(str_moduleName + ': more than one element found for selector "' + selector + '"');
			}
			return null;
		}

		el_containerOrContent = els_containerOrContent[0];

		/* ->
         * Make sure not to handle an element more than once
         */
		if (!el_containerOrContent.retrieve('alreadyHandledBy_' + str_moduleName)) {
			el_containerOrContent.store('alreadyHandledBy_' + str_moduleName, true);
		} else {
			return null;
		}
		/*
         * <-
         */

		return el_containerOrContent;
	}
};

})();