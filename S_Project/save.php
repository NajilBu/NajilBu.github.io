<?php

$folder = "pictures/";

if(!file_exists($folder)){
    mkdir($folder, 0777, true);
}

$filename = $folder . "photo_" . time() . ".jpg";

if(move_uploaded_file($_FILES['photo']['tmp_name'], $filename)){
    echo "Photo saved as: " . $filename;
} else {
    echo "Error saving photo.";
}   

?>