<?php

 $data = json_decode(file_get_contents("php://input"), true);

$user = preg_replace("/[^a-zA-Z0-9]/", "", $data['user']);
$num = intval($data['num']);
$encoding = $data['encoding'];

$folder = "ENCODING/$user";

if(!file_exists($folder)) {
    mkdir($folder, 0777, true);
}

file_put_contents("$folder/$num.json", json_encode($encoding));

echo json_encode(["status"=>"saved"]);

?>