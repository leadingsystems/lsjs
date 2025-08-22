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