<?php

class modelCombiner {
	protected $str_moduleName = '';
	protected $str_modelsPath = '';
	protected $str_pathToBasisFile = '';
	
	protected $arr_modelsContent = array();
	protected $str_jsOutput = '';
	
	public function __construct($str_moduleName, $str_modelsPath, $str_pathToBasisFile) {
		$this->str_moduleName = $str_moduleName;
		$this->str_modelsPath = $str_modelsPath;
		$this->str_pathToBasisFile = $str_pathToBasisFile;
		
		if (!$this->str_moduleName) {
			throw new Exception('no module name given');
		}
		
		if (!$this->str_modelsPath) {
			throw new Exception('no models path given');
		}
		
		if (!file_exists($this->str_modelsPath) || !is_dir($this->str_modelsPath)) {
			throw new Exception('no models folder found for module "'.$this->str_moduleName.'"');
		}
		
		if (!$this->str_pathToBasisFile) {
			throw new Exception('no model basis file given');
		}
		
		if (!file_exists($this->str_pathToBasisFile)) {
			throw new Exception('no model basis file found for module "'.$this->str_moduleName.'"');
		}
		
		$this->readModelsContent();
		$this->insertRenderedModelsIntoJsOutput();
	}
	
	protected function readModelsContent() {
		foreach(scandir($this->str_modelsPath) as $str_filename) {
			if ($str_filename === '.' || $str_filename === '..') {
				continue;
			}
			$str_modelName = pathinfo($str_filename, PATHINFO_FILENAME);
			$this->arr_modelsContent[$str_modelName] = lsjsBinder_file_get_contents($this->str_modelsPath.'/'.$str_filename);
		}
	}
	
	protected function insertRenderedModelsIntoJsOutput() {
		foreach($this->arr_modelsContent as $str_modelContent) {
			$str_tmp_jsOutput = lsjsBinder_file_get_contents($this->str_pathToBasisFile);
			$str_tmp_jsOutput = preg_replace('/__moduleName__/', $this->str_moduleName, $str_tmp_jsOutput);
			$str_tmp_jsOutput = preg_replace('/__modelCode__/', $str_modelContent, $str_tmp_jsOutput);
			$this->str_jsOutput .= $str_tmp_jsOutput."\r\n\r\n\r\n\r\n";
		}
	}
	
	public function output() {
		return $this->str_jsOutput ? $this->str_jsOutput : '';
	}
};