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

			//if (el_numberInput.hasClass(this.__models.options.data.str_appliedClass)) {
//console.log("Klasse bereits gesetzt - return");
				//return;
			//}


			//Das Main Template Element einfügen
			var el_templateMain = this.tplPure({name: 'main'}).getElement('.mainNumberStepper');

			//Das Nummern-Input Feld mit dem Main-Template umschließen (Input kommt nach unten)
			el_templateMain.wraps(el_numberInput);
//console.log({el_templateMain});

			//Plus Button
			el_templateMain.getElement('button.nsPlus').addEvent('click', function() {
//console.log("Plus Button geklickt", this);

/*
				var sibling = this.nextElementSibling;

				//die Siblings durchschleifen, bis das NumberInput Feld gefunden wird
				while (sibling) {
					if (sibling.nodeName == 'INPUT') {
						sibling.stepUp();
						break;
					}
					sibling = sibling.nextElementSibling
				}
*/
				//ALTERNATIVE
				var sibling = this.nextElementSibling.nextElementSibling;
				if (sibling.nodeName == 'INPUT') {
						sibling.stepUp();
				}

			});

			//Minus Button
			el_templateMain.getElement('button.nsMinus').addEvent('click', function() {
//console.log("Minus Button geklickt");
				var sibling = this.nextElementSibling;
				sibling.stepDown();
			});

		}.bind(this));

	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();