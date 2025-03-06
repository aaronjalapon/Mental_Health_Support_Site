<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit();
}

if (!isset($_SESSION['unique_id'])) {
    echo json_encode(['success' => false, 'error' => 'User not authenticated']);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid request data']);
    exit();
}

// Validate required fields
$required_fields = ['therapist_id', 'appointment_date', 'appointment_time', 'session_type'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
        exit();
    }
}

try {
    // Check if therapist is available at the requested time
    $check_sql = "SELECT * FROM therapist_availability 
                  WHERE therapist_id = ? 
                  AND LOWER(day) = LOWER(DAYNAME(?))
                  AND ? BETWEEN start_time AND end_time
                  AND NOT EXISTS (
                      SELECT 1 FROM appointments 
                      WHERE therapist_id = ? 
                      AND appointment_date = ? 
                      AND appointment_time = ?
                      AND status != 'cancelled'
                  )";

    $stmt = $conn->prepare($check_sql);
    $stmt->bind_param(
        "isssss", 
        $data['therapist_id'], 
        $data['appointment_date'], 
        $data['appointment_time'],
        $data['therapist_id'],
        $data['appointment_date'],
        $data['appointment_time']
    );
    
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Selected time slot is not available']);
        exit();
    }

    // Insert the appointment
    $sql = "INSERT INTO appointments (
                client_id, 
                therapist_id, 
                appointment_date, 
                appointment_time, 
                session_type, 
                notes, 
                status
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending')";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "iissss",
        $_SESSION['client_id'],
        $data['therapist_id'],
        $data['appointment_date'],
        $data['appointment_time'],
        $data['session_type'],
        $data['notes']
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Appointment scheduled successfully',
            'appointment_id' => $stmt->insert_id
        ]);
    } else {
        throw new Exception("Failed to schedule appointment");
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
