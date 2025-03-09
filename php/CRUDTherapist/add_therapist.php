<?php
session_start();
require_once '../db.php';

// Set proper headers
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

try {
    // Get form data
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $specialization = $_POST['specialization'];
    $experience = $_POST['experience'];
    $bio = $_POST['bio'] ?? '';

    // Validate required fields
    if (!$firstName || !$lastName || !$username || !$password || !$email) {
        throw new Exception('All required fields must be filled');
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Generate unique_id
        $unique_id = uniqid();
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Insert therapist first
        $stmt = $conn->prepare("INSERT INTO therapists (unique_id, first_name, last_name, username, password, email, phone, specialization, experience_years, bio, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')");
        
        $stmt->bind_param("ssssssssss",
            $unique_id,
            $firstName,
            $lastName,
            $username,
            $hashed_password,
            $email,
            $phone,
            $specialization,
            $experience,
            $bio
        );

        if (!$stmt->execute()) {
            throw new Exception("Failed to add therapist: " . $stmt->error);
        }

        $therapist_id = $conn->insert_id;

        // Handle availability if provided
        if (isset($_POST['availableDays']) && is_array($_POST['availableDays'])) {
            $avail_stmt = $conn->prepare("INSERT INTO therapist_availability (therapist_id, day, start_time, end_time, break_start, break_end) VALUES (?, ?, ?, ?, ?, ?)");

            foreach ($_POST['availableDays'] as $day) {
                $start_time = $_POST['startTime'];
                $end_time = $_POST['endTime'];
                $break_start = $_POST['breakStart'] ?: null;
                $break_end = $_POST['breakEnd'] ?: null;

                $avail_stmt->bind_param("isssss",
                    $therapist_id,
                    $day,
                    $start_time,
                    $end_time,
                    $break_start,
                    $break_end
                );

                if (!$avail_stmt->execute()) {
                    throw new Exception("Failed to add availability: " . $avail_stmt->error);
                }
            }
        }

        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Therapist added successfully'
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Error in add_therapist.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
