<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    $appointmentId = isset($_POST['appointmentId']) ? intval($_POST['appointmentId']) : 0;
    
    if (!$appointmentId) {
        throw new Exception('Invalid appointment ID');
    }

    $stmt = $conn->prepare("DELETE FROM appointments WHERE appointment_id = ?");
    $stmt->bind_param("i", $appointmentId);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Appointment deleted successfully'
        ]);
    } else {
        throw new Exception('Failed to delete appointment');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
