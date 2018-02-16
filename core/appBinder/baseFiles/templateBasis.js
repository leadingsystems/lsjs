(function() {

var obj_templates = {
	'__templateName__': function(arg) {
		var str_return = '__templateCode__';

		// add template info in debug mode
		var str_return = '__templateInfoBegin__' + str_return + '__templateInfoEnd__';

		return str_return;
	}
};

lsjs.tpl.register(obj_templates, '__moduleName__');

})();