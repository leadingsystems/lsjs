(function() {
	var classdef_app = {
		initialize: function() {
			lsjs.createModule({
				__name: 'helloWorld'
			});
		}
	};

	var class_app = new Class(classdef_app);
	
	window.addEvent('domready', function() {
		new class_app();
	});
})();