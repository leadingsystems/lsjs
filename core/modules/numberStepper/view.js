(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		this.addNumberStepperFunction();
	},
	
	addNumberStepperFunction: function() {
//console.log("view: addNumberStepperFunction");

		var	self = this,
			els_numberGroup

		els_numberGroup = $$(this.__models.options.data.str_selector);
//console.log("view: addNumberStepperFunction: els_numberGroup", els_numberGroup);

		Array.each(els_numberGroup, function(el_numberInput) {
//console.log({el_numberInput});

			if (el_numberInput.hasClass(this.__models.options.data.str_appliedClass)) {
//console.log("Klasse bereits gesetzt - return", el_numberInput);
				return;
			}

			//Prüfung: nur Inputfelder vom Typ: Number
//console.log(el_numberInput.nodeName);
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
//console.log({el_templateMain});


			//Den Parent unseres umschließenden (Wrap) Containers holen "mainNumberStepper"
			var parent = el_numberInput.getParent('div.mainNumberStepper');
//console.log("getParent", parent);


			//von diesem parent ausgehend das Inputfeld ermitteln
			//var el_numberInputByParent = parent.getElement('input[type=number].useNumberStepper');
			var el_numberInputByParent = parent.getElement('input[type=number].' + this.__models.options.data.str_selectorClass);
//console.log("el_numberInputByParent", el_numberInputByParent);

			//Plus Button
			el_templateMain.getElement('button.nsPlus').addEvent('click', function() {
//console.log("Plus Button geklickt", this);
				//FUNKTIONIERT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				//el_numberInput.stepUp();

				//FUNKTIONIERT AUCH
				el_numberInputByParent.stepUp()

				self.buttonClickable(el_numberInputByParent, parent);
			});

			//Minus Button
			el_templateMain.getElement('button.nsMinus').addEvent('click', function() {
//console.log("Minus Button geklickt");
				//FUNKTIONIERT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				//el_numberInput.stepDown();


				//FUNKTIONIERT AUCH
				el_numberInputByParent.stepDown();

				self.buttonClickable(el_numberInputByParent, parent);
			});

			//Buttons klickbar aufgrund von Benutzereingaben
			el_numberInputByParent.addEvent('change', function() {
//console.log("Wert geändert");
				self.buttonClickable(el_numberInputByParent, parent);
			});


		}.bind(this));

	},

	/*	31.08.2022, prüft, ob der Button bezüglich des Input-Werts und der Min-/Max Grenzen überhaupt eine Veränderung bringt.
	*	Bsp. Ist Min=10 und der Wert ist 10, bringt der Minus-Buttons nichts und kann ausgegraut werden
	*
	*/
	buttonClickable: function(el_input, el_parent) {
//console.log("el_parent: ", el_parent);
//console.log("el_button: ", el_button);
//console.log("el_input: ", el_input);
//console.log("str_direction: ", str_direction);

		//Die Buttons ermitteln
		var el_buttonPlus = el_parent.getElement('button.nsPlus');
//console.log("el_buttonPlus: ", el_buttonPlus);

		var el_buttonMinus = el_parent.getElement('button.nsMinus');
//console.log("el_buttonMinus: ", el_buttonMinus);

		//Aktueller Wert und Grenzwerte feststellen
		var dec_inputValue = Number(el_input.value);
//console.log("dec_inputValue: ", dec_inputValue);

		var dec_max = Number(el_input.getProperty('max'));
//console.log("dec_max: ", dec_max);

		var dec_min = Number(el_input.getProperty('min'));
//console.log("dec_min: ", dec_min);

		//Klassen abhängig von Grenzwerten setzen
		if (dec_inputValue >= dec_max) {
//console.log("Klasse setzen und ausgrauen: ");
			el_buttonPlus.addClass('minMaxBound');
		} else {
//console.log("Klasse entfernen und Button wieder klickbar");
			el_buttonPlus.removeClass('minMaxBound');
		}

		if (dec_inputValue <= dec_min) {
//console.log("Klasse setzen und ausgrauen: ");
			el_buttonMinus.addClass('minMaxBound');
		} else {
//console.log("Klasse entfernen und Button wieder klickbar");
			el_buttonMinus.removeClass('minMaxBound');
		}

		return false;
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();