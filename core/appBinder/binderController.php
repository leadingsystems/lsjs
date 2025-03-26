<?php
include('binderFunctions.php');
include('templateConverter.php');
include('modelCombiner.php');

class lsjs_binderController {
	const c_str_pathToCore = __DIR__ . '/..';
	
	const c_str_pathToModules = 'modules';
	const c_str_pathToModels = 'models';
	const c_str_pathToTemplates = 'templates';

	const c_str_defaultPathForRenderedFiles = __DIR__ . '/../../cache';

	const c_str_viewFileName = 'view.js';
	const c_str_controllerFileName = 'controller.js';
	
	const c_str_appFileName = 'app.js';
	
	const c_str_lsjsFileName = 'lsjs.js';
	const c_str_lsjsTemplateHandlerFileName = 'lsjs_templateHandler.js';
	const c_str_lsVersionFileName = 'ls_version.txt';
	
	const c_str_pathToAppBinderBaseFiles = __DIR__ . '/baseFiles';
	const c_str_mainContainerBasisFileName = 'mainContainer.js';
	const c_str_templateBasisFileName = 'templateBasis.js';
	const c_str_modelBasisFileName = 'modelBasis.js';
	const c_str_moduleBasisFileName = 'moduleBasis.js';
	
	protected $str_pathToRenderedFile = '';

	protected $arr_pathsToApps = [];
	protected $arr_pathsToCoreCustomizations = [];
	protected $str_pathForRenderedFiles = '';

	protected $str_useBlackOrWhitelist = '';
	protected $arr_moduleBlackOrWhitelist = array();
	
	protected $bln_includeCore = true;
	protected $bln_includeCoreModules = true;
	protected $bln_includeAppModules = true;
	protected $bln_includeApp = true;
	protected $bln_debugMode = false;
	protected $bln_useMinifier = true;

	protected $arr_files = array();
	protected $arr_moduleStructure = array();
	
	protected $str_output = '';

    private array $config;

    public function __construct($config = []) {
        $this->config = $config;
        $this->processParameters();
		$this->readAllFiles();
		$this->render();
    }

    private function getHash($str_additionalStringToHash = '')
    {
        $arr_pathsToCheck = [
            self::c_str_pathToAppBinderBaseFiles,
            self::c_str_pathToCore,
            $this->arr_pathsToApps,
            $this->arr_pathsToCoreCustomizations
        ];

        $arr_pathHashes = [];

        foreach ($arr_pathsToCheck as $var_pathToCheck) {
            if (is_array($var_pathToCheck)) {
                foreach ($var_pathToCheck as $str_path) {
                    $this->processPath($str_path, $arr_pathHashes);
                }
            } else {
                $this->processPath($var_pathToCheck, $arr_pathHashes);
            }
        }

        return md5(implode('', $arr_pathHashes) . $str_additionalStringToHash);
    }

    private function processPath($str_path, &$arr_pathHashes)
    {
        $str_path = trim($str_path);
        if (!empty($str_path)) {
            $arr_pathHashes[] = $this->hashDir($str_path);
        }
    }

