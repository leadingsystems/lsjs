(function() {

var obj_templates = {
	'__templateName__': function(arg) {
		var str_return = '__templateCode__';
		return str_return;
	}
};

lsjs.tpl.register(obj_templates, '__moduleName__');

})();