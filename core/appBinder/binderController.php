<?php
include('binderFunctions.php');
include('templateConverter.php');
include('modelCombiner.php');

class lsjs_binderController {
	const c_str_pathToCore = '..';
	
	const c_str_pathToModules = 'modules';
	const c_str_pathToModels = 'models';
	const c_str_pathToStyles = 'styles';
	const c_str_pathToTemplates = 'templates';
	const c_str_pathToMasterStyles = 'styles';

	const c_str_pathToCache = 'cache';

	const c_str_viewFileName = 'view.js';
	const c_str_controllerFileName = 'controller.js';
	
	const c_str_appFileName = 'app.js';
	
	const c_str_lsjsFileName = 'lsjs.js';
	const c_str_lsjsTemplateHandlerFileName = 'lsjs_templateHandler.js';
	const c_str_lsVersionFileName = 'ls_version.txt';
	
	const c_str_pathToAppBinderBaseFiles = 'baseFiles';
	const c_str_mainContainerBasisFileName = 'mainContainer.js';
	const c_str_templateBasisFileName = 'templateBasis.js';
	const c_str_modelBasisFileName = 'modelBasis.js';
	const c_str_moduleBasisFileName = 'moduleBasis.js';
	
	const c_str_templatesPath = 'resources/lsjs/app/modules/%s/templates';

	protected $str_cacheHash = '';

	protected $str_pathToApp = '';
	protected $str_pathToAppCustomization = '';
	protected $str_pathToCoreCustomization = '';

	protected $str_useBlackOrWhitelist = '';
	protected $arr_moduleBlackOrWhitelist = array();
	
	protected $bln_includeCore = true;
	protected $bln_includeCoreModules = true;
	protected $bln_includeAppModules = true;
	protected $bln_includeApp = true;
	protected $bln_includeMasterStyleFiles = true;
	protected $bln_debugMode = false;
	protected $bln_useMinifier = true;
	protected $bln_useCache = true;


	protected $arr_files = array();
	protected $arr_moduleStructure = array();
	
	protected $str_output = '';
	
	public function __construct() {
		$this->createCacheFolderIfNotExists();
		$this->processGetParameters();
		$this->readAllFiles();
	}

	protected function createCacheFolderIfNotExists() {
		if (!is_dir(self::c_str_pathToCache)) {
			mkdir(self::c_str_pathToCache);
		}
	}
	