	private function render()
    {
        /*
         * Since the filename of the file to render is a hash of everything that defines the content of the file,
         * it's safe to assume that if a file with this name already exists, it is exactly the same file that we
         * would render now, so we stop rendering and assume that the already existing file is what we want.
         */
        if (file_exists($this->str_pathToRenderedFile)) {
            return;
        }

        $this->str_output = lsjsBinder_file_get_contents(self::c_str_pathToAppBinderBaseFiles.'/'.self::c_str_mainContainerBasisFileName);
        $this->str_output = preg_replace('/__ls_version__/', (!$this->bln_includeCore ? '' : '/* '.$this->file_get_contents_envelope($this->arr_files['mainCoreFiles']['ls_version']).' */'), $this->str_output);
        $this->str_output = preg_replace('/__lsjs__/', (!$this->bln_includeCore ? '' : $this->file_get_contents_envelope($this->arr_files['mainCoreFiles']['lsjs'])), $this->str_output);
        $this->str_output = preg_replace('/__lsjs_templateHandler__/', (!$this->bln_includeCore ? '' : $this->file_get_contents_envelope($this->arr_files['mainCoreFiles']['lsjs_templateHandler'])), $this->str_output);
        $this->str_output = preg_replace('/__app__/', (!$this->bln_includeApp || !isset($this->arr_files['mainAppFile']) ? '' : $this->file_get_contents_envelope($this->arr_files['mainAppFile'])), $this->str_output);

        $this->generateModuleOutput('core');
        $this->generateModuleOutput('app');

        if ($this->bln_useMinifier) {
            $minifier_path = __DIR__.'/../../../../vendor/matthiasmullie';
            require_once $minifier_path . '/minify/src/Minify.php';
            require_once $minifier_path . '/minify/src/CSS.php';
            require_once $minifier_path . '/minify/src/JS.php';
            require_once $minifier_path . '/minify/src/Exception.php';
            require_once $minifier_path . '/minify/src/Exceptions/BasicException.php';
            require_once $minifier_path . '/minify/src/Exceptions/FileImportException.php';
            require_once $minifier_path . '/minify/src/Exceptions/IOException.php';
            require_once $minifier_path . '/path-converter/src/ConverterInterface.php';
            require_once $minifier_path . '/path-converter/src/Converter.php';


            $obj_minifier = new \MatthiasMullie\Minify\JS();
            $obj_minifier->add($this->str_output);
            $this->str_output = $obj_minifier->minify();
        }

        file_put_contents($this->str_pathToRenderedFile, $this->str_output);
    }
	
	public function getJS() {
        return file_get_contents($this->str_pathToRenderedFile);
	}

    protected function readAllFiles() {

        if ($this->bln_includeCore) {
            $this->arr_files['mainCoreFiles'] = array(
                'lsjs' => self::c_str_pathToCore . '/' . self::c_str_lsjsFileName,
                'lsjs_templateHandler' => self::c_str_pathToCore . '/' . self::c_str_lsjsTemplateHandlerFileName,
                'ls_version' => self::c_str_pathToCore . '/' . self::c_str_lsVersionFileName
            );
        }

        // Core-Module
        if ($this->bln_includeCoreModules) {
            $coreGroups = [];
            $coreGroups[] = $this->readModules(self::c_str_pathToCore . '/' . self::c_str_pathToModules);
            if (!empty($this->arr_pathsToCoreCustomizations) && is_array($this->arr_pathsToCoreCustomizations)) {
                foreach ($this->arr_pathsToCoreCustomizations as $customCorePath) {
                    $coreGroups[] = $this->readModules($customCorePath . '/' . self::c_str_pathToModules);
                }
            }
            $this->arr_files['coreModuleFiles'] = $this->combineMultipleModuleFileArrays($coreGroups);
        }

        // App Module
        if ($this->bln_includeAppModules) {
            $appGroups = [];
            if (!empty($this->arr_pathsToApps) && is_array($this->arr_pathsToApps)) {
                foreach ($this->arr_pathsToApps as $customAppPath) {
                    $potentialMainFilePath = $customAppPath . '/' . self::c_str_appFileName;

                    // Check if the file exists before setting it
                    if (file_exists($potentialMainFilePath)) {
                        $this->arr_files['mainAppFile'] = $potentialMainFilePath;
                    }

                    // Read modules from this path and add them to the appGroups array
                    $appGroups[] = $this->readModules($customAppPath . '/' . self::c_str_pathToModules);
                }
            }
            // Combine modules from different paths
            $this->arr_files['appModuleFiles'] = $this->combineMultipleModuleFileArrays($appGroups);
        }
    }


