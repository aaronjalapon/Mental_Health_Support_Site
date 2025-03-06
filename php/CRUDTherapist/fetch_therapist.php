<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT t.*, 
            GROUP_CONCAT(ta.day) as working_days,
            MIN(ta.start_time) as start_time,
            MAX(ta.end_time) as end_time
            FROM therapists t
            LEFT JOIN therapist_availability ta ON t.therapist_id = ta.therapist_id
            WHERE t.status = 'Active'
            GROUP BY t.therapist_id";

    $result = $conn->query($sql);
    $therapists = [];

    while ($row = $result->fetch_assoc()) {
        $therapists[] = [
            'therapist_id' => $row['therapist_id'],
            'firstName' => $row['first_name'],
            'lastName' => $row['last_name'],
            'specialization' => $row['specialization'],
            'experience' => $row['experience_years'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'bio' => $row['bio'],
            'status' => $row['status'],
            'availability' => [
                'days' => $row['working_days'] ? explode(',', $row['working_days']) : [],
                'hours' => [
                    'start' => $row['start_time'],
                    'end' => $row['end_time']
                ]
            ]
        ];
    }

    echo json_encode($therapists);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
