<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['therapist_id'])) {
    echo json_encode(['success' => false, 'error' => 'Missing therapist ID']);
    exit();
}

try {
    $sql = "SELECT t.*, 
            GROUP_CONCAT(DISTINCT ta.day) as days,
            MIN(ta.start_time) as start_time,
            MAX(ta.end_time) as end_time
            FROM therapists t
            LEFT JOIN therapist_availability ta ON t.therapist_id = ta.therapist_id
            WHERE t.therapist_id = ?
            GROUP BY t.therapist_id";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $data['therapist_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Therapist not found']);
        exit();
    }

    $therapist = $result->fetch_assoc();

    // Get detailed availability
    $availSql = "SELECT day, start_time, end_time, break_start, break_end 
                 FROM therapist_availability 
                 WHERE therapist_id = ?";
    $availStmt = $conn->prepare($availSql);
    $availStmt->bind_param("i", $data['therapist_id']);
    $availStmt->execute();
    $availResult = $availStmt->get_result();

    $availability = [];
    while ($row = $availResult->fetch_assoc()) {
        $availability[] = $row;
    }

    // Format response
    $response = [
        'success' => true,
        'data' => [
            'therapist_id' => $therapist['therapist_id'],
            'firstName' => $therapist['first_name'],
            'lastName' => $therapist['last_name'],
            'specialization' => $therapist['specialization'],
            'experience' => $therapist['experience_years'],
            'email' => $therapist['email'],
            'phone' => $therapist['phone'],
            'bio' => $therapist['bio'],
            'status' => $therapist['status'],
            'availability' => [
                'days' => explode(',', $therapist['days']),
                'hours' => [
                    'start' => $therapist['start_time'],
                    'end' => $therapist['end_time']
                ],
                'schedule' => $availability
            ]
        ]
    ];

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
