<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    // Debug log
    error_log("Received POST data: " . print_r($_POST, true));
    error_log("Received FILES data: " . print_r($_FILES, true));

    // Validate and sanitize inputs
    if (!isset($_POST['editClientId'])) {
        throw new Exception("Client ID is required");
    }

    $id = mysqli_real_escape_string($conn, $_POST['editClientId']);
    $firstName = mysqli_real_escape_string($conn, $_POST['firstName']);
    $lastName = mysqli_real_escape_string($conn, $_POST['lastName']);
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $contact = mysqli_real_escape_string($conn, $_POST['contact']);
    $pronouns = isset($_POST['pronouns']) && in_array($_POST['pronouns'], [
        'He/Him/His',
        'She/Her/Hers',
        'Others',
        'I prefer not to say'
    ]) ? $_POST['pronouns'] : 'I prefer not to say';

    // Debug log
    error_log("Pronouns value being set: " . $pronouns);

    $address = mysqli_real_escape_string($conn, $_POST['address']);
    $status = mysqli_real_escape_string($conn, $_POST['status']);

    // Begin transaction
    $conn->begin_transaction();

    try {
        $validIdUpdate = '';
        $params = [$firstName, $lastName, $username, $email, $contact, $pronouns, $address, $status];
        $types = "ssssssss";

        // Handle ValidID update if a new file is uploaded
        if (isset($_FILES['ValidID']) && $_FILES['ValidID']['error'] === UPLOAD_ERR_OK) {
            // Get old ValidID filename
            $stmt = $conn->prepare("SELECT ValidID FROM client WHERE unique_id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $oldValidIdFile = $result->fetch_assoc()['ValidID'];

            // Process new ValidID
            $img_name = $_FILES['ValidID']['name'];
            $img_extension = strtolower(pathinfo($img_name, PATHINFO_EXTENSION));
            
            if (!in_array($img_extension, ['png', 'jpeg', 'jpg'])) {
                throw new Exception('Invalid file type. Only JPG, JPEG, PNG allowed.');
            }

            $new_img_name = time() . '_' . bin2hex(random_bytes(8)) . '.' . $img_extension;
            $upload_path = __DIR__ . '/../../ImagesForValidID/';

            if (!move_uploaded_file($_FILES['ValidID']['tmp_name'], $upload_path . $new_img_name)) {
                throw new Exception('Failed to upload new ValidID');
            }

            $validIdUpdate = ", ValidID = ?";
            $params[] = $new_img_name;
            $types .= "s";

            // Delete old file
            if ($oldValidIdFile && file_exists($upload_path . $oldValidIdFile)) {
                unlink($upload_path . $oldValidIdFile);
            }
        }

        // Add ID to parameters
        $params[] = $id;
        $types .= "s";

        // Prepare update query
        $query = "UPDATE client SET 
            firstName = ?, 
            lastName = ?, 
            username = ?, 
            email = ?, 
            contactNumber = ?, 
            Pronouns = ?, 
            Address = ?, 
            Status = ? 
            $validIdUpdate
            WHERE unique_id = ?";

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);

        if (!$stmt->execute()) {
            throw new Exception("Database error: " . $stmt->error);
        }

        $conn->commit();
        echo json_encode(['success' => true]);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Error in update_client.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>