	public function outputJS() {
		header("Content-Type: application/javascript");

		$str_pathToCacheFile = self::c_str_pathToCache.'/'.$this->str_cacheHash.'.js';

		if ($this->bln_useCache) {
			if (file_exists($str_pathToCacheFile)) {
				echo "/* FROM CACHE */\r\n" . file_get_contents($str_pathToCacheFile);
				exit;
			}
		}
		
		$this->str_output = lsjsBinder_file_get_contents(self::c_str_pathToAppBinderBaseFiles.'/'.self::c_str_mainContainerBasisFileName);
		$this->str_output = preg_replace('/__ls_version__/', (!$this->bln_includeCore ? '' : '/* '.$this->file_get_contents_envelope($this->arr_files['mainCoreFiles']['ls_version']).' */'), $this->str_output);
		$this->str_output = preg_replace('/__lsjs__/', (!$this->bln_includeCore ? '' : $this->file_get_contents_envelope($this->arr_files['mainCoreFiles']['lsjs'])), $this->str_output);
		$this->str_output = preg_replace('/__lsjs_templateHandler__/', (!$this->bln_includeCore ? '' : $this->file_get_contents_envelope($this->arr_files['mainCoreFiles']['lsjs_templateHandler'])), $this->str_output);
		$this->str_output = preg_replace('/__app__/', (!$this->bln_includeApp || !isset($this->arr_files['mainAppFile']) ? '' : $this->file_get_contents_envelope($this->arr_files['mainAppFile'])), $this->str_output);

		$this->generateModuleOutput('core');
		$this->generateModuleOutput('app');

		if ($this->bln_useMinifier) {
			$minifier_path = '../../../../vendor/matthiasmullie';
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

		if ($this->bln_useCache) {
			file_put_contents($str_pathToCacheFile, $this->str_output);
		}

		echo $this->str_output;
		exit;
	}
	
	public function outputCSS() {
		header("Content-Type: text/css");

		$str_pathToCacheFile = self::c_str_pathToCache.'/'.$this->str_cacheHash.'.css';

		if ($this->bln_useCache) {
			if (file_exists($str_pathToCacheFile)) {
				echo "/* FROM CACHE */\r\n" . file_get_contents($str_pathToCacheFile);
				exit;
			}
		}

		if ($this->bln_includeMasterStyleFiles) {
			foreach ($this->arr_files['masterStyleFiles'] as $str_filePath) {
				if (!file_exists($str_filePath)) {
					continue;
				}
				
				$this->str_output .= "\r\n\r\n\r\n\r\n/*\r\n";
				$this->str_output .= 'MASTER STYLE FILE "'.pathinfo($str_filePath, PATHINFO_BASENAME).'"';
				$this->str_output .= "\r\n*/\r\n\r\n";
				$this->str_output .= $this->file_get_contents_envelope($str_filePath);
			}
		}
		
		$this->addModuleStylesheetsToOutput('core');
		$this->addModuleStylesheetsToOutput('app');

		if ($this->bln_useMinifier) {
			$minifier_path = '../../../../vendor/matthiasmullie';
			require_once $minifier_path . '/minify/src/Minify.php';
			require_once $minifier_path . '/minify/src/CSS.php';
			require_once $minifier_path . '/minify/src/JS.php';
			require_once $minifier_path . '/minify/src/Exception.php';
			require_once $minifier_path . '/minify/src/Exceptions/BasicException.php';
			require_once $minifier_path . '/minify/src/Exceptions/FileImportException.php';
			require_once $minifier_path . '/minify/src/Exceptions/IOException.php';
			require_once $minifier_path . '/path-converter/src/ConverterInterface.php';
			require_once $minifier_path . '/path-converter/src/Converter.php';


			$obj_minifier = new \MatthiasMullie\Minify\CSS();
			$obj_minifier->add($this->str_output);
			$this->str_output = $obj_minifier->minify();
		}

		if ($this->bln_useCache) {
			file_put_contents($str_pathToCacheFile, $this->str_output);
		}

		echo $this->str_output;
		exit;
	}
	
	protected function addModuleStylesheetsToOutput($str_what) {
		if (!$str_what) {
			throw new Exception(__METHOD__.': $str_what not given');
		}
		
		if (!in_array($str_what, array('core', 'app'))) {
			throw new Exception(__METHOD__.': $str_what has unsupported value');
		}
		
		if (isset($this->arr_files[$str_what.'ModuleFiles']) && is_array($this->arr_files[$str_what.'ModuleFiles'])) {
			foreach ($this->arr_files[$str_what.'ModuleFiles'] as $str_moduleName => $arr_moduleFiles) {
				sort($arr_moduleFiles['styleFiles']);
				foreach ($arr_moduleFiles['styleFiles'] as $str_filePath) {
					if (!file_exists($str_filePath)) {
						return;
					}

					$this->str_output .= "\r\n\r\n\r\n\r\n/*\r\n";
					$this->str_output .= 'MODULE "'.$str_moduleName.'"';
					$this->str_output .= "\r\n";
					$this->str_output .= 'STYLE FILE "'.pathinfo($str_filePath, PATHINFO_BASENAME).'"';
					$this->str_output .= "\r\n*/\r\n\r\n";
					$this->str_output .= $this->file_get_contents_envelope($str_filePath);
				}
			}
		}
	}
	
	protected function readAllFiles() {
		if ($this->bln_includeCore) {
			$this->arr_files['mainCoreFiles'] = array(
				'lsjs' => self::c_str_pathToCore.'/'.self::c_str_lsjsFileName,
				'lsjs_templateHandler' => self::c_str_pathToCore.'/'.self::c_str_lsjsTemplateHandlerFileName,
				'ls_version' => self::c_str_pathToCore.'/'.self::c_str_lsVersionFileName
			);
		}

		if ($this->bln_includeCoreModules) {
			$this->arr_files['coreModuleFiles_original'] = $this->readModules(self::c_str_pathToCore.'/'.self::c_str_pathToModules);
			$this->arr_files['coreModuleFiles_customization'] =
					$this->str_pathToCoreCustomization
				?	$this->readModules($this->str_pathToCoreCustomization.'/'.self::c_str_pathToModules)
				:	array();
			$this->arr_files['coreModuleFiles'] = $this->combineOriginalAndCustomizationModuleFiles('core');
		}

		if (!file_exists($this->str_pathToApp)) {
			return;
		}

		if ($this->bln_includeApp) {
			$this->arr_files['mainAppFile'] = file_exists($this->str_pathToAppCustomization.'/'.self::c_str_appFileName) ? $this->str_pathToAppCustomization.'/'.self::c_str_appFileName : $this->str_pathToApp.'/'.self::c_str_appFileName;
		}
		
		if ($this->bln_includeAppModules) {
			$this->arr_files['appModuleFiles_original'] = $this->readModules($this->str_pathToApp.'/'.self::c_str_pathToModules);
			$this->arr_files['appModuleFiles_customization'] = $this->str_pathToAppCustomization ? $this->readModules($this->str_pathToAppCustomization . '/' . self::c_str_pathToModules) : array();

			$this->arr_files['appModuleFiles'] = $this->combineOriginalAndCustomizationModuleFiles();
		}
		
		$this->arr_files['masterStyleFiles_original'] = $this->readFiles($this->str_pathToApp.'/'.self::c_str_pathToMasterStyles);
		$this->arr_files['masterStyleFiles_customization'] = $this->readFiles($this->str_pathToAppCustomization.'/'.self::c_str_pathToMasterStyles);
		$this->arr_files['masterStyleFiles'] = $this->combineOriginalAndCustomizationFileArrays(
			$this->arr_files['masterStyleFiles_original'],
			$this->arr_files['masterStyleFiles_customization']
		);
	}

	/*
	 * the original module files array and the "customization module files" array have to be combined in such a way
	 * that the resulting array contains all modules that are defined in the two input array and that the content
	 * of the "customization module files" array is prioritized if there are overlaps.
	 */
	protected function combineOriginalAndCustomizationModuleFiles($str_mode = 'app') {
		$arr_combinedModuleFiles = $str_mode === 'app' ? $this->arr_files['appModuleFiles_original'] : $this->arr_files['coreModuleFiles_original'];
		foreach (($str_mode === 'app' ? $this->arr_files['appModuleFiles_customization'] : $this->arr_files['coreModuleFiles_customization']) as $str_moduleName => $arr_customizationModuleFiles) {
			/*
			 * If there's a module defined in the customization files array that does not exist in the original files
			 * array, then we add it as a whole ...
			 */
			if (!key_exists($str_moduleName, $arr_combinedModuleFiles)) {
				$arr_combinedModuleFiles[$str_moduleName] = $arr_customizationModuleFiles;
			}

			/*
			 * ... but if the original files array already defines this module, we have to combine the module files
			 * and prioritize module files contained in the customization files array while still keeping files from
			 * the original files array that are not overriden by the customization files array.
			 */
			else {
				if ($arr_customizationModuleFiles['viewFile']) {
					$arr_combinedModuleFiles[$str_moduleName]['viewFile'] = $arr_customizationModuleFiles['viewFile'];
				}

				if ($arr_customizationModuleFiles['controllerFile']) {
					$arr_combinedModuleFiles[$str_moduleName]['controllerFile'] = $arr_customizationModuleFiles['controllerFile'];
				}

				$arr_combinedModuleFiles[$str_moduleName]['templateFiles'] = $this->combineOriginalAndCustomizationFileArrays(
					$arr_combinedModuleFiles[$str_moduleName]['templateFiles'],
					$arr_customizationModuleFiles['templateFiles'],
					$str_mode
				);

				$arr_combinedModuleFiles[$str_moduleName]['modelFiles'] = $this->combineOriginalAndCustomizationFileArrays(
					$arr_combinedModuleFiles[$str_moduleName]['modelFiles'],
					$arr_customizationModuleFiles['modelFiles'],
					$str_mode
				);

				$arr_combinedModuleFiles[$str_moduleName]['styleFiles'] = $this->combineOriginalAndCustomizationFileArrays(
					$arr_combinedModuleFiles[$str_moduleName]['styleFiles'],
					$arr_customizationModuleFiles['styleFiles'],
					$str_mode
				);
			}
		}
		return $arr_combinedModuleFiles;
	}

	protected function combineOriginalAndCustomizationFileArrays($arr_original, $arr_customization, $str_mode = 'app') {
		$arr_keysOfPositionsAlreadyDealtWith = array();

		$str_customizationPathToUse = $str_mode === 'app' ? $this->str_pathToAppCustomization : $this->str_pathToCoreCustomization;
		$str_originalPathToUse = $str_mode === 'app' ? $this->str_pathToApp : self::c_str_pathToCore;

		$arr_combined = $arr_original;
		/*
		 * Remove the front part of the file paths, which is different for the original files and the
		 * customization files, in order make the two arrays more easily comparable.
		 */
		array_walk(
			$arr_combined,
			function(&$str_filename) use ($str_originalPathToUse) {
				$str_filename = str_replace($str_originalPathToUse, '', $str_filename);
			}
		);

		array_walk(
			$arr_customization,
			function(&$str_filename) use ($str_customizationPathToUse) {
				$str_filename = str_replace($str_customizationPathToUse, '', $str_filename);
			}
		);

		foreach ($arr_customization as $str_customizationFilename) {
			$int_keyForPositionToReplace = array_search($str_customizationFilename, $arr_combined);
			if ($int_keyForPositionToReplace !== false) {
				$arr_combined[$int_keyForPositionToReplace] = $str_customizationPathToUse.$str_customizationFilename;
				$arr_keysOfPositionsAlreadyDealtWith[] = $int_keyForPositionToReplace;
			} else {
				$arr_combined[] = $str_customizationPathToUse.$str_customizationFilename;
				$arr_keysOfPositionsAlreadyDealtWith[] = count($arr_combined) - 1;
			}
		}

		foreach ($arr_combined as $int_key => $str_filename) {
			if (!in_array($int_key, $arr_keysOfPositionsAlreadyDealtWith)) {
				$arr_combined[$int_key] = $str_originalPathToUse.$str_filename;
			}
		}

		return $arr_combined;
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
			 * folder, models folder or styles folder), we assume that the folder is a module group folder and therefore
			 * we look for modules inside.
			 */
			if (
					!file_exists($str_pathToModules.'/'.$str_moduleName.'/'.self::c_str_controllerFileName)
				&&	!file_exists($str_pathToModules.'/'.$str_moduleName.'/'.self::c_str_viewFileName)
				&&	!file_exists($str_pathToModules.'/'.$str_moduleName.'/'.self::c_str_pathToTemplates)
				&&	!file_exists($str_pathToModules.'/'.$str_moduleName.'/'.self::c_str_pathToModels)
				&&	!file_exists($str_pathToModules.'/'.$str_moduleName.'/'.self::c_str_pathToStyles)
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
			'templateFiles' => $this->readFiles($str_modulePath.'/'.self::c_str_pathToTemplates),
			'styleFiles' => $this->readFiles($str_modulePath.'/'.self::c_str_pathToStyles)
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

	/*
	 * Since passing a url as a get parameter can cause the request to be blocked when there are many "folder up" parts
	 * in the url (false positive for apache parent directory attack), we use a special keyword followed by a number
	 * (e.g. _dup7_) to name the number of "folder ups" and then translate it into the correct "../../../.." part.
	 */
	protected function replaceDirectoryUpAbbreviation($str_url) {
		$str_url = preg_replace_callback(
			'/_dup([0-9]+?)_/',
			function($arr_matches) {
				$arr_dirUp = array();
				for ($i = 1; $i <= $arr_matches[1]; $i++) {
					$arr_dirUp[] = '..';
				}
				$str_dirUpPrefix = implode('/', $arr_dirUp);

				return $str_dirUpPrefix;
			},
			$str_url
		);

		return $str_url;
	}
	
	protected function processGetParameters() {
		$str_cacheStringRaw = '';

		if (isset($_GET['debug']) && $_GET['debug']) {
			$this->bln_debugMode = true;
		}
		$str_cacheStringRaw .= $this->bln_debugMode ? '1' : '0';


		if (isset($_GET['no-cache']) && $_GET['no-cache']) {
			$this->bln_useCache = false;
		}
		$str_cacheStringRaw .= $this->bln_useCache ? '1' : '0';


		if (isset($_GET['no-minifier']) && $_GET['no-minifier']) {
			$this->bln_useMinifier = false;
		}
		$str_cacheStringRaw .= $this->bln_useMinifier ? '1' : '0';


		if (isset($_GET['pathToApp']) && $_GET['pathToApp']) {
			$this->str_pathToApp = $this->replaceDirectoryUpAbbreviation($_GET['pathToApp']);
		}
		$str_cacheStringRaw .= $this->str_pathToApp;


		if (isset($_GET['pathToAppCustomization']) && $_GET['pathToAppCustomization']) {
			$this->str_pathToAppCustomization = $this->replaceDirectoryUpAbbreviation($_GET['pathToAppCustomization']);
		}
		$str_cacheStringRaw .= $this->str_pathToAppCustomization;


		if (isset($_GET['pathToCoreCustomization']) && $_GET['pathToCoreCustomization']) {
			$this->str_pathToCoreCustomization = $this->replaceDirectoryUpAbbreviation($_GET['pathToCoreCustomization']);
		}
		$str_cacheStringRaw .= $this->str_pathToCoreCustomization;


		if (isset($_GET['whitelist']) && $_GET['whitelist']) {
			$this->setModuleWhitelist($_GET['whitelist']);
			$str_cacheStringRaw .= $_GET['whitelist'];
		} else {
			$str_cacheStringRaw .= '-no-whitelist-';
		}


		if (isset($_GET['blacklist']) && $_GET['blacklist']) {
			$this->setModuleBlacklist($_GET['blacklist']);
			$str_cacheStringRaw .= $_GET['blacklist'];
		} else {
			$str_cacheStringRaw .= '-no-blacklist-';
		}


		if (isset($_GET['includeCore'])) {
			if ($_GET['includeCore'] == 'yes') {
				$this->bln_includeCore = true;
			} else {
				$this->bln_includeCore = false;
			}
		}
		$str_cacheStringRaw .= $this->bln_includeCore ? '1' : '0';

		
		if (isset($_GET['includeCoreModules'])) {
			if ($_GET['includeCoreModules'] == 'yes') {
				$this->bln_includeCoreModules = true;
			} else {
				$this->bln_includeCoreModules = false;
			}
		}
		$str_cacheStringRaw .= $this->bln_includeCoreModules ? '1' : '0';


		if (isset($_GET['includeAppModules'])) {
			if ($_GET['includeAppModules'] == 'yes') {
				$this->bln_includeAppModules = true;
			} else {
				$this->bln_includeAppModules = false;
			}
		}
		$str_cacheStringRaw .= $this->bln_includeAppModules ? '1' : '0';


		if (isset($_GET['includeApp'])) {
			if ($_GET['includeApp'] == 'yes') {
				$this->bln_includeApp = true;
			} else {
				$this->bln_includeApp = false;
			}
		}
		$str_cacheStringRaw .= $this->bln_includeApp ? '1' : '0';

		
		if (isset($_GET['includeMasterStyleFiles'])) {
			if ($_GET['includeMasterStyleFiles'] == 'yes') {
				$this->bln_includeMasterStyleFiles = true;
			} else {
				$this->bln_includeMasterStyleFiles = false;
			}
		}
		$str_cacheStringRaw .= $this->bln_includeMasterStyleFiles ? '1' : '0';

		$this->str_cacheHash = md5($str_cacheStringRaw);
	}
}