<?php
  $allowedHeaders = array_key_exists('HTTP_ACCESS_CONTROL_REQUEST_HEADERS', $_SERVER) ? $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] : '*';

  header('Access-Control-Allow-Origin: *');
  header("Access-Control-Allow-Methods: GET, OPTIONS, POST");
  header("Access-Control-Allow-Headers: $allowedHeaders");
  header('Access-Control-Max-Age: 1000');
  if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit;
?>

<!--% bOption %-->
<div class="bOption grid grid-5"><span></span></div>

<!--% bOption_overlay %-->
<div class="bOption-overlay" style="display: none;"></div>

<!--% close_filter_overlay %-->
<div class="close_filter_overlay">Close</div>

<!--% filter_input %-->
<div class="filter_input"><label><input type="checkbox"></label></div>

<!--% bTag %-->
<span class="bTag"><i class="fa fa-times"></i> </span>

<!--% clear_all_tags %-->
<span class="bTag clear_all">Clear All</span>

<!--% bResult %-->
<div class="bResult grid grid-4">
	<div class="bResult-content">
  	<div class="bResult-image"></div>
  	<div class="bResult-data">
    	<span class="display_group"></span>
    	<div class="program_title">
      	<span></span>
      	<a class="view_link" style="display: none;">View Program</a>
      </div>
      <div class="filter_results_holder">
      	<table cellpadding="0" cellspacing="0" border="0" class="filter_results">
<!--
        	<tr>
          	<td class="filter">Level</td>
          	<td class="value">Undergraduate</td>
        	</tr>
        	<tr>
          	<td class="filter">Instrument</td>
          	<td class="value">Guitar</td>
        	</tr>
        	<tr>
          	<td class="filter">Location</td>
          	<td class="value">Boston</td>
        	</tr>
-->
      	</table>
      </div>
  	</div>
	</div>
</div>