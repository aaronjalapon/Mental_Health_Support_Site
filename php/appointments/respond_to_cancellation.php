<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['appointmentId']) || !isset($data['action'])) {
        throw new Exception('Missing required parameters');
    }

    $appointmentId = intval($data['appointmentId']);
    $action = $data['action'];
    $role = $_SESSION['role'];
    
    // First verify the appointment exists and check permissions
    $stmt = $conn->prepare("
        SELECT a.*, 
               CASE 
                   WHEN ? = 'therapist' THEN t.unique_id = ?
                   WHEN ? = 'client' THEN c.unique_id = ?
               END AS has_permission,
               a.status as current_status
        FROM appointments a
        LEFT JOIN therapists t ON a.therapist_id = t.therapist_id
        LEFT JOIN client c ON a.client_id = c.client_id
        WHERE a.appointment_id = ?
    ");
    
    $stmt->bind_param("ssssi", 
        $role, $_SESSION['unique_id'],
        $role, $_SESSION['unique_id'],
        $appointmentId
    );
    
    $stmt->execute();
    $result = $stmt->get_result();
    $appointment = $result->fetch_assoc();

    if (!$appointment) {
        throw new Exception('Appointment not found');
    }

    if (!$appointment['has_permission']) {
        throw new Exception('No permission to respond to this cancellation request');
    }

    // Check if the appointment is in a state that can be cancelled
    if (!in_array($appointment['current_status'], ['pending', 'upcoming', 'cancellation_pending', 'cancellation_requested'])) {
        throw new Exception('Appointment cannot be cancelled in its current state');
    }

    // Update appointment status
    $newStatus = ($action === 'approve') ? 'cancelled' : 'upcoming';
    
    $updateStmt = $conn->prepare("
        UPDATE appointments 
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP 
        WHERE appointment_id = ?
    ");
    
    $updateStmt->bind_param("si", $newStatus, $appointmentId);
    
    if ($updateStmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => $action === 'approve' ? 
                'Cancellation approved successfully' : 
                'Cancellation rejected, appointment restored'
        ]);
    } else {
        throw new Exception('Failed to update appointment status');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
