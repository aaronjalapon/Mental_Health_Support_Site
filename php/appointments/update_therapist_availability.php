<?php
session_start();
require_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'therapist') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Get therapist_id using unique_id
    $stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE unique_id = ?");
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $therapist = $result->fetch_assoc();

    if (!$therapist) {
        throw new Exception('Therapist not found');
    }

    $therapist_id = $therapist['therapist_id'];
    
    // Validate required data
    if (!isset($data['days']) || !is_array($data['days']) || empty($data['days'])) {
        throw new Exception('Please select at least one working day');
    }

    if (!isset($data['hours']['start']) || !isset($data['hours']['end'])) {
        throw new Exception('Working hours are required');
    }

    // Start transaction
    $conn->begin_transaction();

    // Delete existing availability
    $delete_sql = "DELETE FROM therapist_availability WHERE therapist_id = ?";
    $delete_stmt = $conn->prepare($delete_sql);
    $delete_stmt->bind_param("i", $therapist_id);
    $delete_stmt->execute();

    // Insert new availability
    $insert_sql = "INSERT INTO therapist_availability (therapist_id, day, start_time, end_time, break_start, break_end) 
                   VALUES (?, ?, ?, ?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_sql);

    foreach ($data['days'] as $day) {
        $break_start = $data['hours']['break']['start'] ?? null;
        $break_end = $data['hours']['break']['end'] ?? null;
        
        $insert_stmt->bind_param("isssss",
            $therapist_id,
            $day,
            $data['hours']['start'],
            $data['hours']['end'],
            $break_start,
            $break_end
        );
        $insert_stmt->execute();
    }

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Availability updated successfully']);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
    }
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
