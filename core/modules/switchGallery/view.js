(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		this.registerElements(this.__el_container, 'main', true);

		this.initializeEvents();
	},

	initializeEvents() {
		var self = this;
		this.__autoElements.main.smallImage.addEvent(
			'click',
			function() {
				self.switchImages(this, self.__autoElements.main.bigImage[0]);
			}
		);
	},

	switchImages: function(el_imageContainer1, el_imageContainer2) {
		var el_realImage1 = el_imageContainer1.tagName === 'img' ? el_imageContainer1 : el_imageContainer1.getElement('img');
		var el_realImage2 = el_imageContainer2.tagName === 'img' ? el_imageContainer2 : el_imageContainer2.getElement('img');
		var str_tmpSrcImage1 = '';

		if (
			el_realImage1 === undefined || el_realImage1 === null
			|| el_realImage2 === undefined || el_realImage2 === null
		) {
			if (this.__models.options.data.bln_debug) {
				console.warn('no real image element could be found for one of the elements to switch');
				console.warn(el_imageContainer1);
				console.warn(el_imageContainer2);
			}
			return;
		}

		str_tmpSrcImage1 = el_realImage1.getAttribute('src');
		el_realImage1.setAttribute('src', el_realImage2.getAttribute('src'));
		el_realImage2.setAttribute('src', str_tmpSrcImage1);
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();