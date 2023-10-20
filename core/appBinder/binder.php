<?php
/*
 * ## PLEASE NOTE ##
 *
 * This file is only necessary when LSJS is being used in the legacy way by directly referencing the binder.php as the
 * source of a script tag.
 *
 * It is strongly suggested not to do that anymore but instead use the binderController to render the JS file and then
 * reference the JS file in a script using whatever way your framework might offer.
 */

include('binderController.php');
$obj_binder = new lsjs_binder();
$obj_binder->run();

class lsjs_binder {
    private $arr_config = [];

    public function run()
    {
        $this->arr_config = [
            'debug' => $_GET['debug'] ?? null,
            'no-cache' => $_GET['no-cache'] ?? null,
            'no-minifier' => $_GET['no-minifier'] ?? null,
            'pathToApp' => (isset($_GET['pathToApp']) && $_GET['pathToApp'] ? $this->replaceDirectoryUpAbbreviationAndGetAbsolutePath($_GET['pathToApp']) : null),
            'pathToAppCustomization' => (isset($_GET['pathToAppCustomization']) && $_GET['pathToAppCustomization'] ? $this->replaceDirectoryUpAbbreviationAndGetAbsolutePath($_GET['pathToAppCustomization']) : null),
            'pathToCoreCustomization' => (isset($_GET['pathToCoreCustomization']) && $_GET['pathToCoreCustomization'] ? $this->replaceDirectoryUpAbbreviationAndGetAbsolutePath($_GET['pathToCoreCustomization']) : null),
            'whitelist' => $_GET['whitelist'] ?? null,
            'blacklist' => $_GET['blacklist'] ?? null,
            'includeCore' => $_GET['includeCore'] ?? null,
            'includeCoreModules' => $_GET['includeCoreModules'] ?? null,
            'includeAppModules' => $_GET['includeAppModules'] ?? null,
            'includeApp' => $_GET['includeApp'] ?? null,
        ];

        $obj_lsjs_appBinder = new lsjs_binderController($this->arr_config);

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
    }

    /*
     * Since passing a url as a get parameter can cause the request to be blocked when there are many "folder up" parts
     * in the url (false positive for apache parent directory attack), we use a special keyword followed by a number
     * (e.g. _dup7_) to name the number of "folder ups" and then translate it into the correct "../../../.." part.
     */
    private function replaceDirectoryUpAbbreviationAndGetAbsolutePath($str_path)
    {
        $str_path = preg_replace_callback(
            '/_dup([0-9]+?)_/',
            function($arr_matches) {
                $arr_dirUp = array();
                for ($i = 1; $i <= $arr_matches[1]; $i++) {
                    $arr_dirUp[] = '..';
                }
                $str_dirUpPrefix = implode('/', $arr_dirUp);

                return $str_dirUpPrefix;
            },
            $str_path
        );

        $str_path = realpath(__DIR__ . '/' . $str_path);

        if (!$str_path) {
            die('LSJS app path not correct');
        }

        return $str_path;
    }
}