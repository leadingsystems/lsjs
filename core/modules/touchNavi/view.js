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

			this.__el_container =
				(
					typeOf(this.__models.options.data.var_naviSelector) === 'element'
					||	typeOf(this.__models.options.data.var_naviSelector) === 'null'
				)
					?	this.__models.options.data.var_naviSelector
					:	$$(this.__models.options.data.var_naviSelector)[0];

			if (typeOf(this.__el_container) !== 'element') {
				console.log(str_moduleName + ': No navigation found with selector "this.__models.options.data.var_naviSelector"')
				return;
			}

			this.__el_container.addClass('useTouchNavi');

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
		}
	};

	lsjs.addViewClass(str_moduleName, obj_classdef);

})();