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
			str_ocContainerSelector: '', // This selector must only match exactly one element
			str_ocTogglerSelector: '', // This selector may match multiple elements

			/*
			 * Each instance of this module must have a unique instance name to make sure that classes
			 * that will be applied to wrapper elements (e.g. the body) are really specific because it is
			 * important for stylesheets to know which of possibly multiple ocFlex elements is currently
			 * being open or closed or running
			 */
			str_uniqueInstanceName: '',
			str_classToSetWhenModuleApplied: 'ocFlexApplied',

			/*
			 * The class that the body has if the header is sticky.
			 * In order to prevent scrolling the body when the oc overlay is displayed, we set the
			 * body's overflow to hidden which leads to the body losing its scroll position and the
			 * stickyHeader module would then remove the sticky class. When the oc overlay is being
			 * closed, the body's overflow is reset to scroll and its scroll position is restored.
			 * Now, the stickyHeader module would add the sticky class to the body again.
			 * This causes a problem: If there's a header animation/transition which e.g. shrinks
			 * the header, this animation/transition will run every time the oc overlay is being closed.
			 * To prevent that, the ocFlex module checks whether the header is sticky by checking
			 * the body class which indicates this state and makes sure that the body keeps its sticky
			 * class even if its scroll position is 0 during the time the oc overlay is open.
			 * Since the stickyHeader module allows for the body's sticky class to be customized,
			 * the ocFlex module must allow that too.
			 */
			str_stickyBodyClass: 'sticky',

			/*
             * Since we don't know the overlay's animation duration (it is defined completely
             * in the stylesheet) and therefore don't know when the body's overflow is being set
             * to "hidden", we don't know when we can safely restore the sticky class. As a default
             * we assume that 1000 ms would be appropriate but this option makes it customizable
             * in case the default delay doesn't fit.
             */
			int_stickyBodyClassRestorationDelay: 1000
		};
	},
	
	set: function(obj_options) {
		Object.merge(this.data, obj_options);
		this.__module.onModelLoaded();
	}
};