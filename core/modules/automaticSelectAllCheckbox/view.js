(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		this.addSelectAllCheckboxes();
	},
	
	addSelectAllCheckboxes: function() {
		var	self = this,
			els_checkboxGroup,
			int_checkboxGroupCounter = 0;
		
		els_checkboxGroup = $$(this.__models.options.data.str_selector);
		
		Array.each(els_checkboxGroup, function(el_checkboxGroup) {
			if (el_checkboxGroup.hasClass(this.__models.options.data.str_appliedClass)) {
				return;
			}
			
			var el_selectAll = this.tplPure({
				name: 'main',
				parent: el_checkboxGroup,
				arg: {
					str_selectAllCheckboxId: 'selectAllCheckbox_' + int_checkboxGroupCounter
				}
			});
			
			el_checkboxGroup.addClass(this.__models.options.data.str_appliedClass);
			el_selectAll.inject(el_checkboxGroup, 'top');
			
			el_selectAll.getElement('input').addEvent('change', function() {
				Array.each(this.getParent(self.__models.options.data.str_selector).getElements('input[type="checkbox"]'), function(el_checkbox) {
					el_checkbox.setProperty('checked', this.getProperty('checked'));
				}.bind(this));
			});
			
			int_checkboxGroupCounter++;
		}.bind(this));		
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();