	/*
	 * the original module files array and the "customization module files" array have to be combined in such a way
	 * that the resulting array contains all modules that are defined in the two input array and that the content
	 * of the "customization module files" array is prioritized if there are overlaps.
	 */
    protected function combineMultipleModuleFileArrays(array $groups)
    {
        $combined = [];

        // Durchlaufe die Gruppen in der Reihenfolge der Priorität:
        foreach ($groups as $group) {
            foreach ($group as $moduleName => $moduleFiles) {
                // Existiert das Modul noch nicht in der kombinierten Liste, einfach hinzufügen:
                if (!isset($combined[$moduleName])) {
                    $combined[$moduleName] = $moduleFiles;
                }
                // Existiert das Modul bereits, dann einzelne Datei-Typen zusammenführen:
                else {
                    // Bei einfachen Dateien: Falls in der aktuellen Gruppe ein Wert gesetzt ist,
                    // überschreibe den bereits vorhandenen Wert.
                    if (!empty($moduleFiles['viewFile'])) {
                        $combined[$moduleName]['viewFile'] = $moduleFiles['viewFile'];
                    }
                    if (!empty($moduleFiles['controllerFile'])) {
                        $combined[$moduleName]['controllerFile'] = $moduleFiles['controllerFile'];
                    }

                    // Für Dateilisten (z.B. Templates, Models) – kombiniere unter Beachtung der Priorität.
                    $combined[$moduleName]['templateFiles'] = $this->mergeFileLists(
                        $combined[$moduleName]['templateFiles'],
                        $moduleFiles['templateFiles']
                    );
                    $combined[$moduleName]['modelFiles'] = $this->mergeFileLists(
                        $combined[$moduleName]['modelFiles'],
                        $moduleFiles['modelFiles']
                    );
                }
            }
        }
        return $combined;
    }

    protected function mergeFileLists(array $highPriority, array $lowPriority)
    {
        $merged = $highPriority;
        foreach ($lowPriority as $file) {
            if (!in_array($file, $merged)) {
                $merged[] = $file;
            }
        }
        return $merged;
    }

	protected function readCssFiles() {
		$this->readAllFiles();
	}
	
	protected function readModules($str_pathToModules, $arr_modules = array(), &$arr_moduleStructure = null) {
		if (!is_dir($str_pathToModules)) {
			return array();
		}

		$bln_isRootCall = false;
		
		if ($arr_moduleStructure === null) {
			$arr_moduleStructure = &$this->arr_moduleStructure;
			$bln_isRootCall = true;
		}
		
		if (!$bln_isRootCall) {
			if ($this->str_useBlackOrWhitelist) {
				switch ($this->str_useBlackOrWhitelist) {
					case 'white':
						if (!in_array(md5($str_pathToModules), $this->arr_moduleBlackOrWhitelist)) {
							return $arr_modules;
						}
						break;
						
					case 'black':
						if (in_array(md5($str_pathToModules), $this->arr_moduleBlackOrWhitelist)) {
							return $arr_modules;
						}
						break;
				}
			}
		}

		
		if (!isset($arr_moduleStructure[$bln_isRootCall ? 'allModules' : $str_pathToModules])) {
			$arr_moduleStructure[$bln_isRootCall ? 'allModules' : $str_pathToModules] = array(
				'str_hash' => $bln_isRootCall ? '' : md5($str_pathToModules),
				'str_path' => $bln_isRootCall ? '' : $str_pathToModules,
				'str_moduleName' => basename($str_pathToModules),
				'arr_children' => array()
			);
		}

		foreach(lsjsBinder_scandir($str_pathToModules) as $str_filename) {
			if (
					$str_filename === '.' || $str_filename === '..'
				||	!is_dir($str_pathToModules.'/'.$str_filename)
			) {
				continue;
			}
						
			$str_moduleName = $str_filename;
						
			/*
			 * ->
			 * If a module folder doesn't contain any of the usual module content (view file, controller file, templates
			 * folder, models folder), we assume that the folder is a module group folder and therefore
			 * we look for modules inside.
			 */
			if (
					!file_exists($str_pathToModules.'/'.$str_moduleName.'/'.self::c_str_controllerFileName)
				&&	!file_exists($str_pathToModules.'/'.$str_moduleName.'/'.self::c_str_viewFileName)
				&&	!file_exists($str_pathToModules.'/'.$str_moduleName.'/'.self::c_str_pathToTemplates)
				&&	!file_exists($str_pathToModules.'/'.$str_moduleName.'/'.self::c_str_pathToModels)
			) {
				$arr_modules = $this->readModules($str_pathToModules.'/'.$str_moduleName, $arr_modules, $arr_moduleStructure[$bln_isRootCall ? 'allModules' : $str_pathToModules]['arr_children']);
				continue;
			}
			/*
			 * <-
			 */
			
			if ($this->str_useBlackOrWhitelist) {
				switch ($this->str_useBlackOrWhitelist) {
					case 'white':
						if (!in_array(md5($str_pathToModules.'/'.$str_moduleName), $this->arr_moduleBlackOrWhitelist)) {
							continue 2;
						}
						break;
						
					case 'black':
						if (in_array(md5($str_pathToModules.'/'.$str_moduleName), $this->arr_moduleBlackOrWhitelist)) {
							continue 2;
						}
						break;
				}
			}
			
			$arr_moduleStructure[$bln_isRootCall ? 'allModules' : $str_pathToModules]['arr_children'][$str_pathToModules.'/'.$str_moduleName] = array(
				'str_hash' => md5($str_pathToModules.'/'.$str_moduleName),
				'str_path' => $str_pathToModules.'/'.$str_moduleName,
				'str_moduleName' => $str_moduleName,
				'arr_children' => array()
			);
			
			$arr_modules[$str_moduleName] = $this->readModuleFolders($str_pathToModules.'/'.$str_moduleName);
		}
		return $arr_modules;
	}
	
