(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		var str_options,
			obj_options = {},
			str_startStatusValueFromSessionStorage,
			str_startStatusValue;

		str_options = this.__el_container.getProperty('data-lsjs-statusTogglerOptions');

		if (str_options) {
			obj_options = JSON.decode(str_options);
		}

		this.__models.options.set(obj_options);

		this.registerElements(this.__el_container, 'main', false);

		/* -->
		 * Prepare bound functions that are needed for events
		 */
		this.bound_changeStatus = this.changeStatus.bind(this);

		str_startStatusValue = this.__models.options.data.arr_statusValue[0];

		if (this.__models.options.data.str_sessionStorageKey) {
			try {
				str_startStatusValueFromSessionStorage = sessionStorage.getItem('lsjs_statusToggler_' + this.__models.options.data.str_sessionStorageKey);
				if (str_startStatusValueFromSessionStorage !== null) {
					str_startStatusValue = str_startStatusValueFromSessionStorage;
				}
			} catch(e) {}
		}

		this.__el_container.setProperty(this.__models.options.data.str_propertyToToggle, str_startStatusValue);

		if (typeOf(this.__autoElements.main.toggler) === 'element' || typeOf(this.__autoElements.main.toggler) === 'elements') {
			this.__autoElements.main.toggler.addEvent(this.__models.options.data.str_eventType, this.bound_changeStatus);
		} else {
			this.__el_container.addEvent(this.__models.options.data.str_eventType, this.bound_changeStatus);
		}
	},

	bound_changeStatus: null,
	changeStatus: function(event) {

		if (this.__models.options.data.bln_stopEvent) {
			event.stop();
		}

		var str_currentStatusValue = this.__el_container.getProperty(this.__models.options.data.str_propertyToToggle);
		var int_currentStatusIndex = this.__models.options.data.arr_statusValue.indexOf(str_currentStatusValue);
		if (int_currentStatusIndex < 0) {
			int_currentStatusIndex = 0;
		}

		var int_nextStatusIndex = int_currentStatusIndex === this.__models.options.data.arr_statusValue.length - 1 ? 0 : int_currentStatusIndex + 1;

		if (this.__el_container.retrieve('bln_resetOnNextEvent') === true) {
			int_nextStatusIndex = 0;
			this.__el_container.store('bln_resetOnNextEvent', false);
		} else {
			if (!this.__models.options.data.bln_resetOtherElementsWithSamePropertyToToggle) {
				this.fireElementsWithSamePropertyToToggle(event);
			}
		}

		this.__el_container.setProperty(this.__models.options.data.str_propertyToToggle, this.__models.options.data.arr_statusValue[int_nextStatusIndex]);

		if (this.__models.options.data.str_sessionStorageKey) {
			try {
				sessionStorage.setItem('lsjs_statusToggler_' + this.__models.options.data.str_sessionStorageKey, this.__models.options.data.arr_statusValue[int_nextStatusIndex]);
			} catch(e) {}
		}
	},

	fireElementsWithSamePropertyToToggle: function(event) {
		var els_withSamePropertyToToggle = $$('[' + this.__models.options.data.str_propertyToToggle + ']');

		Array.each(
			els_withSamePropertyToToggle,
			function(el_toToggle) {
				if (el_toToggle === this.__el_container) {
					return;
				}
				el_toToggle.store('bln_resetOnNextEvent', true);
				el_toToggle.getElement('[data-lsjs-element="toggler"]').fireEvent(this.__models.options.data.str_eventType, event);
			}.bind(this)
		)
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();
