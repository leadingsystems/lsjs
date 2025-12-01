# LSJS Quick Reference — Leading Systems JavaScript Framework

**Version:** Internal documentation with current conventions, patterns, and best practices.

---

## 1. Overview

* **LSJS** is a **modular MVC‑like front‑end JS framework** used in the **Merconis** shop system.
* Modules can exist inside:  
   * `lsjs/core/modules` → reusable core modules.  
   * `lsjs/app/modules` → app‑specific modules.
* `app.js` defines which modules are initialized at runtime.

---

## 2. Module Structure

A typical LSJS module consists of up to three components:

```
modules/
  moduleName/
    controller.js
    view.js
    models/
      options.js
```

### Roles in MVC

* **Controller**: Coordinates logic, data flow between Models, and between Models and View. Avoids direct DOM manipulation unless unavoidable.
* **View**: Owns `__el_container`, performs DOM lookups, manipulations, and binds UI event handlers. All UI behaviour and visual state changes should go in the View.
* **Model**: Holds data and configuration; Views/Controllers use it for logic and rendering decisions.

### controller.js

```javascript
lsjs.addControllerClass(str_moduleName, obj_classdef);
```

For *visual UI modules*, Controller can remain minimal if no coordination logic is needed.

### view.js

```javascript
lsjs.addViewClass(str_moduleName, obj_classdef);
```

Handles all UI work using `this.__el_container` as the instance root DOM node.

### models/options.js

Stores default configuration and merges user-provided overrides. In compiled LSJS, wrapper code is injected automatically — the file should only contain `obj_classdef_model` definition.

```javascript
var obj_classdef_model = {
    name: 'options',
    data: {},
    start: function() {
        this.data = {
            str_containerSelector: '',
            bln_doNotUseAjax: false
        };
    },
    set: function(obj_options) {
        Object.merge(this.data, obj_options);
        this.__module.onModelLoaded();
    }
};
```

---

## 3. Creating a Simple Module

1. Create folder:  
   ```
   lsjs/app/modules/myModule/
   ```

2. controller.js:  
   ```javascript
   (function() {  
       var str_moduleName = 'myModule';  
       var obj_classdef = {  
           start: function() {  
               console.log('Module started!');  
           }  
       };  
       lsjs.addControllerClass(str_moduleName, obj_classdef);  
       lsjs.__moduleHelpers[str_moduleName] = {  
           self: null,  
           start: function(obj_options) {  
               this.self = lsjs.createModule({ __name: str_moduleName });  
               if (this.self.__models && this.self.__models.options) {  
                   this.self.__models.options.set(obj_options || {});  
               }  
           }  
       };  
   })();  
   ```

3. Start in app.js:  
   ```javascript
   lsjs.__moduleHelpers.myModule.start({ /* options */ });  
   ```

---

## 4. App Initialization Flow (app.js)

```javascript
lsjs.__moduleHelpers.someModule.start({
    str_containerSelector: '.some-selector',
    someOption: true
});
```

Flow:   
`Controller → Model(s) → View`

---

## 5. Template Handling

Provided by `lsjs_templateHandler.js`:

* `lsjs.tpl.add(...)` → append rendered template as child.
* `lsjs.tpl.replace(...)` → replace all children, then append.

```javascript
lsjs.tpl.register({
    myTemplate: function(data) { /* return HTML */ }
}, 'moduleName');
```

---

## 6. Key LSJS APIs

* `lsjs.createModule({...})` → create a module instance. Accepts extra arguments that will be available in `this.__module.obj_args`.
* `lsjs.addControllerClass(name, def)` / `lsjs.addViewClass(name, def)`
* `lsjs.__moduleHelpers` registry for starting/stopping modules
* `this.registerElements(container, namespace)` in views auto-registers DOM refs

---

## 7. Patterns to Follow

