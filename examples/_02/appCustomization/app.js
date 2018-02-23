(function() {
	var classdef_app = {
		initialize: function() {
			console.log('customized app.js works!');
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