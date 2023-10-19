<?php
include('binderController.php');

$arr_config = [
    'debug' => $_GET['debug'] ?? null,
    'no-cache' => $_GET['no-cache'] ?? null,
    'no-minifier' => $_GET['no-minifier'] ?? null,
    'pathToApp' => $_GET['pathToApp'] ?? null,
    'pathToAppCustomization' => $_GET['pathToAppCustomization'] ?? null,
    'pathToCoreCustomization' => $_GET['pathToCoreCustomization'] ?? null,
    'whitelist' => $_GET['whitelist'] ?? null,
    'blacklist' => $_GET['blacklist'] ?? null,
    'includeCore' => $_GET['includeCore'] ?? null,
    'includeCoreModules' => $_GET['includeCoreModules'] ?? null,
    'includeAppModules' => $_GET['includeAppModules'] ?? null,
    'includeApp' => $_GET['includeApp'] ?? null,
];

$obj_lsjs_appBinder = new lsjs_binderController($arr_config);

if (!isset($_GET['output'])) {
	die('Output parameter not given');
}

switch($_GET['output']) {
	case 'js':
        header("Content-Type: application/javascript");
		echo $obj_lsjs_appBinder->getJS();
		exit;
		break;
	
	case 'moduleStructure':
		header("Content-Type: text/plain");
		$arr_moduleList = $obj_lsjs_appBinder->getModuleStructure();
		print_r($arr_moduleList);
		exit;
		break;
	
	case 'fileList':
		header("Content-Type: text/plain");
		$arr_fileList = $obj_lsjs_appBinder->getFileList();
		print_r($arr_fileList);
		exit;
		break;
	
	default:
		die('Output parameter has unsupported value');
		break;
}
