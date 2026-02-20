<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(0);

$dir = "./ENCODING";
if(!is_dir($dir)){
    echo json_encode([]);
    exit;
}

$folders = array_values(array_filter(scandir($dir), function($f) use ($dir) {
    return $f !== '.' && $f !== '..' && is_dir("$dir/$f");
}));

$result = [];

foreach ($folders as $folder) {
    $files = glob("$dir/$folder/*.json");
    $encodings = [];
    foreach ($files as $file) {
        $content = file_get_contents($file);
        if($content){
            $encoding = json_decode($content, true);
            if($encoding) $encodings[] = $encoding;
        }
    }
    if(count($encodings) > 0){
        $result[$folder] = $encodings;
    }
}

echo json_encode($result);
exit;
?>