<?php
header('Content-Type: application/json');

$folder = "pictures/";
$files = glob($folder . "*.{jpg,jpeg,png}", GLOB_BRACE);

// Only send the relative path for each image
$images = [];
foreach($files as $file){
    $images[] = $file;
}

echo json_encode($images);
?>
