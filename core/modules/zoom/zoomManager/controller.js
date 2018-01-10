(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
		var els_toEnhance;
		
		if (this.__models.options.data.el_domReference !== undefined && typeOf(this.__models.options.data.el_domReference) === 'element') {
			els_toEnhance = this.__models.options.data.el_domReference.getElements(this.__models.options.data.selector);
		} else {
			els_toEnhance = $$(this.__models.options.data.selector);
		}

		Array.each(els_toEnhance, function(el_zoomImage) {
			/* ->
			 * Make sure not to handle an element more than once
			 */
			if (!el_zoomImage.retrieve('alreadyHandledBy_' + str_moduleName)) {
				el_zoomImage.store('alreadyHandledBy_' + str_moduleName, true);
			} else {
				return;
			}
			/*
			 * <-
			 */

			/*
			 * Try to verify that the element identified with the selector is an
			 * image and return if it isn't. We check for an existing src attribute
			 * because an image without a src attribute wouldn't be okay as well.
			 */
			var str_checkSrcProperty = el_zoomImage.getProperty('src');
			if (str_checkSrcProperty === undefined || str_checkSrcProperty === null || str_checkSrcProperty == '') {
				return;
			}
			
			var el_toDetermineHref =
				(
						this.__models.options.data.useAnchorElement != undefined
					&&	this.__models.options.data.useAnchorElement == true
				)
				?	el_zoomImage.getParent('a')
				:	el_zoomImage;
			if (el_toDetermineHref === undefined || el_toDetermineHref === null) {
				return;
			}
			
			var str_href = el_toDetermineHref.getProperty(this.__models.options.data.bigImageUrlAttribute);
			if (str_href === undefined || str_href === null || str_href === '' || !str_href) {
				return;
			}

			var str_tmpImageSrc = el_zoomImage.getProperty('src');
			el_zoomImage.removeProperty('src');
			el_zoomImage.addEvent('load', function() {
				lsjs.createModule({
					__name: 'zoomInstance',
					__parentModule: this.__module,
					__useLoadingIndicator: false,
					el_zoomImage: el_zoomImage,
					str_href: str_href
				});
			}.bind(this));
			el_zoomImage.setProperty('src', str_tmpImageSrc);

		}.bind(this));
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.__moduleHelpers[str_moduleName] = {
	self: null,
	
	start: function(obj_options) {
		this.self = lsjs.createModule({
			__name: str_moduleName
		});
		this.self.__models.options.set(obj_options);
	}
};

})();