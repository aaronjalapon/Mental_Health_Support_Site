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
    $dayName = strtolower(date('l', strtotime($data['date'])));
    
    // First get all active therapists
    $sql = "SELECT t.* 
            FROM therapists t 
            WHERE t.status = 'Active'";

    // Add search filters if provided
    $params = [];
    $types = "";

    if (!empty($data['specialization'])) {
        $sql .= " AND LOWER(t.specialization) = LOWER(?)";
        $params[] = $data['specialization'];
        $types .= "s";
    }

    if (!empty($data['searchTerm'])) {
        $sql .= " AND (
            LOWER(t.first_name) LIKE ? OR 
            LOWER(t.last_name) LIKE ? OR 
            LOWER(t.specialization) LIKE ?
        )";
        $searchTerm = "%" . strtolower($data['searchTerm']) . "%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "sss";
    }

    // Prepare and execute the query
    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $therapists = [];
    while ($row = $result->fetch_assoc()) {
        // Check availability for each therapist
        $availSql = "SELECT * FROM therapist_availability 
                     WHERE therapist_id = ? 
                     AND day = ?
                     AND ? BETWEEN start_time AND end_time
                     AND (? NOT BETWEEN COALESCE(break_start, '00:00:00') 
                         AND COALESCE(break_end, '00:00:00') 
                         OR break_start IS NULL)";
        
        $availStmt = $conn->prepare($availSql);
        $availStmt->bind_param("isss", 
            $row['therapist_id'], 
            $dayName,
            $data['time'],
            $data['time']
        );
        $availStmt->execute();
        $availResult = $availStmt->get_result();

        // Check if there are no conflicting appointments
        $appointmentSql = "SELECT 1 FROM appointments 
                          WHERE therapist_id = ? 
                          AND appointment_date = ?
                          AND appointment_time = ?
                          AND status != 'cancelled'";
        
        $apptStmt = $conn->prepare($appointmentSql);
        $apptStmt->bind_param("iss", 
            $row['therapist_id'],
            $data['date'],
            $data['time']
        );
        $apptStmt->execute();
        $apptResult = $apptStmt->get_result();

        // Only add therapist if they are available and have no conflicting appointments
        if ($availResult->num_rows > 0 && $apptResult->num_rows === 0) {
            // Get full availability schedule
            $scheduleSql = "SELECT day, start_time, end_time, break_start, break_end 
                           FROM therapist_availability 
                           WHERE therapist_id = ?
                           ORDER BY FIELD(day, 'monday', 'tuesday', 'wednesday', 
                                        'thursday', 'friday', 'saturday', 'sunday')";
            
            $scheduleStmt = $conn->prepare($scheduleSql);
            $scheduleStmt->bind_param("i", $row['therapist_id']);
            $scheduleStmt->execute();
            $scheduleResult = $scheduleStmt->get_result();
            
            $schedule = [];
            while ($scheduleRow = $scheduleResult->fetch_assoc()) {
                $schedule[] = $scheduleRow;
            }

            $therapists[] = [
                'therapist_id' => $row['therapist_id'],
                'firstName' => $row['first_name'],
                'lastName' => $row['last_name'],
                'specialization' => $row['specialization'],
                'experience' => (int)$row['experience_years'],
                'email' => $row['email'],
                'bio' => $row['bio'],
                'availability' => [
                    'days' => array_column($schedule, 'day'),
                    'hours' => [
                        'start' => $schedule[0]['start_time'] ?? null,
                        'end' => $schedule[0]['end_time'] ?? null
                    ],
                    'schedule' => $schedule
                ]
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $therapists
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
