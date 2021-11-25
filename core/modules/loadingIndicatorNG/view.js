(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	bln_debug: false,
	int_showHideDelayMs: 50,
	str_standardReference: 'standard',
	str_standardMessage: 'Loading',
	
	start: function() {
	},

	add: function(obj_params) {
		obj_params = typeof obj_params === 'object' ? obj_params : {};
		obj_params.bln_addOnly = true;
		this.show(obj_params);
	},

	show: function(obj_params) {
		obj_params = typeof obj_params === 'object' ? obj_params : {};

		if (this.bln_debug) {
			console.info('======> Debugging ' + str_moduleName + ' / show() ======>');
			console.info('Given parameters',obj_params);
		}

		var el_target = typeOf(obj_params.var_target) === 'element' ? obj_params.var_target : (obj_params.var_target ? $$(obj_params.var_target)[0] : null);
		var str_reference = typeof obj_params.str_reference === 'undefined' || !obj_params.str_reference ? this.str_standardReference : obj_params.str_reference;
		var bln_addOnly = typeof obj_params.bln_addOnly === 'undefined' ? false : !!obj_params.bln_addOnly;
		var bln_addToBodyIfTargetDoesNotExist = typeof obj_params.bln_addToBodyIfTargetDoesNotExist === 'undefined' ? false : !!obj_params.bln_addToBodyIfTargetDoesNotExist;
		var str_message = typeof obj_params.str_message === 'undefined' ? this.str_standardMessage : obj_params.str_message;

		if (this.bln_debug && str_reference === this.str_standardReference) {
			console.info('using default reference "' + this.str_standardReference + '"');
		}

		var el_loadingIndicator = $$('[data-lsjs-loadingindicator-reference="' + str_reference + '"]')[0];

		if (typeOf(el_loadingIndicator) !== 'element') {
			if (str_reference === this.str_standardReference) {
				if (this.bln_debug) {
					console.warn('Since the standard reference (' + this.str_standardReference + ') is used, the target element is always body. If another target element is specified, it will be ignored.');
				}
				el_target = $$('body')[0];
			} else if (typeOf(el_target) !== 'element') {
				if (bln_addToBodyIfTargetDoesNotExist) {
					if (this.bln_debug) {
						console.warn('The given target element (' + obj_params.var_target + ') is not a dom element. The loading indicator element was placed in body because the "bln_addToBodyIfTargetDoesNotExist" option was used.');
					}
					el_target = $$('body')[0];
				} else {
					if (this.bln_debug) {
						console.warn('The given target element (' + obj_params.var_target + ') is not a dom element. The loading indicator element was NOT PLACED anywhere because the "bln_addToBodyIfTargetDoesNotExist" option was not used.');
						console.info('<======');
					}
					return;
				}
			}

			el_loadingIndicator = this.tplAdd({
				name: 'standard',
				parent: el_target,
				bln_discardContainerElement: true,
				arg: {
					str_reference: str_reference,
					str_message: str_message
				}
			});

			if (this.bln_debug) {
				console.info('Added loading indicator to the target element', el_target);
			}
		} else {
			if (this.bln_debug) {
				console.info('A loading indicator element with this reference (' + str_reference + ') already exists. Therefore, if a target element is specified, it will be ignored.');
			}
		}

		el_loadingIndicator.getElement('.ling-message').setProperty('html', str_message);

		if (!bln_addOnly) {
			/*
			 * We need a short delay to make sure that the browser interprets the styling to hide the loading indicator
			 * before it is made visible because otherwise the css transition would not work.
			 */
			window.setTimeout(
				function() {
					el_loadingIndicator.setProperty('data-lsjs-loadingindicator-num-calls', parseInt(el_loadingIndicator.getProperty('data-lsjs-loadingindicator-num-calls')) + 1);
				},
				this.int_showHideDelayMs
			);
		} else {
			if (this.bln_debug) {
				console.info('Only adding element to dom.');
			}
		}

		if (this.bln_debug) {
			console.info('loading indicator element: ', typeOf(el_loadingIndicator) === 'elements' ? el_loadingIndicator[0] : el_loadingIndicator);
			console.info('<======');
		}
	},
	
	hide: function(obj_params) {
		obj_params = typeof obj_params === 'object' ? obj_params : {};

		if (this.bln_debug) {
			console.info('======> Debugging ' + str_moduleName + ' / hide() ======>');
			console.info('Given parameters',obj_params);
		}

		var str_reference = typeof obj_params.str_reference === 'undefined' || !obj_params.str_reference ? this.str_standardReference : obj_params.str_reference;
		var bln_force = typeof obj_params.bln_force === 'undefined' ? false : !!obj_params.bln_force;
		var el_loadingIndicator = $$('[data-lsjs-loadingindicator-reference="' + str_reference + '"]')[0];

		if (typeOf(el_loadingIndicator) !== 'element') {
			if (this.bln_debug) {
				console.info('loading indicator element not found by reference (' + str_reference + ').');
				console.info('<======');
			}

			return;
		}

		var int_newNumCalls = bln_force ? 0 : (parseInt(el_loadingIndicator.getProperty('data-lsjs-loadingindicator-num-calls')) - 1);

		if (int_newNumCalls < 0) {
			int_newNumCalls = 0;
		}

		/*
		 * Since we have a delay when showing the loading indicator, we need one as well when hiding it. Otherwise
		 * the loading indicator wouldn't be hidden at all if the hide() function was called before the delay in the
		 * show() function has passed.
		 */
		window.setTimeout(
			function() {
				el_loadingIndicator.setProperty('data-lsjs-loadingindicator-num-calls', int_newNumCalls);
			},
			this.int_showHideDelayMs
		);

		if (this.bln_debug) {
			console.info('<======');
		}
	},

	debug: function() {
		if (!this.bln_debug) {
			this.bln_debug = true;
			console.info(str_moduleName + ': start debugging');
		} else {
			this.bln_debug = false;
			console.info(str_moduleName + ': stop debugging');
		}
	}

};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();