(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{

	//Elemente
	el_body: null,
	el_header: null,
	el_triggers: [],

	int_height: 0,
	el_scrollToTop: null,
	str_containerSelector : 'myCssSelector',
	str_fadeInLogic : 'page-length',
	float_fadeInValue : 0.0,
	int_scrollToTop : 0,
	str_scrollToBehavior : 'smooth',

	start: function() {
		this.initializeElements();
		this.initializeVariables();

		this.initializeScrollToTop()
		this.initializeScrollToElement()
	},

	initializeScrollToElement: function() {
		// Event-Listener für jeden Trigger hinzufügen
		this.el_triggers.forEach(trigger => {
			trigger.addEventListener('click', () => {

				// Ziel-Element anhand des Attributs "data-target" finden
				const targetId = trigger.getAttribute('data-scroll-target');
				const targetElement = document.getElementById(targetId);

				if (targetElement) {
					// Scrollen zum Ziel-Element
					targetElement.scrollIntoView({
						behavior: this.str_scrollToBehavior
					});
				} else {
					console.error(`Kein Ziel-Element mit der ID "${targetId}" gefunden.`);
				}
			});
		});
	},

	initializeScrollToTop: function() {

		this.el_scrollToTop = this.tplPure({name: 'scrollToTop'});
		this.el_scrollToTop.inject(this.el_body, 'top');

		this.el_scrollToTop.classList.add(this.str_containerSelector);

		document.addEventListener("scroll", () => {

			let showElement = false;

			switch (this.str_fadeInLogic){
				case 'page-length':

					let scrollableHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
					showElement = ((document.documentElement.scrollTop / scrollableHeight ) > this.float_fadeInValue)
					break;
				case 'viewportheight':

					let scrollableHeight2 = document.documentElement.scrollHeight - document.documentElement.clientHeight;
					showElement = ((document.documentElement.scrollTop / scrollableHeight2 ) > this.float_fadeInValue)
					break;

				case 'fixed-value':
					showElement = (document.documentElement.scrollTop > this.float_fadeInValue)
					break;
			}

			if (showElement) {
				//show button
				this.el_scrollToTop.classList.add("show-scroll-to-top");
			} else {
				//hide button
				this.el_scrollToTop.classList.remove("show-scroll-to-top");
			}

		});


		this.el_scrollToTop.addEventListener("click", () => {
			console.log(this.int_scrollToTop);
			console.log(this.str_scrollToBehavior);

			window.scrollTo({
				top: this.int_scrollToTop,
				behavior: this.str_scrollToBehavior
			});
		});

	},

	initializeElements: function() {

		// Versucht, das <body>-Element zu selektieren und prüft, ob es gefunden wurde
		this.el_body = document.querySelector('body');
		if (!this.el_body) {
			console.error('Fehler: Kein <body>-Element gefunden');
		}

		// Versucht, alle Elemente mit dem Attribut data-scroll-target zu selektieren
		// Wenn keine gefunden werden, wird ein leeres Array zugewiesen
		this.el_triggers = document.querySelectorAll('[data-scroll-target]');
		if (this.el_triggers.length === 0) {
			this.el_triggers = []; // Leeres Array zuweisen, wenn keine Elemente gefunden wurden
		}

	},

	initializeVariables: function() {

		console.log("initializeVariables")

		this.str_containerSelector = this.__models.options.data.str_containerSelector || null;
		this.str_fadeInLogic = this.__models.options.data.str_fadeInLogic;
		this.float_fadeInValue = this.__models.options.data.float_fadeInValue;
		this.int_scrollToTop = this.__models.options.data.int_scrollToTop;
		this.str_scrollToBehavior = this.__models.options.data.str_scrollToBehavior;

		// Prüfung, ob alle erforderlichen Felder gesetzt sind
		if (!this.str_fadeInLogic || !this.str_scrollToBehavior) {
			console.error('Fehler: str_fadeInLogic und str_scrollToBehavior müssen gesetzt sein');
		}

		// Prüfung für str_fadeInLogic: nur 'page-length', 'viewportheight' oder 'fixed-value' erlaubt
		const validFadeInLogicValues = ['page-length', 'viewportheight', 'fixed-value'];
		if (!validFadeInLogicValues.includes(this.str_fadeInLogic)) {
			console.error('Fehler: str_fadeInLogic muss entweder "page-length", "viewportheight" oder "fixed-value" sein');
		}

		// Prüfung für str_scrollToBehavior: nur 'smooth', 'instant' oder 'auto' erlaubt
		const validScrollToBehaviorValues = ['smooth', 'instant', 'auto'];
		if (!validScrollToBehaviorValues.includes(this.str_scrollToBehavior)) {
			console.error('Fehler: str_scrollToBehavior muss entweder "smooth", "instant" oder "auto" sein');
		}

		// Abhängig von str_fadeInLogic gibt es unterschiedliche Validierungen für int_scrollToTop
		if (this.str_fadeInLogic === 'page-length' || this.str_fadeInLogic === 'viewportheight') {

			if (this.int_scrollToTop < 0 || this.int_scrollToTop > 1.0) {
				console.error('Fehler: Bei "page-length" oder "viewportheight" muss int_scrollToTop zwischen 0 und 1.0 liegen');
			}
		} else if (this.str_fadeInLogic === 'fixed-value') {
			// int_scrollToTop darf nicht kleiner als 0 sein
			if (this.int_scrollToTop < 0) {
				console.error('Fehler: Bei "fixed-value" darf int_scrollToTop nicht kleiner als 0 sein');
			}
		}

		// Überprüft, ob str_containerSelector (wenn es gesetzt ist) ein gültiger Wert ist
		if (this.str_containerSelector && typeof this.str_containerSelector !== 'string') {
			console.error('Fehler: str_containerSelector muss ein gültiger String sein, falls es gesetzt ist');
		}

	},
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();