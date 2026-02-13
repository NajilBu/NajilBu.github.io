<?php
header('Content-Type: application/json');

$files = glob("IMAGE/*.{jpg,jpeg,png}", GLOB_BRACE);

echo json_encode($files);
?>
