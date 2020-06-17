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
            		if (!self.__models.options.data.bln_useTouchBehaviourOnNonTouchDevices && !self.el_body.hasClass('user-is-touching')) {
            			// console.log('nobdy touched me :-(');
            			return;
					}

					if (!self.__models.options.data.bln_followLinkOnSecondTouch || !this.hasClass(self.__models.options.data.str_classToSetForTouchedElements)) {
                        event.preventDefault();
					}

					self.handleSubmenuHeightToEnableSmoothTransition(this);

            		if (!this.hasClass(self.__models.options.data.str_classToSetForTouchedElements)) {
						/*
						 * Remove the touched class on all other touchable hyperlinks to make sure it can never
						 * be set on two elements.
						 */
						this.getParent('ul').getElements('.' + self.__models.options.data.str_classToSetForTouchedElements).removeClass(self.__models.options.data.str_classToSetForTouchedElements);

						this.addClass(self.__models.options.data.str_classToSetForTouchedElements);
						this.getParent().addClass(self.__models.options.data.str_classToSetForTouchedElements);
					} else {
						this.removeClass(self.__models.options.data.str_classToSetForTouchedElements);
						this.getParent().removeClass(self.__models.options.data.str_classToSetForTouchedElements);
					}
				}
			)
		},

		handleSubmenuHeightToEnableSmoothTransition: function(el_clickedElement) {
			var el_relatedSubmenu = el_clickedElement.getParent().getElement('ul');

			if (typeOf(el_relatedSubmenu) !== 'element') {
				return;
			}

			var bln_currentlyCollapsed = el_relatedSubmenu.getStyle('height') === '0px';
			var float_targetHeight = el_relatedSubmenu.scrollHeight;

			var func_removeHeight = function() {
				this.style.height = 'auto';
				console.log('here');
				this.removeEventListener('transitionend', this.retrieve('func_removeHeight'));
			};


			if (bln_currentlyCollapsed) {
				el_relatedSubmenu.store(
					'func_removeHeight',
					func_removeHeight
				);

				el_relatedSubmenu.addEventListener(
					'transitionend',
					el_relatedSubmenu.retrieve('func_removeHeight')
				);
				el_relatedSubmenu.setStyle('height', float_targetHeight + 'px');
			} else {
				el_relatedSubmenu.removeEventListener('transitionend', el_relatedSubmenu.retrieve('func_removeHeight'));
				el_relatedSubmenu.setStyle('height', float_targetHeight + 'px');
				window.setTimeout(
					function() {
						el_relatedSubmenu.setStyle('height', 0);
					},
					50
				)
			}
		}
	};

	lsjs.addViewClass(str_moduleName, obj_classdef);

})();