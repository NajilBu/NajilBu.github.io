<?php
include '../db.php';
session_start();

$id = intval($_POST['student_id']);
$mode = $_SESSION['mode'];

$lab = "LAB1";
$schedule = "AUTO";

if($mode === 'IN'){
    $check = $conn->query("SELECT id_log FROM log WHERE student_id=$id AND time_Out IS NULL");

    if($check->num_rows == 0){
        $conn->query("INSERT INTO log (student_id,lab,schedule,time_In)
                       VALUES ($id,'$lab','$schedule',NOW())");
    }
}else{
    $conn->query("UPDATE log 
                   SET time_Out = NOW()
                   WHERE student_id=$id 
                   AND time_Out IS NULL
                   ORDER BY id_log DESC LIMIT 1");
}

echo json_encode(['status'=>'ok']);
?>