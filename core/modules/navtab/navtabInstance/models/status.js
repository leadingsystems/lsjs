var obj_classdef_model = {
	name: 'status',
	
	data: {
		autoplayStatus: false,
		stoppedOnMouseenter: false,
		int_currentTimeout: null,
		currentTabKey: 0,
		bln_firstElementHasBeenActivated: false
	},
	
	start: function() {
		this.__module.onModelLoaded();
	},
	
	set_autoplayStatus: function(bln_status) {
		bln_status = bln_status !== undefined ? bln_status : false;
		this.writeData('autoplayStatus', bln_status);
	},
	
	set_stoppedOnMouseenter: function(bln_status) {
		bln_status = bln_status !== undefined ? bln_status : false;
		this.writeData('stoppedOnMouseenter', bln_status);
	},
	
	set_bln_firstElementHasBeenActivated: function(bln_firstElementHasBeenActivated) {
		bln_firstElementHasBeenActivated = bln_firstElementHasBeenActivated !== undefined ? bln_firstElementHasBeenActivated : false;
		this.writeData('bln_firstElementHasBeenActivated', bln_firstElementHasBeenActivated);
	},
	
	set_currentTabKey: function(currentTabKey) {
		this.writeData('currentTabKey', currentTabKey);
	},
	
	set_currentTimeout: function(int_timeout) {
		int_timeout = int_timeout ? int_timeout : null;
		this.writeData('int_currentTimeout', int_timeout);
	}
};