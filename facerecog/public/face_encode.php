<?php

$data = json_decode(file_get_contents("php://input"), true);

$user = preg_replace("/[^a-zA-Z0-9]/", "", $data['user']);
$num = intval($data['num']);
$image = $data['image'];

$folder = "IMAGE/$user";

if (!file_exists($folder)) {
    mkdir($folder, 0777, true);
}

$image = str_replace('data:image/jpeg;base64,', '', $image);
$image = base64_decode($image);

file_put_contents("$folder/$num.jpg", $image);

echo json_encode(["status"=>"saved"]);
?>
