<?php

class lsjs_templateConverter {
	protected $str_moduleName = '';
	protected $arr_templateFiles = array();
	protected $str_pathToTemplateBasisFile = '';
	protected $bln_debugMode = false;
	
	protected $str_patternForSingleTemplatePartInBasisFile = '/\'__templateName__\'.*?\}/s';
	
	public $arr_templatesContent = array();
	public $arr_templatesPaths = array();
	protected $str_jsOutput = '';
	
	protected $int_maxNumTemplateInsertionRecursions = 3;
	public $int_processedInsertions = 0;
	
	public function __construct($str_moduleName, $arr_templateFiles, $str_pathToTemplateBasisFile, $bln_debugMode = false) {
		$this->str_moduleName = $str_moduleName;
		$this->arr_templateFiles = $arr_templateFiles;
		$this->str_pathToTemplateBasisFile = $str_pathToTemplateBasisFile;
		$this->bln_debugMode = $bln_debugMode;

		if (!$this->str_moduleName) {
			throw new Exception('no module name given');
		}
		
		if (!is_array($this->arr_templateFiles)) {
			throw new Exception('no template files array given');
		}
		
		if (!$this->str_pathToTemplateBasisFile) {
			throw new Exception('no template basis file given');
		}
		
		if (!file_exists($this->str_pathToTemplateBasisFile)) {
			throw new Exception('no template basis file found for module "'.$this->str_moduleName.'"');
		}
		
		$this->readTemplatesContent();
		$this->processTemplateInsertions();
		$this->renderTemplatesContent();
		$this->insertRenderedTemplatesIntoJsOutput();
	}
	
	protected function readTemplatesContent() {
		foreach($this->arr_templateFiles as $str_filePath) {
			$str_templateName = pathinfo($str_filePath, PATHINFO_FILENAME);
			$this->arr_templatesContent[$str_templateName] = lsjsBinder_file_get_contents($str_filePath);
			$this->arr_templatesPaths[$str_templateName] = $str_filePath;
		}
	}
	
	protected function processTemplateInsertions() {
		/*
		 * In order to support PHP < 5.4.0 we have to pass a reference to
		 * $this to the anonymous function in preg_replace_callback because
		 * before 5.4.0 no automatic binding will happen.
		 */
		$obj_thisPassThrough = $this;

		for ($i = 1; $i <= $this->int_maxNumTemplateInsertionRecursions; $i++) {
			$this->int_processedInsertions = 0;
			foreach($this->arr_templatesContent as $str_templateName => $str_templateContent) {
				$this->arr_templatesContent[$str_templateName] = preg_replace_callback(
					'/\{\{template::(.*)\}\}/siU',
					function($arr_matches) use ($obj_thisPassThrough) {
						$obj_thisPassThrough->int_processedInsertions++;
						return key_exists(trim($arr_matches[1]), $obj_thisPassThrough->arr_templatesContent) ? $obj_thisPassThrough->arr_templatesContent[trim($arr_matches[1])] : '### INCLUSION ERROR: template '.trim($arr_matches[1]).' can not be found for inclusion ###';
					},
					$str_templateContent
				);
			}
			
			/*
			 * If no insertions had to be processed in this round, there aren't
			 * any left, so there's no point in looking for them in the next round
			 * and therefore we stop processing the insertions even though the
			 * maximum number of recursions might not even be reached yet.
			 */
			if ($this->int_processedInsertions === 0) {
				break;
			}
		}
	}
	
