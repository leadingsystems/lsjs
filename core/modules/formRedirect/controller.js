(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
		lsjs[str_moduleName] = this.__module;
	},
	
	/*
	 * This function redirects to a url sending data (normally as post data)
	 * with a dynamically created form.
	 * 
	 * As a first parameter it takes an object holding the data to send.
	 * The property names are used as field names in the form and the
	 * property values as field values.
	 * 
	 * As a second parameter it takes the url to redirect to or an empty string
	 * which would result in reloading the current page sending post data
	 * 
	 * As a third parameter it takes a string defining the method used when sending
	 * the form. It defaults to 'post'.
	 */
	send: function(obj_valuesToSend, str_targetUrl, str_method) {
		var	el_form,
			els_inputs;
		
		obj_valuesToSend = obj_valuesToSend !== undefined ? obj_valuesToSend : {};
		str_targetUrl = str_targetUrl !== undefined ? str_targetUrl : '';
		str_method = str_method !== undefined ? str_method : 'post';
		
		console.log('post redirect sending...');
		
		el_form = new Element('form')
		.setProperties({
			'method': str_method,
			'action': str_targetUrl
		})
		.setStyles({
			'position': 'absolute',
			'top': '-5000px',
			'left': '-5000px'
		});
		
		els_inputs = new Elements();
		
		Object.each(obj_valuesToSend, function(str_fieldValue, str_fieldName) {
			els_inputs.push(
				new Element('input').setProperties({
					'type': 'hidden',
					'name': str_fieldName,
					'value': str_fieldValue
				})
			);
		});
		
		$$('body')[0].adopt(
			el_form.adopt(els_inputs)
		);
		
		el_form.submit();
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.createModule({
	__name: str_moduleName
});

})();