* Always register app-startable modules in `lsjs.__moduleHelpers`.
* UI logic with `__el_container` belongs in the View.
* Keep `.start()` minimal in Controller unless coordinating data flow.
* Use models/options.js for default config+merges.
* Enhance existing DOM, when possible, to allow server rendering + progressive enhancement.

---

## 8. Manager/Instance Pattern

For modules that can have multiple independent UI instances, LSJS uses a **Manager/Instance** pattern. The Manager module scans the DOM for relevant containers and creates one Instance module for each container.

### Directory Structure

Both Manager and Instance are separate LSJS modules, inside a common parent directory:

```
modules/
  myModule/
    myModuleManager/
      controller.js   <-- Manager needs only this file
    myModuleInstance/
      controller.js
      view.js
      models/
        options.js   (optional, if instance needs config)
```

The Manager's `controller.js` is the **only file** required for a Manager module — it has no View or Model because it does not directly handle DOM logic. Its sole purpose is to find relevant DOM containers and create Instance modules.

### Passing Options from Manager to Instances

The correct way to pass configuration from a Manager to its Instances is **not** calling `this.self.start()` or similar. Instead:

1. Pass options into `lsjs.createModule()` when creating the Manager from `__moduleHelpers`.
2. Inside the Manager's controller, read them via `this.__module.obj_args`.
3. When creating Instances, pass the options to each Instance's `options` model using `.set()`.

```javascript
(function() {
    var str_moduleName = 'productFilterUIManager';
    var obj_classdef = {
        arr_instances: [],
        start: function() {
            var self = this;
            var obj_instanceOptions = this.__module.obj_args.obj_instanceOptions || {};
            this.arr_instances = [];
            Array.each(
                document.querySelectorAll('[data-merconis-component~="product-filter-ui"]'),
                function(el_container) {
                    if (!el_container.retrieve('alreadyHandledBy_' + str_moduleName)) {
                        el_container.store('alreadyHandledBy_' + str_moduleName, true);
                    } else { return; }
                    var instance = lsjs.createModule({
                        __name: 'productFilterUIInstance',
                        __el_container: el_container
                    });
                    if (instance.__models && instance.__models.options) {
                        instance.__models.options.set(obj_instanceOptions);
                    }
                    self.arr_instances.push(instance);
                }
            );
            console.log(str_moduleName + ': Created ' + this.arr_instances.length + ' instance(s).', this.arr_instances);
        }
    };
    lsjs.addControllerClass(str_moduleName, obj_classdef);
    lsjs.__moduleHelpers[str_moduleName] = {
        self: null,
        start: function(obj_instanceOptions) {
            this.self = lsjs.createModule({
                __name: str_moduleName,
                obj_instanceOptions: obj_instanceOptions
            });
        }
    };
})();
```

### Example: productFilterUI Instance (View with Ajax)

```javascript
(function() {
    var str_moduleName = 'productFilterUIInstance';
    var obj_classdef = {
        el_form: null,
        start: function() {
            this.el_form = this.__el_container.querySelector('form');
            if (!this.el_form) {
                console.warn(str_moduleName + ': No form found', this.__el_container);
                return;
            }
            lsjs.helpers.prepareFormForCajaxRequest(this.el_form);
            this.initUI();
        },
        initUI: function() {
            var submitBtn = this.el_form.querySelector('input[type="submit"]');
            if (submitBtn) submitBtn.style.display = 'none';
            this.el_form.addEventListener('submit', function(event) {
                if (!this.__models.options.data.bln_doNotUseAjax) {
                    event.preventDefault();
                    event.stopPropagation();
                    lsjs.loadingIndicator.__controller.show();
                    new Request.cajax({
                        url: this.el_form.getAttribute('action'),
                        method: 'post',
                        noCache: true,
                        bln_doNotModifyUrl: true,
                        cajaxMode: 'updateCompletely',
                        el_formToUseForFormData: this.el_form,
                        // MANDATORY: tell the server which elements to send back
                        obj_additionalFormData: {
                            'cajaxRequestData[requestedElementClass]': 'ajax-reload-by-filter'
                        },
                        onComplete: function() {
                            lsjs.loadingIndicator.__controller.hide();
                        }
                    }).send();
                }
            }.bind(this));
            // trigger submit via event so it can be intercepted
            this.el_form.addEventListener('change', function() {
                setTimeout(() => {
                    this.el_form.dispatchEvent(
                        new Event('submit', { cancelable: true, bubbles: true })
                    );
                }, 80);
            }.bind(this));
        }
    };
    lsjs.addViewClass(str_moduleName, obj_classdef);
})();
```

