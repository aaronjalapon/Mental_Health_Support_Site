<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['date']) || !isset($data['time'])) {
    echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
    exit();
}

try {
    // Basic validation
    if (empty($data['date']) || empty($data['time'])) {
        throw new Exception('Date and time are required');
    }
    
    if (strtotime($data['date']) < strtotime(date('Y-m-d'))) {
        throw new Exception('Cannot book appointments in the past');
    }
    
    // Get day name (Monday, Tuesday, etc.)
    $dayName = strtolower(date('l', strtotime($data['date'])));
    
    // Updated query to properly check availability and active status
    $sql = "SELECT DISTINCT t.*, 
            GROUP_CONCAT(DISTINCT ta.day) as working_days,
            ta.start_time,
            ta.end_time,
            ta.break_start,
            ta.break_end
            FROM therapists t
            INNER JOIN therapist_availability ta ON t.therapist_id = ta.therapist_id
            LEFT JOIN appointments a ON t.therapist_id = a.therapist_id 
                AND a.appointment_date = ? 
                AND TIME(?) BETWEEN a.appointment_time AND ADDTIME(a.appointment_time, '01:00:00')
                AND a.status NOT IN ('cancelled', 'rejected')
            WHERE t.status = 'Active'
            AND LOWER(ta.day) = ?
            AND ? >= ta.start_time 
            AND ? <= ta.end_time
            AND (ta.break_start IS NULL 
                OR ? NOT BETWEEN ta.break_start AND ta.break_end)
            AND (a.appointment_id IS NULL OR a.status IN ('cancelled', 'rejected'))";

    $params = [$data['date'], $data['time'], $dayName, $data['time'], $data['time'], $data['time']];
    $types = "ssssss";

    // Add search filters if provided
    if (!empty($data['searchTerm'])) {
        $searchTerm = "%" . strtolower($data['searchTerm']) . "%";
        $sql .= " AND (LOWER(t.first_name) LIKE ? 
                      OR LOWER(t.last_name) LIKE ? 
                      OR LOWER(t.specialization) LIKE ?)";
        $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm]);
        $types .= "sss";
    }

    if (!empty($data['specialization'])) {
        $sql .= " AND LOWER(t.specialization) = LOWER(?)";
        $params[] = $data['specialization'];
        $types .= "s";
    }

    $sql .= " GROUP BY t.therapist_id";
    
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        throw new Exception("Database error: " . $conn->error);
    }

    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $therapists = [];
    while ($row = $result->fetch_assoc()) {
        $available = true;
        
        // Additional availability check for break time
        if ($row['break_start'] && $row['break_end']) {
            $appointmentTime = strtotime($data['time']);
            $breakStart = strtotime($row['break_start']);
            $breakEnd = strtotime($row['break_end']);
            
            if ($appointmentTime >= $breakStart && $appointmentTime < $breakEnd) {
                $available = false;
            }
        }

        if ($available) {
            $therapists[] = [
                'therapist_id' => $row['therapist_id'],
                'firstName' => $row['first_name'],
                'lastName' => $row['last_name'],
                'specialization' => $row['specialization'],
                'experience' => (int)$row['experience_years'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'bio' => $row['bio'],
                'status' => $row['status'],
                'availability' => [
                    'days' => array_map('trim', explode(',', $row['working_days'] ?? '')),
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
    }

    echo json_encode([
        'success' => true,
        'data' => $therapists,
        'message' => empty($therapists) ? 'No therapists available for the selected time slot' : null
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();