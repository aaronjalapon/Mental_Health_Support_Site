<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    // Get client/user ID from the session
    $stmt = $conn->prepare("SELECT client_id FROM client WHERE unique_id = ?");
    $stmt->bind_param("i", $_SESSION['unique_id']); // Changed from "s" to "i" since unique_id is integer

    // Add error logging
    if (!$stmt->execute()) {
        error_log("Execute failed: " . $stmt->error);
        throw new Exception('Database query failed');
    }

    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Client not found');
    }
    
    $client = $result->fetch_assoc();
    $client_id = $client['client_id'];

    // Log the SQL query for debugging
    error_log("Client ID found: " . $client_id);

    // Base query with proper JOIN to get therapist name
    $sql = "SELECT 
                a.*,
                CONCAT(t.first_name, ' ', t.last_name) as therapist_name
            FROM appointments a
            LEFT JOIN therapists t ON a.therapist_id = t.therapist_id
            WHERE a.client_id = ?";

    $params = [$client_id];
    $types = "i";

    // Add filters if provided
    if (isset($_GET['status']) && $_GET['status'] !== 'all') {
        $sql .= " AND LOWER(a.status) = LOWER(?)";
        $params[] = $_GET['status'];
        $types .= "s";
    }

    if (isset($_GET['type']) && $_GET['type'] !== 'all') {
        $sql .= " AND LOWER(a.session_type) = LOWER(?)";
        $params[] = $_GET['type'];
        $types .= "s";
    }

    if (isset($_GET['date']) && $_GET['date']) {
        $sql .= " AND DATE(a.appointment_date) = ?";
        $params[] = $_GET['date'];
        $types .= "s";
    }

    // Add order by clause
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
        $appointmentDateTime = $row['appointment_date'] . ' ' . $row['appointment_time'];
        $currentDateTime = date('Y-m-d H:i:s');
        
        // Add 1 hour to appointment time to get end time
        $appointmentEndTime = date('Y-m-d H:i:s', strtotime($appointmentDateTime . ' +1 hour'));
        
        // If the appointment is 'upcoming' and end time has passed, mark it as 'completed'
        if ($row['status'] === 'upcoming' && strtotime($appointmentEndTime) < strtotime($currentDateTime)) {
            // Update the status in database
            $updateSql = "UPDATE appointments SET status = 'completed' WHERE appointment_id = ?";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bind_param("i", $row['appointment_id']);
            $updateStmt->execute();
            
            $row['status'] = 'completed';
        }

        $appointments[] = [
            'id' => $row['appointment_id'],
            'therapist_name' => $row['therapist_name'] ?? 'Not Assigned',
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
        'data' => $appointments,    
    
    ]);

} catch (Exception $e) {
    error_log("Error in fetch_appointments.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => 'Check server logs for details'
    ]);
}

$conn->close();
