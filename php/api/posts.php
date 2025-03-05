<?php
require_once '../db.php';

header('Content-Type: application/json');

// Simple post creation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $content = $_POST['content'] ?? '';
    
    if (empty($content)) {
        echo json_encode(['status' => 'error', 'message' => 'Content is empty']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)");
    $user_id = $_SESSION['client_id'];
    $stmt->bind_param("is", $user_id, $content);
    
    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'id' => $stmt->insert_id
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to create post']);
    }
    exit;
}

// Simple post fetching
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT p.*, c.username, 
                           (SELECT COUNT(*) FROM reactions WHERE post_id = p.post_id) as heart_count,
                           (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count
                           FROM posts p 
                           LEFT JOIN client c ON p.user_id = c.client_id 
                           ORDER BY p.created_at DESC");
    
    $posts = [];
    while ($post = $result->fetch_assoc()) {
        $posts[] = [
            'id' => $post['post_id'],
            'content' => $post['content'],
            'author' => $post['username'],
            'created_at' => $post['created_at'],
            'hearts' => (int)$post['heart_count'],
            'comments' => (int)$post['comment_count']
        ];
    }
    
    echo json_encode($posts);
    exit;
}
?>