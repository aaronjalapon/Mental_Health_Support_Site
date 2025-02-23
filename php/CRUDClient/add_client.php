<?php
session_start();
include_once '../db.php';

// Ensure proper JSON response headers
header('Content-Type: application/json');

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Configuration
define('UPLOAD_PATH', __DIR__ . '/../../ImagesForValidID/');
define('ALLOWED_EXTENSIONS', ['png', 'jpeg', 'jpg']);
define('MIN_PASSWORD_LENGTH', 8);

function isPasswordStrong($password) {
    return (strlen($password) >= MIN_PASSWORD_LENGTH && 
            preg_match('/[A-Z]/', $password) && 
            preg_match('/[a-z]/', $password) && 
            preg_match('/[0-9]/', $password));
}

try {
    // Get form data
    $firstName = filter_input(INPUT_POST, 'firstName', FILTER_SANITIZE_STRING);
    $lastName = filter_input(INPUT_POST, 'lastName', FILTER_SANITIZE_STRING);
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    $contactNumber = filter_input(INPUT_POST, 'contact', FILTER_SANITIZE_STRING);
    $pronouns = filter_input(INPUT_POST, 'pronouns', FILTER_SANITIZE_STRING);
    $address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
    $status = "Pending";
    $Role = 'user';
    $verification_status = '1'; // Auto-verified since admin is creating

    // Validate required fields
    if (!$firstName || !$lastName || !$username || !$email || !$password || !$contactNumber) {
        throw new Exception('All required fields must be filled');
    }

    // Validate password
    if (!isPasswordStrong($password)) {
        echo json_encode(['error' => 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers']);
        exit();
    }

    // Check if email exists
    $stmt = $conn->prepare("SELECT email FROM client WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['error' => 'Email already exists']);
        exit();
    }

    // Check if username exists
    $stmt = $conn->prepare("SELECT username FROM client WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['error' => 'Username already exists']);
        exit();
    }

    // Handle image upload
    if (!isset($_FILES['ValidID']) || $_FILES['ValidID']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['error' => 'Please select a valid ID image']);
        exit();
    }

    $img_name = $_FILES['ValidID']['name'];
    $tmp_name = $_FILES['ValidID']['tmp_name'];
    $img_extension = strtolower(pathinfo($img_name, PATHINFO_EXTENSION));

    if (!in_array($img_extension, ALLOWED_EXTENSIONS)) {
        echo json_encode(['error' => 'Please select a valid image file (JPG, PNG, JPEG)']);
        exit();
    }

    $newimagename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $img_extension;
    $image_path = UPLOAD_PATH . $newimagename;

    // Generate random ID
    $random_id = rand(time(), 10000000);
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Begin transaction
    $conn->begin_transaction();

    try {
        // Move uploaded file
        if (!move_uploaded_file($tmp_name, $image_path)) {
            throw new Exception("Failed to upload image");
        }

        // Insert user data
        $stmt = $conn->prepare("
            INSERT INTO client (
                unique_id, firstName, lastName, username, password,
                email, contactNumber, Pronouns, Address, ValidID,
                Status, verification_status, Role, RegisterDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");

        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("sssssssssssss",
            $random_id,
            $firstName,
            $lastName,
            $username,
            $hashed_password,
            $email,
            $contactNumber,
            $pronouns,
            $address,
            $newimagename,
            $status,
            $verification_status,
            $Role
        );

        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Client added successfully']);

    } catch (Exception $e) {
        $conn->rollback();
        if (file_exists($image_path)) {
            unlink($image_path);
        }
        throw $e;
    }

} catch (Exception $e) {
    error_log("Error in add_client.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>