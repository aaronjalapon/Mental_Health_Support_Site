<?php
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

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get pagination parameters
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 10;
            $offset = ($page - 1) * $limit;
            
            // Prepare the main query with joins for user info and counts
            $query = "
                SELECT 
                    p.*,
                    c.username,
                    c.firstName,
                    c.lastName,
                    COUNT(DISTINCT r.reaction_id) as reaction_count,
                    COUNT(DISTINCT cm.comment_id) as comment_count,
                    EXISTS(SELECT 1 FROM reactions WHERE post_id = p.post_id AND user_id = ?) as user_reacted
                FROM posts p
                JOIN client c ON p.user_id = c.client_id
                LEFT JOIN reactions r ON p.post_id = r.post_id
                LEFT JOIN comments cm ON p.post_id = cm.post_id
                GROUP BY p.post_id
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            ";
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param("iii", $user_id, $limit, $offset);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $posts = [];
            while ($row = $result->fetch_assoc()) {
                $posts[] = [
                    'id' => $row['post_id'],
                    'content' => $row['content'],
                    'author' => $row['username'],
                    'authorName' => $row['firstName'] . ' ' . $row['lastName'],
                    'created_at' => $row['created_at'],
                    'reactions' => intval($row['reaction_count']),
                    'comments' => intval($row['comment_count']),
                    'userReacted' => (bool)$row['user_reacted']
                ];
            }
            
            echo json_encode([
                'success' => true,
                'data' => $posts,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'hasMore' => count($posts) === $limit
                ]
            ]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['content']) || trim($data['content']) === '') {
                throw new Exception('Post content is required');
            }
            
            $content = trim($data['content']);
            
            $stmt = $conn->prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)");
            $stmt->bind_param("is", $user_id, $content);
            
            if (!$stmt->execute()) {
                throw new Exception('Failed to create post');
            }
            
            $post_id = $stmt->insert_id;
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $post_id,
                    'content' => $content,
                    'created_at' => date('Y-m-d H:i:s'),
                    'reactions' => 0,
                    'comments' => 0
                ]
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log('Error in posts API: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    // Close statement if it exists
    if (isset($stmt)) {
        $stmt->close();
    }
}