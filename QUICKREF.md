### LSJS quick reference (project-tailored)

This document explains how LSJS works in this project and how to build custom LSJS modules using the patterns used here (e.g., `liveHits`, `configurator`, `variantSelector`, `zrtoolDialog`, …).

### What is LSJS

- **LSJS** is a lightweight MVC framework with a powerful HTML templating system and a build step that bundles app code (modules, models, templates) into a single output file via its binder.
- **App composition**: An app has a main `app.js` and a set of modules (each module has controller, view, models and templates). The binder combines them and injects module names automatically.
- **Where it lives here**: Core is in `assets/lsjs/core`. The project’s custom app lives in `files/merconisfiles/themes/theme10/lsjs/app`.

### Loading LSJS on a page

There are two standard approaches (see `assets/lsjs/README.md` for full details):

- **PHP context (recommended)**: Instantiate the LSJS binder controller on the server to render a versioned/bundled JS file and include it via a `<script src="...">` tag.
- **Non‑PHP context**: Use `assets/lsjs/core/appBinder/binder.php` directly with GET parameters (e.g., `pathToApp`, `pathToAppCustomization`, `debug=1`).

Useful flags:
- **`debug=1`**: Add HTML comments with template source locations to the rendered output to find where content comes from.
- **`no-minifier=1`**: Disable minification during development.

### App entry point (app.js)

Pattern used in this project (`files/merconisfiles/themes/theme10/lsjs/app/app.js`):
- Define an app class with `initialize`/`start` methods.
- On `domready`, instantiate the app and store a reference under `lsjs.__appHelpers.<name>` if needed.
- Initialize modules via their module helpers: `lsjs.__moduleHelpers.<module>.start({ ...options })`.
- Handle dynamic HTML updates by listening to `window` event `cajax_domUpdate` (emitted after AJAX updates done via `Request.cajax`). Re-run module starts with `el_domReference` so only the updated subtree is re-initialized.

Key lines from this project’s `app.js`:
- `lsjs.obj_preferences.bln_activateUrlModificationInRequestCajax = true;` enables URL history adjustment on cajax.
- The app repeatedly calls helpers like `ocFlex`, `sliderManager`, `imageZoomerManager`, `submitOnChangeManager`, `filterFormManager`, `variantSelectorManager`, `variationSelectorManager`, …
- The app sets `lsjs.apiInterface.str_apiUrl` to an API base derived from PHP and then uses `lsjs.apiInterface` from models.

### Module anatomy

LSJS modules are MVC units. A typical module folder looks like:

```
app/modules/<namespace>/<moduleName>/
  <moduleName>Instance/   # instance-specific controller/view/models/templates
  <moduleName>Manager/    # optional manager for multi-instance orchestration
  controller.js           # simple modules may only have controller/view/models directly
  view.js
  models/
    <model>.js
  templates/
    *.html
```

In this project you will find, for example:
- `files/merconisfiles/themes/theme10/lsjs/app/modules/merconis/liveHits/` (simple controller + view + models + template)
- `files/merconisfiles/themes/theme10/lsjs/app/modules/merconis/variationSelector/variationSelectorInstance` and `variationSelectorManager` (manager/instance pattern)

#### Controller

- Controllers are defined with a placeholder module name that the binder replaces:
  - `var str_moduleName = '__moduleName__';`
- Register using `lsjs.addControllerClass(str_moduleName, obj_classdef)`.
- Expose a convenience start via `lsjs.__moduleHelpers[str_moduleName].start(options)` that:
  - creates the module instance via `lsjs.createModule({ __name: str_moduleName })`
  - writes options to a dedicated model (commonly an `options` model) and calls `onModelLoaded()` so the module can render.

Example pattern (from `merconis/liveHits/controller.js`):
```javascript
var str_moduleName = '__moduleName__';
var obj_classdef = { start: function() {} };
lsjs.addControllerClass(str_moduleName, obj_classdef);
lsjs.__moduleHelpers[str_moduleName] = {
  self: null,
  start: function(obj_options) {
    this.self = lsjs.createModule({ __name: str_moduleName });
    this.self.__models.options.set(obj_options);
  }
};
```

#### View

- Register using `lsjs.addViewClass(str_moduleName, obj_classdef)`.
- In `start()` typically:
  - read initial DOM context (e.g., the module container, attributes)
  - render templates using `this.tplAdd(...)` or `this.tplReplace(...)`
  - cache auto-registered elements from templates in `this.__autoElements.*`
  - attach events to those auto elements
- View has helpful methods wired by the module:
  - `tplPure`, `tplAdd`, `tplReplace`, `tplOutput`
  - `registerElements`, `removeDataBindings`, `debugBindings`

