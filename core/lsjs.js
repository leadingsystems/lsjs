(function() {
	
/*
 * ==>
 * Make sure that we can safely use all the console methods even if some of
 * them might not be available in a certain client
 */
(function() {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn', 'lsjsConsoleTest'
	];
	var length = methods.length;
	console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
})();
/*
 * <==
 */

/*
 * Request.cajax makes an ajax call and expects an html response with cajax elements
 * whose contents replace the contents of elements currently in the dom with
 * matching ids.
 */
Request.cajax = new Class({
	Extends: Request,

	bln_urlHistoryHasBeenHandled: false,

	options: {
		cajaxMode: 'update', // can be 'update', 'updateCompletely', 'append', 'discard',
		el_formToUseForFormData: false,
		obj_additionalFormData: {},
		headers: {
			/*
			 * We only expect html but we keep the Accept value as it is in
			 * Request.HTML. Who knows what it might be good for...
			 */
			Accept: 'text/html, application/xml, text/xml, */*'
		}
	},

	initialize: function(options){

		if (options.url !== undefined && options.url !== null) {
			options.url = options.url + (String(options.url).includes('?') ? '&' : '?') + 'cajaxCall=' + (new Date).getTime();
        }

		if (lsjs.obj_preferences.bln_activateUrlModificationInRequestCajax) {
			var func_onProgressOption = options.onProgress;

			options.onProgress = function(event, xhr) {
				if (!options.bln_doNotModifyUrl) {
					this.handleUrlHistory(xhr);
				}

				if (typeOf(func_onProgressOption) === 'function') {
					func_onProgressOption(event, xhr);
				}
			};
		}

		this.parent(options);
	},

	handleUrlHistory: function(xhr) {
		if (this.bln_urlHistoryHasBeenHandled) {
			return;
		}

		if (xhr.responseURL) {
			var obj_urlToPushToHistory = new URL(xhr.responseURL);
			var arr_paramsToRemove = ['cajaxCall', 'cajaxRequestData'];

			obj_urlToPushToHistory.searchParams.forEach(
				function(value, key) {
					if (value === '') {
						arr_paramsToRemove.push(key);
					}
				}
			);

			Array.each(
				arr_paramsToRemove,
				function(str_paramNameToRemove) {
					obj_urlToPushToHistory.searchParams.delete(str_paramNameToRemove);
				}
			);

			/*
			 * We're using "replaceState()" because using "pushState()" comes with some problems.
			 *
			 * Maybe it would be a good idea to use "pushState()" but there are some things that need to be further
			 * examined.
			 *
			 * === An explanation of the whole situation for future reference: ===
			 *
			 * "pushState()" would write the URLs of every cajax call to the history and using history.back() or the
			 * browser's "step back button" would go through each of them. This seems to be what we want but unfortunately,
			 * those steps back in history don't change the contents of the page to reflect the URL but ONLY the URL.
			 * This happens because those states we pushed are only states of the same document and as long as the browser
			 * is in the same document, going through its states doesn't actually load the URLs of those states.
			 * Example: If we opened page 1, then page 2, then clicked through a pagination using cajax on page 2 and
			 * then we opened page 3, this would look something like this:
			 * 		/page1.html => loaded regularly
			 * 		/page2.html => loaded regularly
			 * 		/page2.html?subpage=2 => loaded via cajax
			 * 		/page2.html?subpage=3 => loaded via cajax
			 * 		/page3.html => loaded regularly
			 * Going back from /page3.html to /page2.html?subpage=3 would actually load the page with this URL because
			 * page2.html is not the same document as page3.html. But then going back from /page2.html?subpage=3 to
			 * /page2.html?subpage=2 and /page2.html would only change the URL but not a thing in the page's contents.
			 * We would see subpage 3 all the time. Only when we go on to /page1.html, the page would actually load the
			 * URL. And if we moved forward in history, we would see /page2.html loading from the URL in history but
			 * /page2.html?subpage=2 and /page2.html?subpage=3 always showing subpage 1.
			 *
			 * We could probably solve this issue by placing this line of code in the app.js (or somewhere else):
			 *  >> window.addListener('popstate', function(event) { window.location.href = event.target.location.href; }); <<
			 *
			 * This event would be triggered every time that one of those history steps which only change the URL occurs
			 * and then write the changed URL to window.location.href causing the page to actually reload with the given
			 * URL. We tested this briefly in firefox and it worked. However, this is far too experimental to actually
			 * use it without massive x-browser testing.
			 *
			 * By using "replaceState()" we are not building a real history at all. We simply tell the one document
			 * that we loaded before that its URL changes after each cajax call. The previously mentioned example
			 * would result in this history:
			 * 		/page1.html => loaded regularly
			 * 		/page2.html?subpage=3 => loaded regularly as /page2.html but then overwritten via cajax/replaceState()
			 * 		/page3.html => loaded regularly
			 *
			 * If we go back in history from /page3.html to /page2.html?subpage=3, this will load the page with this URL
			 * and going forward in history from /page1.html to /page2.html?subpage=3 will also load the page with this URL.
			 * But the history doesn't reflect in any way that we called multiple subpages.
			 *
			 */
			history.replaceState({}, '', obj_urlToPushToHistory);

			this.bln_urlHistoryHasBeenHandled = true;
		}
	},

	success: function(str_text){
		/*
		 * Strip javascript to make sure that we only have html
		 */
		this.response.html = str_text.stripScripts(function(str_script){
			this.response.javascript = str_script;
		}.bind(this));

		if (this.options.cajaxMode === 'discard') {
			this.onSuccess(els_toPassToOnSuccess, this.response.html, this.response.javascript);
			return;
		}
		
		/*
		 * Create a temporary element with the html response because this parses
		 * the html response so that we can actually work with the elements
		 * returned by ls_cajax
		 */
		var el_temp = new Element('div').set('html', this.response.html);
		
		/*
		 * The children of el_temp are the elements that were requested from
		 * ls_cajax and that need to be updated in the dom.
		 */
		var els_updated = el_temp.getChildren();
		
		var els_toPassToOnSuccess = new Elements();
		
		Array.each(els_updated, function(el_updated) {
			if ($(el_updated.getProperty('id')) === null) {
				console.info('cajax response contains elements without IDs, which therefore can\'t be considered for content updates:')
				console.log(el_updated);
				return;
			}
			
			els_toPassToOnSuccess.push(this.options.cajaxMode === 'updateCompletely' ? el_updated : $(el_updated.getProperty('id')));
			
			/*
			 * We take the element whose id matches the id of the response element
			 * from the dom and update its contents with those of the response element.
			 */
			switch(this.options.cajaxMode) {
				case 'update':
					$(el_updated.getProperty('id')).empty().adopt(el_updated.childNodes);
					break;

				case 'updateCompletely':
					var float_scrollTop = $(el_updated.getProperty('id')).scrollTop;

					el_updated.replaces($(el_updated.getProperty('id')));

					el_updated.scrollTop = float_scrollTop;
					break;

				case 'append':
					$(el_updated.getProperty('id')).adopt(el_updated.childNodes);
					break;
			}
		}.bind(this));

		this.onSuccess(els_toPassToOnSuccess, this.response.html, this.response.javascript);
		
		Array.each(els_toPassToOnSuccess, function(el_domReference) {
			window.fireEvent('cajax_domUpdate', el_domReference);
		});
	},

	send: function(options) {
		/*
		 * If we don't use FormData, we call the parent function...
		 */
		if (typeOf(this.options.el_formToUseForFormData) !== 'element') {
			this.parent(options);
			return;
		}

		/*
		 * but if we use FormData, we have to use our own implementation of the send() function
		 */

		/*
		 * first, we build the FormData object from the given form, adding the key/value pairs of the
		 * additionalFormData object
		 */
		var obj_formData = new FormData(this.options.el_formToUseForFormData);
		Object.each(this.options.obj_additionalFormData, function(value, key) {
			obj_formData.append(key, value);
		});

		/*
		console.log('sending FormData: ');
		console.log(this.options.el_formToUseForFormData);
		console.log(this.options.obj_additionalFormData);
		for (var pair of obj_formData.entries()) {
			console.log(pair[0]+ ', ' + pair[1]);
		}
		*/

		this.sendFormData(options, obj_formData);
	},

	sendFormData: function(options, obj_formData){
		if (!this.check(options)) return this;

		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.running = true;

		var xhr = this.xhr;
		var progressSupport = ('onprogress' in new Browser.Request);
		if (progressSupport){
			xhr.onloadstart = this.loadstart.bind(this);
			xhr.onprogress = this.progress.bind(this);
			xhr.upload.onprogress = this.progress.bind(this);
		}

		xhr.open('POST', this.options.url, true);
		xhr.onreadystatechange = this.onStateChange.bind(this);

		Object.each(this.headers, function(value, key){
			try {
				xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		xhr.send(obj_formData);

		if (!this.options.async) this.onStateChange();
		if (this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
		return this;
	}

});

var classdef_lsjs_helpers = {
	/*
	 * When a form is sent via Request.cajax the data to send is determined using a FormData object.
	 * Since the FormData object doesn't know which button was used to submit the form, the following function
	 * writes this information in a hidden input field.
	 *
	 * There should be a simpler way but at the current time, IE 11 and Safari don't support direct access
	 * to the submit event's submitter.
	 */
	prepareFormForCajaxRequest: function(el_form) {
		if (typeOf(el_form) !== 'element') {
			return;
		}

		el_form.getElements('[type="submit"]').addEvent(
			'click',
			function() {
				var str_dataAttributeNameForFakeSubmit = 'data-fake-submit-field-for-cajax-request';
				var el_fakeSubmitField = el_form.getElement('[' + str_dataAttributeNameForFakeSubmit + ']');

				if (el_fakeSubmitField === undefined || el_fakeSubmitField === null) {
					el_fakeSubmitField = new Element('input');
					el_fakeSubmitField.setProperty('type', 'hidden');
					el_fakeSubmitField.setProperty(str_dataAttributeNameForFakeSubmit, '');
					el_form.adopt(el_fakeSubmitField);
				}

				el_fakeSubmitField.setProperties(
					{
						'name': this.getProperty('name'),
						'value': this.getProperty('value')
					}
				);
			}
		);
	},

	decimalSaveParseFloat: function(str_number) {
		return parseFloat(str_number.replace(/[^\d\-.,]/g, "").replace(/,/g, ".").replace(/\.(?=.*\.)/g, ""));
	}
};
var class_lsjs_helpers = new Class(classdef_lsjs_helpers);

var classdef_lsjs_hooks = {
	registered_hooks: {},

	registerHook: function(str_hook, func_hookedFunction, obj_properties) {
        if (!this.registered_hooks[str_hook]) {
            this.registered_hooks[str_hook] = [];
        }

        // Check if the function is already registered for this hook
        const alreadyRegistered = this.registered_hooks[str_hook].some(
            (hook) => hook.function === func_hookedFunction
        );

        // Only register if the function is not already registered
        if (!alreadyRegistered) {
			this.registered_hooks[str_hook].push({
				function: func_hookedFunction,
				properties: obj_properties || {},
				order: obj_properties?.order ?? null // Use `null` for unordered hooks
			});
        }
    },

    callHook: function(str_hook, thisArg, ...args) {
        if (this.registered_hooks[str_hook]) {
            this.registered_hooks[str_hook].sort((a, b) => {
                if (a.order === null && b.order === null) {
                    return 0; // Both hooks are unordered; maintain registration order
                } else if (a.order === null) {
                    return 1; // Unordered hooks go last
                } else if (b.order === null) {
                    return -1; // Unordered hooks go last
                }
                return a.order - b.order; // Sort by order (ascending)
            });

            return this.registered_hooks[str_hook].map(
				function(hook) {
                    return hook.function.apply(thisArg, args);
				},
				this
            ).filter(result => result !== undefined); // Remove undefined values
		}
        return [];
	}
};

var class_lsjs_hooks = new Class(classdef_lsjs_hooks);


var classdef_lsjs_apiInterface = {
	str_apiUrl: '',
	
	/*
	 * This function executes an api request and returns the request object.
	 * 
	 * obj_options.str_resource needs to be provided in order to define the api
	 * resource addressed in the request. If obj_options.obj_additionalRequestOptions
	 * is given, this is not mandatory.
	 * 
	 * With obj_options.obj_params the data/parameters to be sent with the
	 * request, can be defined.
	 * 
	 * With "obj_options.obj_additionalRequestOptions" it is possible to completely
	 * override the predefined request settings.
	 */
	request: function(obj_options) {
		var obj_params = {},
			obj_requestOptions = {},
			method = 'get',
			self = this;
		
		obj_params = obj_options.obj_params !== undefined && obj_options.obj_params !== null ? obj_options.obj_params : obj_params;
		
		if (
				(obj_options.str_resource === undefined || obj_options.str_resource === null)
			&&	(obj_options.obj_additionalRequestOptions === undefined || obj_options.obj_additionalRequestOptions === null)
		) {
			console.error('no api resource specified for this request');
			return;
		}

		if (
				obj_options.obj_additionalRequestOptions !== undefined
			&&	obj_options.obj_additionalRequestOptions.method !== undefined
			&&	obj_options.obj_additionalRequestOptions.method === 'post'
		) {
			method = 'post';
		}

		if (method !== 'post') {
			obj_params.resource = obj_options.str_resource;
		}

		obj_requestOptions = {
			url: this.str_apiUrl + (method === 'post' ? (this.str_apiUrl.search(/\?/) === -1 ? '?' : '&') + 'resource=' + obj_options.str_resource : ''),
			noCache: true,
			method: method,
			
			data: Object.toQueryString(obj_params),
			
			onComplete: function(obj_response) {
				if (obj_response === undefined || obj_response.status !== 'success') {
					console.info('ajax/api request not successful');
					return;
				}
				
				if (typeOf(obj_options.func_onSuccess) === 'function') {
					obj_options.func_onSuccess(obj_response.data, this);
				}
   			}
		};
		
		Object.merge(obj_requestOptions, obj_options.obj_additionalRequestOptions);
		
		if (obj_requestOptions.url === undefined || !obj_requestOptions.url) {
			console.error('no url specified for this request');
			return;
		}
		
		return new Request.JSON(obj_requestOptions).send();
	}
};
var class_lsjs_apiInterface = new Class(classdef_lsjs_apiInterface);
	
var classdef_lsjs = {
	obj_moduleClasses: {},
	
	/*
	 * In the __moduleHelpers object, modules (not instances of a module but the
	 * module itself) can store module related helper functions.
	 * 
	 * For example, the core module "messageBox" does this to provide a simplified
	 * creator function (lsjs.__moduleHelpers.messageBox.open())
	 */
	__moduleHelpers: {},
	
	/*
	 * Apps can store a reference to themselves in __appHelpers if they need 
	 * to be accessible in the global scope (lsjs.__appHelpers.appXyz)
	 */
	__appHelpers: {},
	
	createModule: function(obj_args) {
		if (obj_args.__name === undefined || obj_args.__name === null) {
			console.error('module name missing');
			return;
		}
		
		return new class_lsjs_module(obj_args);
	},
	
	addViewClass: function(str_moduleName, obj_classDefinition) {
		if (str_moduleName === undefined || str_moduleName === null || !str_moduleName) {
			console.error('module name missing');
		}
		
		if (obj_classDefinition === undefined || obj_classDefinition === null || !obj_classDefinition) {
			console.error('class definition missing');
		}
		
		if (this.obj_moduleClasses[str_moduleName] === undefined) {
			this.obj_moduleClasses[str_moduleName] = {};
		}
		
		if (this.obj_moduleClasses[str_moduleName].view !== undefined && this.obj_moduleClasses[str_moduleName].view !== null) {
			console.error('view class already created for module "' + str_moduleName + '"');
		}
		
		this.obj_moduleClasses[str_moduleName].view = new Class(obj_classDefinition);
	},
	
	addModelClass: function(str_moduleName, obj_classDefinition) {
		if (str_moduleName === undefined || str_moduleName === null || !str_moduleName) {
			console.error('module name missing');
		}
		
		if (obj_classDefinition === undefined || obj_classDefinition === null || !obj_classDefinition) {
			console.error('class definition missing');
		}
		
		if (obj_classDefinition.name === undefined || obj_classDefinition.name === null || !obj_classDefinition.name) {
			console.error('model name missing');
		}
		
		if (this.obj_moduleClasses[str_moduleName] === undefined) {
			this.obj_moduleClasses[str_moduleName] = {};
		}
		
		if (this.obj_moduleClasses[str_moduleName].model === undefined) {
			this.obj_moduleClasses[str_moduleName].model = {};
		}
		
		if (this.obj_moduleClasses[str_moduleName].model[obj_classDefinition.name] !== undefined && this.obj_moduleClasses[str_moduleName].model[obj_classDefinition.name] !== null) {
			console.error('model class "' + obj_classDefinition.name + '" already created in module "' + str_moduleName + '"');
		}
		
		/*
		 * We need to pass the data object along and then, after instantiating the
		 * model class, we write a clone of this data object to the model instance's
		 * data object. This way, we get an iterable data object and sidestep the
		 * problem that occurs when converting the data object into a hash for this
		 * purpose. When using the hash, we realized that the data objects of multiple
		 * modules' models pointed to the same resource.
		 */
		this.obj_moduleClasses[str_moduleName].model[obj_classDefinition.name] = {
			class_module: new Class(obj_classDefinition),
			obj_data: obj_classDefinition.data
		};
	},
	
	addControllerClass: function(str_moduleName, obj_classDefinition) {
		if (str_moduleName === undefined || str_moduleName === null || !str_moduleName) {
			console.error('module name missing');
		}
		
		if (obj_classDefinition === undefined || obj_classDefinition === null || !obj_classDefinition) {
			console.error('class definition missing');
		}
		
		if (this.obj_moduleClasses[str_moduleName] === undefined) {
			this.obj_moduleClasses[str_moduleName] = {};
		}
		
		if (this.obj_moduleClasses[str_moduleName].controller !== undefined && this.obj_moduleClasses[str_moduleName].controller !== null) {
			console.error('controller class already created for module "' + str_moduleName + '"');
		}
		
		this.obj_moduleClasses[str_moduleName].controller = new Class(obj_classDefinition);
	},
	
	apiInterface: new class_lsjs_apiInterface(),

	helpers: new class_lsjs_helpers(),

	hooks: new class_lsjs_hooks(),

	obj_preferences: {
		bln_activateUrlModificationInRequestCajax: false
	}
};
var class_lsjs = new Class(classdef_lsjs);

var classdef_lsjs_module = {
	__name: '',
	__parentModule: null,
	
	__el_container: null,
	
	__view: null, // will later hold the view
	__models: null, // will later hold the object that provides access to all models
	__controller: null, // will later hold the controller

	els_renderedTemplates: new Elements(),

	int_numModelsToLoad: 0,
	
	obj_args: {},
	obj_registeredDataBindings: {},
	
	initialize: function(obj_args) {
		this.obj_args = obj_args;
		this.__name = this.obj_args.__name;
		
		if (this.obj_args.__parentModule !== undefined && this.obj_args.__parentModule !== null) {
			this.__parentModule = this.obj_args.__parentModule;
		}
		
		if (this.obj_args.__useLoadingIndicator === true && this.__name !== 'loadingIndicator' && lsjs.loadingIndicator !== undefined && lsjs.loadingIndicator !== null) {
			lsjs.loadingIndicator.__controller.show();
		}
		
		if (this.obj_args.__el_container !== undefined && typeOf(this.obj_args.__el_container) === 'element') {
			this.__el_container = this.obj_args.__el_container;
		} else {
			if (this.obj_args.str_containerSelector === undefined || this.obj_args.str_containerSelector === null) {
				this.__el_container = new Element('div.moduleContainer.autoModuleContainer.' + this.__name);
			} else {
				this.__el_container = $$(this.obj_args.str_containerSelector)[0];
				if (this.__el_container === undefined || this.__el_container === null) {
					console.error('no element found in DOM for selector "'+ this.obj_args.str_containerSelector + '" in module "' + this.__name + '"');
					return;
				}
			}
		}
		
		if (lsjs.obj_moduleClasses[this.__name] === undefined || lsjs.obj_moduleClasses[this.__name] === null) {
			console.error('module classes not registered for module "' + this.__name + '". Did you include all of the script files?');
			return;
		}
				
		/*
		 * Instantiate the controller
		 */
		this.__controller = new lsjs.obj_moduleClasses[this.__name].controller();
		this.__controller.__module = this;
		
		/*
		 * Instantiate the view and make some module functions available
		 */
		if (lsjs.obj_moduleClasses[this.__name].view !== undefined && lsjs.obj_moduleClasses[this.__name].view !== null) {
			this.__view = new lsjs.obj_moduleClasses[this.__name].view();
			this.__view.__module = this;
			this.__view.__el_container = this.__el_container;
			this.__view.tplPure = this.tplPure.bind(this);
			this.__view.tplAdd = this.tplAdd.bind(this);
			this.__view.tplReplace = this.tplReplace.bind(this);
			this.__view.registerElements = this.registerElements.bind(this);
			this.__view.removeDataBindings = this.removeDataBindings.bind(this);
			this.__view.debugBindings = this.debugBindings.bind(this);
		}
		
		/*
		 * Make controller and view available for each other
		 */
		this.__controller.__view = this.__view;
		if (this.__view !== undefined && this.__view !== null) {
			this.__view.__controller = this.__controller;
		}

		
		/*
		 * Instantiate each model as a property of an object holding all models.
		 * Make controller and view available for each model and call each model's
		 * "start()" method.
		 */
		this.__models = {};
		
		/*
		 * Make the object holding all models available for controller and view.
		 * Important: This assignment needs to be created before actually instantiating
		 * any models because otherwise a race condition exists which can cause
		 * the controller's and the view's "start" method to be called before
		 * __models is assigned to them.
		 */
		this.__controller.__models = this.__models;
		if (this.__view !== undefined && this.__view !== null) {
			this.__view.__models = this.__models;
		}
		
		/*
		 * First, we walk through all model classes and instantiate them but we
		 * don't actually call the model's "start()" method because before the
		 * first model can be started, we need to know how many models we have
		 * to load in this module. This is important because only then we can
		 * determine later if all modules have been loaded successfully.
		 */
		/*
		 * [1.0.0_h_#3] make sure that we don't try to iterate over undefined or
		 * null because as of mootools 1.5.2. this would cause an error.
		 */
		if (lsjs.obj_moduleClasses[this.__name].model !== undefined && lsjs.obj_moduleClasses[this.__name].model !== null) {
			Object.each(lsjs.obj_moduleClasses[this.__name].model, function(obj_modelClassAndData, str_moduleName) {
				this.int_numModelsToLoad++;
				this.__models[str_moduleName] = new obj_modelClassAndData.class_module();
				this.__models[str_moduleName].data = Object.clone(obj_modelClassAndData.obj_data);
				this.__models[str_moduleName].__module = this;
				this.__models[str_moduleName].__view = this.__view;
				this.__models[str_moduleName].__controller = this.__controller;
				this.__models[str_moduleName].__models = this.__models;
				this.__models[str_moduleName].writeData = this.writeData;
				this.__models[str_moduleName].readData = this.readData;
				this.__models[str_moduleName].triggerDataBinding = this.triggerDataBinding;
				this.__models[str_moduleName].handleDataBinding = this.handleDataBinding;
				this.__models[str_moduleName].handleDataFunctionBinding = this.handleDataFunctionBinding;
				this.__models[str_moduleName].lookForMatchingDataBindings = this.lookForMatchingDataBindings;
			}.bind(this));
		}
		
		/*
		 * Walk through all models again and start them or, if there are no models
		 * registered, call "onModelLoaded()" directly so that the module can work
		 * without a model.
		 */
		if (Object.getLength(this.__models) > 0) {
			Object.each(lsjs.obj_moduleClasses[this.__name].model, function(class_module, str_moduleName) {
				this.__models[str_moduleName].start();
			}.bind(this));
		} else {
			this.onModelLoaded();
		}
	},
	
	onModelLoaded: function() {
		this.int_numModelsToLoad--;
		
		/*
		 * If there are models that have yet to be loaded, we return
		 * right now and do nothing
		 */
		if (this.int_numModelsToLoad > 0) {
			return;
		}
		
		/*
		 * If all models are loaded we start view and controller
		 */
		/*
		 * Start the view
		 */
		if (this.__view !== undefined && this.__view !== null) {
			this.__view.start();
		}
		
		/*
		 * Start the controller
		 */
		this.__controller.start();
		
		if (this.obj_args.__useLoadingIndicator === true && this.__name !== 'loadingIndicator' && lsjs.loadingIndicator !== undefined && lsjs.loadingIndicator !== null) {
			lsjs.loadingIndicator.__controller.hide();
		}
	},
	
	remove: function() {
		this.__el_container.destroy();
		delete this.__el_container;
		delete this.__view;
		delete this.__models;
		delete this.__controller;
	},
	
	tplPure: function(obj_usageOptions, str_moduleName, bln_registerSingleElementsInElementList) {
		return this.tplUse('pure', obj_usageOptions, str_moduleName, bln_registerSingleElementsInElementList);
	},

	/*
	 * tplOutput can be used to output a rendered template in another template like this:
	 * <?= this.tplOutput({name: 'templatexyz', arg: {str_someValue: str_value}}) =?>
	 */
	tplOutput: function(obj_usageOptions, str_moduleName, bln_registerSingleElementsInElementList) {
		obj_usageOptions.bln_output = true;
		return this.tplUse('pure', obj_usageOptions, str_moduleName, bln_registerSingleElementsInElementList);
	},

	tplAdd: function(obj_usageOptions, str_moduleName, bln_registerSingleElementsInElementList) {
		return this.tplUse('add', obj_usageOptions, str_moduleName, bln_registerSingleElementsInElementList);
	},
	
	tplReplace: function(obj_usageOptions, str_moduleName, bln_registerSingleElementsInElementList) {
		return this.tplUse('replace', obj_usageOptions, str_moduleName, bln_registerSingleElementsInElementList);
	},
	
	tplUse: function(str_mode, obj_usageOptions, str_moduleName, bln_registerSingleElementsInElementList) {
		var el_renderedTemplate;
		
		if (str_moduleName === undefined || str_moduleName === null || !str_moduleName) {
			str_moduleName = this.__name;
		}
		if (obj_usageOptions.arg === undefined || obj_usageOptions.arg === null) {
			obj_usageOptions.arg = {};
		}
		
		obj_usageOptions.arg.__models = this.__models;
		obj_usageOptions.arg.__view = this.__view;
		obj_usageOptions.arg.__controller = this.__controller;
		obj_usageOptions.bind = obj_usageOptions.bind !== undefined && obj_usageOptions.bind !== null ? obj_usageOptions.bind : this;
		obj_usageOptions.class = obj_usageOptions.class !== undefined && obj_usageOptions.class !== null ? obj_usageOptions.class : this.__name;
		obj_usageOptions.autoElementsKey = obj_usageOptions.autoElementsKey !== undefined && obj_usageOptions.autoElementsKey !== null ? obj_usageOptions.autoElementsKey : null;
		obj_usageOptions.parent = obj_usageOptions.parent !== undefined && obj_usageOptions.parent !== null ? obj_usageOptions.parent : this.__el_container;
		obj_usageOptions.bln_discardContainerElement = obj_usageOptions.bln_discardContainerElement !== undefined && obj_usageOptions.bln_discardContainerElement;
		obj_usageOptions.bln_output = obj_usageOptions.bln_output !== undefined && obj_usageOptions.bln_output;

		el_renderedTemplate = lsjs.tpl[str_mode](obj_usageOptions, str_moduleName);

		if (el_renderedTemplate === null) {
			return el_renderedTemplate;
		}
		
		this.registerElements(el_renderedTemplate, obj_usageOptions.autoElementsKey !== null ? obj_usageOptions.autoElementsKey : obj_usageOptions.name, bln_registerSingleElementsInElementList);
		this.registerDataBindings(el_renderedTemplate);
		this.registerMultipleDataBindings(el_renderedTemplate);

		this.registerEvents(el_renderedTemplate);

		this.replaceElementPlaceholders(el_renderedTemplate);
		this.replaceTemplatePlaceholders(el_renderedTemplate);

		if (obj_usageOptions.bln_discardContainerElement) {
			var els_renderedTemplateContent = el_renderedTemplate.getChildren();
			el_renderedTemplate.getParent().adopt(els_renderedTemplateContent);
			el_renderedTemplate.destroy();
			return els_renderedTemplateContent;
		} else {
			if (obj_usageOptions.bln_output) {
				this.els_renderedTemplates.push(el_renderedTemplate);
				return '<div data-lsjs-replaceWithElement="this.els_renderedTemplates[' + (this.els_renderedTemplates.length - 1) + ']"></div>';
			} else {
				return el_renderedTemplate;
			}
		}
	},

	replaceTemplatePlaceholders: function(el_toSearchForElementsToReplace) {
		Array.each(el_toSearchForElementsToReplace.getElements('[data-lsjs-replaceWithTemplate]'), function(el_toReplace) {
			var el_toReplaceWith,
				arg;
			
			/*
			 * In the scope that this function is executed in, the "arg" parameter
			 * that would be available in the template's scope does not exist.
			 * Since the value for the 'data-lsjs-replaceWith' property is written
			 * in the template we want the parameter "arg" to work, so we create
			 * it here so that it works when the 'data-lsjs-replaceWith' value
			 * is evaled here.
			 */
			arg = {
				__view: this.__view,
				__models: this.__models
			};
			
			el_toReplaceWith = this.tplPure({name: el_toReplace.getProperty('data-lsjs-replaceWithTemplate')});
			
			if (typeOf(el_toReplaceWith) !== 'element') {
				return;
			}
			
			el_toReplaceWith.wraps(el_toReplace);
			el_toReplace.destroy();
		}.bind(this));
	},
	
	replaceElementPlaceholders: function(el_toSearchForElementsToReplace) {
		Array.each(el_toSearchForElementsToReplace.getElements('[data-lsjs-replaceWithElement]'), function(el_toReplace) {
			var el_toReplaceWith,
				arg;
			
			/*
			 * In the scope that this function is executed in, the "arg" parameter
			 * that would be available in the template's scope does not exist.
			 * Since the value for the 'data-lsjs-replaceWith' property is written
			 * in the template we want the parameter "arg" to work, so we create
			 * it here so that it works when the 'data-lsjs-replaceWith' value
			 * is evaled here.
			 */
			arg = {
				__view: this.__view,
				__models: this.__models
			};
			
			eval('el_toReplaceWith = ' + el_toReplace.getProperty('data-lsjs-replaceWithElement'));
			
			if (typeOf(el_toReplaceWith) !== 'element') {
				return;
			}
			
			el_toReplaceWith.wraps(el_toReplace);
			el_toReplace.destroy();
		}.bind(this));
	},

	registerEvents: function(el_toSearchForEvents) {
		Array.each(
			el_toSearchForEvents.getElements('[data-lsjs-events]'),
			function(el_toRegisterEventTo) {
				var str_events = el_toRegisterEventTo.getProperty('data-lsjs-events');
				var arr_events = null;

				eval('arr_events = ' + str_events);
				if (typeOf(arr_events) !== 'array') {
					return;
				}

				Array.each(
					arr_events,
					function(obj_event) {
						var func_toRegisterWithEvent = null;
						eval('func_toRegisterWithEvent = this.' + obj_event.scope + '.' + obj_event.function + '.bind(this.' + obj_event.scope + ')');

						el_toRegisterEventTo.addEvent(
							obj_event.event,
							function(event) {
								var test = 'hallo';
								func_toRegisterWithEvent(el_toRegisterEventTo, event);
							}.bind(this)
						);
					}.bind(this)
				);
			}.bind(this)
		);
	},

	removeDataBindings: function(el_toSearchForBindings) {
		this.registerMultipleDataBindings(el_toSearchForBindings, true);
		this.registerDataBindings(el_toSearchForBindings, true);
	},
	
	registerMultipleDataBindings: function(el_toSearchForBindings, bln_performDeregistration) {
		bln_performDeregistration = bln_performDeregistration !== undefined && bln_performDeregistration ? true : false;

		Array.each(
			el_toSearchForBindings.getElements('[data-lsjs-bindTo]'),
			function(el_toBind) {
				var str_bindTo = el_toBind.getProperty('data-lsjs-bindTo');
				var arr_bindings = null;

				eval('arr_bindings = ' + str_bindTo);
				if (typeOf(arr_bindings) !== 'array') {
					return;
				}

				Array.each(
					arr_bindings,
					function(obj_binding) {
						var str_bindToModel = obj_binding.model;
						var str_bindToPath = obj_binding.path !== undefined && obj_binding.path !== null ? obj_binding.path : '';
						var str_bindToProperty = obj_binding.property !== undefined && obj_binding.property !== null ? obj_binding.property : '';

						/*
						 * use the new way to declare a binding translation but also accept the old way
						 * if the new is not being used for this binding
						 */
						var str_bindToTranslation = obj_binding.translationModelToView !== undefined && obj_binding.translationModelToView !== null ? obj_binding.translationModelToView : '';

						if (!str_bindToTranslation) {
							str_bindToTranslation = obj_binding.translation !== undefined && obj_binding.translation !== null ? obj_binding.translation : '';
						}

						var str_bindToTranslationViewToModel = obj_binding.translationViewToModel !== undefined && obj_binding.translationViewToModel !== null ? obj_binding.translationViewToModel : '';

						var str_bindToCallbackViewToModel = obj_binding.callbackViewToModel !== undefined && obj_binding.callbackViewToModel !== null ? obj_binding.callbackViewToModel : '';

						if (bln_performDeregistration) {
							this.deregisterSingleDataBinding(el_toBind, str_bindToModel, str_bindToPath, str_bindToProperty, str_bindToTranslation, str_bindToTranslationViewToModel, str_bindToCallbackViewToModel);
						} else {
							this.registerSingleDataBinding(el_toBind, str_bindToModel, str_bindToPath, str_bindToProperty, str_bindToTranslation, str_bindToTranslationViewToModel, str_bindToCallbackViewToModel);
						}
					}.bind(this)
				);
			}.bind(this)
		);
	},

	registerDataBindings: function(el_toSearchForBindings, bln_performDeregistration) {
		bln_performDeregistration = bln_performDeregistration !== undefined && bln_performDeregistration ? true : false;

		Array.each(el_toSearchForBindings.getElements('[data-lsjs-bindToModel]'), function(el_toBind) {
			var	str_bindToModel,
				str_bindToPath,
				str_bindToProperty,
				str_bindToTranslation,
				str_bindToTranslationViewToModel,
				str_bindToCallbackViewToModel;

			str_bindToModel = el_toBind.getProperty('data-lsjs-bindToModel');

			str_bindToPath = el_toBind.getProperty('data-lsjs-bindToPath');
			str_bindToPath = str_bindToPath ? str_bindToPath : '';

			str_bindToProperty = el_toBind.getProperty('data-lsjs-bindToProperty');
			str_bindToProperty = str_bindToProperty ? str_bindToProperty : '';

			/*
			 * use the new way to declare a binding translation but also accept the old way
			 * if the new is not being used for this binding
			 */
			str_bindToTranslation = el_toBind.getProperty('data-lsjs-bindToTranslationModelToView');
			str_bindToTranslation = str_bindToTranslation ? str_bindToTranslation : '';

			if (!str_bindToTranslation) {
				str_bindToTranslation = el_toBind.getProperty('data-lsjs-bindToTranslation');
				str_bindToTranslation = str_bindToTranslation ? str_bindToTranslation : '';
			}

			str_bindToTranslationViewToModel = el_toBind.getProperty('data-lsjs-bindToTranslationViewToModel');
			str_bindToTranslationViewToModel = str_bindToTranslationViewToModel ? str_bindToTranslationViewToModel : '';

			str_bindToCallbackViewToModel = el_toBind.getProperty('data-lsjs-bindToCallbackViewToModel');
			str_bindToCallbackViewToModel = str_bindToCallbackViewToModel ? str_bindToCallbackViewToModel : '';

			if (bln_performDeregistration) {
				this.deregisterSingleDataBinding(el_toBind, str_bindToModel, str_bindToPath, str_bindToProperty, str_bindToTranslation, str_bindToTranslationViewToModel, str_bindToCallbackViewToModel);
			} else {
				this.registerSingleDataBinding(el_toBind, str_bindToModel, str_bindToPath, str_bindToProperty, str_bindToTranslation, str_bindToTranslationViewToModel, str_bindToCallbackViewToModel);
			}

		}.bind(this));
	},

	debugBindings: function() {
		console.log('DEBUG BINDINGS: this.obj_registeredDataBindings', Object.clone(this.obj_registeredDataBindings));
	},

	deregisterSingleDataBinding: function(el_toBind, str_bindToModel, str_bindToPath, str_bindToProperty, str_bindToTranslation, str_bindToTranslationViewToModel, str_bindToCallbackViewToModel) {
		if (this.obj_registeredDataBindings[str_bindToModel] === undefined || this.obj_registeredDataBindings[str_bindToModel] === null) {
			return;
		}

		if (this.obj_registeredDataBindings[str_bindToModel][str_bindToPath] === undefined || this.obj_registeredDataBindings[str_bindToModel][str_bindToPath] === null) {
			return;
		}

		this.obj_registeredDataBindings[str_bindToModel][str_bindToPath] = this.obj_registeredDataBindings[str_bindToModel][str_bindToPath].filter(
			function(obj_binding) {
				var bln_keepBinding =
						obj_binding.str_bindToProperty !== str_bindToProperty
					||	obj_binding.str_bindToTranslation !== str_bindToTranslation
					||	obj_binding.str_bindToTranslationViewToModel !== str_bindToTranslationViewToModel
					||	obj_binding.str_bindToCallbackViewToModel !== str_bindToCallbackViewToModel
					||	obj_binding.el_bound !== el_toBind;

				if (!bln_keepBinding) {
					/*
					 * If we remove the binding, we have to remove corresponding events as well
					 */
					if (obj_binding.func_bound !== null) {
						el_toBind.removeEvent('change', obj_binding.func_bound);
					}
				}

				return bln_keepBinding;
			}
		);

		if (this.obj_registeredDataBindings[str_bindToModel][str_bindToPath].length === 0) {
			delete this.obj_registeredDataBindings[str_bindToModel][str_bindToPath];
		}
	},

	registerSingleDataBinding: function(el_toBind, str_bindToModel, str_bindToPath, str_bindToProperty, str_bindToTranslation, str_bindToTranslationViewToModel, str_bindToCallbackViewToModel) {
		if (this.obj_registeredDataBindings[str_bindToModel] === undefined || this.obj_registeredDataBindings[str_bindToModel] === null) {
			this.obj_registeredDataBindings[str_bindToModel] = {};
		}

		if (this.obj_registeredDataBindings[str_bindToModel][str_bindToPath] === undefined || this.obj_registeredDataBindings[str_bindToModel][str_bindToPath] === null) {
			this.obj_registeredDataBindings[str_bindToModel][str_bindToPath] = [];
		}

		var func_bound =
			str_bindToProperty === 'none'
		?	null
		:	function (eventOrElement) {
				var el_target,
					var_newValue,
					var_oldValue = this.__models[str_bindToModel].readData(str_bindToPath);

				if (eventOrElement === undefined || eventOrElement === null) {
					/*
					 * Before 2017-08-25 a missing eventOrElement caused an error
					 * but this was a problem when an input field was fired by a datepicker
					 * because in this case eventOrElement was missing and we couldn't do
					 * anything about it. So, as of 2017-08-25, if eventOrElement is missing
					 * we assume el_toBind is the element that fired the event.
					 *
					 * console.error('eventOrElement missing');
					 * return;
					 *
					 */
					eventOrElement = el_toBind;
				}

				el_target = typeOf(eventOrElement) === 'element' ? eventOrElement : eventOrElement.target;

				/* ->
				 * !!! Important: !!!
				 * Don't react on change events that did not originate on the bound element itself but another
				 * element inside from which the event bubbled up!
				 */
				if (el_target !== el_toBind) {
					return;
				}
				/*
				 * <-
				 */

				if (str_bindToProperty) {
					var_newValue = el_target.getProperty(str_bindToProperty);
				} else {
					if (el_target.match('input[type="checkbox"')) {

						/*
						 * In case of a checkbox we might want to get a boolean value with either true set in case of
						 * a checked checkbox and false set in case of an unchecked checkbo or the other way around.
						 *
						 * But we might also want the checkbox to deliver an explicitly set value if its checked and
						 * an empty string its not.
						 *
						 * So the behavior implemented for handling checkbox values is as follows:
						 *
						 * - if a value attribute is set for the checkbox input element and this value is not the empty
						 * string, this value is delivered when checked and an empty string when unchecked
						 *
						 * - if no value attribute is set, the string 'on' is delivered when checked and an empty
						 * string when unchecked (this is to support the browser's default 'on' value)
						 *
						 * - if a value attribute is set and it is the empty string or the string 'true', a boolean
						 * true is delivered when checked and a boolean false when unchecked
						 *
						 * - if a value attribute is set and it is the string 'false', a boolean false is delivered
						 * when checked and a boolean true when unchecked
						 */

						var	var_valueChecked,
							var_valueUnchecked;

						if (
							el_target.getProperty('value') === ''
							||	el_target.getProperty('value') === 'true'
						) {
							var_valueChecked = true;
							var_valueUnchecked = false;
						} else if (
							el_target.getProperty('value') === 'false'
						) {
							var_valueChecked = false;
							var_valueUnchecked = true;
						} else {
							var_valueChecked = el_target.getProperty('value');
							var_valueUnchecked = '';
						}

						var_newValue = el_target.checked ? var_valueChecked : var_valueUnchecked;

					} else if (el_target.match('input') || el_target.match('select') || el_target.match('textarea')) {
						var_newValue = el_target.getProperty('value');
					} else {
						var_newValue = el_target.getProperty('html');
					}
				}

				if (str_bindToTranslationViewToModel) {
					/*
					 * a translation function can also be used for a validation. Therefore, the data path
					 * as well as the old value and the bound element are passed as parameters.
					 *
					 * For example, the value could be validated with a validation pattern that depends on the
					 * given data path and if the value is valid, it is returned. But if it is not valid,
					 * the old value could be returned and the bound element could be the target for
					 * some kind of error message output.
					 */
					var_newValue = this.__models[str_bindToModel][str_bindToTranslationViewToModel](
						var_newValue, // new value
						el_toBind, // the bound element

						var_oldValue, // old value (useful if the old value needs to be reset for some reason)

						/*
						 * the data path, also useful if the old value needs to be restored for some reason
						 * or if one callback function is registered for multiple bindings with different
						 * data paths and should behave differently depending on the used data path
						 */
						str_bindToPath
					);
				}

				this.__models[str_bindToModel].writeData(str_bindToPath, var_newValue);

				if (str_bindToCallbackViewToModel) {
					/*
					 * A translation function can be used to trigger external data storage usind some kind
					 * of api/ajax request. If external storage failed, it is possible to reset the old value
					 * using the old value parameter and the data path parameter which both are passed to
					 * the callback function.
					 */
					this.__models[str_bindToModel][str_bindToCallbackViewToModel](
						var_newValue, // new value
						el_toBind, // the bound element
						var_oldValue, // old value (useful if the old value needs to be reset for some reason

						/*
						 * the data path, also useful if the old value needs to be restored for some reason
						 * or if one callback function is registered for multiple bindings with different
						 * data paths and should behave differently depending on the used data path
						 */
						str_bindToPath
					);
				}
			}.bind(this);

		this.obj_registeredDataBindings[str_bindToModel][str_bindToPath].push({
			str_bindToProperty: str_bindToProperty,
			str_bindToTranslation: str_bindToTranslation,
			str_bindToTranslationViewToModel: str_bindToTranslationViewToModel,
			str_bindToCallbackViewToModel: str_bindToCallbackViewToModel,
			el_bound: el_toBind,
			func_bound: func_bound
		});

		if (func_bound !== null) {
			el_toBind.addEvent('change', func_bound);
		}

		/*
		 * Initially set all bound elements to the current value
		 */
		this.__models[str_bindToModel].writeData(str_bindToPath, this.__models[str_bindToModel].readData(str_bindToPath), true, false);

		// console.log('this.obj_registeredDataBindings', this.obj_registeredDataBindings);
	},
	
	registerElements: function(el_toSearchForElementsToRegister, str_registerGroup, bln_registerSingleElementsInElementList, str_elementNameOnly, str_subGroupNameOnly, bln_checkForParentSubGroups ) {
		str_registerGroup = str_registerGroup !== undefined && str_registerGroup ? str_registerGroup : 'defaultElementGroup';
		bln_registerSingleElementsInElementList = bln_registerSingleElementsInElementList !== undefined && bln_registerSingleElementsInElementList ? true : false;
		str_elementNameOnly = str_elementNameOnly !== undefined && str_elementNameOnly ? str_elementNameOnly : null;
		str_subGroupNameOnly = str_subGroupNameOnly !== undefined && str_subGroupNameOnly ? str_subGroupNameOnly : null;
		bln_checkForParentSubGroups = bln_checkForParentSubGroups !== undefined && bln_checkForParentSubGroups ? true : false;

		if (this.__view.__autoElements === undefined || this.__view.__autoElements === null) {
			this.__view.__autoElements = {};
		}
		
		if (this.__view.__autoElements[str_registerGroup] === undefined || this.__view.__autoElements[str_registerGroup] === null) {
			this.__view.__autoElements[str_registerGroup] = {};
		}

		Array.each(el_toSearchForElementsToRegister.getElements('[data-lsjs-element]'), function(el_toRegister) {
			var str_autoElementSubGroupKey = el_toRegister.getProperty('data-lsjs-autoElementSubGroup');

			if (bln_checkForParentSubGroups) {
				if (str_autoElementSubGroupKey === null) {
					var el_subGroupParent = el_toRegister.getParent('[data-lsjs-autoElementSubGroup]');
					if (typeOf(el_subGroupParent) === 'element') {
						str_autoElementSubGroupKey = el_subGroupParent.getProperty('data-lsjs-autoElementSubGroup');
					}
				}
			}

			if (str_subGroupNameOnly !== null && str_autoElementSubGroupKey !== str_subGroupNameOnly) {
				return;
			}

			var str_autoElementName = el_toRegister.getProperty('data-lsjs-element');
			if (str_elementNameOnly !== null && str_autoElementName !== str_elementNameOnly) {
				return;
			}


			if (
					str_autoElementSubGroupKey !== null
				&&	(
							this.__view.__autoElements[str_registerGroup][str_autoElementSubGroupKey] === undefined
						||	this.__view.__autoElements[str_registerGroup][str_autoElementSubGroupKey] === null
					)
			) {
				this.__view.__autoElements[str_registerGroup][str_autoElementSubGroupKey] = {};
			}

			var obj_autoElementsSubGroupPointer =
				str_autoElementSubGroupKey === null
					? this.__view.__autoElements[str_registerGroup]
					: this.__view.__autoElements[str_registerGroup][str_autoElementSubGroupKey];

			var bln_isFirstElement =	typeOf(obj_autoElementsSubGroupPointer[str_autoElementName]) !== 'element'
									&&	typeOf(obj_autoElementsSubGroupPointer[str_autoElementName]) !== 'elements';
			if (
					!bln_registerSingleElementsInElementList
				&&	bln_isFirstElement
			) {
				/*
				 * If single elements should not be stored in element lists and
				 * there is no element registered under the name read out as the
				 * "data-lsjs-element" value, we store the element itself
				 */
				obj_autoElementsSubGroupPointer[str_autoElementName] = el_toRegister;
			} else {				
				/*
				 * If single elements should be stored in element lists or
				 * there's already an element registered, we create an element list,
				 * store the already registered element (if there is one) as the
				 * first array element and add the new element.
				 * 
				 * If we already have an element list, we simply add the new element.
				 */
				if (typeOf(obj_autoElementsSubGroupPointer[str_autoElementName]) !== 'elements') {
					obj_autoElementsSubGroupPointer[str_autoElementName] = bln_registerSingleElementsInElementList && bln_isFirstElement ? new Elements() : new Elements([obj_autoElementsSubGroupPointer[str_autoElementName]]);
				}
				obj_autoElementsSubGroupPointer[str_autoElementName].push(el_toRegister);
			}
		}.bind(this));
	},
	
	triggerDataBinding: function(str_dataPath, bln_triggerDataViewBindings, bln_triggerDataFunctionBindings) {
		this.writeData(str_dataPath, '___TRIGGER_ONLY___', bln_triggerDataViewBindings, bln_triggerDataFunctionBindings);
	},
	
	writeData: function(str_dataPath, var_value, bln_triggerDataViewBindings, bln_triggerDataFunctionBindings) {
		var obj_originalData;
		
		/*
		 * This weird assignment is only used to make sure that an IDE would
		 * not think 'var_value' was unused because that might lead a developer
		 * to the conclusion that the 'var_value' parameter could be removed,
		 * which it can't.
		 */
		var_value = var_value !== undefined ? var_value : undefined;
		
		bln_triggerDataViewBindings = bln_triggerDataViewBindings === undefined || bln_triggerDataViewBindings ? true : false;
		bln_triggerDataFunctionBindings = bln_triggerDataFunctionBindings === undefined || bln_triggerDataFunctionBindings ? true : false;
		
		/*
		 * Even the empty string is allowed as data path, pointing directly
		 * to 'this.data'
		 */
		if (str_dataPath === undefined || !str_dataPath) {
			str_dataPath = '';
		}
		
		/*
		 * If this function is called by a simple call to 'triggerDataBinding',
		 * the only purpose is to fire all data bindings registered for the
		 * data path and no data should actually be changed. Therefore we set the
		 * data to write to the data that is currently stored.
		 */
		if (var_value === '___TRIGGER_ONLY___') {
			var_value = this.readData(str_dataPath);
		}
		
		/*
		 * -> Create a copy of the original data before writing the new value.
		 * We need to pass the original data to the data function bindings so
		 * that resetting the original data is possible if the bound function
		 * needs to do so, e.g. if storing with an external storage engine or
		 * something similar fails.
		 * 
		 * We only create the copy if function bindings will be triggered later
		 * and if there are actually function bindings registered.
		 */
		if (
				bln_triggerDataFunctionBindings
			&&	this.obj_dataFunctionBindings !== undefined
			&&	this.obj_dataFunctionBindings !== null
		) {
			obj_originalData = Object.clone(this.data);
		}
		/*
		 * <-
		 */

		if (var_value === '___DELETE___') {
			eval('delete this.data' + (str_dataPath ? '.' + str_dataPath : ''));
		} else {
			eval('this.data' + (str_dataPath ? '.' + str_dataPath : '') + ' = var_value');
		}
		
		if (bln_triggerDataViewBindings) {
			this.handleDataBinding(str_dataPath);
		}
		
		if (bln_triggerDataFunctionBindings) {
			this.handleDataFunctionBinding(str_dataPath, obj_originalData);
		}
	},
	
	handleDataFunctionBinding: function(str_dataPath, obj_originalData) {
		var arr_matchingDataPaths;
		
		/*
		 * Do nothing if no dataFunctionBindings are registered with the model
		 */
		if (this.obj_dataFunctionBindings === undefined || this.obj_dataFunctionBindings === null) {
			return;
		}
		
		arr_matchingDataPaths = this.lookForMatchingDataBindings(str_dataPath, this.obj_dataFunctionBindings, true);
		
		Array.each(arr_matchingDataPaths, function(str_registeredDataPath) {			
			this[this.obj_dataFunctionBindings[str_registeredDataPath]](
				this.readData(str_registeredDataPath), // the new data that is written to the actual data path
				str_registeredDataPath, // the registered data path, which might be some levels above the actual data path where the data is being written to
				this.readData(str_registeredDataPath, obj_originalData), // the original data that is stored in the actual data path before the new data is being written to it
				str_dataPath // the actual data path where the new data is being written to
			);
		}.bind(this));
	},
	
	handleDataBinding: function(str_dataPath) {
		var arr_matchingDataPaths;
		
		arr_matchingDataPaths = this.lookForMatchingDataBindings(str_dataPath, this.__module.obj_registeredDataBindings[this.name]);

		Array.each(arr_matchingDataPaths, function(str_registeredDataPath) {
			if (
					this.__module.obj_registeredDataBindings[this.name][str_registeredDataPath] === undefined
				||	typeOf(this.__module.obj_registeredDataBindings[this.name][str_registeredDataPath]) !== 'array'
			) {
				/*
				 * Return if the value registered for the dataPath is not actually
				 * an element collection
				 */
				return;
			}
			
			Array.each(this.__module.obj_registeredDataBindings[this.name][str_registeredDataPath], function(obj_binding) {
				var var_valueToSet = this.readData(str_registeredDataPath);
				if (obj_binding.str_bindToTranslation) {
					var_valueToSet = this[obj_binding.str_bindToTranslation](var_valueToSet, obj_binding.el_bound);
				}
				
				/*
				 * Different element types need different ways to set their value
				 */
				if (obj_binding.str_bindToProperty) {
					if (obj_binding.str_bindToProperty !== 'none') {
						obj_binding.el_bound.setProperty(obj_binding.str_bindToProperty, var_valueToSet);
					}
				} else if (
						obj_binding.el_bound.match('select')
					||	obj_binding.el_bound.match('textarea')
					||	(obj_binding.el_bound.match('input') && obj_binding.el_bound.getProperty('type') === 'text')
				) {
					obj_binding.el_bound.setProperty('value', var_valueToSet);
				} else if (
					(obj_binding.el_bound.match('input') && obj_binding.el_bound.getProperty('type') === 'checkbox')
				) {
					if (typeOf(var_valueToSet) === 'boolean') {
						obj_binding.el_bound.setProperty('checked', obj_binding.el_bound.getProperty('value') === 'false' ? !var_valueToSet : var_valueToSet);
					} else {
						if (obj_binding.el_bound.getProperty('value') == var_valueToSet) {
							obj_binding.el_bound.setProperty('checked', true);
						} else {
							obj_binding.el_bound.setProperty('checked', false);
						}
					}
				} else if (
					(obj_binding.el_bound.match('input') && obj_binding.el_bound.getProperty('type') === 'radio')
				) {
					if (obj_binding.el_bound.getProperty('value') == var_valueToSet) {
						obj_binding.el_bound.setProperty('checked', true);
					} else {
						obj_binding.el_bound.setProperty('checked', false);
					}
				} else {
		                    if (typeOf(var_valueToSet) === 'element') {
		                        obj_binding.el_bound.empty();
		                        obj_binding.el_bound.adopt(var_valueToSet);
		                    } else {
		                        obj_binding.el_bound.setProperty('html', var_valueToSet);
		                    }
				}
			}.bind(this));
		}.bind(this));
	},
	
	/*
	 * Multiple registered data bindings can match a dataPath used with writeData().
	 * In fact, all registered dataPaths that begin with the dataPath used with
	 * writeData() match, but there's an exception:
	 * 
	 * obj_test1.obj_test2.str_testValue
	 *		must match obj_test1.obj_test2
	 *		but must NOT match obj_test1.obj_test2.str_test
	 */
	lookForMatchingDataBindings: function(str_dataPath, obj_registeredDataBindings, bln_checkForFunctionBinding) {
		var arr_matchingDataPaths = [];
		
		bln_checkForFunctionBinding = bln_checkForFunctionBinding !== undefined && bln_checkForFunctionBinding !== null && bln_checkForFunctionBinding ? true : false;
		
		if (str_dataPath === undefined || str_dataPath === null) {
			console.error('str_dataPath missing');
		}

		/*
		 * Nothing matches if there are no bindings defined for this model
		 */
		if (obj_registeredDataBindings === undefined || obj_registeredDataBindings === null) {
			return arr_matchingDataPaths;
		}
		
		/*
		 * Convert the data bindings object into a hash to make sure that
		 * iterating over its keys will work, because otherwise in some cases,
		 * it won't.
		 */
		obj_registeredDataBindings = new Hash(obj_registeredDataBindings);
		
		/*
		 * If str_dataPath is empty, all registered data paths match
		 */		
		if (!str_dataPath) {
			arr_matchingDataPaths = Object.keys(obj_registeredDataBindings);
			return arr_matchingDataPaths;
		}
		
		/*
		 * Check for registered data paths that begin with the written data path
		 * including the dot/square bracket or that are completely equal
		 */
		Array.each(Object.keys(obj_registeredDataBindings), function(str_registeredDataPath) {
			if (
					str_registeredDataPath === str_dataPath
				||	str_registeredDataPath.lastIndexOf(str_dataPath + '.', 0) === 0
				||	str_registeredDataPath.lastIndexOf(str_dataPath + '[', 0) === 0

				/*
				 * If we are looking for "data function bindings" instead of
				 * "data view/template bindings", we have to match the data path
				 * whether the written data path is the first part of the registered
				 * data path or it is the other way round. In case of "data view/template
				 * bindings" we only consider it a match if the written data path
				 * represents the beginning of a registered data path.
				 */
				|| (bln_checkForFunctionBinding && str_dataPath.lastIndexOf(str_registeredDataPath + '.', 0) === 0)
				|| (bln_checkForFunctionBinding && str_dataPath.lastIndexOf(str_registeredDataPath + '[', 0) === 0)
			) {
				arr_matchingDataPaths.push(str_registeredDataPath);
			}
		});
		
		return arr_matchingDataPaths;
	},
	
	/*
	 * This function expects a data path and returns the corresonding value from
	 * the model's data. Additionally, it is possible to pass an object that is
	 * used instead of the model's data. This feature is used to access the data
	 * path from a copy of the model's data which is being used if written data
	 * needs to be reset.
	 * 
	 * If used without the optional "obj_dataToUseInstead" parameter, calling this
	 * function is basically equivalent to addressing a model's data-object
	 * directly:
	 * this.__models.abc.readData('obj_test.str_test') === this.__models.abc.data.obj_test.str_test
	 * 
	 */
	readData: function(str_dataPath, obj_dataToUseInstead) {
		var var_value;
		
		obj_dataToUseInstead = obj_dataToUseInstead !== undefined && obj_dataToUseInstead !== null ? obj_dataToUseInstead : null;
		
		/*
		 * Even the empty string is allowed as data path, pointing directly
		 * to 'this.data'
		 */
		if (str_dataPath === undefined || !str_dataPath) {
			str_dataPath = '';
		}

		eval('var_value = ' + (obj_dataToUseInstead !== null ? 'obj_dataToUseInstead' : 'this.data') + (str_dataPath ? '.' + str_dataPath : ''));
		return var_value;
	}
};
var class_lsjs_module = new Class(classdef_lsjs_module);


	Cookie.write = function (key, value, options = {}) {
		if (options.encode !== false) value = encodeURIComponent(value);
		let cookieString = `${key}=${value}`;

		if (options.domain) cookieString += `; domain=${options.domain}`;
		if (options.path) cookieString += `; path=${options.path}`;
		if (options.duration) {
			let date = new Date();
			date.setTime(date.getTime() + options.duration * 24 * 60 * 60 * 1000);
			cookieString += `; expires=${date.toUTCString()}`;
		}
		if (options.secure) cookieString += `; Secure`;
		if (options.httpOnly) cookieString += `; HttpOnly`;
		if (options.sameSite) cookieString += '; SameSite=' + options.sameSite;

		document.cookie = cookieString;
	};


if (window.lsjs === undefined || window.lsjs === null) {
	window.lsjs = new class_lsjs();

	window.addEvent('domready', function() {
		$$('body')[0].addClass('lsjs-active');
	});
} else {
	console.error('lsjs core already loaded!');
}
})();
