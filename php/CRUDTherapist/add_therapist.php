<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    // Get form data
    $firstName = filter_input(INPUT_POST, 'firstName', FILTER_SANITIZE_STRING);
    $lastName = filter_input(INPUT_POST, 'lastName', FILTER_SANITIZE_STRING);
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $specialization = filter_input(INPUT_POST, 'specialization', FILTER_SANITIZE_STRING);
    $experience = filter_input(INPUT_POST, 'experience', FILTER_SANITIZE_NUMBER_INT);
    $bio = filter_input(INPUT_POST, 'bio', FILTER_SANITIZE_STRING) ?? '';

    // Validate required fields
    if (!$firstName || !$lastName || !$username || !$email || !$password) {
        throw new Exception('All required fields must be filled');
    }

    // Check if username exists
    $stmt = $conn->prepare("SELECT username FROM therapists WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['error' => 'Username already exists']);
        exit();
    }

    // Check if email exists
    $stmt = $conn->prepare("SELECT email FROM therapists WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['error' => 'Email already exists']);
        exit();
    }

    // Generate unique_id and hash password
    $unique_id = uniqid();
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $conn->begin_transaction();

    try {
        // Insert therapist data
        $stmt = $conn->prepare("
            INSERT INTO therapists (
                unique_id, first_name, last_name, username, password,
                email, phone, specialization, experience_years, bio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

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
            throw new Exception("Failed to add therapist");
        }

        // Handle availability if provided
        if (!empty($_POST['availableDays'])) {
            $therapist_id = $stmt->insert_id;
            $avail_stmt = $conn->prepare("
                INSERT INTO therapist_availability 
                (therapist_id, day, start_time, end_time, break_start, break_end)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            foreach ($_POST['availableDays'] as $day) {
                $avail_stmt->bind_param("isssss",
                    $therapist_id,
                    $day,
                    $_POST['startTime'],
                    $_POST['endTime'],
                    $_POST['breakStart'],
                    $_POST['breakEnd']
                );
                $avail_stmt->execute();
            }
        }

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Therapist added successfully']);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Error in add_therapist.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
