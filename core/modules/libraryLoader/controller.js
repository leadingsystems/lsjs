(function() {
	
	// ### ENTER MODULE NAME HERE ######
	var str_moduleName = '__moduleName__';
	// #################################


	lsjs.__moduleHelpers[str_moduleName] = {
		self: null,
		arr_loadedLibraries: [],
		arr_totalLibraries: [],
		domReady: false,
		_currentIndex: 0,

		start: function(arr_libraries) {
			this.arr_totalLibraries = arr_libraries;
			this.arr_loadedLibraries = [];
			this._currentIndex = 0;
			var self = this;

			if (this.arr_totalLibraries.length > 0) {
				this._loadNextScript();
			} else {
				this._checkDomAndFinalize();
			}

			if (document.readyState === "complete" || document.readyState === "interactive") {
				self.domReady = true;
				self._checkDomAndFinalize();
			} else {
				document.addEventListener('DOMContentLoaded', function() {
					self.domReady = true;
					self._checkDomAndFinalize();
				});
			}
		},

		_loadNextScript: function() {
			var self = this;

			if (this._currentIndex >= this.arr_totalLibraries.length) {
				this._checkDomAndFinalize();
				return;
			}

			var libEntry = this.arr_totalLibraries[this._currentIndex];

			var scriptLoadHandler = function() {
				var loadedIdentifier = this.src || (this.dataset ? this.dataset.originalSrc : null) || '[inline-script]';

				self.arr_loadedLibraries.push(loadedIdentifier);
				window.fireEvent('libraryLoaded', loadedIdentifier);

				self._currentIndex++;
				self._loadNextScript();
			};

			var scriptErrorHandler = function() {
				var errorIdentifier = this.src || (this.dataset ? this.dataset.originalSrc : null) || '[inline-script-error]';
				console.error('Error loading library:', errorIdentifier);
				// Push library to Error loaded because we check later how much are in this array see: _checkDomAndFinalize
				self.arr_loadedLibraries.push('[ERROR] ' + errorIdentifier);

				self._currentIndex++;
				self._loadNextScript();
			};

			if (typeof libEntry === 'string' && libEntry.trim().startsWith('<script')) {
				var temp = document.createElement('div');
				temp.innerHTML = libEntry.trim();
				var oldScript = temp.querySelector('script');
				if (oldScript) {
					var newScript = document.createElement('script');
					for (var i = 0; i < oldScript.attributes.length; i++) {
						var attr = oldScript.attributes[i];
						if (attr.name.toLowerCase() !== 'onload' && attr.name.toLowerCase() !== 'onerror') {
							newScript.setAttribute(attr.name, attr.value);
						}
					}
					if (!newScript.src) {
						newScript.text = oldScript.textContent;
					}
					newScript.dataset.originalSrc = oldScript.src || '[inline-script-' + this._currentIndex + ']';

					newScript.onload = scriptLoadHandler;
					newScript.onerror = scriptErrorHandler;
					document.head.appendChild(newScript);

					if (!newScript.src) {
						setTimeout(function() {
							if (typeof newScript.onload === 'function') {
								newScript.onload();
							}
						}, 0);
					}
				} else {
					console.error('Could not parse script tag:', libEntry);
					return;
				}
			} else {
				var script = document.createElement('script');
				script.src = libEntry;
				script.dataset.originalSrc = libEntry;
				script.onload = scriptLoadHandler;
				script.onerror = scriptErrorHandler;
				document.head.appendChild(script);
			}
		},

		_checkDomAndFinalize: function() {
			if (this.domReady && this._currentIndex >= this.arr_totalLibraries.length) {
				this.checkAllLoaded();
			}
		},

		checkAllLoaded: function() {
			if (typeof window.fireEvent === 'function') {
				window.fireEvent('librariesLoadedAndDomReady');
			} else {
				console.warn("window.fireEvent nicht definiert.");
			}
		}
	};

	window.addEvent('libraryLoaded', function(el_domReference) {

		for (const key in lsjs.__moduleHelpers) {
			if (Object.prototype.hasOwnProperty.call(lsjs.__moduleHelpers, key)) {
				if (key.startsWith("customCode")) {
					lsjs.__moduleHelpers[key].onLibraryLoaded(el_domReference);
				}
			}
		}
	});
	window.addEvent('librariesLoadedAndDomReady', function(el_domReference) {

		for (const key in lsjs.__moduleHelpers) {
			if (Object.prototype.hasOwnProperty.call(lsjs.__moduleHelpers, key)) {
				if (key.startsWith("customCode")) {
					lsjs.__moduleHelpers[key].onLibrariesLoadedAndDomReady(el_domReference);
				}
			}
		}
	});
	window.addEvent('domready', function(el_domReference) {

		for (const key in lsjs.__moduleHelpers) {
			if (Object.prototype.hasOwnProperty.call(lsjs.__moduleHelpers, key)) {
				if (key.startsWith("customCode")) {
					lsjs.__moduleHelpers[key].onDomReady(el_domReference);
				}
			}
		}
	});
	window.addEvent('cajax_domUpdate', function(el_domReference) {

		for (const key in lsjs.__moduleHelpers) {
			if (Object.prototype.hasOwnProperty.call(lsjs.__moduleHelpers, key)) {
				if (key.startsWith("customCode")) {
					lsjs.__moduleHelpers[key].onCajaxDomUpdate(el_domReference);
				}
			}
		}
	});

})();