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
    // Get therapist's availability for the given day
    $sql = "SELECT start_time, end_time, break_start, break_end 
            FROM therapist_availability 
            WHERE therapist_id = ? 
            AND LOWER(day) = LOWER(DAYNAME(?))";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $therapist_id, $date);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Therapist not available on this day']);
        exit();
    }

    $availability = $result->fetch_assoc();

    // Get existing appointments for the day
    $sql = "SELECT appointment_time 
            FROM appointments 
            WHERE therapist_id = ? 
            AND appointment_date = ? 
            AND status != 'cancelled'";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $therapist_id, $date);
    $stmt->execute();
    $result = $stmt->get_result();

    $booked_slots = [];
    while ($row = $result->fetch_assoc()) {
        $booked_slots[] = $row['appointment_time'];
    }

    // Generate available time slots (30-minute intervals)
    $available_slots = [];
    $start = strtotime($availability['start_time']);
    $end = strtotime($availability['end_time']);
    $break_start = $availability['break_start'] ? strtotime($availability['break_start']) : null;
    $break_end = $availability['break_end'] ? strtotime($availability['break_end']) : null;

    for ($time = $start; $time < $end; $time += 1800) {
        $slot = date('H:i:s', $time);
        
        // Skip if slot is during break time
        if ($break_start && $break_end) {
            if ($time >= $break_start && $time < $break_end) {
                continue;
            }
        }

        // Skip if slot is already booked
        if (!in_array($slot, $booked_slots)) {
            $available_slots[] = $slot;
        }
    }

    echo json_encode(['success' => true, 'slots' => $available_slots]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
