<?php
session_start();
$_SESSION['mode'] = ($_SESSION['mode'] == 'IN') ? 'OUT' : 'IN';
echo json_encode(['mode'=>$_SESSION['mode']]);
?>