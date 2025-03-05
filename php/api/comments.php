<?php
// comments.php
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
            if (!isset($_GET['post_id'])) {
                throw new Exception('Missing post_id parameter');
            }
            
            $post_id = intval($_GET['post_id']);
            
            $stmt = $conn->prepare("
                SELECT c.*, cl.username 
                FROM comments c 
                JOIN client cl ON c.user_id = cl.client_id 
                WHERE c.post_id = ? 
                ORDER BY c.created_at DESC
            ");
            $stmt->bind_param("i", $post_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $comments = [];
            while ($row = $result->fetch_assoc()) {
                $comments[] = $row;
            }
            
            echo json_encode($comments);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['post_id']) || !isset($data['content'])) {
                throw new Exception('Invalid comment data');
            }

            $post_id = intval($data['post_id']);
            $content = trim($data['content']);

            if (empty($content)) {
                throw new Exception('Comment content cannot be empty');
            }

            $stmt = $conn->prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)");
            $stmt->bind_param("iis", $post_id, $user_id, $content);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true, 
                    'comment_id' => $stmt->insert_id,
                    'message' => 'Comment created successfully'
                ]);
            } else {
                throw new Exception('Failed to create comment');
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log('Error in comments API: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    // Close statement if it exists
    if (isset($stmt)) {
        $stmt->close();
    }
}