Example fragments used in this project (from `merconis/configurator/.../view.js`):
- Render templates and capture auto elements:
```javascript
this.tplAdd({ name: 'structure' });
this.el_menuContainer = this.__autoElements.structure.menu;
this.tplReplace({ name: 'tabsMenu', parent: this.el_menuContainer });
```
- Before replacing templates during updates, clear bindings and auto elements:
```javascript
this.removeDataBindings(this.el_menuContainer);
this.tplReplace({ name: 'tabsMenu', parent: this.el_menuContainer });
```
- Attaching events to auto elements:
```javascript
this.__autoElements.main.btn_option.addEvent('click', function(event) { /* ... */ });
```

#### Models

- Each model file defines `obj_classdef_model` and registers it via the binder (see `assets/lsjs/core/appBinder/baseFiles/modelBasis.js`).
- Required keys:
  - `name`: the model name as used in data-bindings and `__models.<name>`
  - `data`: the model state object
  - `start()`: invoked during module bootstrap (load or initialize data here)
- If the model is ready for the view to render, call `this.__module.onModelLoaded()`.

Common option model pattern in this project:
```javascript
var obj_classdef_model = {
  name: 'options',
  data: { var_inputField: '.liveHits input[name="merconis_searchWord"]' },
  start: function() {},
  set: function(obj_options) {
    Object.merge(this.data, obj_options);
    this.__module.onModelLoaded();
  }
};
```

#### Creating and starting a module

- Create the folder and files for your module under `app/modules/...`.
- In the controller’s helper `start()`, call:
  - `lsjs.createModule({ __name: str_moduleName, str_containerSelector?: '#selector' })`
  - then feed initial options to your `options` model as needed.
- Start modules from `app.js` either on `domready` or inside the `cajax_domUpdate` handler:
```javascript
lsjs.__moduleHelpers.myModuleManager.start({ el_domReference: el_domReference, /* other options */ });
```

### Templates

- Location: `templates/*.html` inside your module.
- Syntax: HTML with inline JS blocks, PHP-like delimiters:
  - `<? ... ?>` executes JS
  - `<?= expression ?>` outputs expression result
- Includes and placeholders:
  - Replace with template: `<div data-lsjs-replaceWithTemplate="subTemplateName"></div>`
  - Replace with element: `<div data-lsjs-replaceWithElement="arg.__view.el_something"></div>`
  - Pre-conversion include: `{{template::templatename}}` (has access to all vars of the including template)
- Auto element registration:
  - Add `data-lsjs-element="<name>"` on elements you want accessible via `this.__autoElements`
  - Optional subgrouping: `data-lsjs-autoElementSubGroup="<group>"`
  - After render, access via `this.__autoElements[<templateNameOrGroup>].<name>`
- Event registration in templates is supported via `data-lsjs-events` (JSON), but in this project events are mostly attached in view code after rendering.

### Data binding (model ↔ view)

Bind DOM elements to model data using attributes (one-way to view, and two-way on events):
- **Attributes on the bound element**:
  - `data-lsjs-bindToModel="<modelName>"`
  - `data-lsjs-bindToPath="some.deep.path"` (optional, default root)
  - `data-lsjs-bindToProperty="value|html|checked|src|...|none"` (optional)
  - `data-lsjs-bindToEvent="change|keyup|input|..."` (default: `change`)
  - `data-lsjs-bindToTranslationModelToView="<modelFunctionName>` (optional)
  - `data-lsjs-bindToTranslationViewToModel="<modelFunctionName>` (optional)
  - `data-lsjs-bindToCallbackViewToModel="<modelFunctionName>` (optional)
  - `data-lsjs-bindToAllowInsideEvents` (flag) to allow bubbling from children

Notes from core behavior (`assets/lsjs/core/lsjs.js`):
- Initial write pushes current model value into the bound element after registration.
- Checkbox semantics:
  - If `value` attribute is empty or `true` → checked yields boolean `true`, unchecked `false`.
  - If `value` is `false` → checked yields boolean `false`, unchecked `true`.
  - Otherwise: checked yields the element’s `value`, unchecked yields empty string.
- To trigger bindings manually from code: `this.__models.<model>.triggerDataBinding('path.to.value')`.

### Hooks

- Register: `lsjs.hooks.registerHook('hook_name', myFunction, { order: 10 })`
- Call synchronously: `lsjs.hooks.callHook('hook_name', this, arg1, arg2)` → returns array of results.
- Call asynchronously: `await lsjs.hooks.callHookAsync('hook_name', this, arg1, arg2)`.
- Example use in this project (configurator view) to let extensions modify rendering:
  - `lsjs.hooks.callHook('merconis_configurator_updateTemplates_afterRoundup', this)`

### AJAX and API utilities

- **API interface** (`lsjs.apiInterface`):
  - Set base URL: `lsjs.apiInterface.str_apiUrl = '<url>'`
  - Request:
```javascript
lsjs.apiInterface.request({
  str_resource: 'callCustomizerMethodForProduct',
  obj_params: { method: 'getConfiguratorOptions', productId: '123', parameters: null },
  obj_additionalRequestOptions: { method: 'post' },
  func_onSuccess: function(data) { /* ... */ }
});
```

