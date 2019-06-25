(function() {

// ### ENTER MODULE NAME HERE ######
	var str_moduleName = '__moduleName__';
// #################################

	var obj_classdef = 	{
		start: function() {
			var els_touchableHyperlinks;

			this.__el_container =
				(
					typeOf(this.__models.options.data.var_naviSelector) === 'element'
					||	typeOf(this.__models.options.data.var_naviSelector) === 'null'
				)
					?	this.__models.options.data.var_naviSelector
					:	$$(this.__models.options.data.var_naviSelector)[0];

			if (typeOf(this.__el_container) !== 'element') {
				console.log(str_moduleName + ': No navigation found with selector "this.__models.options.data.var_naviSelector"')
				return;
			}

			this.__el_container.addClass('useTouchNavi');

			els_touchableHyperlinks = this.__el_container.getElements(this.__models.options.data.var_touchableHyperlinkSelector);

            els_touchableHyperlinks.addEvent(
            	'click',
				function(event) {
            		if (!this.hasClass('touched')) {
						event.preventDefault();
						this.addClass('touched');
						this.getParent().addClass('touched');
					} else {
						this.removeClass('touched');
						this.getParent().removeClass('touched');
					}
				}
			)
		}
	};

	lsjs.addViewClass(str_moduleName, obj_classdef);

})();