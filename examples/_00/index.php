<?php
require_once(__DIR__ . '/../../core/appBinder/binderController.php');

$arr_coreArguments = [
    'debug' => 1,
    'no-minifier' => 1,
    'pathForRenderedFiles' => __DIR__ . '/renderedFiles',
    'pathsToApps' => null,
    'pathsToCoreCustomizations' => null,
    'whitelist' => null,
    'blacklist' => null,
    'includeCore' => 'yes',
    'includeCoreModules' => 'yes',
    'includeApp' => 'no',
    'includeAppModules' => 'no',
];

$coreBinder = new lsjs_binderController($arr_coreArguments);

$arr_appArguments = [
    'debug' => 1,
    'no-minifier' => 1,
    'pathForRenderedFiles' => __DIR__ . '/renderedFiles',
    'pathsToApps' => [
            __DIR__ . '/app'
    ],
    'pathsToCoreCustomizations' => null,
    'whitelist' => null,
    'blacklist' => null,
    'includeCore' => 'no',
    'includeCoreModules' => 'no',
    'includeApp' => 'yes',
    'includeAppModules' => 'yes',
];

$appBinder = new lsjs_binderController($arr_appArguments);

?>

<!DOCTYPE html>
<html>
	<head>
		<title>EXAMPLE _01</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		<script src="../../../mootools/js/mootools.js"></script> <!-- LSJS requires mootools -->

		<script src="<?php echo str_replace(__DIR__ . '/', '', $coreBinder->getPathToRenderedFile()); ?>"></script>
		<script src="<?php echo str_replace(__DIR__ . '/', '', $appBinder->getPathToRenderedFile()); ?>"></script>
	</head>
	<body>
	</body>
</html>
