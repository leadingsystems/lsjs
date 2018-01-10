(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	str_containerID: null,

	start: function() {
		this.registerElements(this.__el_container, 'main', true);

		this.str_containerID = this.__el_container.getProperty('id');

		lsjs.__moduleHelpers.unfold.start({
			str_initialToggleStatus: 'open',
			bln_toggleOnInitialization: false,
			bln_skipAnimationWhenTogglingOnInitialization: false,
			var_togglerSelector: this.__autoElements.main.elementFolderToggler,
			var_contentBoxSelector: this.__autoElements.main.elementFolderContent,
			var_wrapperSelector: this.__el_container,
			str_cookieIdentifierName: this.str_containerID ? this.str_containerID : '',
			str_initialCookieStatus: 'open',
			obj_morphOptions: {
				'duration': 600
			}
		});

	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();