	protected function renderTemplatesContent() {
		foreach($this->arr_templatesContent as $str_templateName => $str_templateContent) {
			/*
			 * First, we have to grab all the JS blocks and store them in an array
			 * (which automatically happens in the order of their appearance in
			 * the code.
			 */
			preg_match_all('/<\?.*?\?>/s', $str_templateContent, $arr_jsBlockMatches);
			$arr_jsBlockMatches = $arr_jsBlockMatches[0];
			
			# print_r($arr_jsBlockMatches);
			
			/*
			 * Second, we replace all JS block with a placeholder. We do this,
			 * so that the JS blocks are not present when line breaks are prefixed
			 * with a backslash because that must not happen inside of a JS block
			 */
			$str_templateContent = preg_replace('/<\?.*?\?>/s', '__JSBLOCK__', $str_templateContent);
			
			# echo $str_templateContent;
			# echo "\r\n\r\n\r\n\r\n";
			
			/*
			 * Then we add the backslash in front of each line break to create a
			 * valid multiline javascript string
			 */
			$str_templateContent = preg_replace("/([\n\r]+?)/","\\\\$1",$str_templateContent);

			# echo $str_templateContent;
			# echo "\r\n\r\n\r\n\r\n";
			
			/*
			 * Now we can insert the JS blocks back into the string. We do this
			 * one block after the other using a callback function
			 */
			$str_templateContent = preg_replace_callback(
				'/__JSBLOCK__/',
				function($arr_matches) use (&$arr_jsBlockMatches) {
					return array_shift($arr_jsBlockMatches);
				},
				$str_templateContent
			);
				
			# echo $str_templateContent;
			# echo "\r\n\r\n\r\n\r\n";
			
			/*
			 * Now we can translate our special JS block syntax into an actual
			 * JS string construction
			 */
			$str_templateContent = preg_replace('/<\?=/', "' +", $str_templateContent);
			$str_templateContent = preg_replace('/=\?>/', "+ '", $str_templateContent);
			$str_templateContent = preg_replace('/<\?/', "';", $str_templateContent);
			$str_templateContent = preg_replace('/\?>/', "str_return += '", $str_templateContent);
			$str_templateContent = preg_replace('/\?>/', "str_return += '", $str_templateContent);
			
			# echo $str_templateContent;
			# echo "\r\n\r\n\r\n\r\n";
			
			$this->arr_templatesContent[$str_templateName] = $str_templateContent;
		}
	}
	
	protected function insertRenderedTemplatesIntoJsOutput() {
		$this->str_jsOutput = lsjsBinder_file_get_contents($this->str_pathToTemplateBasisFile);
		$this->str_jsOutput = preg_replace('/__moduleName__/', $this->str_moduleName, $this->str_jsOutput);
		
		$arr_matches = array();
		preg_match($this->str_patternForSingleTemplatePartInBasisFile, $this->str_jsOutput, $arr_matches);
		$str_partForSingleTemplate = $arr_matches[0];
		
		$str_wholeTemplatePart = '';
		foreach($this->arr_templatesContent as $str_templateName => $str_templateContent) {
			$str_templateContent = preg_replace('/__templateCode__/', $str_templateContent, $str_partForSingleTemplate);
			$str_templateContent = preg_replace('/__templateName__/', $str_templateName, $str_templateContent);

			$str_templateInfoBegin = '';
			$str_templateInfoEnd = '';
			if ($this->bln_debugMode) {
				$str_templatesPathWithoutDirectoryUpPrefix = str_replace($_SERVER['HOME'] . '/' . $_SERVER['SERVER_NAME'] . '/', '', str_replace('../', '', $this->arr_templatesPaths[$str_templateName]));
				$str_templateInfoBegin = '<!-- BEGIN LSJS TEMPLATE: ' . $str_templatesPathWithoutDirectoryUpPrefix . ' -->';
				$str_templateInfoEnd = '<!-- END LSJS TEMPLATE: ' . $str_templatesPathWithoutDirectoryUpPrefix . ' -->';
			}

			$str_templateContent = preg_replace('/__templateInfoBegin__/', $str_templateInfoBegin, $str_templateContent);
			$str_templateContent = preg_replace('/__templateInfoEnd__/', $str_templateInfoEnd, $str_templateContent);

			if ($str_wholeTemplatePart) {
				$str_wholeTemplatePart = $str_wholeTemplatePart.",\r\n";
			}
			$str_wholeTemplatePart = $str_wholeTemplatePart.$str_templateContent;
		}
		
		$this->str_jsOutput = preg_replace($this->str_patternForSingleTemplatePartInBasisFile, $str_wholeTemplatePart, $this->str_jsOutput);
	}
	
	public function output() {
		return $this->str_jsOutput ? $this->str_jsOutput : '';
	}
};