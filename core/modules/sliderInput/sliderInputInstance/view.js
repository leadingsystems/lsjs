(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		var self = this;

		this.registerElements(this.__el_container, 'main', true);

		if (
			typeOf(this.__autoElements.main.sliderInput_inputField) !== 'elements'
			|| typeOf(this.__autoElements.main.sliderInput_targetContainer) !== 'elements'
		) {
			console.warn(str_moduleName + ': required elements missing.');
		}

		Array.each(
			this.__autoElements.main.sliderInput_inputField,
			function(el_input, int_key) {
				if (el_input.get('tag') !== 'input') {
					var el_realInput = el_input.getElement('input');
					if (typeOf(el_realInput) === 'element') {
						this.__autoElements.main.sliderInput_inputField[int_key] = el_realInput;
					} else {
						console.warn('no actual input element could be found in ', el_input)
					}
				}
			}.bind(this)
		);

	    noUiSlider.create(
			this.__autoElements.main.sliderInput_targetContainer[0],
			{
				range: {
					'min': 0,
					'max': 500
				},

				start: this.getStartParameterFromInputs(),

				connect: true
			}
		);

		this.__autoElements.main.sliderInput_targetContainer[0].noUiSlider.on(
			'update',
			function() {
				self.setInputFieldsToSliderValues(this.get());
			}
		);

		this.__autoElements.main.sliderInput_inputField.addEvent(
			'change',
			function() {
				this.setSliderValuesToInputFieldValues();
			}.bind(this)
		);

		this.__autoElements.main.sliderInput_inputField.getParent('form').addEvent(
			'reset',
			function() {
				window.setTimeout(
					function() {
						this.setSliderValuesToInputFieldValues();
					}.bind(this),
					1
				);
			}.bind(this)
		);
	},

	setSliderValuesToInputFieldValues: function() {
		var arr_valuesToSet = [];
		Array.each(
			this.__autoElements.main.sliderInput_inputField,
			function(el_input, int_key) {
				arr_valuesToSet[int_key] = lsjs.helpers.decimalSaveParseFloat(el_input.getProperty('value'));
			}.bind(this)
		);
		this.__autoElements.main.sliderInput_targetContainer[0].noUiSlider.set(arr_valuesToSet);
	},

	setInputFieldsToSliderValues: function(arr_sliderValues) {
		Array.each(
			this.__autoElements.main.sliderInput_inputField,
			function(el_input, int_key) {
				el_input.setProperty('value', Math.round(arr_sliderValues[int_key]));
			}
		);
	},

	getStartParameterFromInputs: function() {
		var arr_start = [];
		Array.each(
			this.__autoElements.main.sliderInput_inputField,
			function(el_input) {
				arr_start.push(el_input.getProperty('value'));
			}
		);
		return arr_start;
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();
