# Leading Systems LSJS

**LSJS was designed and is being used as the javascript framework behind the e-commerce
system Merconis.**

**However, LSJS can be used without Merconis and already is being used this way in a couple
of web applications. Since at this time we can't offer support for LSJS unless it's
used in a Merconis project, standalone usage is currently not recommended.**

**In the future we might actively promote standalone usage of LSJS, so if you are
interested in using it, we'd definitely like to hear from you.**

#

#### What is LSJS and what is it good for?
LSJS helps you to write powerful JS applications and organize your application code in
a way that will make your work a lot easier.

Every app you write using LSJS has a main app file called "app.js". Your main app file
coordinates everything but is not responsible for the actual functionality. This is
where LSJS modules come into play.

_Example: Let's say you have a website with a nice slideshow effect, a table in which you can
sort elements using drag and drop and a news ticker which load new entries via AJAX. In this case you would write three modules, e.g. "my-slideshow", "fancy-table", "new-ticker".
In your main app file you would load these modules but the slideshow functionality etc. is
completely located in your modules._

A module is not only a single JS file. It's a folder holding separate JS files for your
models, the view, the controller and of course the templates.

Organizing everything in well structured files and folders makes things easy for you but
of course LSJS doesn't deliver your application to the browser that way. LSJS comes
with a binder script which combines all your work in one single file and it also optimizes,
minimizes and caches it.

Besides the powerful templating engine, LSJS offers you an MVC architecture, bi-directional
data-binding, helpful core modules and much more.

#### How to use LSJS
The following explanation can easily be followed with the little example projects
located in the "examples" folder.

To use LSJS on a website it is necessary to load the LSJS core and at least one
LSJS app. Loading the core or an app means loading the LSJS binder.php file with
specific GET parameters. binder.php will then deliver a JS response.
The purpose of binder.php is to combine the scripts of the LSJS core or an app (which are structured
in folders) in one single file. No JS file of the LSJS core or an app will ever be referenced directly.

Example _01 doesn't use any of the cool LSJS features (only the very simple messageBox
core module). It simply shows how to include an LSJS app in your website.

Please open: http://yourdomain.com/assets/lsjs/examples/_01/index.html

If your browser displays a message box saying "LSJS loaded!" then the javascript of the
LSJS core and the example app have been loaded successfully.

Take look in "assets/lsjs/examples/_01/index.html" to see how binder.php is being
referenced there.

First of all, binder.php has to be referenced in the "src" attribute of a script element.

Like this:

`<script src="../../core/appBinder/binder.php?output=js"></script>`

This includes the JS source code of the LSJS core and the core modules.

If we only do this, we don't see anything happening because we don't have any
application code yet.

In order to load the JS of our app, we use the following "script" element:
 
`<script src="../../core/appBinder/binder.php?output=js&pathToApp=_dup2_/examples/_01/app&includeCore=no&includeCoreModules=no"></script>`

The GET parameters `includeCore=no` and `includeCoreModules=no` tell binder.php
to only load the app and its modules but not the core. Since we loaded the core
separately before, that's exactly what we want. However, we could load the core and
the app in one single request with this:

`<script src="../../core/appBinder/binder.php?output=js&pathToApp=_dup2_/examples/_01/app"></script>`

Please note: The path to the app has to be specified relative to the location of
binder.php. Therefore the path would probably beginn with at least some of those: "../"

Although referencing the path to the app is in no way a security risk because the server
never executes any files at the referenced location but only combines them and delivers
them as plain JS code, some server protection systems (e.g. BitNinja) might find
URLs that contain something like "../../../../" suspicious and block the request or
even the user's IP after several attempts to load the URL. To prevent this, binder.php
supports a "directory up alias". So, in the "pathToApp" parameter, "../" can be wrote
as `_dup1_` ("dup" stands for "directory up" and the following number stands for the
number of steps we want to go up). Therefore, `_dup_4` would mean `../../../../`.

##### Using the debug mode
Adding the GET parameter `debug=1` to the binder.php URL activates the debug mode which
allows us to find out exactly the location of any template file used when generating
the combined LSJS output.

This is especially useful if we use a third party LSJS app whose output we want to modify.
In order to be able to modify output, we first need to find the template that is
responsible for the output and then we can modify that output using the update-safe
customization technique provided by LSJS.

With the debug function activated, comments indicating which part of the output was
created by which template will be added to the HTML output generated by LSJS. Like this:

