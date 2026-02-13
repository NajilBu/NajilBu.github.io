<?php
$dir = "./IMAGE";
$folders = array_values(array_filter(scandir($dir), function($f) use ($dir) {
    return $f !== '.' && $f !== '..' && is_dir("$dir/$f");
}));

header('Content-Type: application/json');
echo json_encode($folders);
?>
