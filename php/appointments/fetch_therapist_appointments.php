<?php
session_start();
include_once '../db.php';
include_once 'auto_cancel_appointments.php';

// Run auto-cancellation check before fetching appointments
autoCancelExpiredAppointments();

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'therapist') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    // Get therapist ID from unique_id
    $stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE unique_id = ?");
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Therapist not found');
    }
    
    $therapist = $result->fetch_assoc();
    $therapist_id = $therapist['therapist_id'];

    // Base query
    $sql = "SELECT 
                a.*,
                CONCAT(c.firstName, ' ', c.lastName) as client_name,
                c.email as client_email,
                c.contactNumber as client_phone
            FROM appointments a
            JOIN client c ON a.client_id = c.client_id
            WHERE a.therapist_id = ?";

    $params = [$therapist_id];
    $types = "i";

    // Add filters if provided
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['status']) && $data['status'] !== 'all') {
        $sql .= " AND LOWER(a.status) = LOWER(?)";
        $params[] = $data['status'];
        $types .= "s";
    }

    if (isset($data['type']) && $data['type'] !== 'all') {
        $sql .= " AND LOWER(a.session_type) = LOWER(?)";
        $params[] = $data['type'];
        $types .= "s";
    }

    if (isset($data['date']) && $data['date']) {
        $sql .= " AND DATE(a.appointment_date) = ?";
        $params[] = $data['date'];
        $types .= "s";
    }

    if (isset($data['search']) && $data['search']) {
        $searchTerm = "%" . $data['search'] . "%";
        $sql .= " AND (LOWER(c.firstName) LIKE LOWER(?) OR LOWER(c.lastName) LIKE LOWER(?))";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "ss";
    }

    // Sort by status priority and date
    $sql .= " ORDER BY 
              CASE 
                WHEN a.status = 'pending' THEN 1
                WHEN a.status = 'upcoming' THEN 2
                WHEN a.status = 'completed' THEN 3
                WHEN a.status = 'cancelled' THEN 4
              END,
              a.appointment_date ASC, 
              a.appointment_time ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = [
            'id' => $row['appointment_id'],
            'client_id' => $row['client_id'], // Add this line
            'client_name' => $row['client_name'],
            'client_email' => $row['client_email'],
            'client_phone' => $row['client_phone'],
            'date' => date('Y-m-d', strtotime($row['appointment_date'])),
            'time' => date('H:i:s', strtotime($row['appointment_time'])),
            'session_type' => $row['session_type'],
            'status' => $row['status'],
            'notes' => $row['notes'],
            'cancellation_reason' => $row['cancellation_reason'],
            'proposed_date' => $row['proposed_date'],
            'proposed_time' => $row['proposed_time'],
            'reschedule_notes' => $row['reschedule_notes'],
            'reschedule_by' => $row['reschedule_by']
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $appointments
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
