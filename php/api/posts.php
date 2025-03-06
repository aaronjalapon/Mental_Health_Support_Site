<?php
require_once '../db.php';
session_start();

header('Content-Type: application/json');

// Debug log
error_log('Posts API called. Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Session data: ' . print_r($_SESSION, true));

// Verify user is logged in
if (!isset($_SESSION['unique_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Please login first']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get POST data and validate
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            throw new Exception('Invalid JSON data');
        }

        $content = trim($data['content'] ?? '');
        $user_id = $_SESSION['client_id'];

        // Validate content
        if (empty($content)) {
            throw new Exception('Post content cannot be empty');
        }

        // Start transaction
        $conn->begin_transaction();

        // Create post
        $stmt = $conn->prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)");
        if (!$stmt) {
            throw new Exception('Database error: ' . $conn->error);
        }

        $stmt->bind_param("is", $user_id, $content);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to create post: ' . $stmt->error);
        }

        // Get the username for the response
        $username_stmt = $conn->prepare("SELECT username FROM client WHERE client_id = ?");
        $username_stmt->bind_param("i", $user_id);
        $username_stmt->execute();
        $username_result = $username_stmt->get_result();
        $username = $username_result->fetch_assoc()['username'];

        $post_id = $stmt->insert_id;
        $created_at = date('Y-m-d H:i:s');

        $conn->commit();

        // Return success with complete post data
        echo json_encode([
            'status' => 'success',
            'message' => 'Post created successfully',
            'data' => [
                'id' => $post_id,
                'content' => $content,
                'author' => $username,
                'created_at' => $created_at,
                'hearts' => 0,
                'comments' => 0
            ]
        ]);

    } else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch posts with username and counts
        $query = "SELECT p.*, c.username, 
                 (SELECT COUNT(*) FROM reactions WHERE post_id = p.post_id) as heart_count,
                 (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
                 (SELECT COUNT(*) > 0 FROM reactions WHERE post_id = p.post_id AND user_id = ?) as user_reacted
                 FROM posts p 
                 JOIN client c ON p.user_id = c.client_id 
                 ORDER BY p.created_at DESC";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $_SESSION['client_id']);
        $stmt->execute();
        $result = $stmt->get_result();

        $posts = [];
        while ($row = $result->fetch_assoc()) {
            $posts[] = [
                'id' => $row['post_id'],
                'content' => $row['content'],
                'author' => $row['username'],
                'created_at' => $row['created_at'],
                'hearts' => (int)$row['heart_count'],
                'comments' => (int)$row['comment_count'],
                'userReacted' => (bool)$row['user_reacted']
            ];
        }

        echo json_encode([
            'status' => 'success',
            'data' => $posts
        ]);
    }

} catch (Exception $e) {
    if (isset($conn) && $conn->in_transaction()) {
        $conn->rollback();
    }
    error_log('Error in posts.php: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($username_stmt)) $username_stmt->close();
    if (isset($conn)) $conn->close();
}
?>