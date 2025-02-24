<?php
session_start();
include_once '../db.php';

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    $conn->begin_transaction();

    // Delete availability (will be cascade deleted, but being explicit)
    $stmt = $conn->prepare("DELETE FROM therapist_availability WHERE therapist_id = ?");
    $stmt->bind_param("i", $data['id']);
    $stmt->execute();

    // Delete therapist
    $stmt = $conn->prepare("DELETE FROM therapists WHERE therapist_id = ?");
    $stmt->bind_param("i", $data['id']);
    
    if(!$stmt->execute()) {
        throw new Exception("Failed to delete therapist");
    }

    $conn->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
