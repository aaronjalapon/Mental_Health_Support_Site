<?php
session_start();
include_once '../db.php';

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    $stmt = $conn->prepare("UPDATE users SET 
        firstName = ?, 
        lastName = ?, 
        username = ?, 
        email = ?, 
        contactNumber = ?, 
        Pronouns = ?, 
        Address = ?, 
        Status = ? 
        WHERE unique_id = ?");
        
    $stmt->bind_param("sssssssss", 
        $data['firstName'],
        $data['lastName'],
        $data['username'],
        $data['email'],
        $data['contact'],
        $data['pronouns'],
        $data['address'],
        $data['status'],
        $data['id']
    );

    if($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Failed to update client']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
