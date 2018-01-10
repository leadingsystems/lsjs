(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		var els_header,
			el_header,
			self = this;

		els_header = $$(this.__models.options.data.str_headerSelector);

		if (typeOf(els_header) !== 'elements' || els_header.length < 1) {
			console.log('no elements found for selector "' + this.__models.options.data.str_headerSelector + '"');
			return;
		}

		if (els_header.length > 1) {
			console.log('more than one element found for selector "' + this.__models.options.data.str_headerSelector + '"');
			return;
		}

		el_header = els_header[0];

		lsjs.__moduleHelpers.scrollReactor.start({
			arr_reactions: [
				{
					func_reactionCrossingTop: function () {
						if (this.str_currentDirection === 'down') {
							el_header.addClass(self.__models.options.data.str_stickyClass);
						} else {
							el_header.removeClass(self.__models.options.data.str_stickyClass);
						}
					},
					int_scrollPositionTop: el_header.getPosition().y + self.__models.options.data.int_offset,
					obj_reactOn: {
						str_crossingTop: 'both',
						str_crossingBottom: 'none',
						str_between: 'none'
					}
				}
			]
		});
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();