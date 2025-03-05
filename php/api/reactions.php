<?php
// reactions.php
require_once '../php/db.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Single database connection function
function getDatabaseConnection() {
    static $conn = null;
    if ($conn === null) {
        $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if (!$conn) {
            error_log('Database connection failed: ' . mysqli_connect_error());
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit();
        }
    }
    return $conn;
}

// Authentication check function
function checkAuthentication() {
    session_start();
    if (!isset($_SESSION['unique_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    return $_SESSION['client_id'];
}

try {
    $user_id = checkAuthentication();
    $conn = getDatabaseConnection();

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['post_id'])) {
        throw new Exception('Missing post_id');
    }

    $post_id = intval($data['post_id']);

    // Use a transaction for atomic operation
    $conn->begin_transaction();

    // Check if reaction exists
    $stmt = $conn->prepare("SELECT reaction_id FROM reactions WHERE post_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $post_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Remove reaction
        $stmt = $conn->prepare("DELETE FROM reactions WHERE post_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $post_id, $user_id);
        $action = 'removed';
    } else {
        // Add reaction
        $stmt = $conn->prepare("INSERT INTO reactions (post_id, user_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $post_id, $user_id);
        $action = 'added';
    }

    if ($stmt->execute()) {
        $conn->commit();
        echo json_encode(['success' => true, 'action' => $action]);
    } else {
        $conn->rollback();
        throw new Exception('Failed to update reaction');
    }

} catch (Exception $e) {
    // Rollback transaction if it's still open
    if ($conn->in_transaction()) {
        $conn->rollback();
    }

    error_log('Error in reactions API: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    // Close statement if it exists
    if (isset($stmt)) {
        $stmt->close();
    }
}