<?php
error_reporting(0);

// Only set header to JSON if file is directly accessed
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    header('Content-Type: application/json');
}

session_start();
require_once __DIR__ . '/../db.php';

// Basic CRUD functions
function createTestimonial($username, $content, $rating) {
    global $conn;
    
    // Check if the number of testimonials is less than or equal to 6
    $countQuery = "SELECT COUNT(*) as count FROM testimonials";
    $countResult = $conn->query($countQuery);
    $count = $countResult->fetch_assoc()['count'];
    
    if ($count >= 6) {
        return false; // Limit reached
    }

    $stmt = $conn->prepare("INSERT INTO testimonials (username, content, rating) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $username, $content, $rating);
    return $stmt->execute();
}

// Update the existing getTestimonials function to keep it separate for admin
function getTestimonials() {
    global $conn;
    $query = "SELECT testimonial_id, username, content, rating, created_at 
              FROM testimonials 
              ORDER BY created_at DESC";
    $result = $conn->query($query);
    return $result->fetch_all(MYSQLI_ASSOC);
}

function getTestimonialById($id) {
    global $conn;
    $stmt = $conn->prepare("SELECT testimonial_id, username, content, rating FROM testimonials WHERE testimonial_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function updateTestimonial($id, $username, $content, $rating) {
    global $conn;
    $stmt = $conn->prepare("UPDATE testimonials SET username = ?, content = ?, rating = ? WHERE testimonial_id = ?");
    $stmt->bind_param("ssii", $username, $content, $rating, $id);
    return $stmt->execute();
}

function deleteTestimonial($id) {
    global $conn;
    $stmt = $conn->prepare("DELETE FROM testimonials WHERE testimonial_id = ?");
    $stmt->bind_param("i", $id);
    return $stmt->execute();
}

// Add this function for public display of testimonials
function getPublicTestimonials() {
    global $conn;
    $query = "SELECT username, content, rating 
              FROM testimonials 
              WHERE rating >= 3  -- Only show testimonials with 3 or more stars
              ORDER BY created_at DESC 
              LIMIT 6"; // Limit to 6 most recent testimonials
    $result = $conn->query($query);
    if ($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    return [];
}

// Only process API requests if the file is directly accessed
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    // Handle POST requests
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            $action = $_POST['action'] ?? '';
            
            switch($action) {
                case 'create':
                    $username = trim($_POST['username']);
                    $content = trim($_POST['content']);
                    $rating = intval($_POST['rating']);
                    
                    // Validation
                    if (empty($username)) {
                        throw new Exception('Username is required');
                    }
                    if (strlen($content) < 10) {
                        throw new Exception('Testimonial must be at least 10 characters long');
                    }
                    if ($rating < 1 || $rating > 5) {
                        throw new Exception('Rating must be between 1 and 5');
                    }
                    
                    if (createTestimonial($username, $content, $rating)) {
                        echo json_encode(['status' => 'success', 'message' => 'Testimonial added successfully']);
                    } else {
                        throw new Exception('Failed to add testimonial or limit reached');
                    }
                    break;

                case 'update':
                    $id = intval($_POST['id']);
                    $username = trim($_POST['username']);
                    $content = trim($_POST['content']);
                    $rating = intval($_POST['rating']);
                    
                    if (empty($username)) {
                        throw new Exception('Username cannot be empty');
                    }
                    if (empty($content)) {
                        throw new Exception('Content cannot be empty');
                    }
                    if ($rating < 1 || $rating > 5) {
                        throw new Exception('Rating must be between 1 and 5');
                    }
                    
                    if (updateTestimonial($id, $username, $content, $rating)) {
                        echo json_encode(['status' => 'success', 'message' => 'Testimonial updated successfully']);
                    } else {
                        throw new Exception('Failed to update testimonial');
                    }
                    break;

                case 'delete':
                    $id = intval($_POST['id']);
                    if (deleteTestimonial($id)) {
                        echo json_encode(['status' => 'success']);
                    } else {
                        throw new Exception('Failed to delete testimonial');
                    }
                    break;

                default:
                    throw new Exception('Invalid action');
            }
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        exit;
    }

    // Handle GET requests
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $id = $_GET['id'] ?? null;
        
        try {
            if ($id) {
                $testimonial = getTestimonialById($id);
                echo json_encode(['status' => 'success', 'data' => $testimonial]);
            } else {
                $testimonials = getTestimonials();
                echo json_encode(['status' => 'success', 'data' => $testimonials]);
            }
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        exit;
    }
}
?>