<?php

$file = dirname(__FILE__) . '/output.txt';
$data = "hello, its ".date('d/m/Y H:i:s'). "\n";

file_put_contents($file, $data,FILE_APPEND);


?>