<?php
session_start();
require_once '../db.php';

header('Content-Type: application/json');

// Function to get YouTube video ID from URL
function getYouTubeVideoId($url) {
    $videoId = "";
    $pattern = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i';
    if (preg_match($pattern, $url, $match)) {
        $videoId = $match[1];
    }
    return $videoId;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'create';

    switch ($action) {
        case 'create':
        case 'update':
            $title = $_POST['title'];
            $videoUrl = $_POST['videoId'];
            $category = $_POST['category'];
            $description = $_POST['description'];
            $youtubeId = getYouTubeVideoId($videoUrl);
            
            if (empty($youtubeId)) {
                echo json_encode(['status' => 'error', 'message' => 'Invalid YouTube URL']);
                exit;
            }

            if ($action === 'create') {
                $stmt = $conn->prepare("INSERT INTO meditation_videos (title, youtube_id, category, description) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("ssss", $title, $youtubeId, $category, $description);
            } else {
                $id = $_POST['id'];
                $stmt = $conn->prepare("UPDATE meditation_videos SET title = ?, youtube_id = ?, category = ?, description = ? WHERE video_id = ?");
                $stmt->bind_param("ssssi", $title, $youtubeId, $category, $description, $id);
            }

            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => $action === 'create' ? 'Video added successfully' : 'Video updated successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Database error']);
            }
            break;

        case 'delete':
            $id = $_POST['id'];
            $stmt = $conn->prepare("DELETE FROM meditation_videos WHERE video_id = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Video deleted successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Database error']);
            }
            break;
    }
} else {
    // GET request - fetch videos
    $category = $_GET['category'] ?? null;
    $id = $_GET['id'] ?? null;

    if ($id) {
        // Fetch specific video
        $stmt = $conn->prepare("SELECT * FROM meditation_videos WHERE video_id = ?");
        $stmt->bind_param("i", $id);
    } elseif ($category) {
        // Fetch videos by category
        $stmt = $conn->prepare("SELECT * FROM meditation_videos WHERE category = ?");
        $stmt->bind_param("s", $category);
    } else {
        // Fetch all videos
        $stmt = $conn->prepare("SELECT * FROM meditation_videos ORDER BY created_at DESC");
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $videos = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $videos]);
}
?>
