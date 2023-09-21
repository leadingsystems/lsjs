<?php
include('binderController.php');
$obj_lsjs_appBinder = new lsjs_binderController();

if (!isset($_GET['output'])) {
	die('Output parameter not given');
}

switch($_GET['output']) {
	case 'js':
		$obj_lsjs_appBinder->getJS();
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
