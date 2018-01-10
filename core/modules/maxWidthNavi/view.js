(function() {

// ### ENTER MODULE NAME HERE ######
	var str_moduleName = '__moduleName__';
// #################################

	var obj_classdef = 	{
		start: function() {
			this.__el_container =
				(
					typeOf(this.__models.options.data.var_naviSelector) === 'element'
					||	typeOf(this.__models.options.data.var_naviSelector) === 'null'
				)
					?	this.__models.options.data.var_naviSelector
					:	$$(this.__models.options.data.var_naviSelector)[0];

			if (typeOf(this.__el_container) !== 'element') {
				return;
			}

			this.__el_container.addClass('useMaxWidthNavi');
			this.calculateAndSetSize();
			window.addEvent('resize', this.calculateAndSetSize.bind(this));
		},

		calculateAndSetSize: function() {
			Array.each(this.__el_container.getElements('li').filter(this.__models.options.data.bln_onlyFirstLevel ? '.level_1 > .submenu' : '.submenu'), function(el_li) {
				var obj_li = el_li.getCoordinates();
				var obj_nav = el_li.getParent('nav').getCoordinates();
				var float_offsetLeft = obj_li.left - obj_nav.left;
				var float_offsetRight = obj_nav.right - obj_li.right;

				el_li.getElement('> ul').setStyles({
					'left': (Math.round(float_offsetLeft) + this.__models.options.data.int_offsetLeft) * -1,
					'right': (Math.round(float_offsetRight) + this.__models.options.data.int_offsetRight) * -1
				});
			}.bind(this));
		}
	};

	lsjs.addViewClass(str_moduleName, obj_classdef);

})();