- **Cajax** (`Request.cajax`): HTML-in/HTML-out partial updates where returned elements replace DOM elements by `id` (or by attribute in `updateByAttribute` mode). Options:
  - `cajaxMode`: `update` | `updateCompletely` | `append` | `discard` | `updateByAttribute`
  - `attributeForUpdateTargetDetection`: used only for `updateByAttribute`
  - `el_formToUseForFormData` and `obj_additionalFormData` for `FormData` posts
  - Emits `window` event `cajax_domUpdate` with the updated element(s)
  - If `lsjs.obj_preferences.bln_activateUrlModificationInRequestCajax = true`, replaces the browser URL with the response URL minus temporary params.

### Core module helpers used in this project

These helpers wrap common modules under `lsjs.__moduleHelpers.<module>` and expose `start({ ...options })`:
- **`touchDetector`**, **`scrollAssistant`**, **`stickyHeader`**
- **`ocFlex`**: off-canvas UI; options include `str_ocTogglerSelector`, `str_ocContainerSelector`, `str_uniqueInstanceName`, `el_domReference`, `bln_debug`.
- **`sliderManager`**, **`sliderInputManager`**, **`imageZoomerManager`**, **`switchGallery`**
- **`conditionalFormManager`**, **`formReviewerManager`**, **`statusTogglerManager`**, **`cajaxCallerManager`**, **`elementFolderManager`**, **`submitOnChangeManager`**
- Merconis-specific: **`configuratorManager`**, **`putInCartFormManager`**, **`putInWatchlistFormManager`**, **`variantLinkerManager`**, **`variantSelectorManager`**, **`variationSelectorManager`**, **`liveHits`**, **`zrtoolDialogManager`**

Start them either once in `start()` or inside the `cajax_domUpdate` handler with `el_domReference` to limit initialization to updated DOM.

### Manager vs. Instance modules

Some modules provide both a manager and an instance submodule:
- The **manager** scans the DOM for instance containers and creates instances (e.g., variation/variant selectors, sliders).
- The **instance** holds the module-specific controller/view/models/templates used per DOM occurrence.

Folder example:
```
modules/merconis/variationSelector/
  variationSelectorManager/controller.js
  variationSelectorInstance/
    controller.js
    view.js
    models/*.js
    templates/*.html
```

### Writing a custom LSJS module (recipe)

1) **Create the files** under `files/merconisfiles/themes/theme10/lsjs/app/modules/<vendor>/<yourModule>/`:
- `controller.js` with:
```javascript
var str_moduleName = '__moduleName__';
lsjs.addControllerClass(str_moduleName, { start: function() {} });
lsjs.__moduleHelpers[str_moduleName] = {
  self: null,
  start: function(options) {
    this.self = lsjs.createModule({ __name: str_moduleName });
    this.self.__models.options.set(options || {});
  }
};
```
- `view.js` with a `start()` method that renders your templates and wires events.
- `models/options.js` to accept start options and call `this.__module.onModelLoaded()`.
- `templates/main.html` (and others as needed) using the template syntax and `data-lsjs-element` markers.

2) **Render templates** in the view and access auto elements:
```javascript
this.tplAdd({ name: 'main' });
// use this.__autoElements.main.<elementName> afterwards
```

3) **Bind data** if needed by adding `data-lsjs-bind*` attributes in templates. Provide translation/callback functions on your model if necessary.

4) **Start the module** from `app.js`:
```javascript
lsjs.__moduleHelpers['<vendor>/<yourModule>'].start({ /* options */ });
```
If it’s a manager/instance module, call the manager’s `start({ el_domReference })`.

### Debugging tips

- Add `debug=1` to the binder to annotate which template generated which HTML block.
- Temporarily add `no-minifier=1` while developing.
- Use `this.debugBindings()` in a view to inspect current data bindings.
- If a module seems to not render, ensure all its classes are registered and the model calls `this.__module.onModelLoaded()`.
- Before re-rendering a section, call `this.removeDataBindings(container)` to avoid duplicate bindings.

### Reference: frequently used APIs in this project

- **Module creation**: `lsjs.createModule({ __name, __el_container?, str_containerSelector?, __parentModule?, __useLoadingIndicator? })`
- **Templating in views**: `this.tplPure()`, `this.tplAdd()`, `this.tplReplace()`, `this.tplOutput()`
- **Auto elements**: `this.registerElements()` automatically runs inside template usage; read from `this.__autoElements`
- **Data paths**: Read/write model data via `this.__models.<model>.readData(path)` and `writeData(path, value)`
- **Hooks**: `lsjs.hooks.registerHook()`, `lsjs.hooks.callHook()`, `lsjs.hooks.callHookAsync()`
- **API**: `lsjs.apiInterface.request({ ... })`
- **Cajax**: `new Request.cajax({ ... }).send()` and listen for `cajax_domUpdate`

### Credits and source

- LSJS core: `assets/lsjs/core` (notably `lsjs.js` and binder in `core/appBinder`)
- Project app and modules: `files/merconisfiles/themes/theme10/lsjs/app`


