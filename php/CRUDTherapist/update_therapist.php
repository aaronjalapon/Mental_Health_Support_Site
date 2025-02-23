<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    $input = file_get_contents('php://input');
    error_log("Raw input received: " . $input);
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    error_log("Decoded data: " . print_r($data, true));

    if (!isset($data['id']) || empty($data['id']) || $data['id'] === 'undefined') {
        throw new Exception('Invalid or missing therapist ID');
    }

    // Clean and validate the ID
    $therapist_id = filter_var($data['id'], FILTER_VALIDATE_INT);
    if ($therapist_id === false || $therapist_id <= 0) {
        throw new Exception("Invalid therapist ID format: " . var_export($data['id'], true));
    }

    // Begin transaction
    $conn->begin_transaction();

    // Verify therapist exists with detailed error
    $check_stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE therapist_id = ?");
    $check_stmt->bind_param("i", $therapist_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Therapist not found with ID: $therapist_id");
    }

    // Update therapist basic info
    $update_query = "UPDATE therapists SET 
        first_name = ?,
        last_name = ?,
        specialization = ?,
        experience_years = ?,
        email = ?,
        phone = ?,
        bio = ?,
        status = ?
        WHERE therapist_id = ?";

    $stmt = $conn->prepare($update_query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("sssissssi",
        $data['firstName'],
        $data['lastName'],
        $data['specialization'],
        $data['experience'],
        $data['email'],
        $data['phone'],
        $data['bio'],
        $data['status'],
        $therapist_id
    );

    if (!$stmt->execute()) {
        throw new Exception("Failed to update therapist information");
    }

    // Handle availability update
    $del_stmt = $conn->prepare("DELETE FROM therapist_availability WHERE therapist_id = ?");
    $del_stmt->bind_param("i", $therapist_id);
    $del_stmt->execute();

    if (!empty($data['availability']['days'])) {
        $avail_query = "INSERT INTO therapist_availability 
            (therapist_id, day, start_time, end_time, break_start, break_end) 
            VALUES (?, ?, ?, ?, ?, ?)";
        
        $avail_stmt = $conn->prepare($avail_query);
        
        foreach ($data['availability']['days'] as $day) {
            $break_start = !empty($data['availability']['hours']['break']['start']) 
                ? $data['availability']['hours']['break']['start'] 
                : null;
            
            $break_end = !empty($data['availability']['hours']['break']['end']) 
                ? $data['availability']['hours']['break']['end'] 
                : null;

            $avail_stmt->bind_param("isssss",
                $therapist_id,
                $day,
                $data['availability']['hours']['start'],
                $data['availability']['hours']['end'],
                $break_start,
                $break_end
            );
            
            if (!$avail_stmt->execute()) {
                throw new Exception("Failed to update availability for day: " . $day);
            }
        }
    }

    $conn->commit();
    echo json_encode([
        'success' => true,
        'message' => 'Therapist updated successfully',
        'therapist_id' => $therapist_id
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
    }
    error_log("Update error: " . $e->getMessage());
    http_response_code(400); // Set appropriate error status
    echo json_encode([
        'error' => $e->getMessage(),
        'debug_info' => [
            'received_data' => $data ?? null,
            'raw_input' => $input ?? null,
            'id_value' => $data['id'] ?? 'not set',
            'id_type' => isset($data['id']) ? gettype($data['id']) : 'undefined'
        ]
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
