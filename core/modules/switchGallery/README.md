# ocFlex

#### Purpose
With this module it is easily possible to display elements as page overlay
by clicking on a toggler element. The most common use is the classic
off-canvas navigation.

However, as the word "Flex" in the module name already indicates, this
module can be used flexibly.  It is thus possible to place several
off-canvas elements on one page and control them separately with
different toggler elements.

Since the off-canvas navigation is the best example of how to use ocFlex,
this module comes with a default styling that is made especially for this
use case.

#### Example usage

Put the following HTML code anywhere in your page.

    <a id="example-toggler" class="oc-flex-default-toggler" href="#">
        <div class="nav-bars">[nbsp]</div>
    </a>
    <div id="example-container" class="oc-flex-default-container">
        <!-- Content -->
    </div>

The toggler element and the container element can be placed in completely different
locations.

It is not necessary to use an "a" element as the toggler but it is a good idea
in many situations because this way it is possible to set a hyperlink that works as
a fallback if JS is deactivated.

The classes "oc-flex-default-toggler" and "oc-flex-default-container" can be used to
leverage the default styling which is basically the classic off-canvas navigation with
an animated hamburger toggler icon positioned fixed in the top left corner and with
the navigation container sliding in from the left.

The ".nav-bars" element is technically not necessary for ocFlex to work but it is
necessary for the toggler animation if the default styling should be used.

**Note:**
If you don't want to use the default styling, you simply don't set the default classes
in the HTML code and instead write your own stylesheet. If you do that, ocFlex basically
only changes the classes on the given DOM elements so that you can react on that with
your styling. In case the default styling is largely okay for you and you only want to
change a few things, it is probably best to use the default classes and then overwrite
whatever is necessary in another stylesheet.

#### Activation

To activate this module, put the following code in the app.js:
 
    lsjs.__moduleHelpers.ocFlex.start({
        str_ocTogglerSelector: '#example-toggler',
        str_ocContainerSelector: '#example-container',
        str_uniqueInstanceName: 'example',
        
        // Optional. Use this to activate debug logging. Defaults to false.
        // bln_debug: true,
        
        // Optional. Use DOM reference only in a cajax context. Defaults to the body element.
        // el_domReference: el_domReference
    });

The given selectors etc. are just examples and have to be changed in reality.
 
The el_domReference parameter is only required if this module initialization
code is called in a cajax_domUpdate event where el_domReference is given.
If this parameter is used, the module will only look for elements (e.g. toggler,
container etc.) inside el_domReference. If not, the whole DOM will be considered.