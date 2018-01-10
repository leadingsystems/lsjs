(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
	},
	
	setOptions: function(obj_options) {
		this.__models.options.set(obj_options);
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

/*
 * Registering a specific instantiation method with lsjs that can (or rather should)
 * be used instead of manually calling "lsjs.createModule()" in order to open
 * a messageBox. Not every module needs to use this option but in case of standard
 * core modules it often is a good idea.
 */
lsjs.__moduleHelpers[str_moduleName] = {
	open: function(obj_options) {
		lsjs.createModule({
			__name: str_moduleName
		}).__controller.setOptions(obj_options);
	}
};

/*
 * When the message box is opened, people might try to close it by pressing the
 * enter or escape key. We don't provide that functionality yet but at least we
 * want to make sure that pressing these keys while the message box is opened
 * will not do anything else, like, for example, sending a form.
 */
window.addEvent('keydown', function(event) {
	/*
	 * Don't stop anything with the event if no message box is opened
	 */
	if (typeOf($$('.autoModuleContainer.messageBox')[0]) !== 'element') {
		return;
	}

	switch (event.key) {
		case 'enter': // Enter key pressed
		case 'esc': // Escape key pressed
			event.stop();
			break;
	}
}.bind(this));

})();