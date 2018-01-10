<?php

/*
 * This function is mostly an alias for file_get_contents. The specialty is,
 * that, if the globally stored app path is the first part of the file path,
 * the working directory will be changed to the app path and the file will then
 * be read from this position. This is done to prevent file paths that are too
 * long because of a "../../.." part from exceeding the path limit (260 characters
 * in windows)
 */
function lsjsBinder_file_get_contents($str_filePath) {
	if (!$str_filePath) {
		return '';
	}

	$str_fileContent = file_get_contents(lsjsBinder_appPathFix_before($str_filePath));
	lsjsBinder_appPathFix_after();
	
	return $str_fileContent;
}

function lsjsBinder_scandir($str_filePath) {
	if (!$str_filePath) {
		return array();
	}

	$var_return = scandir(lsjsBinder_appPathFix_before($str_filePath));
	
	lsjsBinder_appPathFix_after();

	if ($var_return === false) {
		throw new Exception('could not find '.getcwd().'/'.$str_filePath.'; or it is not a directory.');
	}
	
	return $var_return;
}

function lsjsBinder_appPathFix_before($str_filePath) {
	$GLOBALS['lsjs']['appBinder']['appPathFix']['bln_switchedToAppDir'] = false;
	
	$GLOBALS['lsjs']['appBinder']['appPathFix']['str_currentDir'] = getcwd();
	if ($GLOBALS['lsjs']['appBinder']['appPathFix']['str_currentDir'] === false) {
		throw new Exception('getcwd() seems not to be supported.');
	}
	
	if (strpos($str_filePath, $GLOBALS['lsjs']['appBinder']['str_pathToApp']) === 0) {
		$str_filePath = str_replace($GLOBALS['lsjs']['appBinder']['str_pathToApp'].'/', '', $str_filePath);
		chdir($GLOBALS['lsjs']['appBinder']['str_pathToApp']);
		$GLOBALS['lsjs']['appBinder']['appPathFix']['bln_switchedToAppDir'] = true;
	}
	
	return $str_filePath;
}

function lsjsBinder_appPathFix_after() {
	if ($GLOBALS['lsjs']['appBinder']['appPathFix']['bln_switchedToAppDir']) {
		chdir($GLOBALS['lsjs']['appBinder']['appPathFix']['str_currentDir']);
	}
	
	unset($GLOBALS['lsjs']['appBinder']['appPathFix']);
}