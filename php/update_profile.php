<?php
session_start();
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    try {
        if (!isset($_SESSION['unique_id'])) {
            throw new Exception("Not logged in");
        }

        $userId = $_SESSION['unique_id'];
        $firstName = trim($_POST['firstName']);
        $lastName = trim($_POST['lastName']);
        $username = trim($_POST['username']);
        $contact = trim($_POST['contact']);
        $pronouns = trim($_POST['pronouns']);
        $address = trim($_POST['address']);

        // Validate inputs
        if (empty($firstName) || empty($lastName) || empty($username) || 
            empty($contact) || empty($pronouns) || empty($address)) {
            throw new Exception("All fields are required");
        }

        // Check if username already exists for other users
        $checkStmt = $conn->prepare("SELECT unique_id FROM client WHERE username = ? AND unique_id != ?");
        $checkStmt->bind_param("si", $username, $userId);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows > 0) {
            throw new Exception("Username already exists");
        }
        $checkStmt->close();

        $sql = "UPDATE client SET 
                firstName = ?, 
                lastName = ?, 
                username = ?, 
                contactNumber = ?, 
                Pronouns = ?, 
                Address = ? 
                WHERE unique_id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssssi", 
            $firstName, 
            $lastName, 
            $username, 
            $contact, 
            $pronouns, 
            $address, 
            $userId
        );
        
        if ($stmt->execute()) {
            // Update session data
            $_SESSION['username'] = $username;
            $_SESSION['firstName'] = $firstName;
            $_SESSION['lastName'] = $lastName;

            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
        } else {
            throw new Exception("Failed to update profile");
        }
        $stmt->close();

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

$conn->close();
