<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['appointmentId']) || !isset($data['newDate']) || !isset($data['newTime'])) {
        throw new Exception('Required parameters missing');
    }

    // Get user info based on role
    $isTherapist = $_SESSION['role'] === 'therapist';
    $userIdField = $isTherapist ? 'therapist_id' : 'client_id';
    $userTable = $isTherapist ? 'therapists' : 'client';

    $stmt = $conn->prepare("SELECT {$userIdField} FROM {$userTable} WHERE unique_id = ?");
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('User not found');
    }
    
    $user = $result->fetch_assoc();
    $userId = $user[$userIdField];

    // Update appointment with new schedule
    $sql = "UPDATE appointments 
            SET status = ?, 
                appointment_date = ?,
                appointment_time = ?,
                reschedule_notes = ?,
                reschedule_by = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE appointment_id = ?";

    // If therapist initiates reschedule, set status to 'reschedule_pending'
    // If client accepts reschedule, set status to 'upcoming'
    $newStatus = $isTherapist ? 'reschedule_pending' : 'upcoming';
    $rescheduleBy = $isTherapist ? 'therapist' : 'client';

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssi", 
        $newStatus,
        $data['newDate'],
        $data['newTime'],
        $data['notes'],
        $rescheduleBy,
        $data['appointmentId']
    );
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => $isTherapist ? 
                'Appointment rescheduled pending client approval' : 
                'Appointment rescheduled successfully'
        ]);
    } else {
        throw new Exception('Failed to reschedule appointment');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
