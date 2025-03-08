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
    $rescheduleBy = $isTherapist ? 'therapist' : 'client';
    $newStatus = $isTherapist ? 'reschedule_pending' : 'reschedule_requested';

    $stmt = $conn->prepare("SELECT {$userIdField} FROM {$userTable} WHERE unique_id = ?");
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('User not found');
    }
    
    $user = $result->fetch_assoc();
    $userId = $user[$userIdField];

    // Update appointment with new schedule request
    $sql = "UPDATE appointments 
            SET status = ?, 
                proposed_date = ?,
                proposed_time = ?,
                reschedule_notes = ?,
                reschedule_by = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE appointment_id = ? 
            AND {$userIdField} = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssii", 
        $newStatus,
        $data['newDate'],
        $data['newTime'],
        $data['notes'],
        $rescheduleBy,
        $data['appointmentId'],
        $userId
    );
    
    if ($stmt->execute()) {
        // If client accepts therapist's proposed schedule
        if (!$isTherapist && isset($data['accept']) && $data['accept']) {
            $updateSql = "UPDATE appointments 
                         SET status = 'upcoming',
                             appointment_date = proposed_date,
                             appointment_time = proposed_time,
                             proposed_date = NULL,
                             proposed_time = NULL,
                             reschedule_by = NULL,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE appointment_id = ?";
            
            $stmt = $conn->prepare($updateSql);
            $stmt->bind_param("i", $data['appointmentId']);
            $stmt->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'New schedule accepted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => $isTherapist ? 
                    'Reschedule request sent to client' : 
                    'Reschedule request sent to therapist'
            ]);
        }
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
