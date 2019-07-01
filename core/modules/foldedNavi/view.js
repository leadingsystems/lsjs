(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		this.__els_container =
			(
				typeOf(this.__models.options.data.var_naviSelector) === 'element'
				||	typeOf(this.__models.options.data.var_naviSelector) === 'null'
			)
				?	this.__models.options.data.var_naviSelector
				:	$$(this.__models.options.data.var_naviSelector);

		if (typeOf(this.__els_container) !== 'element' && typeOf(this.__els_container) !== 'elements') {
			return;
		}

		if (typeOf(this.__els_container) !== 'elements') {
            this.__els_container = new Elements([this.__els_container]);
		}

		this.__els_container.addClass('useFoldedNavi');

		Array.each(
            this.__els_container,
			function(el_naviToFold) {
				Array.each(el_naviToFold.getElements('li').filter(this.__models.options.data.bln_onlyFirstLevel ? '.level_1 > .submenu' : '.submenu'), function(el_li) {
					var el_toggler = new Element('span.foldedNaviToggler').inject(el_li, 'top');

					lsjs.__moduleHelpers.unfold.start({
						bln_automaticallyCreateResizeBox: false,
						str_initialDisplayType: 'block',
						str_initialToggleStatus: 'closed',
						bln_toggleOnInitialization: this.__models.options.data.bln_automaticallyToggleOnInitialization ? (el_li.hasClass('trail') || el_li.hasClass('active')) : false,
						var_togglerSelector: el_toggler,
						var_contentBoxSelector: el_li.getElement('> ul'),
						var_wrapperSelector: el_li,
						str_animationMode: 'height',
						obj_morphOptions: {
							'duration': 400
						},
						bln_closeOnOutsideClick: this.__models.options.data.bln_closeOnOutsideClick
					});
				}.bind(this));
			}.bind(this)
		);

	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();