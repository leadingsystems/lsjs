/*
 * -- ACTIVATION: --
 *
 * To activate this module, the following code has to be put in the app.js:
 *
	 lsjs.__moduleHelpers.statusTogglerManager.start({
		 el_domReference: el_domReference
	 });
 *
 * The el_domReference parameter is only required if this module initialization code is called in a cajax_domUpdate event.
 *
 *
 *
 * -- FUNCTIONALITY AND USAGE: --
 *
 * This module enriches DOM elements by giving them a status that can be toggled and then be used for CSS styling
 * based on an element attribute that holds the status value.
 *
 * Example:
 *
 * We have an element with the following DOM structure:
 *
	<div>
		<h1>Click me!</h1>
		<div class="hidden">
			Show me!
		</div>
	</div>
 *
 * The div with the class hidden originally has a "display: none" style set. If the user clicks on "Click me!" we
 * want the hidden div to be displayed if it is currently hidden or to hide again if it is currently displayed.
 *
 * We can achieve this by making the following changes to the markup
 *
	 <div data-lsjs-component="statusToggler">
		 <h1 data-lsjs-element="toggler">Click me!</h1>
		 <div class="hidden">
			 Show me!
		 </div>
	 </div>
 *
 * By default, the element that has the statusToggler applied (data-lsjs-component="statusToggler") gets an attribute
 * "data-lsjs-statusTogglerStatus" initially set to the value "off" and by clicking on the element marked as the
 * toggler (data-lsjs-element="toggler") the value toggles between "off" and "on".
 *
 * This attribute can then be used to create a CSS selector that applies any kind of styling to the element itself
 * or any of its children.
 *
 * Therefore, this styling would achieve the desired show/hide effect:
 *
	 #div[data-lsjs-statusTogglerStatus="off"] .hidden {
	 	display: none;
	}

	 #div[data-lsjs-statusTogglerStatus="on"] .hidden {
	 	display: block;
	}
 *
 * Defining an explicit toggler element is optional. Without it, the whole element that has the statusToggler module
 * applied, reacts on the click event.
 *
 * The element marked with data-lsjs-component="statusToggler" can also send custom configurator options to the module:
 *
	 <div
		 data-lsjs-component="statusToggler"
		 data-lsjs-statusTogglerOptions="
		 {
			 str_eventType: 'mouseover',
			 str_propertyToToggle: 'class',
			 arr_statusValue: ['status1', 'status2', 'status3'],
			 str_sessionStorageKey: 'test123'
		 }
		 "
	 >
		 <h1 data-lsjs-element="toggler">Click me!</h1>
		 <div class="hidden">
			 Show me!
		 </div>
	 </div>
 *
 * In this example, every time a mouseover event on the toggler element occurs, the class value will be changed.
 * Since we have more than two status values defined, they will be looped over.
 *
 * The status values could be numeric values but they have to be defined as strings ("1" instead of 1) because applying
 * these values to an html attribute would cast them as strings anyway and detection of the currently set status value
 * would fail if they had been defined as integers in the module configuration.
 *
 * If the configuration parameter "str_sessionStorageKey" is used, the status value will be stored in the sessionStorage
 * so that the status can be set to its last value if the page gets reloaded.
 */

(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
		var els_toEnhance;
		/*
		 * Look for elements to enrich with the lsjs-module and then
		 * instantiate instances for each element found.
		 */
		if (this.__models.options.data.el_domReference !== undefined && typeOf(this.__models.options.data.el_domReference) === 'element') {
			els_toEnhance = this.__models.options.data.el_domReference.getElements(this.__models.options.data.str_selector);
		} else {
			els_toEnhance = $$(this.__models.options.data.str_selectors);
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

			el_container.addClass(this.__models.options.data.str_classToSetWhenModuleApplied);

			lsjs.createModule({
				__name: 'statusTogglerInstance',
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