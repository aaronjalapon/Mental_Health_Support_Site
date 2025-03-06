<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'client') {
    echo json_encode(['success' => false, 'error' => 'User not authenticated or not authorized']);
    exit();
}

try {
    // First get the client_id
    $stmt = $conn->prepare("SELECT client_id FROM client WHERE unique_id = ? AND Role = 'client'");
    $stmt->bind_param("i", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Client not found');
    }
    
    $client = $result->fetch_assoc();
    $client_id = $client['client_id'];

    // Base query
    $sql = "SELECT 
                a.*, 
                CONCAT(t.first_name, ' ', t.last_name) as therapist_name,
                t.email as therapist_email,
                t.phone as therapist_phone
            FROM appointments a
            JOIN therapists t ON a.therapist_id = t.therapist_id
            WHERE a.client_id = ?";
    
    $params = [$client_id];
    $types = "i";

    // Add status filter if provided
    if (isset($_GET['status']) && $_GET['status'] !== 'all') {
        $sql .= " AND LOWER(a.status) = LOWER(?)";
        $params[] = $_GET['status'];
        $types .= "s";
    }

    // Add type filter if provided
    if (isset($_GET['type']) && $_GET['type'] !== 'all') {
        $sql .= " AND LOWER(a.session_type) = LOWER(?)";
        $params[] = $_GET['type'];
        $types .= "s";
    }

    // Add date filter if provided
    if (isset($_GET['date']) && $_GET['date']) {
        $sql .= " AND DATE(a.appointment_date) = ?";
        $params[] = $_GET['date'];
        $types .= "s";
    }

    // Add sorting
    $sql .= " ORDER BY 
              CASE 
                WHEN a.status = 'upcoming' THEN 1
                WHEN a.status = 'pending' THEN 2
                WHEN a.status = 'completed' THEN 3
                WHEN a.status = 'cancelled' THEN 4
              END,
              a.appointment_date, 
              a.appointment_time";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = [
            'id' => $row['appointment_id'],
            'therapist_name' => $row['therapist_name'],
            'therapist_email' => $row['therapist_email'],
            'therapist_phone' => $row['therapist_phone'],
            'date' => $row['appointment_date'],
            'time' => $row['appointment_time'],
            'session_type' => $row['session_type'],
            'status' => $row['status'],
            'notes' => $row['notes'],
            'cancellation_reason' => $row['cancellation_reason'] // Add this line
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
