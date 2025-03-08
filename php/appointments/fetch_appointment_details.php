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
    
    if (!isset($data['appointmentId'])) {
        throw new Exception('Appointment ID is required');
    }

    $isTherapist = $_SESSION['role'] === 'therapist';
    
    // Get user ID based on role
    if ($isTherapist) {
        $stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE unique_id = ?");
    } else {
        $stmt = $conn->prepare("SELECT client_id FROM client WHERE unique_id = ?");
    }
    
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('User not found');
    }
    
    $user = $result->fetch_assoc();
    $userId = $isTherapist ? $user['therapist_id'] : $user['client_id'];

    // Fetch appointment details with therapist/client name based on role
    if ($isTherapist) {
        $sql = "SELECT 
            a.*,
            CONCAT(c.firstName, ' ', c.lastName) as client_name,
            c.client_id,
            c.email as client_email
        FROM appointments a
        JOIN client c ON a.client_id = c.client_id
        WHERE a.appointment_id = ? 
        AND a.therapist_id = ?";
    } else {
        $sql = "SELECT 
            a.*,
            CONCAT(t.first_name, ' ', t.last_name) as therapist_name,
            t.therapist_id,
            t.email as therapist_email
        FROM appointments a
        JOIN therapists t ON a.therapist_id = t.therapist_id
        WHERE a.appointment_id = ? 
        AND a.client_id = ?";
    }
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $data['appointmentId'], $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Appointment not found');
    }
    
    $appointment = $result->fetch_assoc();

    echo json_encode([
        'success' => true,
        'appointment' => [
            'id' => $appointment['appointment_id'],
            'date' => $appointment['appointment_date'],
            'time' => $appointment['appointment_time'],
            'type' => $appointment['session_type'],
            'status' => $appointment['status'],
            'notes' => $appointment['notes'],
            'therapist_name' => $appointment['therapist_name'] ?? null,
            'client_name' => $appointment['client_name'] ?? null
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
