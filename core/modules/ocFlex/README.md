# ocFlex

#### Purpose
With this module it is easily possible to display elements as page overlay
only by clicking on a toggler element. The most common use is the classic
off-canvas navigation.

However, as the word "Flex" in the module name already indicates, this
module can be used flexibly.  It is thus possible to place several
off-canvas elements on one page and control them separately with
different toggler elements.

Since the off-canvas navigation is the best example of how to use ocFlex,
this module comes with a default styling that is made especially for this
use case.

#### Activation
To activate this module, the following code has to be put in the app.js:
 
    lsjs.__moduleHelpers.ocFlex.start({
        el_domReference: el_domReference,
        str_ocContainerSelector: '#container-selector',
        str_ocTogglerSelector: '#toggler-selector',
        str_uniqueInstanceName: 'unique-name'
    });

**Note:** The given selectors etc. are just examples and have to be changed
in reality.
 
The el_domReference parameter is only required if this module initialization
code is called in a cajax_domUpdate event where el_domReference is given.
If this parameter is used, the module will only look for elements (e.g. toggler,
container etc.) inside el_domReference. If not, the whole DOM will be considered.

#### Example usage

Put the following HTML code anywhere in your page.

    <a id="ocFlexToggler_example01" class="ocFlexToggler" href="#"><div class="nav-bars">[nbsp]</div></a>
    <div id="ocFlexContainer_example01" class="ocFlexContainer">
        <div class="ocFlexContainerInside">
            <!-- Navigation content -->
        </div>
    </div>
    
This example can be used perfectly for an off-canvas navigation. In this case it would
be advisable to put a hyperlink to a sitemap on the toggler as a fallback if JS is
deactivated.

The ".nav-bars" element is only used because the default styling uses an animated hamburger
toggler icon.

The ".ocFlexContainerInside" element is technically not required but since the
".ocFlexContainer" element is usually set do "display: fixed;" and stretches to overlay
the whole viewport, the element inside is a good idea to be able to center the content.

