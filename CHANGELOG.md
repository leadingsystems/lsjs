Leading Systems LSJS changelog
===========================================

##### v3.1.1 (2023-12-11)
 * fix slider thumbnail

##### v3.1.0 (2023-12-11)
 * Improve caching
 * deprecated: lsjs_binder class will be removed in version 4.0

##### v3.0.3 (2023-08-16)
 * Improve templating (add tplOutput for directly outputting templates in other templates)

##### v3.0.2 (2023-06-29)
 * Fix double tap bug on iOS

##### v3.0.1 (2023-02-28)
 * Improving statusToggler; Implementing the functionality to use fixed status values which are defined for the togglers using the data-lsjs-statustoggler-toggle-fixed-value attribute

##### v3.0.0 (2023-01-11)

##### 3.0.0 beta1 (2020-06-18)

##### 2.0.11 (2020-06-05)
 * Use document.location in cajaxCaller if a form has no action attribute

##### 2.0.10 (2019-06-26)
 * Add touch navi module
 * Add touch detector module

##### 2.0.9 (2019-05-24)

##### 2.0.8 (2018-04-28)
 * Fix loading indicator z-index

##### 2.0.7 (2018-04-25)

##### 2.0.6 (2018-02-26)
 * Implement caching and minification

##### 2.0.5 (2018-02-25)

##### 2.0.4 (2018-02-22)
 * Module customization is now possible using the GET parameter
 "pathToAppCustomization" in the call to binder.php

##### 2.0.3 (2018-02-16)
 * Added debug mode which shows template locations in rendered html output.
 To activate it, use the GET parameter "debug=1" in the call to binder.php 

##### 2.0.2 (2018-02-13)
 * Don't hide ".formReviewerApplied p.success"

##### 2.0.1 (2018-02-12)
 * Enable the cajax caller module to execute javascript code that comes with the
 cajax response

##### 2.0.0 (2018-01-10)
 * Now optimized for the usage within Contao 4 as a "contao-component"
