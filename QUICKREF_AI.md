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
