<?php

$host = "localhost";
$db   = "face_recognition";
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}
 
$data = json_decode(file_get_contents("php://input"), true);

$user = preg_replace("/[^a-zA-Z0-9]/", "", $data['user']);
$encoding = $data['encoding'];

$result = $conn->prepare("SELECT encodings FROM face_encodings WHERE username = ?");
$result->bind_param("s", $user);
$result->execute();
$result->bind_result($existing_json);
$result->fetch();
$result->close();
$folder = "ENCODING/$user";

if ($existing_json) {
    // Append new encoding
    $encodings_array = json_decode($existing_json, true);
    $encodings_array[] = $encoding;
    $updated_json = json_encode($encodings_array);

    $stmt = $conn->prepare("UPDATE face_encodings SET encodings = ?, created_at = CURRENT_TIMESTAMP WHERE username = ?");
    $stmt->bind_param("ss", $updated_json, $user);
} else {
    // Insert new user
    $updated_json = json_encode([$encoding]); // wrap in array
    $stmt = $conn->prepare("INSERT INTO face_encodings (username, encodings) VALUES (?, ?)");
    $stmt->bind_param("ss", $user, $updated_json);
}

if ($stmt->execute()) {
    echo json_encode(["status" => "saved"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
$stmt->close();
$conn->close();
echo json_encode(["status"=>"saved"]);

?>