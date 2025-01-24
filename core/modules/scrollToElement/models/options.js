var obj_classdef_model = {
	name: 'options',

	data: {
		str_moduleName: '__moduleName__',
		str_containerSelector: 'myCssSelector',
		str_fadeInLogic: 'page-length',
		float_fadeInValue: 0.0,
		int_scrollToTop: 0,
		str_scrollToBehavior: 'smooth',
	},

	start: function() {
	},

	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	},

	get: function(key) {
		return this.data[key];
	},

	validate: function() {

		const validFadeInLogicValues = ['page-length', 'viewportheight', 'fixed-value'];
		if (!validFadeInLogicValues.includes(this.data.str_fadeInLogic)) {
			console.error('Fehler: str_fadeInLogic muss entweder "page-length", "viewportheight" oder "fixed-value" sein');
		}

		const validScrollToBehaviorValues = ['smooth', 'instant', 'auto'];
		if (!validScrollToBehaviorValues.includes(this.data.str_scrollToBehavior)) {
			console.error('Fehler: str_scrollToBehavior muss entweder "smooth", "instant" oder "auto" sein');
		}

		console.log(this.data.str_fadeInLogic)
		if (this.data.str_fadeInLogic === 'page-length' || this.data.str_fadeInLogic === 'viewportheight') {
			console.log(this.data.float_fadeInValue)
			if (this.data.float_fadeInValue < 0 || this.data.float_fadeInValue > 1.0) {
				console.log(this.data.float_fadeInValue)
				console.error('Fehler: Bei "page-length" oder "viewportheight" muss float_fadeInValue zwischen 0 und 1.0 liegen');
			}
		} else if (this.data.str_fadeInLogic === 'fixed-value') {
			if (this.data.float_fadeInValue < 0) {
				console.error('Fehler: Bei "fixed-value" darf float_fadeInValue nicht kleiner als 0 sein');
			}
		}

		if (this.data.int_scrollToTop < 0) {
			console.error('Fehler: Bei "fixed-value" darf int_scrollToTop nicht kleiner als 0 sein');
		}

	},
};
