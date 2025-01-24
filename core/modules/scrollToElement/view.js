(function() {

	var str_moduleName = '__moduleName__';
	var obj_classdef = {
		el_body: null,
		el_header: null,
		el_triggers: [],
		el_scrollToTop: null,

		start: function() {
			this.initializeElements();
			this.initializeVariables();
			this.initializeScrollToTop();
			this.initializeScrollToElement();
		},

		initializeScrollToElement: function() {
			this.el_triggers.forEach(trigger => {
				trigger.addEventListener('click', () => {
					const targetId = trigger.getAttribute('data-scroll-target');
					const targetElement = document.getElementById(targetId);

					if (targetElement) {
						targetElement.scrollIntoView({
							behavior: this.__models.options.data.str_scrollToBehavior
						});
					} else {
						console.error(`Kein Ziel-Element mit der ID "${targetId}" gefunden.`);
					}
				});
			});
		},

		initializeScrollToTop: function() {
			this.el_scrollToTop = this.tplPure({ name: 'scrollToTop' });
			this.el_scrollToTop.inject(this.el_body, 'top');

			//Sicherstellen das es Empty ist und nicht nur ein leerzeichen
			if (this.__models.options.data.str_containerSelector && this.__models.options.data.str_containerSelector.trim() !== '') {
				this.el_scrollToTop.classList.add(this.__models.options.data.str_containerSelector);
			}

			document.addEventListener("scroll", () => {
				let showElement = false;
				const fadeInLogic = this.__models.options.data.str_fadeInLogic;

				switch (fadeInLogic) {
					case 'page-length': {

						const scrollableHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
						const scrolledRatio = document.documentElement.scrollTop / scrollableHeight;
						showElement = scrolledRatio > this.__models.options.data.float_fadeInValue;
						break;
					}
					case 'viewportheight': {

						const viewportHeight = document.documentElement.clientHeight;
						const scrolledRatio = document.documentElement.scrollTop / viewportHeight;
						showElement = scrolledRatio > this.__models.options.data.float_fadeInValue;
						break;
					}
					case 'fixed-value': {

						showElement = document.documentElement.scrollTop > this.__models.options.data.float_fadeInValue;
						break;
					}
				}

				if (showElement) {
					this.el_scrollToTop.classList.add("show-scroll-to-top");
				} else {
					this.el_scrollToTop.classList.remove("show-scroll-to-top");
				}
			});

			this.el_scrollToTop.addEventListener("click", () => {
				window.scrollTo({
					top: this.__models.options.data.int_scrollToTop,
					behavior: this.__models.options.data.str_scrollToBehavior
				});
			});
		},

		initializeElements: function() {
			this.el_body = document.querySelector('body');
			if (!this.el_body) {
				console.error('Fehler: Kein <body>-Element gefunden');
			}

			this.el_triggers = document.querySelectorAll('[data-scroll-target]');
			if (this.el_triggers.length === 0) {
				this.el_triggers = [];
			}
		},

		initializeVariables: function() {
			const options = this.__models.options.data;
			this.str_fadeInLogic = options.str_fadeInLogic;
			this.str_scrollToBehavior = options.str_scrollToBehavior;

			this.__models.options.validate();
		}
	};

	lsjs.addViewClass(str_moduleName, obj_classdef);

})();
