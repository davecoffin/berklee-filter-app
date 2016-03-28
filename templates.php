<?php
  $allowedHeaders = array_key_exists('HTTP_ACCESS_CONTROL_REQUEST_HEADERS', $_SERVER) ? $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] : '*';

  header('Access-Control-Allow-Origin: *');
  header("Access-Control-Allow-Methods: GET, OPTIONS, POST");
  header("Access-Control-Allow-Headers: $allowedHeaders");
  header('Access-Control-Max-Age: 1000');
  if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit;
?>

