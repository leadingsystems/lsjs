var obj_classdef_model = {
	name: 'options',
	
	data: {},
	
	start: function() {
		/*
		 * Initializing the options in the data object with default values which
		 * can later be overwritten when the "set" method is called with other options
		 */
		this.data = {
			el_domReference: null,
			contentSelector: '.lsSlides',
			containerClass: '',
			slideboxSize: {
				x: 200, // if you want to use a percentage value, please declare it as a string (e.g. '100%')
				y: 200
			},
			duration: 800, // duration of the sliding effect in ms
			transition: 'sine:in:out', // any string that defines a transition type in the mootools way (see http://mootools.net/docs/core/Fx/Fx.Transitions#Fx-Transitions:sine)

			/*
			 * If multiple elements should be positioned horizontally next to each other (horizontal slides) but the number of elements is variable,
			 * the surrounding element can be set to a width calculated based on the number of elements counted on the basis of a given selector.
			 * Without this autoSize functionality the only way to perform a horizontal slide with an unknown number of contained elements would be
			 * to set the surrounding container to a much too big width but this would cause the lsSlides to slide into a whole lot of empty space.
			 * 
			 * In the vertical direction it is easy to work with an unknown number of elements because they will automatically be positioned right
			 * below each other using a simple css floating technique or even without any special css because of the standard text flow. However,
			 * in order to create a flexible and consistent autoSize functionality it is even possible to autoSize the height of the surrounding element.
			 */
			autoSize: {
				targetSelector: '', // The selector for the element which should be autosized. The selector will only be searched inside the element found using the contentSelector. If set to an empty string, the element found using the contentSelector will be resized itself.
				countingElementSelector: '', // The selector for the elements which should be counted (only counted inside the element found using the contentSelector)
				sizePerElement: {
					x: 0, // The width that should be added for each counted element. If set to 0, the width will not be calculated and not set.
					y: 0 // The height that should be added for each counted element. If set to 0, the height will not be calculated and not set.
				},
				sizeOffset: {
					x: 0, // A horizontal offset. This can be useful for example if all counted elements have a right margin except for the last one. In this case the width including the right margin will be added for each element but the missing right margin of the last element needs to be subtracted. A negative offset can provide this.
					y: 0 // A vertical offset. See description of the horizontal offset
				}
			},
			blnUseVariableSlideDistance: false, // Set this parameter to true if your slideboxSize is set as a percentage and you want the slide distance to be adjusted dynamically if the actual slidebox size changes
			slideDistanceOffset: {
				x: 0, // A horizontal offset. By default lsSlides slides the width of the slidebox but this distance can be adjusted with this offset.
				y: 0 // A vertical offset. See description of the horizontal offset			
			},
			blnUpdateMovingPossibilityClassesOnWindowResize: false // Set this parameter to true if you want the moving possibility classes of the buttons to be updated if the window resizes. This way, if the slidebox size changes because the user resized the window, the sliding buttons will appear as needed. 
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};