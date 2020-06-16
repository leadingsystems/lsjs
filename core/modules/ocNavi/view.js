(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_body: null,
	float_documentScrollY: 0,

	start: function() {
		this.el_body = $$('body')[0];
		this.registerElements(this.__el_container, 'main', false);

		if (
			typeOf(this.__autoElements.main.offCanvasOuterContainer) !== 'element'
			|| typeOf(this.__autoElements.main.offCanvasContainer) !== 'element'
			|| typeOf(this.__autoElements.main.togglerContainer) !== 'element'
			|| typeOf(this.__autoElements.main.toggler) !== 'element'
		) {
			console.error('ocNavi could not be initialized correctly because mandatory elements are missing.');
		}

		this.el_body.addClass('useOcNavi');

		this.__autoElements.main.toggler.addEvent(
			'click',
			function(event) {
				event.stop();
				if (this.el_body.hasClass('showOcNavi')) {
					this.el_body.removeClass('showOcNavi');
					this.el_body.addClass('hideOcNavi');
					// window.setTimeout(
					// 	function() {
							document.documentElement.scrollTop = this.float_documentScrollY;
					// 	}.bind(this),
					// 	10
					// );
				} else {
					this.float_documentScrollY = document.documentElement.scrollTop;
					this.el_body.addClass('showOcNavi');
					this.el_body.removeClass('hideOcNavi');
				}
			}.bind(this)
		)
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();