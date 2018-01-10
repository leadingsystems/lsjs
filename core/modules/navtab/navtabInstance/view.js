/**
 * This class creates a tab navigation/slideshow from a simple html construction.
 * 
 * Example:
		<div data-lsjs-component="navtab">
			<div data-lsjs-element="navtabLabelContainer">
				<div data-lsjs-element="navtabLabel" class="start">TAB 01</div>
				<div data-lsjs-element="navtabLabel" >TAB 02</div>
				<div data-lsjs-element="navtabLabel" >TAB 03</div>
			</div>
			<div data-lsjs-element="navtabContentContainer">
				<div data-lsjs-element="navtabContent" class="noJsDefault">CONTENT TAB 01</div>
				<div data-lsjs-element="navtabContent" >CONTENT TAB 02</div>
				<div data-lsjs-element="navtabContent" >CONTENT TAB 03</div>
			</div>
			<div data-lsjs-element="navtabNavigation" class="navigation">
				<div data-lsjs-element="btn_prev" class="prev">PREV</div>
				<div data-lsjs-element="btn_next" class="next">NEXT</div>
				<div data-lsjs-element="btn_play" class="play">PLAY</div>
				<div data-lsjs-element="btn_stop" class="stop">STOP</div>
			</div>
		</div>

 * FIXME: Add more detailed description
 */

