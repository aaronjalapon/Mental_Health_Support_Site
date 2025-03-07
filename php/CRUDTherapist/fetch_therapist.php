<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

try {
    // Add debug logging
    error_log("Fetching therapists...");

    $sql = "SELECT t.*, 
            GROUP_CONCAT(DISTINCT ta.day) as days,
            MIN(ta.start_time) as start_time,
            MAX(ta.end_time) as end_time,
            MIN(ta.break_start) as break_start,
            MIN(ta.break_end) as break_end
            FROM therapists t
            LEFT JOIN therapist_availability ta ON t.therapist_id = ta.therapist_id
            GROUP BY t.therapist_id";

    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $therapists = [];

    while ($row = $result->fetch_assoc()) {
        // Log each therapist ID for debugging
        error_log("Processing therapist ID: " . $row['therapist_id']);

        // Ensure therapist_id is properly cast to integer
        $therapist_id = (int)$row['therapist_id'];

        // Get availability
        $avail_sql = "SELECT * FROM therapist_availability WHERE therapist_id = ?";
        $avail_stmt = $conn->prepare($avail_sql);
        $avail_stmt->bind_param('i', $therapist_id);
        $avail_stmt->execute();
        $availability_result = $avail_stmt->get_result();
        
        $days = [];
        while ($avail = $availability_result->fetch_assoc()) {
            $days[] = $avail['day'];
        }

        $therapists[] = [
            'therapist_id' => $therapist_id, // Use the cast integer
            'firstName' => $row['first_name'],
            'lastName' => $row['last_name'],
            'username' => $row['username'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'specialization' => $row['specialization'],
            'experience' => (int)$row['experience_years'],
            'bio' => $row['bio'],
            'status' => $row['status'],
            'availability' => [
                'days' => $days,
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

    // Log the final therapists array
    error_log("Found " . count($therapists) . " therapists");
    error_log("Therapist IDs: " . json_encode(array_column($therapists, 'therapist_id')));

    echo json_encode($therapists);

} catch (Exception $e) {
    error_log("Error in fetch_therapist.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    if (isset($avail_stmt)) $avail_stmt->close();
    $conn->close();
}
?>