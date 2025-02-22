<?php
session_start();
include_once '../db.php';

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    $conn->begin_transaction();

    // Insert therapist basic info
    $stmt = $conn->prepare("INSERT INTO therapists (
        first_name, last_name, specialization, experience_years,
        email, phone, bio, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("sssissss",
        $data['firstName'],
        $data['lastName'],
        $data['specialization'],
        $data['experience'],
        $data['email'],
        $data['phone'],
        $data['bio'],
        $data['status']
    );

    if(!$stmt->execute()) {
        throw new Exception("Failed to add therapist");
    }

    $therapist_id = $conn->insert_id;

    // Insert availability
    if(isset($data['availability']) && isset($data['availability']['days'])) {
        $stmt = $conn->prepare("INSERT INTO therapist_availability (
            therapist_id, day, start_time, end_time, break_start, break_end
        ) VALUES (?, ?, ?, ?, ?, ?)");

        foreach($data['availability']['days'] as $day) {
            $stmt->bind_param("isssss",
                $therapist_id,
                $day,
                $data['availability']['hours']['start'],
                $data['availability']['hours']['end'],
                $data['availability']['hours']['break']['start'],
                $data['availability']['hours']['break']['end']
            );
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to add availability for $day");
            }
        }
    }

    $conn->commit();
    echo json_encode(['success' => true, 'id' => $therapist_id]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
