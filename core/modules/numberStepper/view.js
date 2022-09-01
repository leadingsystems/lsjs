(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		this.addNumberStepperFunction();
	},
	
	addNumberStepperFunction: function() {

		var	self = this,
			els_numberGroup

		els_numberGroup = $$(this.__models.options.data.str_selector);

		Array.each(els_numberGroup, function(el_numberInput) {

			if (el_numberInput.hasClass(this.__models.options.data.str_appliedClass)) {
				return;
			}

			if (el_numberInput.nodeName != 'INPUT' || el_numberInput.type != 'number') {
				console.warn ("Only inputfields of type=number may use the class " + this.__models.options.data.str_selectorClass, el_numberInput);
				return;
			}

			el_numberInput.addClass(this.__models.options.data.str_appliedClass);


			var el_templateMain = this.tplPure({name: 'main'}).getElement('.mainNumberStepper');

			el_templateMain.wraps(el_numberInput);

			var parent = el_numberInput.getParent('div.mainNumberStepper');

			//Plus Button
			el_templateMain.getElement('button.nsPlus').addEvent('click', function() {
				el_numberInput.stepUp();

				self.buttonClickable(el_numberInput, parent);
			});

			//Minus Button
			el_templateMain.getElement('button.nsMinus').addEvent('click', function() {
				el_numberInput.stepDown();

				self.buttonClickable(el_numberInput, parent);
			});

			el_numberInput.addEvent('change', function() {
				self.buttonClickable(el_numberInput, parent);
			});


		}.bind(this));

	},

	/*	check if buttons are clickable
	*
	* 	@param el_input		element, Input Type=number
	* 	@param el_parent	element, Container of Buttons and inputfield
	*/
	buttonClickable: function(el_input, el_parent) {

		var el_buttonPlus = el_parent.getElement('button.nsPlus');

		var el_buttonMinus = el_parent.getElement('button.nsMinus');

		var dec_inputValue = Number(el_input.value);

		var dec_max = Number(el_input.getProperty('max'));

		var dec_min = Number(el_input.getProperty('min'));

		if (dec_inputValue >= dec_max) {
			el_buttonPlus.addClass('minMaxBound');
		} else {
			el_buttonPlus.removeClass('minMaxBound');
		}

		if (dec_inputValue <= dec_min) {
			el_buttonMinus.addClass('minMaxBound');
		} else {
			el_buttonMinus.removeClass('minMaxBound');
		}

		return false;
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();