(function() {
var classdef_lsjs_templateHandler = {
	obj_templateFunctions: {},
	
	initialize: function() {
	},

	use: function(obj_usageOptions, str_moduleName) {
		var	obj_usageOptionsDefaults,
			func_templateBoundWithArguments,
			el_renderedTemplate;
		
		if (str_moduleName === undefined || str_moduleName === null || !str_moduleName) {
			str_moduleName = 'universal';
		}

		obj_usageOptionsDefaults = {
			'name': '', // the name of the template function
			'arg': null, // the argument to pass to the template function
			'parent': null, // an element in which the parsed template should be inserted
			'mode': 'add', // the template usage mode (pure, add, replace)
			'bind': null, // an object to bind to the template function as "this" for the template function
			'class': null, // a class string to use with the template wrapping div
			'id': null // an id to use with the template wrapping div
		};
		
		Object.each(obj_usageOptionsDefaults, function(value, key) {
			if (obj_usageOptions[key] === undefined || obj_usageOptions[key] === null) {
				obj_usageOptions[key] = value;
			}
		});
		
		obj_usageOptions.mode = obj_usageOptions.mode === 'replace' || obj_usageOptions.mode === 'pure' ? obj_usageOptions.mode : 'add';
		
		if (
				this.obj_templateFunctions[str_moduleName] === undefined
			||	this.obj_templateFunctions[str_moduleName] === null
		) {
			console.error('module "' + str_moduleName + '" is not registered');
			return null;
		}
		
		if (
				obj_usageOptions.name === undefined
			||	!obj_usageOptions.name
		) {
			console.error('no template name given.');
			return null;
		}
		
		if (
				this.obj_templateFunctions[str_moduleName][obj_usageOptions.name] === undefined
			||	this.obj_templateFunctions[str_moduleName][obj_usageOptions.name] === null
		) {
			console.info('template "' + obj_usageOptions.name + '" is not registered');
			return null;
		}
		
		func_templateBoundWithArguments = this.obj_templateFunctions[str_moduleName][obj_usageOptions.name].pass(obj_usageOptions.arg, (obj_usageOptions.bind !== undefined && obj_usageOptions.bind !== null ? obj_usageOptions.bind : window));
				
		el_renderedTemplate = new Element('div').setProperty('html', func_templateBoundWithArguments());
		if (obj_usageOptions.id !== undefined && obj_usageOptions.id !== null) {
			el_renderedTemplate.setProperty('id', obj_usageOptions.id);
		}
		el_renderedTemplate.addClass(obj_usageOptions.name);
		if (obj_usageOptions.class !== undefined && obj_usageOptions.class !== null) {
			el_renderedTemplate.addClass(obj_usageOptions.class);
		}

		if (typeOf(obj_usageOptions.parent) !== 'element') {
			return el_renderedTemplate;
		}
		
		if (obj_usageOptions.mode === 'pure') {
			return el_renderedTemplate;
		}
		
		if (obj_usageOptions.mode === 'replace') {
			/*
			 * First, we use destroy() on all the children, because we want to
			 * prepare them for garbage collection. This, however, does not eliminate
			 * text nodes, which is why, secondly, we use parent.empty() to get
			 * rid of them, too.
			 */
			obj_usageOptions.parent.getChildren().destroy();
			obj_usageOptions.parent.empty();
		}
		
		obj_usageOptions.parent.adopt(el_renderedTemplate);
		
		return el_renderedTemplate;
	},
	
	/*
	 * 'pure' simply returns the rendered template but does not add it to the DOM.
	 */
	pure: function(obj_usageOptions, str_moduleName) {
		obj_usageOptions.mode = 'pure';
		return this.use(obj_usageOptions, str_moduleName);
	},
	
	/*
	 * 'add' puts the rendered template in the DOM as a child of the given parent
	 */
	add: function(obj_usageOptions, str_moduleName) {
		obj_usageOptions.mode = 'add';
		return this.use(obj_usageOptions, str_moduleName);
	},
	
	/*
	 * 'replace' first removes all children from the given parent and then does
	 * what 'add' does.
	 */
	replace: function(obj_usageOptions, str_moduleName) {
		obj_usageOptions.mode = 'replace';
		return this.use(obj_usageOptions, str_moduleName);
	},
	
	register: function(obj_templateFunctions, str_moduleName) {
		if (str_moduleName === undefined || str_moduleName === null || !str_moduleName) {
			str_moduleName = 'universal';
		}
		Object.each(obj_templateFunctions, function(func_template, str_templateFunctionName) {
			this.registerSingleTemplate(str_templateFunctionName, func_template, str_moduleName);
		}.bind(this));
	},
	
	registerSingleTemplate: function(str_templateFunctionName, func_template, str_moduleName) {
		if (this.obj_templateFunctions[str_moduleName] === undefined || this.obj_templateFunctions[str_moduleName] === null) {
			this.obj_templateFunctions[str_moduleName] = {};
		}
		if (this.obj_templateFunctions[str_moduleName][str_templateFunctionName] !== undefined && typeOf(this.obj_templateFunctions[str_moduleName][str_templateFunctionName]) === 'function') {
			console.error('double assignment to template name "' + str_templateFunctionName + '". Is it possible that you included the same template file more than once?');
			return;
		}
		
		if (typeOf(func_template) !== 'function') {
			console.error('no template function given for template name "' + str_templateFunctionName + '"');
			return;
		}
		
		this.obj_templateFunctions[str_moduleName][str_templateFunctionName] = func_template;
	}
};

var class_lsjs_templateHandler = new Class(classdef_lsjs_templateHandler);

lsjs.tpl = new class_lsjs_templateHandler();

})();