	protected function readModuleFolders($str_modulePath) {
		return array(
			'viewFile' => file_exists($str_modulePath.'/'.self::c_str_viewFileName) ? $str_modulePath.'/'.self::c_str_viewFileName : '',
			'controllerFile' => file_exists($str_modulePath.'/'.self::c_str_controllerFileName) ? $str_modulePath.'/'.self::c_str_controllerFileName : '',
			'modelFiles' => $this->readFiles($str_modulePath.'/'.self::c_str_pathToModels),
			'templateFiles' => $this->readFiles($str_modulePath.'/'.self::c_str_pathToTemplates)
		);
	}
	
	protected function readFiles($str_pathToFiles) {
		$arr_return = array();
		if (!file_exists($str_pathToFiles) || !is_dir($str_pathToFiles)) {
			return $arr_return;
		}
		
		foreach(scandir($str_pathToFiles) as $str_filename) {
			if (is_dir($str_pathToFiles.'/'.$str_filename)) {
				continue;
			}
			
			$arr_return[] = $str_pathToFiles.'/'.$str_filename;
		}
		
		return $arr_return;
	}
	
	protected function generateModelOutput($str_moduleName, $arr_modelFiles) {
		if (!is_array($arr_modelFiles) || !count($arr_modelFiles)) {
			return '';
		}
		
		try {
			$obj_modelCombiner = new modelCombiner(
				$str_moduleName,
				$arr_modelFiles,
				self::c_str_pathToAppBinderBaseFiles.'/'.self::c_str_modelBasisFileName
			);
			return $obj_modelCombiner->output();
		} catch (Exception $e) {
			return $e->getMessage();
		}
	}
	
	protected function generateTemplateOutput($str_moduleName, $arr_templateFiles) {
		if (!is_array($arr_templateFiles) || !count($arr_templateFiles)) {
			return '';
		}

		try {
			$obj_lsjs_templateConverter = new lsjs_templateConverter(
				$str_moduleName,
				$arr_templateFiles,
				self::c_str_pathToAppBinderBaseFiles.'/'.self::c_str_templateBasisFileName,
				$this->bln_debugMode
			);
			return $obj_lsjs_templateConverter->output();
		} catch (Exception $e) {
			return $e->getMessage();
		}
	}
	
	protected function generateModuleOutput($str_what) {
		if (!$str_what) {
			throw new Exception(__METHOD__.': $str_what not given');
		}
		
		if (!in_array($str_what, array('core', 'app'))) {
			throw new Exception(__METHOD__.': $str_what has unsupported value');
		}
		
		$str_completeModuleOutput = '';
		if (isset($this->arr_files[$str_what.'ModuleFiles']) && is_array($this->arr_files[$str_what.'ModuleFiles'])) {
			foreach($this->arr_files[$str_what.'ModuleFiles'] as $str_moduleName => $arr_moduleFiles) {
				$str_moduleOutput = lsjsBinder_file_get_contents(self::c_str_pathToAppBinderBaseFiles.'/'.self::c_str_moduleBasisFileName);
				$str_moduleOutput = preg_replace('/__viewFile__/', $this->file_get_contents_envelope($arr_moduleFiles['viewFile']), $str_moduleOutput);
				$str_moduleOutput = preg_replace('/__controllerFile__/', $this->file_get_contents_envelope($arr_moduleFiles['controllerFile']), $str_moduleOutput);

				$str_tmpOutput = $this->generateModelOutput($str_moduleName, $arr_moduleFiles['modelFiles']);
				$str_moduleOutput = preg_replace('/__modelFiles__/', $str_tmpOutput, $str_moduleOutput);

				$str_tmpOutput = $this->generateTemplateOutput($str_moduleName, $arr_moduleFiles['templateFiles']);
				$str_moduleOutput = preg_replace('/__templateFiles__/', $str_tmpOutput, $str_moduleOutput);

				$str_completeModuleOutput .= "\r\n".preg_replace('/__moduleName__/', $str_moduleName, $str_moduleOutput);
			}
		}
		$this->str_output = preg_replace('/__'.$str_what.'_modules__/', $str_completeModuleOutput, $this->str_output);
	}
	
