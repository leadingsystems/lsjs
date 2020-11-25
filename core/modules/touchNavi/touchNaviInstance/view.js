(function() {

// ### ENTER MODULE NAME HERE ######
	var str_moduleName = '__moduleName__';
// #################################

	var obj_classdef = 	{
		els_touchableHyperlinks: null,
		el_body: null,

		start: function() {
			var self = this;

			this.el_body = $$('body')[0];

			if (this.__models.options.data.bln_useTouchBehaviourOnNonTouchDevices) {
                this.__el_container.addClass('useTouchNaviOnNonTouchDevices');
            }

			this.els_touchableHyperlinks = this.__el_container.getElements(this.__models.options.data.var_touchableHyperlinkSelector);

			if (typeOf(this.els_touchableHyperlinks) !== 'elements') {
				/*
				 * Do nothing if there are no touchable hyperlinks
				 */
				return;
			}

            this.els_touchableHyperlinks.addEvent(
            	'click',
				function(event) {
            		var els_toRemoveTouch;

            		if (!self.__models.options.data.bln_useTouchBehaviourOnNonTouchDevices && !self.el_body.hasClass('user-is-touching')) {
            			// console.log('nobody touched me :-(');
            			return;
					}

					if (!self.__models.options.data.bln_followLinkOnSecondTouch || !this.hasClass(self.__models.options.data.str_classToSetForTouchedElements)) {
                        event.preventDefault();
					}

            		if (!this.hasClass(self.__models.options.data.str_classToSetForTouchedElements)) {
						/*
						 * Remove the touched class on all other touchable hyperlinks (parallel in DOM) to make sure it
						 * can never be set on two elements.
						 */
						els_toRemoveTouch = this.getParent('ul').getElements('.' + self.__models.options.data.str_classToSetForTouchedElements);
						Array.each(
							els_toRemoveTouch,
							function(el_toRemoveTouch) {
								if (Object.contains(self.els_touchableHyperlinks, el_toRemoveTouch)) {
									/*
									 * Only execute callback function if the element about to remove touch is one
									 * of the touchable hyperlinks and not e. g. a parent element
									 */
									self.callbackBeforeRemovingTouch(el_toRemoveTouch);
								}
							}
						);

						els_toRemoveTouch.removeClass(self.__models.options.data.str_classToSetForTouchedElements);

						self.callbackBeforeAddingTouch(this);
						this.addClass(self.__models.options.data.str_classToSetForTouchedElements);
						this.getParent().addClass(self.__models.options.data.str_classToSetForTouchedElements);
					} else {
						/*
						 * Remove the touched class on all other touchable hyperlinks (touched element and children in DOM)
						 */
						els_toRemoveTouch = this.getParent().getElements('.' + self.__models.options.data.str_classToSetForTouchedElements);
						Array.each(
							els_toRemoveTouch,
							function(el_toRemoveTouch) {
								if (Object.contains(self.els_touchableHyperlinks, el_toRemoveTouch)) {
									/*
									 * Only execute callback function if the element about to remove touch is one
									 * of the touchable hyperlinks and not e. g. a parent element
									 */
									self.callbackBeforeRemovingTouch(el_toRemoveTouch);
								}
							}
						);

						els_toRemoveTouch.removeClass(self.__models.options.data.str_classToSetForTouchedElements);

						this.getParent().removeClass(self.__models.options.data.str_classToSetForTouchedElements);
					}
				}
			)
		},

		callbackBeforeAddingTouch: function(el_aboutToAddTouch) {
			console.log('about to add touch on');
			console.log(el_aboutToAddTouch);

			this.handleSubmenuHeightToEnableSmoothTransition(el_aboutToAddTouch, false);
		},

		callbackBeforeRemovingTouch: function(el_aboutToRemoveTouch) {
			console.log('about to remove touch on');
			console.log(el_aboutToRemoveTouch);
			this.handleSubmenuHeightToEnableSmoothTransition(el_aboutToRemoveTouch, true);
		},

		handleSubmenuHeightToEnableSmoothTransition: function(el_touchedElement, bln_removingTouch) {
			var el_relatedSubmenu = el_touchedElement.getParent().getElement('ul');

			if (typeOf(el_relatedSubmenu) !== 'element') {
				return;
			}

			/* -->
			 * Here we assume that we can identify a "toggler element" by its toggler icon which is expected to be an
			 * "after" pseudo element. Of course, this is not a very clean approach but it's okay for a proof of concept
			 * which it still is.
			 */
			var str_cssContent = window.getComputedStyle(el_touchedElement, '::after').content;
			if (str_cssContent === undefined || str_cssContent === null || !str_cssContent || str_cssContent === 'none') {
				 return;
			}
			/*
			 * <--
			 */

			var float_openSubmenuHeight = el_relatedSubmenu.scrollHeight;

			var func_removeExplicitHeight = function() {
				this.style.removeProperty('height');
				this.removeEventListener('transitionend', this.retrieve('func_removeExplicitHeight'));
			};

			el_relatedSubmenu.store('func_removeExplicitHeight', func_removeExplicitHeight);
			el_relatedSubmenu.addEventListener('transitionend', el_relatedSubmenu.retrieve('func_removeExplicitHeight'));
			el_relatedSubmenu.setStyle('height', float_openSubmenuHeight + 'px');

			if (bln_removingTouch) {
				window.setTimeout(
					function() {
						el_relatedSubmenu.setStyle('height', 0);
					},
					50
				);
			}
		}
	};

	lsjs.addViewClass(str_moduleName, obj_classdef);

})();