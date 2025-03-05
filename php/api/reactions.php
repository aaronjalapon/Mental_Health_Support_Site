<?php
require_once '../db.php'; // Fix path

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
if (!isset($_SESSION['unique_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $post_id = filter_var($data['post_id'] ?? null, FILTER_VALIDATE_INT);
    $user_id = $_SESSION['client_id'];

    if (!$post_id) {
        throw new Exception('Invalid post ID');
    }

    // Start transaction
    $conn->begin_transaction();

    // Check if reaction exists
    $stmt = $conn->prepare("SELECT * FROM reactions WHERE post_id = ? AND user_id = ?");
    if (!$stmt) {
        throw new Exception('Failed to prepare check statement: ' . $conn->error);
    }

    $stmt->bind_param("ii", $post_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Remove reaction
        $stmt = $conn->prepare("DELETE FROM reactions WHERE post_id = ? AND user_id = ?");
        $action = 'removed';
    } else {
        // Add reaction
        $stmt = $conn->prepare("INSERT INTO reactions (post_id, user_id) VALUES (?, ?)");
        $action = 'added';
    }

    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }

    $stmt->bind_param("ii", $post_id, $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to update reaction: ' . $stmt->error);
    }

    $conn->commit();
    echo json_encode(['status' => 'success', 'action' => $action]);

} catch (Exception $e) {
    if ($conn->in_transaction()) {
        $conn->rollback();
    }
    error_log('Error in reactions.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>