	/*
	 * The only purpose of this function is to return the file path as a string
	 * instead of the complete file content in test cases.
	 */
	protected function file_get_contents_envelope($str_filePath) {
		$bln_testMode = false;
		if ($bln_testMode) {
			if (!file_exists($str_filePath)) {
				return 'FILE DOES NOT EXIST: '.$str_filePath;
			}
			return $str_filePath;
		}
		
		if (!file_exists($str_filePath)) {
			return '';
		}
		return lsjsBinder_file_get_contents($str_filePath);
	}
	
	public function setModuleWhitelist($str_list) {
		$this->arr_moduleBlackOrWhitelist = array_map('trim', explode(',', $str_list));
		if (count($this->arr_moduleBlackOrWhitelist)) {
			$this->str_useBlackOrWhitelist = 'white';
		}
	}
	
	public function setModuleBlacklist($str_list) {
		$this->arr_moduleBlackOrWhitelist = array_map('trim', explode(',', $str_list));
		if (count($this->arr_moduleBlackOrWhitelist)) {
			$this->str_useBlackOrWhitelist = 'black';
		}
	}
	
	public function getModuleStructure() {
		return $this->arr_moduleStructure;
	}
	
	public function getFileList() {
		return $this->arr_files;
	}

	public function getPathToRenderedFile()
    {
        return $this->str_pathToRenderedFile;
    }

    protected function createDefaultFolderForRenderedFilesIfNotExists() {
        if (!is_dir(self::c_str_defaultPathForRenderedFiles)) {
            mkdir(self::c_str_defaultPathForRenderedFiles);
        }
    }

    protected function handlePathForRenderedFiles()
    {
        /*
         * If the path for rendered files is not set because it wasn't given as a config parameter on instantiation,
         * we use the default path and create the respective folder if it doesn't exist yet.
         */
        if (!$this->str_pathForRenderedFiles) {
            $this->createDefaultFolderForRenderedFilesIfNotExists();
            $this->str_pathForRenderedFiles = self::c_str_defaultPathForRenderedFiles;
        } elseif (!file_exists($this->str_pathForRenderedFiles) || !is_dir($this->str_pathForRenderedFiles)) {
            throw new Exception('Path for rendered files does not exist or is not a directory: ' . $this->str_pathForRenderedFiles);
        }

        $this->str_pathForRenderedFiles = realpath($this->str_pathForRenderedFiles);
    }

