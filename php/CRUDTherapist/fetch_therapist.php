<?php
session_start();
include_once '../db.php';

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    $query = "SELECT t.*, 
              GROUP_CONCAT(DISTINCT ta.day) as days,
              MIN(ta.start_time) as start_time,
              MAX(ta.end_time) as end_time,
              MIN(ta.break_start) as break_start,
              MIN(ta.break_end) as break_end
              FROM therapists t
              LEFT JOIN therapist_availability ta ON t.therapist_id = ta.therapist_id
              GROUP BY t.therapist_id";
              
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $therapists = [];
    while($row = $result->fetch_assoc()) {
        $therapists[] = [
            'therapist_id' => (int)$row['therapist_id'], // Ensure ID is numeric
            'firstName' => htmlspecialchars($row['first_name']),
            'lastName' => htmlspecialchars($row['last_name']),
            'specialization' => htmlspecialchars($row['specialization']),
            'experience' => (int)$row['experience_years'],
            'email' => htmlspecialchars($row['email']),
            'phone' => htmlspecialchars($row['phone']),
            'bio' => htmlspecialchars($row['bio']),
            'status' => $row['status'],
            'availability' => [
                'days' => $row['days'] ? explode(',', $row['days']) : [],
                'hours' => [
                    'start' => $row['start_time'],
                    'end' => $row['end_time'],
                    'break' => [
                        'start' => $row['break_start'],
                        'end' => $row['break_end']
                    ]
                ]
            ]
        ];
    }
    
    error_log("Fetched therapists data: " . json_encode($therapists));
    
    header('Content-Type: application/json');
    echo json_encode($therapists);
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
