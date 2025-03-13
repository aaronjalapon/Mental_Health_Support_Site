<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT a.*, 
            c.firstName as client_first_name, 
            c.lastName as client_last_name,
            t.first_name as therapist_first_name, 
            t.last_name as therapist_last_name
            FROM appointments a
            LEFT JOIN client c ON a.client_id = c.client_id
            LEFT JOIN therapists t ON a.therapist_id = t.therapist_id";

    // Add status filter if provided
    if (isset($_GET['status']) && $_GET['status'] !== 'all') {
        $sql .= " WHERE a.status = '" . $_GET['status'] . "'";
    }

    $sql .= " ORDER BY a.appointment_date DESC, a.appointment_time ASC";

    $result = $conn->query($sql);
    $appointments = [];

    while($row = $result->fetch_assoc()) {
        // Convert date and time to proper format
        $appointmentDate = new DateTime($row['appointment_date']);
        $appointmentTime = new DateTime($row['appointment_time']);
        
        $appointments[] = [
            'id' => $row['appointment_id'],
            'client_name' => $row['client_first_name'] . ' ' . $row['client_last_name'],
            'therapist_name' => $row['therapist_first_name'] . ' ' . $row['therapist_last_name'],
            'date' => $appointmentDate->format('Y-m-d'),
            'time' => $appointmentTime->format('H:i:s'),
            'session_type' => $row['session_type'],
            'status' => $row['status'],
            'notes' => $row['notes']
        ];
    }

    echo json_encode(['success' => true, 'data' => $appointments]);

} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
