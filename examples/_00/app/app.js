(function() {
	var classdef_app = {
		initialize: function() {
			lsjs.__moduleHelpers.messageBox.open({
				str_msg: 'LSJS loaded!'
			});
		}
	};
	var class_app = new Class(classdef_app);
	
	window.addEvent('domready', function() {
		new class_app();
	});
})();