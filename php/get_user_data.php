<?php
session_start();
include_once "db.php"; // Change from config.php to db.php

if (!isset($_SESSION['unique_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

// Check database connection
if (!$conn) {
    error_log("Database connection failed: " . mysqli_connect_error());
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    $userId = $_SESSION['unique_id'];
    $sql = "SELECT unique_id, firstName, lastName, username, email, contactNumber as contact, 
            Pronouns as pronouns, Address as address 
            FROM client WHERE unique_id = ?";
            
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("s", $userId);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            'success' => true,
            'user' => $row
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }
} catch (Exception $e) {
    error_log("Error in get_user_data.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
}

$conn->close();
