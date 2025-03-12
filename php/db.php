<?php
$host = "127.0.0.1";
$username = "root";
$password = "";
$database = "mentalhealthdb";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'code' => 'DB_ERROR'
    ]);
    exit;
}

$conn->set_charset("utf8mb4");
?>
