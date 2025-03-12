<?php
session_start();
require_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'therapist') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    // First get therapist_id from therapists table using unique_id
    $stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE unique_id = ?");
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $therapist = $result->fetch_assoc();

    if (!$therapist) {
        throw new Exception('Therapist not found');
    }

    // Now fetch availability using therapist_id
    $sql = "SELECT * FROM therapist_availability WHERE therapist_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $therapist['therapist_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    $availability = [
        'days' => [],
        'hours' => [
            'start' => '',
            'end' => '',
            'break' => [
                'start' => null,
                'break_end' => null
            ]
        ]
    ];

    // Process results
    while ($row = $result->fetch_assoc()) {
        $availability['days'][] = $row['day'];
        
        // Use the first row's times (they should be the same for all days)
        if (empty($availability['hours']['start'])) {
            $availability['hours']['start'] = $row['start_time'];
            $availability['hours']['end'] = $row['end_time'];
            $availability['hours']['break']['start'] = $row['break_start'] ?: null;
            $availability['hours']['break']['end'] = $row['break_end'] ?: null;
        }
    }

    echo json_encode([
        'success' => true,
        'availability' => $availability
    ]);

} catch (Exception $e) {
    error_log("Error fetching therapist availability: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
