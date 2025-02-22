<?php
session_start();
include_once '../db.php';  // Fixed include path

// Check if user is logged in and is admin
if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    // Updated query to match the database structure
    $query = "SELECT 
        unique_id as id, 
        firstName, 
        lastName, 
        username, 
        email, 
        contactNumber as contact, 
        Status as status, 
        Pronouns as pronouns, 
        Address as address 
        FROM client 
        WHERE Role = 'client'";
        
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $clients = [];
    while($row = $result->fetch_assoc()) {
        // Ensure proper data formatting
        $clients[] = array(
            'id' => $row['id'],
            'firstName' => htmlspecialchars($row['firstName']),
            'lastName' => htmlspecialchars($row['lastName']),
            'username' => htmlspecialchars($row['username']),
            'email' => htmlspecialchars($row['email']),
            'contact' => htmlspecialchars($row['contact']),
            'status' => htmlspecialchars($row['status']),
            'pronouns' => htmlspecialchars($row['pronouns']),
            'address' => htmlspecialchars($row['address'])
        );
    }
    
    header('Content-Type: application/json');
    echo json_encode($clients);
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    error_log("Error in fetch_clients.php: " . $e->getMessage());
    echo json_encode(['error' => 'Failed to fetch clients', 'details' => $e->getMessage()]);
}

$conn->close();
?>