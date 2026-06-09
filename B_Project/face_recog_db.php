<?php
header('Content-Type: application/json');

$host = "localhost";
$db   = "face_recognition";
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT username, encodings FROM face_encodings";
$result = $conn->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
    $encodings = json_decode($row['encodings'], true);

    if (is_array($encodings) && count($encodings) > 0) {
        $data[$row['username']] = $encodings;
    }
}

echo json_encode($data);
$conn->close();
exit;

?>