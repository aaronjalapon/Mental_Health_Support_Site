<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    // Updated query to include ValidIDid
    $query = "SELECT 
        client_id,     /* Changed from unique_id to client_id */
        firstName,
        lastName,
        username,
        email,
        contactNumber,
        Status,
        Pronouns,
        Address,
        ValidID     /* Added ValidID field */
        FROM client 
        WHERE Role = 'client'
        ORDER BY RegisterDate DESC";
        
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception($conn->error);
    }
    
    $clients = [];
    while($row = $result->fetch_assoc()) {
        $clients[] = [
            'id' => $row['client_id'],  // Changed from unique_id to client_id     /* Changed from unique_id to client_id */
            'firstName' => htmlspecialchars($row['firstName']),
            'lastName' => htmlspecialchars($row['lastName']),
            'username' => htmlspecialchars($row['username']),
            'email' => htmlspecialchars($row['email']),
            'contact' => htmlspecialchars($row['contactNumber']),
            'status' => htmlspecialchars($row['Status']),
            'pronouns' => $row['Pronouns'] ?? 'I prefer not to say', // Use null coalescing operator
            'address' => htmlspecialchars($row['Address']),
            'validId' => htmlspecialchars($row['ValidID'])  /* Added ValidID to response */
        ];
    }
    
    echo json_encode($clients);
    
} catch (Exception $e) {
    error_log("Error in fetch_clients.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>