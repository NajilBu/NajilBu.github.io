<?php
session_start();
if(!isset($_SESSION['mode'])) $_SESSION['mode'] = 'IN';
echo json_encode(['mode'=>$_SESSION['mode']]);
?>