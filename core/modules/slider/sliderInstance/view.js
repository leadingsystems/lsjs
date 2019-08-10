(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_container: null,
	el_slidingArea: null,
	els_items: null,

	float_completeWidthOfAllItems: 0,

	start: function() {
        this.el_container = this.__el_container;
        this.el_container.setStyle('overflow', 'hidden');
        this.els_items = this.el_container.getElements('> *');

		this.initializeElements();

        window.addEvent(
        	'resize',
			this.reinitializeSlider.bind(this)
		);
	},

	initializeElements: function() {
        /*
         * In order to allow the web designer to style items with a width relative to the original parent element
         * (i.e. before inserting the sliding area element that the web designer doesn't know anything about)
         * we have to set the calculated width as a fixed width and we have to do it before we insert the sliding area.
         */
        this.setItemsToFixedWidth();

        this.el_slidingArea = new Element('div.slidingArea');
        this.el_slidingArea.inject(this.el_container);
        this.el_slidingArea.adopt(this.els_items);

        this.float_completeWidthOfAllItems = this.getCompleteWidthOfAllItems();

        this.setSlidingAreaSize();
	},

	reinitializeSlider: function() {
		this.el_slidingArea.destroy();
		this.unsetItemsFixedWidth();
		this.el_container.adopt(this.els_items);

		this.initializeElements();
	},

	setItemsToFixedWidth: function() {
		Array.each(
			this.els_items,
			function(el_item) {
				el_item.measure(
					function() {
						var obj_computedSize = this.getComputedSize({
							styles: ['margin']
						});

						this.store('float_completeWidthIncludingMargins', this.offsetWidth + obj_computedSize['margin-left'] + obj_computedSize['margin-right']);
						this.setStyle('width', this.getComputedSize().width)
                    }
				);
			}
		);
	},

	unsetItemsFixedWidth: function() {
        Array.each(
            this.els_items,
            function(el_item) {
                el_item.removeProperty('style');
            }
        );
	},
	
	setSlidingAreaSize: function() {
		this.el_slidingArea.setStyles({
			'width': this.float_completeWidthOfAllItems + 'px'
		})
	},

	getCompleteWidthOfAllItems: function() {
		var float_completeWidth = 0;
		Array.each(
			this.els_items,
			function(el_item) {
				float_completeWidth += el_item.retrieve('float_completeWidthIncludingMargins');
			}.bind(this)
		);
		return float_completeWidth;
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();