    protected function processParameters() {
        $str_cacheStringRaw = '';

        //dump($this->config);

        if (isset($this->config['pathForRenderedFiles']) && $this->config['pathForRenderedFiles']) {
            $this->str_pathForRenderedFiles = $this->config['pathForRenderedFiles'];
        }

        $this->handlePathForRenderedFiles();

        if (isset($this->config['debug']) && $this->config['debug']) {
            $this->bln_debugMode = true;
        }
        $str_cacheStringRaw .= $this->bln_debugMode ? '1' : '0';


        if (isset($this->config['no-minifier']) && $this->config['no-minifier']) {
            $this->bln_useMinifier = false;
        }
        $str_cacheStringRaw .= $this->bln_useMinifier ? '1' : '0';

        if (isset($this->config['pathsToApps']) && $this->config['pathsToApps']) {
            $this->arr_pathsToApps = $this->config['pathsToApps'];
        }

        // This block is for backward compatibility and can be safely removed - start
        if (isset($this->config['pathToApp']) && $this->config['pathToApp']) {
            trigger_error('pathToApp is deprecated use pathsToApps instead', E_USER_DEPRECATED);
            $this->arr_pathsToApps = array_merge($this->arr_pathsToApps, [$this->config['pathToApp']]);
        }
        if (isset($this->config['pathToAppCustomization']) && $this->config['pathToAppCustomization']) {
            trigger_error('pathToAppCustomization is deprecated use pathsToCoreCustomizations instead', E_USER_DEPRECATED);
            $this->arr_pathsToApps = array_merge($this->arr_pathsToApps, [$this->config['pathToAppCustomization']]);
        }
        // This block is for backward compatibility and can be safely removed - end

        $str_cacheStringRaw .= implode(',', $this->arr_pathsToApps);


        if (isset($this->config['pathsToCoreCustomizations']) && $this->config['pathsToCoreCustomizations']) {
            $this->arr_pathsToCoreCustomizations = $this->config['pathsToCoreCustomizations'];
        }

        // This block is for backward compatibility and can be safely removed - start
        if (isset($this->config['pathToCoreCustomization']) && $this->config['pathToCoreCustomization']) {
            trigger_error('pathToCoreCustomization is deprecated use pathsToCoreCustomizations instead', E_USER_DEPRECATED);
            $this->arr_pathsToCoreCustomizations = array_merge( $this->arr_pathsToCoreCustomizations, [
                $this->config['pathToCoreCustomization']
            ]);
        }
        // This block is for backward compatibility and can be safely removed - end


        $str_cacheStringRaw .= implode(',', $this->arr_pathsToCoreCustomizations);

        if (isset($this->config['whitelist']) && $this->config['whitelist']) {
            $this->setModuleWhitelist($this->config['whitelist']);
            $str_cacheStringRaw .= $this->config['whitelist'];
        } else {
            $str_cacheStringRaw .= '-no-whitelist-';
        }


        if (isset($this->config['blacklist']) && $this->config['blacklist']) {
            $this->setModuleBlacklist($this->config['blacklist']);
            $str_cacheStringRaw .= $this->config['blacklist'];
        } else {
            $str_cacheStringRaw .= '-no-blacklist-';
        }


        if (isset($this->config['includeCore'])) {
            if ($this->config['includeCore'] == 'yes') {
                $this->bln_includeCore = true;
            } else {
                $this->bln_includeCore = false;
            }
        }
        $str_cacheStringRaw .= $this->bln_includeCore ? '1' : '0';


        if (isset($this->config['includeCoreModules'])) {
            if ($this->config['includeCoreModules'] == 'yes') {
                $this->bln_includeCoreModules = true;
            } else {
                $this->bln_includeCoreModules = false;
            }
        }
        $str_cacheStringRaw .= $this->bln_includeCoreModules ? '1' : '0';


        if (isset($this->config['includeAppModules'])) {
            if ($this->config['includeAppModules'] == 'yes') {
                $this->bln_includeAppModules = true;
            } else {
                $this->bln_includeAppModules = false;
            }
        }
        $str_cacheStringRaw .= $this->bln_includeAppModules ? '1' : '0';


        if (isset($this->config['includeApp'])) {
            if ($this->config['includeApp'] == 'yes') {
                $this->bln_includeApp = true;
            } else {
                $this->bln_includeApp = false;
            }
        }
        $str_cacheStringRaw .= $this->bln_includeApp ? '1' : '0';


        $this->str_pathToRenderedFile = $this->str_pathForRenderedFiles . '/lsjs_' . $this->getHash($str_cacheStringRaw) . '.js';
    }

    protected function hashDir($str_dir) {
        if (!is_dir($str_dir)) {
            return '';
        }

        $arr_fileHashes = [];
        $obj_dir = dir($str_dir);

        while (false !== ($str_file = $obj_dir->read())) {
            if ($str_file == '.' || $str_file == '..') {
                continue;
            }

            $str_filePath = $str_dir . '/' . $str_file;

            if (is_dir($str_filePath)) {
                $arr_fileHashes[] = $this->hashDir($str_filePath);
            } else {
                $arr_fileHashes[] = md5_file($str_filePath);
            }
        }

        $obj_dir->close();

        return md5(implode('', $arr_fileHashes));
    }

}