<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit();
}

$date = $_GET['date'] ?? null;

if (!$date) {
    echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
    exit();
}

try {
    $dayName = date('l', strtotime($date));
    
    // Get all standard time slots
    $standard_slots = ['09:00:00', '10:00:00', '11:00:00', '12:00:00', 
                      '13:00:00', '14:00:00', '15:00:00', '16:00:00'];
    
    // Get all booked slots for this date
    $sql = "SELECT appointment_time 
            FROM appointments 
            WHERE appointment_date = ? 
            AND status NOT IN ('cancelled', 'rejected')";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $date);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $booked_slots = [];
    while ($row = $result->fetch_assoc()) {
        $booked_slots[] = $row['appointment_time'];
    }
    
    // Filter out booked slots
    $available_slots = array_filter($standard_slots, function($slot) use ($booked_slots) {
        return !in_array($slot, $booked_slots);
    });

    echo json_encode([
        'success' => true, 
        'slots' => array_values($available_slots)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'error' => 'Error fetching available slots: ' . $e->getMessage()
    ]);
}

$conn->close();