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
    $user_id = $_SESSION['client_id'];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $post_id = filter_var($data['post_id'] ?? null, FILTER_VALIDATE_INT);
        $content = trim($data['content'] ?? '');

        if (!$post_id || empty($content)) {
            throw new Exception('Invalid post ID or empty comment');
        }

        $stmt = $conn->prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)");
        if (!$stmt) {
            throw new Exception('Failed to prepare statement: ' . $conn->error);
        }

        $stmt->bind_param("iis", $post_id, $user_id, $content);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to add comment: ' . $stmt->error);
        }

        echo json_encode([
            'status' => 'success',
            'data' => [
                'id' => $stmt->insert_id,
                'content' => $content,
                'created_at' => date('Y-m-d H:i:s'),
                'author' => $_SESSION['username'] ?? 'Anonymous'
            ]
        ]);

    } else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $post_id = filter_var($_GET['post_id'] ?? null, FILTER_VALIDATE_INT);
        
        if (!$post_id) {
            throw new Exception('Invalid post ID');
        }

        $stmt = $conn->prepare(
            "SELECT c.*, cl.username as author 
             FROM comments c
             JOIN client cl ON c.user_id = cl.client_id
             WHERE c.post_id = ?
             ORDER BY c.created_at DESC"
        );

        if (!$stmt) {
            throw new Exception('Failed to prepare statement: ' . $conn->error);
        }

        $stmt->bind_param("i", $post_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $comments = [];
        while ($comment = $result->fetch_assoc()) {
            $comments[] = [
                'id' => $comment['comment_id'],
                'content' => $comment['content'],
                'created_at' => $comment['created_at'],
                'author' => $comment['author']
            ];
        }
        
        echo json_encode(['status' => 'success', 'data' => $comments]);
    }

} catch (Exception $e) {
    error_log('Error in comments.php: ' . $e->getMessage());
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