### Debugging Approach

The Manager stores each created Instance in `this.arr_instances`, accessible from browser console after startup:

```javascript
lsjs.__moduleHelpers.productFilterUIManager.self.arr_instances
// First instance's form:
lsjs.__moduleHelpers.productFilterUIManager.self.arr_instances[0].el_form
```

---

## 9. CAJAX Usage Notes

* **Mandatory request data:** In `Request.cajax`, always send `cajaxRequestData` so the server knows which DOM elements to return:  
   ```javascript
   obj_additionalFormData: {  
       'cajaxRequestData[requestedElementClass]': 'ajax-reload-by-filter'  
   }  
   ```
* **Unique IDs required:** Each element returned via CAJAX must have a unique `id` so LSJS can map it for replacement in the DOM.
* **Reinitialization after CAJAX:** When a CAJAX update replaces a module's `__el_container`, all event bindings are lost. Re-run the module's starter code inside a `cajax_domUpdate` handler. Use the passed `el_domReference` to limit the re-init scope:  
   ```javascript
   window.addEvent('cajax_domUpdate', function(el_domReference) {  
       lsjs.__moduleHelpers.productFilterUIManager.start();  
       // Optionally scope to el_domReference if supported  
   });  
   ```

---

## 10. Event Dispatch vs submit()

Calling a form's `submit()` method bypasses `submit` event listeners. If your Ajax intercept is bound to `submit`, dispatch a synthetic event instead:

```javascript
form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
```

---

## Additional Notes