`<!-- BEGIN LSJS TEMPLATE: modules/messageBox/templates/main.html/main.html -->`  

and
  
`<!-- END LSJS TEMPLATE: modules/messageBox/templates/main.html/main.html -->`

##### Using app customization
If we use a third party LSJS app on our website, we might want to change its look or
behaviour but we can't (or at least we definitely shouldn't) change the original
app code because future updates would be a real problem or even become impossible.

Therefore, LSJS offers an easy way to customize the modules of an app.

Just like the path to an app can be specified as a GET parameter when referencing
binder.php, using the GET parameter `pathToAppCustomization` the location of 
customized versions of the app modules can be specified.

The given customization path needs to point to a directory which contains the
customized files in exactly the same structure as in the original app.

When combining the app code, LSJS will look for customized files and replace the
respective parts of the original code accordingly. It is even possible to add new
templates, models or even complete modules by putting them into the customization
folder.

Take a look at example _02 to see how this works.

In example _02 we have a very simple app that comes with one module "helloWorld"
which only prints "Hello World!" to the screen using a template "main.html".

Example _02 doesn't only have the app folder but also another folder called
"appCustomization" which holds the customized template. By referencing the path
to the customization folder in the GET parameter `pathToAppCustomization` when
loading binder.php in the example's index.html, the customization is applied.

Please open: http://yourdomain.com/assets/lsjs/examples/_02/index.html

You will already see the modified output.

The module's controller is also customized and prints `customized controller works in module "helloWorld"`
to the console.

Even the main app file, app.js, is customized and prints "customized app.js works"
to the console.

Open the example's index.html and remove the GET parameter `pathToAppCustomization`
to see what the module originally did.

If you switch between the original and the customized version, take a look in the
generated HTML source and see how the location of the template that we can see
due to the activated debug mode changes.

##### Using core module customization
Customizing core modules in an update-safe way basically works as customizing app
modules which was described earlier in this document.

Using the GET parameter `pathToCoreCustomization` the folder containing the customized
files can be specified. This folder needs to contain a folder called "modules" in
which customizing works exactly the same way as it does with app modules.

Please open example _03 to see it in action: http://yourdomain.com/assets/lsjs/examples/_03/index.html

#### Using the LSJS templating system
LSJS comes with a powerful templating system which is designed especially for people who
like the way that PHP code can be used to create HTML output and want the same, easy way
to create HTML output with JS.

LSJS templates are HTML files in which you can embed JS code like this

```
<div>
    <?
    var	i,
        str_text = 'Hello template!';
    
    for (i = 0; i <= 5; i++) {
        ?>
        <h3>This template says: <?= str_text =?></h3>
        <?
    }
    ?>
</div>
```

You've probably never seen this in JS but in PHP this is standard:

```
<div>
    <?php
    $str_text = 'Hello template!';
    
    for ($i = 0; $i <= 5; $i++) {
        ?>
        <h3>This template says: <?= str_text ?></h3>
        <?php
    }
    ?>
</div>
```

There's not much to know about the syntax in LSJS templates:

- `<?` begins a JS code block
- `?>` ends a JS code block
- ```<?= 'some text or some ' + variable ?>``` prints some text or some variable

_Hint: Since LSJS templates will be transformed into regular JS code string
concatenations by binder.php you have to escape single quotes if you want to use
them inside a template:_

```<p>This won\'t be a problem</p>```

```<p>But this doesn't work</p>```

##### Template includes
Templates can be included in other templates. There are three possible ways of doing this:

```
<div data-lsjs-replaceWithTemplate="sub01"></div>
```

or

```
<div data-lsjs-replaceWithElement="arg.__view.el_replacement01"></div>
```

or

```
{{template::templatename}}
```

The last mentioned way to include another template inserts the subtemplate in the main template when the template is converted into actual JS code in the binder's template converter on the PHP side. Therefore, using this including technique you have full access to all variables that are available in the main template even from the subtemplate.


#### Cache and Minifier
By default, LSJS minifies and caches its output in order to optimize page loading speed.
Both options can be deactivated because during development you probably don't want
to use them.

Add the GET parameter `no-minifier=1` to your binder.php URL to deactivate the minifier.

Add the GET parameter `no-cache=1` to your binder.php URL to deactivate caching.

If you use caching, simply delete the folder named "cache" from your LSJS folder if
you want to get changes you've made to your app. The next time, you're loading
binder.php using the cache, LSJS will recreate the cache folder with the updated contents.
