<?php
session_start();
include_once "db.php";

if (!isset($_SESSION['unique_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$userId = $_SESSION['unique_id'];

// Check if username is unique (excluding current user)
$stmt = $conn->prepare("SELECT unique_id FROM client WHERE username = ? AND unique_id != ?");
$stmt->bind_param("ss", $_POST['editUsername'], $userId);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Username already taken']);
    exit;
}

// Update user data
$sql = "UPDATE client SET 
        firstName = ?, 
        lastName = ?, 
        username = ?, 
        contactNumber = ?, 
        Pronouns = ?, 
        Address = ? 
        WHERE unique_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssss", 
    $_POST['editFirstName'],     // Changed from firstName to editFirstName
    $_POST['editLastName'],      // Changed from lastName to editLastName
    $_POST['editUsername'],      // Changed from username to editUsername
    $_POST['editContact'],       // Changed from contact to editContact
    $_POST['editPronouns'],      // Changed from pronouns to editPronouns
    $_POST['editAddress'],       // Changed from address to editAddress
    $userId
);

if ($stmt->execute()) {
    // Update session data
    $_SESSION['username'] = $_POST['editUsername'];
    echo json_encode(['success' => true]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update profile: ' . $stmt->error
    ]);
}