For the most up-to-date information, refer to the official Leading Systems documentation and the [LSJS GitHub repository](https://github.com/leadingsystems/lsjs).

---

## 11. Core Modules

### ocFlex — Flexible off‑canvas/overlay toggler

- **What it is**: A core View module that toggles an off‑canvas/overlay container via one or more toggler elements. Supports either an existing container in the DOM or a standalone content element that will be moved into an auto‑generated overlay container when opened.
- **Primary use cases**: Off‑canvas navigation, search, filter panels, mini‑cart, dialogs.

#### How it works (high level)
- You start ocFlex via `lsjs.__moduleHelpers.ocFlex.start({...})` with a unique instance name and either:
  - `str_ocContainerSelector` to point to an existing overlay container, or
  - `str_ocContentSelector` to point to an existing content element which ocFlex will move into an auto‑generated overlay container when opened.
- The View finds togglers via `str_ocTogglerSelector` (global query, not limited to the container) and binds click to `toggle()`.
- ocFlex adds state classes on `body`, on the container, and on togglers. It also locks body scroll while open and restores scroll on close.
- Only one ocFlex can be open at a time; opening one closes any other open ocFlex instance.

#### Default CSS classes applied
- On `body`:
  - General: `ocFlex`, `ocFlexOpen`, `ocFlexClosed`
  - Specific (per instance): `ocFlex-{name}`, `ocFlexOpen-{name}`, `ocFlexClosed-{name}`
- On container: `open` / `closed` toggled; initial application: `ocFlexApplied` (configurable)
- On togglers: `open` / `closed` toggled

#### Options (models/options.js)
```javascript
{
  el_domReference: null,            // Limit DOM querying when called during CAJAX updates
  bln_debug: false,                 // Log warnings to console
  str_ocTogglerSelector: '',        // May match multiple toggler elements
  // Choose exactly one of the following two selectors:
  str_ocContainerSelector: '',      // Selector for existing container (must match exactly one)
  str_ocContentSelector: '',        // Selector for existing content element (must match exactly one)
  str_uniqueInstanceName: '',       // Required, used for specific state classes
  str_classToSetWhenModuleApplied: 'ocFlexApplied',
  bln_closeOnOutsideClick: true     // Click on overlay backdrop closes when true
}
```

Notes:
- Do not pass both `str_ocContainerSelector` and `str_ocContentSelector`. ocFlex will warn and abort.
- When using `str_ocContentSelector`, ocFlex auto‑generates a container from template `autoOcContainer.html` (id: `{name}-container`) and moves the content in on open, back on close.

#### Events
- `window.fireEvent('ocFlexOpen', name)` when opened
- `window.fireEvent('ocFlexClose', name)` when closed
- Global helper `window.ocFlexCloseCurrentlyOpen` is maintained so opening a new ocFlex closes the previously open one.

#### Toggle programmatically
```javascript
lsjs.__moduleHelpers.ocFlex.self['your-instance-name'].__view.toggle();
```

#### Project usage examples
- Off‑canvas navigation:
```javascript
lsjs.__moduleHelpers.ocFlex.start({
  str_ocTogglerSelector: '#off-canvas-navi-toggler',
  str_ocContainerSelector: '#off-canvas-navi-container',
  str_uniqueInstanceName: 'off-canvas-navi',
  bln_debug: true
});
```
- Off‑canvas search:
```javascript
lsjs.__moduleHelpers.ocFlex.start({
  str_ocTogglerSelector: '.off-canvas-search-toggler',
  str_ocContainerSelector: '#off-canvas-search-container',
  str_uniqueInstanceName: 'off-canvas-search',
  bln_debug: true
});
```
- Off‑canvas filter form (initialized on CAJAX updates):
```javascript
window.addEvent('cajax_domUpdate', function(el_domReference) {
  lsjs.__moduleHelpers.ocFlex.start({
    el_domReference: el_domReference,
    str_ocTogglerSelector: '.off-canvas-filter-form-toggler',
    str_ocContainerSelector: '#off-canvas-filter-form-container',
    str_uniqueInstanceName: 'off-canvas-filter-form',
    bln_debug: false
  });
});
```
- Programmatic open after content injection (e.g., added‑to‑cart info):
```javascript
if (el_domReference.getElement('[id^="off-canvas-added-to-cart-info-container"]')) {
  lsjs.__moduleHelpers.ocFlex.self['off-canvas-added-to-cart-info'].__view.toggle();
}
```

#### Minimal HTML structures
- Using an existing container:
```html
<a class="off-canvas-search-toggler" href="#">Search</a>
<div id="off-canvas-search-container" class="oc-flex-default-container">
  <!-- your content -->
</div>
```
- Using an external content element (auto container):
```html
<button class="open-dialog">Open Dialog</button>
<div id="myDialogContent">Dialog content...</div>
```
```javascript
lsjs.__moduleHelpers.ocFlex.start({
  str_ocTogglerSelector: '.open-dialog',
  str_ocContentSelector: '#myDialogContent',
  str_uniqueInstanceName: 'my-dialog'
});
```

#### Gotchas
- Ensure `str_uniqueInstanceName` is unique per instance; styles rely on it.
- Toggler query is global; ensure your selector doesn’t unintentionally match unrelated elements.
- In CAJAX flows, pass `el_domReference` so element lookups only search inside the updated subtree.
- Do not re‑initialize the same container/content twice; ocFlex guards against duplicates, but prefer to scope with `el_domReference`.

---

## 12. Module lifecycle and createModule args (crucial)

How LSJS instantiates modules and in which order things run:

- Controller, View, then Models are instantiated; Models’ `start()` run first.
- After all models signal loaded, View `.start()` runs, then Controller `.start()`.
- A module instance exposes:
  - `this.__name`, `this.__el_container`, `this.__controller`, `this.__view`, `this.__models`.
  - View gets helper methods bound: `tplPure`, `tplAdd`, `tplReplace`, `registerElements`,
    `removeDataBindings`, `debugBindings`.

`lsjs.createModule({...})` accepts:
- `__name` (required)
- `__el_container` (Element) or `str_containerSelector` (string); if neither provided,
  a `<div class="moduleContainer autoModuleContainer {__name}">` is created.
- `__parentModule` (for Manager → Instance linkage)
- `__useLoadingIndicator` (boolean) shows/hides global loading indicator around start.
- Any additional keys are available as `this.__module.obj_args` inside Controller/View/Models.

Global helpers:
- `lsjs.__moduleHelpers` – put simple starters/factories here; managers commonly register in this.
- `lsjs.__appHelpers` – apps can store global app references (e.g., `lsjs.__appHelpers.merconisApp`).

---

## 13. Auto‑element registration (data-lsjs-element)

Use the View method `registerElements(container, group, registerSingles)` to auto‑collect
DOM references and store them under `this.__autoElements[group]`.

When you use LSJS templates via `this.tplAdd` / `this.tplReplace` / `this.tplPure`, auto‑elements inside the rendered template are registered automatically. This is done inside the core `tplUse()` flow after rendering:

```940:949:assets/lsjs/core/lsjs.js
		el_renderedTemplate = lsjs.tpl[str_mode](obj_usageOptions, str_moduleName);

		if (el_renderedTemplate === null) {
			return el_renderedTemplate;
		}
		
		this.registerElements(el_renderedTemplate, obj_usageOptions.autoElementsKey !== null ? obj_usageOptions.autoElementsKey : obj_usageOptions.name, bln_registerSingleElementsInElementList);
		this.registerDataBindings(el_renderedTemplate);
		this.registerMultipleDataBindings(el_renderedTemplate);
```

Therefore:
- If you render UI through templates, you typically do not need a separate `registerElements` call.
- Call `registerElements` manually when enhancing pre‑existing DOM that was not created through LSJS templates.

Markup:
```html
<div data-lsjs-element="row"></div>
<div data-lsjs-autoElementSubGroup="item-1">
  <button data-lsjs-element="remove"></button>
</div>
```

Usage:
```javascript
// In View.start():
this.registerElements(this.__el_container, 'main', true);
// Access:
this.__autoElements.main.row           // Element or Elements
this.__autoElements.main['item-1'].remove
```

Notes:
- `registerSingles = true` forces even single matches into an `Elements` collection.
- You can filter by element or subgroup name with the optional 4th/5th params.
- Use `bln_checkForParentSubGroups` when elements inherit subgroup from parent wrappers.

---

## 14. Data binding (crucial for forms and reactive UI)

Two attribute styles are supported:

- Single binding:
  - `data-lsjs-bindToModel="options"`
  - `data-lsjs-bindToPath="user.email"`
  - `data-lsjs-bindToProperty="value"` (omit for smart default)
  - `data-lsjs-bindToEvent="change"`
  - `data-lsjs-bindToTranslationModelToView="translateEmailForInput"`
  - `data-lsjs-bindToTranslationViewToModel="normalizeEmail"`
  - `data-lsjs-bindToCallbackViewToModel="persistEmail"`
  - `data-lsjs-bindToAllowInsideEvents="true"`

- Multiple bindings:
  - `data-lsjs-bindTo='[{ "model":"options", "path":"user.email", "event":"input" }]'`

Where functions are instance methods on the target Model (e.g., `this.__models.profile`).

Important behaviors:
- Initial sync: after registration, elements are initialized with current model values.
- Checkbox values:
  - If `value=""` or `"true"` → booleans true/false.
  - If `value="false"` → inverted boolean mapping.
  - Otherwise uses element’s `value` when checked, empty string when unchecked.
- `allowInsideEvents`: by default, ignore bubbled events from inside children; enable explicitly if needed.
- Trigger programmatically: `this.__models.options.triggerDataBinding('user.email')`.

Model function bindings (optional):
- Define `obj_dataFunctionBindings` on a model mapping data paths to handler names.
- Handlers receive `(newValue, registeredPath, originalValue, actualWrittenPath)`.
- Useful for side‑effects (e.g., server persistence) and reset on failure.

Example (generic Profile model):
```javascript
// models/profile.js
var obj_classdef_model = {
    name: 'profile',
    data: {
        user: { email: '' }
    },
    // Translate model → view (e.g., lowercase display)
    translateEmailForInput: function(value, elBound) {
        return String(value || '').toLowerCase();
    },
    // Translate view → model (e.g., trim and normalize)
    normalizeEmail: function(newValue, elBound, oldValue, dataPath) {
        return String(newValue || '').trim();
    },
    // Optional side-effect (e.g., async save)
    persistEmail: function(newValue, elBound, oldValue, dataPath) {
        // fire request or queue save; restore on failure if needed
    }
};
```

```html
<!-- In template -->
<input type="email"
       data-lsjs-bindToModel="profile"
       data-lsjs-bindToPath="user.email"
       data-lsjs-bindToEvent="input"
       data-lsjs-bindToTranslationModelToView="translateEmailForInput"
       data-lsjs-bindToTranslationViewToModel="normalizeEmail"
       data-lsjs-bindToCallbackViewToModel="persistEmail" />
```

---

## 15. Templates advanced (tpl, events, placeholders)

Registration:
```javascript
lsjs.tpl.register({ card: (arg) => `<div>${arg.title}</div>` }, 'moduleName');
```

Use from View (bound helpers):
```javascript
this.tplAdd({ name: 'card', arg: { title: 'Hi' }, parent: this.__el_container }, 'moduleName');
```

Detailed modes and options:
- `tplPure({ name, arg, class, id, bind, parent?, autoElementsKey?, bln_discardContainerElement? }, moduleName?)`
  - Renders and returns an Element without inserting into the DOM.
  - Auto‑elements and data bindings inside the rendered element are registered immediately (see core snippet above).
  - Useful when you need to manipulate the element first or insert it manually later.
- `tplAdd({ name, arg, parent, class, id, bind, autoElementsKey?, bln_discardContainerElement? }, moduleName?)`
  - Inserts the rendered element as a child of `parent`.
  - If `bln_discardContainerElement` is true, only the inner children of the rendered wrapper are adopted and the wrapper is removed.
- `tplReplace({ name, arg, parent, class, id, bind, autoElementsKey?, bln_discardContainerElement? }, moduleName?)`
  - Replaces all children of `parent` with the rendered element. Implementation detail:
    ```78:91:assets/lsjs/core/lsjs_templateHandler.js
		if (obj_usageOptions.mode === 'replace') {
			/*
			 * First, we use destroy() on all the children, because we want to
			 * prepare them for garbage collection. This, however, does not eliminate
			 * text nodes, which is why, secondly, we use parent.empty() to get
			 * rid of them, too.
			 */
			obj_usageOptions.parent.getChildren().destroy();
			obj_usageOptions.parent.empty();
		}
		
		obj_usageOptions.parent.adopt(el_renderedTemplate);
    ```
- Common options supported by the bound helpers:
  - `name` (string): registered template name (required)
  - `arg` (any): argument passed to the template function (available as `arg` in template scope)
  - `parent` (Element): required for `tplAdd`/`tplReplace`; defaults to `this.__el_container` if omitted at higher levels
  - `class`, `id` (string): applied to the wrapper element around the template HTML
  - `bind` (object): set `this` inside the template function
  - `autoElementsKey` (string|null): key under which auto‑elements are registered (defaults to the template `name` when omitted)
  - `bln_discardContainerElement` (bool): adopt children of rendered wrapper, then remove wrapper

Advanced:
- `autoElementsKey`: set to the template name to auto‑register elements within the rendered
  template under that key.
- `data-lsjs-events='[{ "event":"click", "scope":"__view", "function":"onClick" }]'` binds
  DOM events to methods. Valid scopes are properties on the module instance such as
  `__view` or `__controller`.
- Placeholders:
  - `data-lsjs-replaceWithElement="this.els_renderedTemplates[0]"` to swap in elements created earlier.
  - `data-lsjs-replaceWithTemplate="otherTemplateName"` to inline a (pure) template.
- String output for server templates:
  - `this.tplOutput({ name: 'card', arg: {...} })` returns a placeholder string which is
    replaced after render.

---

## 16. CAJAX details and URL history

`Request.cajax` options you will need:
- `cajaxMode`: `'update' | 'updateCompletely' | 'append' | 'discard' | 'updateByAttribute'`
  - `update`: replace innerHTML of matched target by id.
  - `updateCompletely`: replace the whole element by id (preserves scrollTop).
  - `append`: append children.
  - `updateByAttribute`: match targets by a custom attribute value (set `attributeForUpdateTargetDetection`).
- `el_formToUseForFormData`: send form via FormData; combine with
  `lsjs.helpers.prepareFormForCajaxRequest(form)`.
- `obj_additionalFormData`: include
  `{'cajaxRequestData[requestedElementClass]': '<server-class>'}` (mandatory on Merconis).
- `bln_doNotModifyUrl`: true to opt out of URL rewriting.

URL history rewriting:
- Enable globally: `lsjs.obj_preferences.bln_activateUrlModificationInRequestCajax = true;`
- Uses `history.replaceState` to keep the current page URL in sync with cajax responses
  while avoiding “fake” history steps.

After cajax update:
- LSJS fires `window.fireEvent('cajax_domUpdate', el_domReference)`.
- Re‑initialize any modules that depend on replaced DOM. Scope lookups to `el_domReference`
  where supported to avoid duplicate init.
- Best practice before re‑initializing overlays: first close any open `ocFlex` instances
  (use `window.ocFlexCloseCurrentlyOpen && window.ocFlexCloseCurrentlyOpen()`).

---

## 17. Hooks API

LSJS provides a small hook system:
- Register (prefer binding with `bindWithOriginal` to avoid duplicate registration tracking):
  ```javascript
  lsjs.hooks.registerHook('my_hook',
    this.onSomething.bindWithOriginal(this),
    { order: 100 });
  ```
- Call sync: `lsjs.hooks.callHook('my_hook', thisArg, arg1, arg2)` → returns array of non‑undefined results.
- Call async: `await lsjs.hooks.callHookAsync('my_hook', thisArg, arg1)`; honors `order`.

---

## 18. App helpers pattern

An app can expose itself if needed:
```javascript
lsjs.__appHelpers.myApp = new class_app();
```
This is how code like `lsjs.apiInterface.str_apiUrl = lsjs.__appHelpers.myApp.obj_config.str_ajaxUrl;`
is wired in projects.

---

## 19. Loading indicator integration

Pass `__useLoadingIndicator: true` to `lsjs.createModule({...})` to automatically show/hide the
core loading indicator module around module startup (except for the loadingIndicator module itself).

---

## 20. Debugging tips

- Manager/Instance: keep `arr_instances` on the Manager; inspect via console:
  `lsjs.__moduleHelpers.productFilterUIManager.self.arr_instances`.
- Use `this.__view.debugBindings()` to inspect currently registered data bindings.
- Add `bln_debug` options to core modules (where available) to log warnings instead of throwing.