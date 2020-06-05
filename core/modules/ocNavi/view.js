(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_toggler: null,
    el_togglerContainer: null,
	el_navi: null,
	el_body: null,
	el_content: null,
	
	start: function() {
		this.el_body = $$('body')[0];

		this.el_navi = $$(this.__models.options.data.str_naviSelector)[0];
		if (typeOf(this.el_navi) !== 'element') {
			this.el_navi = new Element('div' + this.__models.options.data.str_naviSelector);
			this.el_navi.inject(this.el_body, 'top');
		}

		if (this.__models.options.data.str_togglerContainerSelector !== undefined && this.__models.options.data.str_togglerContainerSelector) {
            this.el_togglerContainer = $$(this.__models.options.data.str_togglerContainerSelector)[0];
            if (typeOf(this.el_togglerContainer) !== 'element') {
                this.el_togglerContainer = new Element('div' + this.__models.options.data.str_togglerContainerSelector);
                this.el_togglerContainer.inject(this.el_body, 'top');
            }
        }

		this.el_toggler = $$(this.__models.options.data.str_togglerSelector)[0];
		if (typeOf(this.el_toggler) !== 'element') {
			this.el_toggler = new Element('div' + this.__models.options.data.str_togglerSelector);
			this.el_toggler.inject(typeOf(this.el_togglerContainer) === 'element' ? this.el_togglerContainer : this.el_body, 'top');
		}

		if (this.__models.options.data.str_contentSelector) {
			this.el_content = $$(this.__models.options.data.str_contentSelector)[0];
			if (typeOf(this.el_content) === 'element') {
				this.el_navi.adopt(this.el_content);
				this.el_content.setStyle('display', 'block');
			}
		}
		
		if (
				typeOf(this.el_toggler) !== 'element'
			||	typeOf(this.el_navi) !== 'element'
			||	typeOf(this.el_body) !== 'element'
		) {
			return;
		}
		
		this.el_body.addClass('useOcNavi');
		
		lsjs.__moduleHelpers.unfold.start({
			bln_automaticallyCreateResizeBox: false,
			str_initialDisplayType: 'block',
			str_initialToggleStatus: 'closed',
			var_togglerSelector: this.el_toggler,
			var_contentBoxSelector: this.el_navi,
			var_wrapperSelector: this.el_body,
			str_animationMode: 'margin-left',
			str_classOpen: 'lsOcNaviOpen',
			str_classClosed: 'lsOcNaviClosed',
			str_classRunning: 'lsOcNaviRunning',
			str_classUseLsUnfold: '',
			
			obj_morphOptions: {
				'duration': 600,
                'onStart': function() {
					var el_body = $$('body')[0];
					if (!el_body.hasClass('lsOcNaviOpen')) {
                        lsjs.scrollAssistant.__controller.getLSFEScrollOffset();
                    } else if (el_body.hasClass('lsOcNaviRunning')) {
                        lsjs.scrollAssistant.__controller.scrollToLSFEOffset();
					}
                }
			}
		});

		if (this.__models.options.data.bln_useFoldedNaviInside) {
            lsjs.__moduleHelpers.foldedNavi.start({
                var_naviSelector: this.el_navi
            });
        }
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();