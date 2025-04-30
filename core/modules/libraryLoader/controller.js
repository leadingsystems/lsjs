(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################


lsjs.__moduleHelpers[str_moduleName] = {
	self: null,
	arr_loadedLibraries: [],
	arr_totalLibraries: [],
	domReady: false,
	
	start: function(arr_libraries) {


		this.arr_totalLibraries = arr_libraries;

		var self = this;

		arr_libraries.forEach(function(libEntry) {
			if (typeof libEntry === 'string' && libEntry.trim().startsWith('<script')) {
				// Analyze the script tag
				var temp = document.createElement('div');
				temp.innerHTML = libEntry.trim();
				var oldScript = temp.querySelector('script');
				if (oldScript) {
					var newScript = document.createElement('script');

					// Transfer all attributes (e.g. src, type, etc.)
					for (var i = 0; i < oldScript.attributes.length; i++) {
						var attr = oldScript.attributes[i];
						newScript.setAttribute(attr.name, attr.value);
					}

					// If inline JS: transfer content
					if (!newScript.src) {
						newScript.text = oldScript.textContent;
					}

					// Events as before
					newScript.onload = function() {
						console.log('Library loaded:', newScript.src || '[inline-script]');
						self.arr_loadedLibraries.push(newScript.src || '[inline-script]');
						window.fireEvent('libraryLoaded', newScript.src || '[inline-script]');
						self.checkAllLoaded();
					};

					document.head.appendChild(newScript);

					// The onload event only fires for external scripts
					if (!newScript.src) {
						newScript.onload();
					}
				}
			} else {
				// Normal handling as before
				var script = document.createElement('script');
				script.src = libEntry;
				script.onload = function() {
					console.log('Library loaded:', libEntry);
					self.arr_loadedLibraries.push(libEntry);
					window.fireEvent('libraryLoaded', libEntry);
					self.checkAllLoaded();
				};
				document.head.appendChild(script);
			}
		});

		// Wait for DOM Ready
		if (document.readyState === "complete" || document.readyState === "interactive") {
			self.domReady = true;
			self.checkAllLoaded();
		} else {
			document.addEventListener('DOMContentLoaded', function() {
				self.domReady = true;
				self.checkAllLoaded();
			});
		}



	},

	checkAllLoaded: function() {
		if (this.domReady && this.arr_loadedLibraries.length === this.arr_totalLibraries.length) {
			console.log("Alle Libraries geladen und DOM bereit.");
			window.fireEvent('librariesLoadedAndDomReady');
		}
	}
};


})();