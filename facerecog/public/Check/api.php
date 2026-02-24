<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

include 'db.php';
session_start();

$action = $_GET['action'] ?? '';

// ---------------- GET SYSTEM MODE ----------------
if($action === 'get_mode'){
    $_SESSION['mode'] = 'IN'; // always default to TIME IN on refresh
    echo json_encode(['mode'=>$_SESSION['mode']]);
    exit;
}
// ---------------- TOGGLE SYSTEM MODE ----------------
if($action === 'toggle_mode'){
    $_SESSION['mode'] = ($_SESSION['mode']==='IN') ? 'OUT' : 'IN';
    echo json_encode(['mode'=>$_SESSION['mode']]);
    exit;
}

// ---------------- GET STUDENTS WITH STATUS ----------------
if($action === 'get_students'){

    $date = $_GET['date'] ?? date('Y-m-d'); // default today

    $sql = "
    SELECT s.id, s.name,
    CASE
        WHEN last_log.time_In IS NULL AND last_log.time_Out IS NULL THEN '---'
        WHEN last_log.time_In IS NOT NULL AND last_log.time_Out IS NULL THEN 'Present'
        WHEN last_log.time_In IS NOT NULL AND last_log.time_Out IS NOT NULL THEN 'Going home'
        WHEN last_log.time_In IS NULL AND last_log.time_Out IS NOT NULL THEN 'Late'
        ELSE '---'
    END AS status
    FROM students s
    LEFT JOIN (
        SELECT l1.*
        FROM log l1
        INNER JOIN (
            SELECT student_id, MAX(id_log) AS last_id
            FROM log
            WHERE DATE(schedule) = ?
            GROUP BY student_id
        ) l2 ON l1.id_log = l2.last_id
    ) last_log ON s.id = last_log.student_id
    ORDER BY s.name ASC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $date);
    $stmt->execute();
    $res = $stmt->get_result();
    $data = [];
    while($row = $res->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
    exit;
}

// ---------------- GET LOGS ----------------
if($action==='get_logs'){
    $sql = "SELECT l.id_log, s.name, l.lab, l.schedule, l.time_In, l.time_Out
            FROM log l
            LEFT JOIN students s ON s.id=l.student_id
            ORDER BY l.id_log DESC";
    $res = $conn->query($sql);
    $data=[];
    while($row = $res->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
    exit;
}

// ---------------- PROCESS TIME IN / TIME OUT ----------------
if($action==='process'){
    $id = intval($_POST['student_id']);
    $schedule = $_POST['schedule'] ?? '';
    $mode = $_SESSION['mode'] ?? 'IN';
    $lab = 'LAB1';

    if($mode==='IN'){
        // Insert TIME IN
        $check = $conn->query("SELECT id_log FROM log WHERE student_id=$id AND DATE(schedule)='".date('Y-m-d', strtotime($schedule))."' AND time_Out IS NULL");
        if($check->num_rows==0){
            $stmt=$conn->prepare("INSERT INTO log (student_id, lab, schedule, time_In) VALUES (?,?,?,NOW())");
            $stmt->bind_param("iss",$id,$lab,$schedule);
            $stmt->execute();
        }
    } else {
        // TIME OUT: update last TIME IN if exists, else create TIME OUT only
        $check = $conn->query("SELECT id_log FROM log WHERE student_id=$id AND DATE(schedule)='".date('Y-m-d', strtotime($schedule))."' AND time_Out IS NULL");

        if($check->num_rows > 0){
            $stmt = $conn->prepare("UPDATE log SET time_Out=NOW(), schedule=? WHERE student_id=? AND time_Out IS NULL ORDER BY id_log DESC LIMIT 1");
            $stmt->bind_param("si",$schedule,$id);
            $stmt->execute();
        } else {
            $stmt = $conn->prepare("INSERT INTO log (student_id, lab, schedule, time_Out) VALUES (?,?,?,NOW())");
            $stmt->bind_param("iss",$id,$lab,$schedule);
            $stmt->execute();
        }
    }

    echo json_encode(['status'=>'ok']);
    exit;
}
// ==========================
// FACE SCAN LOGGING API
// ==========================
if($action === 'face_scan'){
    $username = $_POST['username'];

    $stmt = $conn->prepare("SELECT id FROM students WHERE name=? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $res = $stmt->get_result();

    if($res->num_rows === 0){
        echo json_encode(['status'=>'error','msg'=>'Student not found']);
        exit;
    }

    $row = $res->fetch_assoc();
    $id = $row['id'];

    $schedule = $_POST['schedule'] ?? date('Y-m-d H:i');
    $mode = $_SESSION['mode'] ?? 'IN';

    if($mode === 'IN'){
        $stmt = $conn->prepare("INSERT INTO log (student_id, lab, schedule, time_In) VALUES (?,?,?,NOW())");
        $lab = 'LAB1';
        $stmt->bind_param("iss",$id,$lab,$schedule);
        $stmt->execute();
        echo json_encode(['status'=>'in','name'=>$username]);
        exit;
    }

    if($mode === 'OUT'){
        $check = $conn->query("SELECT id_log FROM log WHERE student_id=$id AND time_Out IS NULL ORDER BY id_log DESC LIMIT 1");

        if($check->num_rows > 0){
            $stmt = $conn->prepare("UPDATE log SET time_Out=NOW(), schedule=? WHERE student_id=? AND time_Out IS NULL ORDER BY id_log DESC LIMIT 1");
            $stmt->bind_param("si",$schedule,$id);
            $stmt->execute();
        } else {
            $stmt = $conn->prepare("INSERT INTO log (student_id, lab, schedule, time_Out) VALUES (?,?,?,NOW())");
            $lab = 'LAB1';
            $stmt->bind_param("iss",$id,$lab,$schedule);
            $stmt->execute();
        }

        echo json_encode(['status'=>'out','name'=>$username]);
        exit;
    }
}

// ---------------- INVALID REQUEST ----------------
echo json_encode(['error'=>'Invalid API request']);
exit;

?>