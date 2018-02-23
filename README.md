Leading Systems LSJS
=================================
#### What is LSJS and what is it good for?
FIXME: Add explanation

- Nice way to organize and modularize JS applications

- MVC (-ish)

- powerful templating system that is designe especially for people who like the way that
PHP code can be used to create HTML output and want the same, easy way to create HTML
output with JS.

- useful core modules

#### How to use LSJS
The following explanation can easily be followed with the little example projects
located in the "examples" folder.

To use LSJS on a website it is necessary to load the LSJS core and at least one
LSJS app. Loading the core or an app means loading the LSJS binder.php file with
specific GET parameters. binder.php will then deliver a JS response or a CSS
response, depending on what is requested. The purpose of binder.php is to
combine the scripts and stylesheets of the LSJS core or an app (which are structured
in folders) in one single file. No JS file or CSS file of the LSJS core or an app
will ever be referenced directly.

Example _01 doesn't use any of the cool LSJS features. It simply shows how to
include an LSJS app in your website.

Please open: http://yourdomain.com/assets/lsjs/examples/_01/index.html

If your browser displays a message box saying "LSJS loaded!" and your screen has a
nice green background then both the javascript part and the CSS part of the
LSJS core and the example app have been loaded successfully.

Take look in "assets/lsjs/examples/_01/index.html" to see how binder.php is being
referenced there.

First of all, binder.php has to be referenced in the "src" attribute of a script element
and/or the "href" attribute of a style element.

Like this:

`<script src="../../core/appBinder/binder.php?output=js"></script>`

or this:

`<link rel="stylesheet" href="../../core/appBinder/binder.php?output=css">`

The first includes the JS source code of the LSJS core and the core modules,
the second includes the CSS code for the LSJS core and the core modules.

If we only do this, we don't see anything happening because we don't have any
application code yet.

In order to load the JS and the CSS of our app, we use the following "script" and
"style" elements:
 
`<script src="../../core/appBinder/binder.php?output=js&pathToApp=_dup2_/examples/_01/app&includeCore=no&includeCoreModules=no"></script>`

`<link rel="stylesheet" href="../../core/appBinder/binder.php?output=css&pathToApp=_dup2_/examples/_01/app&includeCore=no&includeCoreModules=no">`

The GET parameters `includeCore=no` and `includeCoreModules=no` tell binder.php
to only load the app and its modules but not the core. Since we loaded the core
separately before, that's exactly what we want. However, we could load the core and
the app in one single request with this:

`<script src="../../core/appBinder/binder.php?output=js&pathToApp=_dup2_/examples/_01/app"></script>`

`<link rel="stylesheet" href="../../core/appBinder/binder.php?output=css&pathToApp=_dup2_/examples/_01/app">`

Please note: The path to the app has to be specified relative to the location of
binder.php. Therefore the path would probably beginn with at least some of those: "../"

Although referencing the path to the app is in no way a security risk because the server
never executes any files at the referenced location but only combines them and delivers
them as plain JS/CSS code, some server protection systems (e.g. BitNinja) might find
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

##### Using module customization
If we use a third party LSJS app on our website, we might want to change its look or
behaviour but we can't (or at least we definitely shouldn't) change the original
app code because future updates would be a real problem or even become impossible.

Therefore, LSJS offers an easy way to customize the modules of an app.

Just like the path to an app can be specified as a GET parameter when referencing
binder.php, using the GET parameter `pathToAppCustomization` the location of 
customized versions of the app modules can specified.

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

The app's styles are customized as well. If the stylesheet in the customization app folder
had the same filename as the one in the original app folder, the original style file
would be completely overridden. Instead, in this example we chose to put a stylesheet
with a different file name in the customization app folder with the effect that both
are being used simultaneously.

Open the example's index.html and remove the GET parameter `pathToAppCustomization`
to see what the module originally did.

If you switch between the original and the customized version, take a look in the
generated HTML source and see how the location of the template that we can see
due to the activated debug mode changes.