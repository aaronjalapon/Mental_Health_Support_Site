<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id'])) {
    echo json_encode(['success' => false, 'error' => 'User not authenticated']);
    exit();
}

try {
    // Get client_id from session
    $stmt = $conn->prepare("SELECT client_id FROM client WHERE unique_id = ?");
    $stmt->bind_param("i", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Client not found');
    }
    
    $client = $result->fetch_assoc();
    $client_id = $client['client_id'];

    // Base query matching the database structure
    $sql = "SELECT 
                a.*,
                CONCAT(t.first_name, ' ', t.last_name) as therapist_name
            FROM appointments a
            JOIN therapists t ON a.therapist_id = t.therapist_id
            WHERE a.client_id = ?";
    
    $params = [$client_id];
    $types = "i";

    // Add filters if provided
    if (isset($_GET['status']) && $_GET['status'] !== 'all') {
        $sql .= " AND a.status = ?";
        $params[] = $_GET['status'];
        $types .= "s";
    }

    if (isset($_GET['type']) && $_GET['type'] !== 'all') {
        $sql .= " AND a.session_type = ?";
        $params[] = $_GET['type'];
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
            'therapist' => $row['therapist_name'],
            'appointment_date' => $row['appointment_date'],
            'appointment_time' => $row['appointment_time'],
            'session_type' => $row['session_type'],
            'status' => $row['status'],
            'notes' => $row['notes']
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