(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		this.registerElements(this.__el_container, 'main', true);
		
//		console.log(this.__module.__parentModule.__models.options.data);
// 		console.log(this.__autoElements);
		
		if (this.__autoElements.main.navtabContent.length !== this.__autoElements.main.navtabLabel.length) {
			console.error('number of label elements does not match the number of content elements');
			return;
		}
		
		this.__models.status.set_autoplayStatus(this.__module.__parentModule.__models.options.data.defaultAutoplayStatus);
		
		this.showHiddenElements();
		this.addNavigationEvents();
		this.prepareContentElements();
		this.prepareLabelElements();
		this.__controller.activateStartLabel();
	},
	
	prepareLabelElements: function() {
		/*
		 * Get the corresponding content div for each label div
		 * and add the click event to each label div
		 */
		Array.each(this.__autoElements.main.navtabLabel, function(el_label, key) {
			el_label.store('tabKey', key);
			
			var el_correspondingContent = this.__autoElements.main.navtabContent[key];
			
			el_label.activate = function() {
				window.clearTimeout(this.__models.status.data.int_currentTimeout);
				
				if (this.__models.status.data.autoplayStatus) {
					this.__models.status.set_currentTimeout(
						window.setTimeout(
							function() {
								this.__controller.gotoNext();
							}.bind(this),
							this.__module.__parentModule.__models.options.data.autoplayDelay
						)
					);
				}

				// do nothing more if the label is already active
				if (el_label.hasClass('active')) {
					return;
				}
				
				/*
				 * Remove 'active' classes from all labels and set it for the
				 * currently clicked label
				 */
				this.__autoElements.main.navtabLabel.removeClass('active');
				el_label.addClass('active');
				
				// store the tabKey of the currently clicked label
				this.__models.status.set_currentTabKey(el_label.retrieve('tabKey'));
				
				/*
				 * Walk through all contents and remove the 'active' class wherever it is present and
				 * call the content's tweenOut function
				 */
				Array.each(this.__autoElements.main.navtabContent, function(el_content) {
					if (el_content.hasClass('active')) {
						el_content.removeClass('active');
						el_content.tweenOut();
					}
				});
				
				/*
				 * add the 'active' class for the content corresponding with the currently clicked label
				 * and call the content's tweenIn function
				 */
				el_correspondingContent.addClass('active');
				
				if (!this.__models.status.data.bln_firstElementHasBeenActivated) {
					this.__models.status.set_bln_firstElementHasBeenActivated(true);
					el_correspondingContent.removeClass(this.__module.__parentModule.__models.options.data.cssClassForHide);
					el_correspondingContent.addClass(this.__module.__parentModule.__models.options.data.cssClassForShow);
				} else {
					el_correspondingContent.tweenIn();
				}
			}.bind(this);
			
			el_label.addEvent('click', function() {
				this.__controller.stopAutoplay();
				el_label.activate();
			}.bind(this));
		}.bind(this));	
	},
	
	prepareContentElements: function() {
		this.__autoElements.main.navtabContent.addClass(this.__module.__parentModule.__models.options.data.cssClassForHide);
		
		/*
		 * Store the tween effect for each content div and create the tweenIn and tweenOut functions
		 */
		Array.each(this.__autoElements.main.navtabContent, function(el_content) {
			var obj_tweenInOptions,
				obj_tweenOutOptions;
				
			el_content.store('obj_originalPositionValues', {
				'position': el_content.getStyle('position'),
				'top': el_content.getStyle('top'),
				'z-index': el_content.getStyle('z-index')
			});
			
			el_content.store('cssClassForShow', this.__module.__parentModule.__models.options.data.cssClassForShow);
			el_content.store('cssClassForHide', this.__module.__parentModule.__models.options.data.cssClassForHide);
			
			/*
			 * add the onComplete function for the tweenIn because if the tweenIn transition
			 * is finished, the content div's position properties need to be set to the
			 * original values
			 */
			obj_tweenInOptions = this.__module.__parentModule.__models.options.data.tweenInOptions;

			obj_tweenInOptions.onComplete = function() {
				el_content.setStyles(el_content.retrieve('obj_originalPositionValues'));
			};

			el_content.store('fxTweenIn', new Fx.Morph(
				el_content,
				obj_tweenInOptions
			));
			
			
			/*
			 * add the onComplete function for the tweenOut because if the tweenOut transition
			 * is finished, the content div's display property needs to be set to 'none'
			 */
			obj_tweenOutOptions = this.__module.__parentModule.__models.options.data.tweenOutOptions;
			
			obj_tweenOutOptions.onComplete = function() {
				el_content.setStyle('display', 'none');
			};
			
			el_content.store('fxTweenOut', new Fx.Morph(
				el_content,
				obj_tweenOutOptions
			));
			
			el_content.tweenIn = this.tweenIn;
			el_content.tweenOut = this.tweenOut;
			
			el_content.addEvent('mouseenter', function() {
				if (this.__module.__parentModule.__models.options.data.stopAutoplayOnMouseenter) {
					if (this.__models.status.data.autoplayStatus) {
						this.__models.status.set_stoppedOnMouseenter(true);
						this.__controller.stopAutoplay();
					}
				}
			}.bind(this));
			
			el_content.addEvent('mouseleave', function() {
				if (this.__module.__parentModule.__models.options.data.startAutoplayOnMouseleave) {
					if (this.__models.status.data.stoppedOnMouseenter) {
						this.__models.status.set_stoppedOnMouseenter(false);
						this.__controller.startAutoplay();
					}
				}
			}.bind(this));
		}.bind(this));
	},
	
	addNavigationEvents: function() {
		if (this.__autoElements.main.btn_prev) {
			this.__autoElements.main.btn_prev.addEvent('click', this.__controller.gotoPrev.bind(this.__controller));
		}
		if (this.__autoElements.main.btn_next) {
			this.__autoElements.main.btn_next.addEvent('click', this.__controller.gotoNext.bind(this.__controller, true));
		}
		if (this.__autoElements.main.btn_play) {
			this.__autoElements.main.btn_play.addEvent('click', this.__controller.startAutoplay.bind(this.__controller));
			if (this.__module.__parentModule.__models.options.data.defaultAutoplayStatus) {
				this.__autoElements.main.btn_play.addClass('active');
			}
		}
		if (this.__autoElements.main.btn_stop) {
			this.__autoElements.main.btn_stop.addEvent('click', this.__controller.stopAutoplay.bind(this.__controller));
			if (!this.__module.__parentModule.__models.options.data.defaultAutoplayStatus) {
				this.__autoElements.main.btn_stop.addClass('active');
			}
		}
	},
	
	/*
	 * Show elements that are hidden by default because they must not be
	 * displayed without js.
	 */
	showHiddenElements: function() {
		if (this.__autoElements.main.navtabNavigation) {
			this.__autoElements.main.navtabNavigation.addClass('visible');
		}
		
		if (this.__autoElements.main.navtabLabelContainer) {
			this.__autoElements.main.navtabLabelContainer.addClass('visible');
		}
	},
	
	tweenIn: function() {
		// first, make the content visible
		this.setStyles({
			'display': 'block'
		});
		
		/*
		 * Set the absolute position if the element originally wasn't positioned
		 * absolutely. This is necessary because the elements morphing in and out
		 * should overlay each other.
		 */
		if (this.retrieve('obj_originalPositionValues').position !== 'absolute') {
			this.setStyles({
				'position': 'absolute',
				'top': '0'
			});			
		}
		
		this.setStyles({
			'z-index': '1000'
		});
		
		/*
		 * If a tweenOut transition is already/still running, cancel it because
		 * otherwise its onComplete function will be called in the end and hide
		 * the content that should be visible
		 */
		if (this.retrieve('fxTweenOut').isRunning()) {
			this.retrieve('fxTweenOut').cancel();
		}
		
		/*
		 * Start the transition that has been stored in the content element
		 */
		this.retrieve('fxTweenIn').start('.' + this.retrieve('cssClassForShow'));
	},
	
	tweenOut: function() {
		/*
		 * Start the transition that has been stored in the content element
		 */
		this.retrieve('fxTweenOut').start('.' + this.retrieve('cssClassForHide'));
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();