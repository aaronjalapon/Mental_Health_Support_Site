<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    // Debug logging
    error_log("Received POST data: " . print_r($_POST, true));
    
    // Get and validate therapist ID
    $id = $_POST['editTherapistId'] ?? null;
    if (!$id) {
        error_log("Missing therapist ID in request");
        throw new Exception("Missing therapist ID");
    }

    // Required fields array
    $required_fields = ['firstName', 'lastName', 'username', 'email', 'specialization'];
    $missing_fields = [];

    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            $missing_fields[] = $field;
        }
    }

    if (!empty($missing_fields)) {
        throw new Exception("Missing required fields: " . implode(', ', $missing_fields));
    }

    // Validate and sanitize inputs
    $firstName = filter_input(INPUT_POST, 'firstName', FILTER_SANITIZE_STRING);
    $lastName = filter_input(INPUT_POST, 'lastName', FILTER_SANITIZE_STRING);
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $specialization = filter_input(INPUT_POST, 'specialization', FILTER_SANITIZE_STRING);
    $experience = filter_input(INPUT_POST, 'experience', FILTER_SANITIZE_NUMBER_INT);
    $bio = filter_input(INPUT_POST, 'bio', FILTER_SANITIZE_STRING);
    $status = filter_input(INPUT_POST, 'status', FILTER_SANITIZE_STRING);

    // Log sanitized data
    error_log("Sanitized data: " . json_encode([
        'id' => $id,
        'firstName' => $firstName,
        'lastName' => $lastName,
        'username' => $username,
        'email' => $email,
        'specialization' => $specialization
    ]));

    // Validate required fields
    if (!$firstName || !$lastName || !$username || !$email || !$specialization) {
        throw new Exception("All required fields must be filled");
    }

    // Begin transaction
    $conn->begin_transaction();

    try {
        // Check if username exists for other therapists
        $stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE username = ? AND therapist_id != ?");
        $stmt->bind_param("si", $username, $id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            throw new Exception("Username already exists");
        }

        // Check if email exists for other therapists
        $stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE email = ? AND therapist_id != ?");
        $stmt->bind_param("si", $email, $id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            throw new Exception("Email already exists");
        }

        // Update therapist information
        $update_query = "UPDATE therapists SET 
            first_name = ?,
            last_name = ?,
            username = ?,
            email = ?,
            phone = ?,
            specialization = ?,
            experience_years = ?,
            bio = ?,
            status = ?
            WHERE therapist_id = ?";

        $stmt = $conn->prepare($update_query);
        $stmt->bind_param("sssssssssi",
            $firstName,
            $lastName,
            $username,
            $email,
            $phone,
            $specialization,
            $experience,
            $bio,
            $status,
            $id
        );

        if (!$stmt->execute()) {
            throw new Exception("Failed to update therapist");
        }

        // Update availability
        if (isset($_POST['availableDays'])) {
            // Delete existing availability
            $del_stmt = $conn->prepare("DELETE FROM therapist_availability WHERE therapist_id = ?");
            $del_stmt->bind_param("i", $id);
            $del_stmt->execute();

            // Insert new availability
            $avail_stmt = $conn->prepare("
                INSERT INTO therapist_availability 
                (therapist_id, day, start_time, end_time, break_start, break_end)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            foreach ($_POST['availableDays'] as $day) {
                $start_time = $_POST['startTime'] ?? null;
                $end_time = $_POST['endTime'] ?? null;
                $break_start = !empty($_POST['breakStart']) ? $_POST['breakStart'] : null;
                $break_end = !empty($_POST['breakEnd']) ? $_POST['breakEnd'] : null;

                $avail_stmt->bind_param("isssss",
                    $id,
                    $day,
                    $start_time,
                    $end_time,
                    $break_start,
                    $break_end
                );
                if (!$avail_stmt->execute()) {
                    throw new Exception("Failed to update availability for day: $day");
                }
            }
        }

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Therapist updated successfully']);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Error in update_therapist.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($avail_stmt)) $avail_stmt->close();
    if (isset($del_stmt)) $del_stmt->close();
    $conn->close();
}
?>
