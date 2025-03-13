<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['appointmentId'])) {
        throw new Exception('Appointment ID is required');
    }

    $sql = "UPDATE appointments 
            SET session_type = ?, 
                appointment_date = ?,
                appointment_time = ?,
                status = ?,
                notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE appointment_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssi",
        $data['sessionType'],
        $data['date'],
        $data['time'],
        $data['status'],
        $data['notes'],
        $data['appointmentId']
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Appointment updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update appointment');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
