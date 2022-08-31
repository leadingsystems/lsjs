(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		this.addNumberStepperFunction();
	},
	
	addNumberStepperFunction: function() {
console.log("view: addNumberStepperFunction");

		var	self = this,
			els_numberGroup
			//,
			//int_numberGroupCounter = 0;
		
		els_numberGroup = $$(this.__models.options.data.str_selector);
console.log("view: addNumberStepperFunction: els_numberGroup", els_numberGroup);

		
		Array.each(els_numberGroup, function(el_numberGroup) {

//console.log({el_numberGroup});

			if (el_numberGroup.hasClass(this.__models.options.data.str_appliedClass)) {
console.log("Klasse bereits gesetzt - return");
				return;
			}


			//Einfach nur die beiden entfernen
			//el_numberGroup.remove();


//			el_numberGroup.tplReplace({				//GEHT NET
//				name: 'main'
//			});


			//var el_test = el_numberGroup.tplReplace({				//GEHT NET
				//name: 'main'													//OHNE PARENT TUT SICH AUCH NICHTS
			//});


			//Das Main Template Element einfügen
			//var el_templateMainWithContainer = this.tplPure({name: 'main'}).getElement('.theNumberStepper');
			var el_templateMainWithContainer = this.tplPure({name: 'main'});
			var el_templateMain = el_templateMainWithContainer.getElement('.theNumberStepper');
			// $$('body')[0].adopt(el_templateMainWithContainer);

			//Das Dummy mit unserem Input umschließen
//			el_numberGroup.wraps(el_templateMain);						//Das ist falsch - EIGENTLICH UMGEKEHRT

			el_templateMain.wraps(el_numberGroup);						//SCHON MAL GANZ OK - Container ist noch drin

console.log({el_templateMain});


			el_templateMain.getElement('button.nsplus').addEvent('click', function() {
//console.log("test", self.__models.options.data.str_selector);
console.log("Plus Button geklickt", this);



	var sibling = this.nextElementSibling;

	// If the sibling matches our selector, use it
	// If not, jump to the next sibling and continue the loop
	while (sibling) {
console.log({sibling});
		//if (sibling.matches(selector)) return sibling;
		if (sibling.nodeName == 'INPUT') {
			sibling.stepUp();
			break;
		}
		sibling = sibling.nextElementSibling
	}



var nextSibling = this.nextElementSibling;
console.log(nextSibling);


//var sibl = this.siblings();
//self.__models.options.data.str_selector
				//Wird der Button + geklickt, soll die stepUp Methode des Inputs angestossen werden
				//this.stepUp();

/*
				Array.each(this.getParent(
					//'useNumberStepper'
					'ls_contentWrapper'
					).getElements('input[type="number"]')
					, function(el_checkbox) {
console.log("test2");
						//el_checkbox.setProperty('checked', this.getProperty('checked'));

				}.bind(this));
*/

			});

			el_templateMain.getElement('button.nsminus').addEvent('click', function() {
console.log("Minus Button geklickt");

var nextSibling = this.nextElementSibling;
console.log(nextSibling);

			});







/*
			var el_test = this.tplPure({name: 'main'});
			var el_daswirbrauchen = el_test.getElement('.theNumberStepper');
console.log({el_daswirbrauchen});
			$$('body')[0].adopt(el_test);
console.log({el_test});
*/

			//var mySecondElement = new Element('div#second').wraps(el_daswirbrauchen);
//console.log({mySecondElement});



			//var mytest2 = new Element(el_daswirbrauchen).wraps(el_numberGroup);
//console.log({mytest2});





/*
			var el_selectAll = this.tplReplace({		//Einfügen IN Input
			//var el_selectAll = this.tplAdd({			//Einfügen IN Input
			//var el_selectAll = this.tplUse({			//Keine Änderung
				name: 'main',
				parent: el_numberGroup

				//,
				//arg: {
					//str_selectAllCheckboxId: 'selectAllCheckbox_' + int_numberGroupCounter
				//}

			});
*/

/*
			el_numberGroup.addClass(this.__models.options.data.str_appliedClass);

			el_selectAll.inject(el_numberGroup, 'top');


			el_selectAll.getElement('input').addEvent('change', function() {
				Array.each(this.getParent(self.__models.options.data.str_selector).getElements('input[type="checkbox"]'), function(el_checkbox) {
					el_checkbox.setProperty('checked', this.getProperty('checked'));
				}.bind(this));
			});

			
			int_numberGroupCounter++;
*/
		}.bind(this));
console.log("view: addNumberStepperFunction: ENDE");
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();