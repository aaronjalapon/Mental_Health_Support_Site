<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    $sql = "SELECT 
                a.*,
                CONCAT(c.firstName, ' ', c.lastName) as client_name,
                CONCAT(t.first_name, ' ', t.last_name) as therapist_name,
                c.email as client_email,
                t.email as therapist_email
            FROM appointments a
            JOIN client c ON a.client_id = c.client_id
            JOIN therapists t ON a.therapist_id = t.therapist_id";

    // Add filters if provided
    $params = [];
    $types = "";

    if (isset($_GET['status']) && $_GET['status'] !== 'all') {
        $sql .= " WHERE a.status = ?";
        $params[] = $_GET['status'];
        $types .= "s";
    }

    // Add sorting
    $sql .= " ORDER BY 
              CASE 
                WHEN a.status = 'pending' THEN 1
                WHEN a.status = 'upcoming' THEN 2
                WHEN a.status = 'completed' THEN 3
                WHEN a.status = 'cancelled' THEN 4
              END,
              a.appointment_date DESC, 
              a.appointment_time ASC";

    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = [
            'id' => $row['appointment_id'],
            'client' => $row['client_name'],
            'client_email' => $row['client_email'],
            'therapist' => $row['therapist_name'],
            'therapist_email' => $row['therapist_email'],
            'date' => $row['appointment_date'],
            'time' => $row['appointment_time'],
            'sessionType' => $row['session_type'],
            'status' => $row['status'],
            'notes' => $row['notes'],
            'cancellation_reason' => $row['cancellation_reason']
        ];
    }

    echo json_encode([
        'success' => true,
        'appointments' => $appointments
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
