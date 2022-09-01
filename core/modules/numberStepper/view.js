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

			//Prüfung: nur Inputfelder vom Typ: Number
			if (el_numberInput.nodeName != 'INPUT' || el_numberInput.type != 'number') {
				console.warn ("Nur Inputfelder vom Typ: Number dürfen die Klasse " + this.__models.options.data.str_selectorClass + " haben! ", el_numberInput);
				return;
			}

			//Klasse vergeben um erneute bearbeitung zu vermeiden
			el_numberInput.addClass(this.__models.options.data.str_appliedClass);


			//Das Main Template Element einfügen
			var el_templateMain = this.tplPure({name: 'main'}).getElement('.mainNumberStepper');

			//Das Nummern-Input Feld mit dem Main-Template umschließen (Input kommt nach unten)
			el_templateMain.wraps(el_numberInput);

			//Den Parent unseres umschließenden (Wrap) Containers holen "mainNumberStepper"
			var parent = el_numberInput.getParent('div.mainNumberStepper');


			//von diesem parent ausgehend das Inputfeld ermitteln
			//var el_numberInputByParent = parent.getElement('input[type=number].useNumberStepper');
			var el_numberInputByParent = parent.getElement('input[type=number].' + this.__models.options.data.str_selectorClass);

			//Plus Button
			el_templateMain.getElement('button.nsPlus').addEvent('click', function() {
				//FUNKTIONIERT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				//el_numberInput.stepUp();
//TODO: Nur eine der beiden Varianten nehmen

				//FUNKTIONIERT AUCH
				el_numberInputByParent.stepUp()

				self.buttonClickable(el_numberInputByParent, parent);
			});

			//Minus Button
			el_templateMain.getElement('button.nsMinus').addEvent('click', function() {
				//FUNKTIONIERT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				//el_numberInput.stepDown();
//TODO: Nur eine der beiden Varianten nehmen

				//FUNKTIONIERT AUCH
				el_numberInputByParent.stepDown();

				self.buttonClickable(el_numberInputByParent, parent);
			});

			//Buttons klickbar aufgrund von Benutzereingaben
			el_numberInputByParent.addEvent('change', function() {
				self.buttonClickable(el_numberInputByParent, parent);
			});


		}.bind(this));

	},

	/*	31.08.2022, prüft, ob der Button bezüglich des Input-Werts und der Min-/Max Grenzen überhaupt eine Veränderung bringt.
	*	Bsp. Ist Min=10 und der Wert ist 10, bringt der Minus-Buttons nichts und kann ausgegraut werden
	*
	* 	@param el_input		element, das Input Type=number
	* 	@param el_parent	element, der Container der Buttons in dem auch das Inputfeld ist
	*/
	buttonClickable: function(el_input, el_parent) {

		//Die Buttons ermitteln
		var el_buttonPlus = el_parent.getElement('button.nsPlus');

		var el_buttonMinus = el_parent.getElement('button.nsMinus');

		//Aktueller Wert und Grenzwerte feststellen
		var dec_inputValue = Number(el_input.value);

		var dec_max = Number(el_input.getProperty('max'));

		var dec_min = Number(el_input.getProperty('min'));

		//Klassen abhängig von Grenzwerten setzen
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