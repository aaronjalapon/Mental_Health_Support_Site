<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit();
}

// Check if user is logged in and is a client
if(!isset($_SESSION['unique_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'client') {
    echo json_encode(['success' => false, 'error' => 'User not authenticated or not authorized']);
    exit();
}

// Get client_id from client table (not users)
try {
    $stmt = $conn->prepare("SELECT client_id FROM client WHERE unique_id = ? AND Role = 'client'");
    $stmt->bind_param("i", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Client not found']);
        exit();
    }
    
    $user = $result->fetch_assoc();
    $client_id = $user['client_id'];
    
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

    // Get day name from date for availability check
    $dayName = date('l', strtotime($data['appointment_date']));

    // Improved availability check
    $check_sql = "SELECT COUNT(*) as is_available 
                  FROM therapist_availability ta
                  WHERE ta.therapist_id = ? 
                  AND LOWER(ta.day) = LOWER(?)
                  AND ? >= ta.start_time 
                  AND ? <= ta.end_time
                  AND (ta.break_start IS NULL OR ? NOT BETWEEN ta.break_start AND ta.break_end)
                  AND NOT EXISTS (
                      SELECT 1 FROM appointments a 
                      WHERE a.therapist_id = ta.therapist_id 
                      AND a.appointment_date = ? 
                      AND a.appointment_time = ?
                      AND a.status NOT IN ('cancelled', 'rejected')
                  )";

    $stmt = $conn->prepare($check_sql);
    $stmt->bind_param(
        "issssss", 
        $data['therapist_id'], 
        $dayName,
        $data['appointment_time'],
        $data['appointment_time'], 
        $data['appointment_time'],
        $data['appointment_date'],
        $data['appointment_time']
    );
    
    $stmt->execute();
    $availability_result = $stmt->get_result();
    $availability = $availability_result->fetch_assoc();

    if ($availability['is_available'] == 0) {
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
    $notes = isset($data['notes']) ? $data['notes'] : '';
    $stmt->bind_param(
        "iissss",
        $client_id,
        $data['therapist_id'],
        $data['appointment_date'],
        $data['appointment_time'],
        $data['session_type'],
        $notes
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Appointment scheduled successfully',
            'appointment_id' => $stmt->insert_id
        ]);
    } else {
        throw new Exception("Failed to schedule appointment: " . $stmt->error);
    }

} catch (Exception $e) {
    error_log("Error in create_appointment.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();