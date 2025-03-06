<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit();
}

$therapist_id = $_GET['therapist_id'] ?? null;
$date = $_GET['date'] ?? null;

if (!$therapist_id || !$date) {
    echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
    exit();
}

try {
    // Get day name from date
    $dayName = date('l', strtotime($date));
    
    // Get therapist's schedule for the given day
    $sql = "SELECT start_time, end_time, break_start, break_end
            FROM therapist_availability
            WHERE therapist_id = ?
            AND LOWER(day) = LOWER(?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $therapist_id, $dayName);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'No availability found for this day']);
        exit();
    }

    $schedule = $result->fetch_assoc();
    
    // Get already booked appointments
    $sql = "SELECT appointment_time 
            FROM appointments 
            WHERE therapist_id = ? 
            AND appointment_date = ? 
            AND status NOT IN ('cancelled', 'rejected')";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $therapist_id, $date);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $booked_slots = [];
    while ($row = $result->fetch_assoc()) {
        $booked_slots[] = $row['appointment_time'];
    }
    
    // Generate available slots (30-minute intervals)
    $available_slots = [];
    $start = strtotime($schedule['start_time']);
    $end = strtotime($schedule['end_time']);
    
    // Fix for some therapists having incorrect time ranges (start > end)
    if ($start > $end) {
        // Swap start and end times
        $temp = $start;
        $start = $end;
        $end = $temp;
    }
    
    for ($time = $start; $time < $end; $time += 1800) { // 1800 seconds = 30 minutes
        $slot = date('H:i:s', $time);
        
        // Skip if slot is during break time
        if ($schedule['break_start'] && $schedule['break_end']) {
            $break_start = strtotime($schedule['break_start']);
            $break_end = strtotime($schedule['break_end']);
            $current_time = strtotime($slot);
            
            if ($current_time >= $break_start && $current_time < $break_end) {
                continue;
            }
        }
        
        // Format time in 24-hour format for consistency
        $formatted_slot = date('H:i:s', strtotime($slot));
        
        // Skip if slot is already booked
        if (!in_array($formatted_slot, $booked_slots)) {
            $available_slots[] = $formatted_slot;
        }
    }

    echo json_encode([
        'success' => true, 
        'slots' => $available_slots
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'error' => 'Error fetching available slots: ' . $e->getMessage()
    ]);
}

$conn->close();