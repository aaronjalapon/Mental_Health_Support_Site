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
    
    $sql = "INSERT INTO appointments (
                client_id, 
                therapist_id, 
                appointment_date, 
                appointment_time,
                session_type,
                status,
                notes
            ) VALUES (?, ?, ?, ?, ?, 'pending', ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "iissss",
        $data['clientId'],
        $data['therapistId'],
        $data['date'],
        $data['time'],
        $data['sessionType'],
        $data['notes']
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Appointment scheduled successfully'
        ]);
    } else {
        throw new Exception('Failed to schedule appointment');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
