<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit();
}

if (!isset($_SESSION['unique_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'client') {
    echo json_encode(['success' => false, 'error' => 'User not authenticated or not authorized']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['appointmentId'])) {
        throw new Exception('Appointment ID is required');
    }

    // Get client_id from the session
    $stmt = $conn->prepare("SELECT client_id FROM client WHERE unique_id = ?");
    $stmt->bind_param("i", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Client not found');
    }
    
    $client = $result->fetch_assoc();
    $client_id = $client['client_id'];

    // Verify appointment belongs to client and is cancelable
    $stmt = $conn->prepare("
        SELECT status 
        FROM appointments 
        WHERE appointment_id = ? 
        AND client_id = ? 
        AND status NOT IN ('completed', 'cancelled')
    ");
    $stmt->bind_param("ii", $data['appointmentId'], $client_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Appointment not found or cannot be cancelled');
    }

    // Update appointment status and set cancellation reason
    $stmt = $conn->prepare("
        UPDATE appointments 
        SET status = 'cancelled',
            cancellation_reason = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE appointment_id = ? 
        AND client_id = ?
    ");
    
    // Use NULL if no reason provided, otherwise use the provided reason
    $reason = !empty($data['reason']) ? $data['reason'] : null;
    $stmt->bind_param("sii", $reason, $data['appointmentId'], $client_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Appointment cancelled successfully'
        ]);
    } else {
        throw new Exception('Failed to cancel appointment');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
