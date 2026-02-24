<?php
include '../db.php';

$data = [];

$sql = "
SELECT s.id, s.name,
CASE 
    WHEN l.time_Out IS NULL THEN 'IN'
    ELSE 'OUT'
END AS status
FROM students s
LEFT JOIN log l ON s.id = l.student_id
AND l.id_log = (
    SELECT MAX(id_log) FROM log WHERE student_id = s.id
)
ORDER BY s.name ASC
";

$result = $conn->query($sql);

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);
?>