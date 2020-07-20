(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,

	start: function() {
		var self = this;

		this.el_body = $$('body')[0];

		lsjs.__moduleHelpers.scrollReactor.start({
			arr_reactions: [
				{
					func_reactionCrossingTop: function () {
						if (this.str_currentDirection === 'down') {
							self.el_body.addClass(self.__models.options.data.str_stickyClass);
						} else {
							if (!self.el_body.hasClass('keep-sticky')) {
								self.el_body.removeClass(self.__models.options.data.str_stickyClass);
							}
						}
					},
					int_scrollPositionTop: self.el_body.getPosition().y + self.__models.options.data.int_offset,
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