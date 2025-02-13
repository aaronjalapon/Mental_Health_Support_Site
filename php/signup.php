<?php
session_start();
include_once 'db.php';

require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


// Configuration
define('UPLOAD_PATH', __DIR__ . '/../ImagesForValidID/');
define('ALLOWED_EXTENSIONS', ['png', 'jpeg', 'jpg']);
define('MIN_PASSWORD_LENGTH', 8);

// Validation functions
function isPasswordStrong($password) {
    return (strlen($password) >= MIN_PASSWORD_LENGTH && 
            preg_match('/[A-Z]/', $password) && 
            preg_match('/[a-z]/', $password) && 
            preg_match('/[0-9]/', $password));
}

function validateContactNumber($number) {
    return preg_match('/^[0-9]{11}$/', $number);
}

// Sanitize inputs
$firstName = mysqli_real_escape_string($conn, trim($_POST['firstName']));
$lastName = mysqli_real_escape_string($conn, trim($_POST['lastName']));
$username = mysqli_real_escape_string($conn, trim($_POST['username']));
$email = mysqli_real_escape_string($conn, trim($_POST['email']));
$contactNumber = mysqli_real_escape_string($conn, trim($_POST['contactNumber']));
$pronouns = mysqli_real_escape_string($conn, trim($_POST['Pronouns']));
$address = mysqli_real_escape_string($conn, trim($_POST['address']));
$password = $_POST['password'];
$cpassword = $_POST['cpass'];

$Role = 'user';
$verification_status = '0';

// Validate all required fields
if (empty($firstName) || empty($lastName) || empty($username) || empty($email) || 
    empty($contactNumber) || empty($pronouns) || empty($address) || 
    empty($password) || empty($cpassword)) {
    echo "All input fields are required!";
    exit();
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "$email is not a valid email.";
    exit();
}

// Check if email exists
$stmt = $conn->prepare("SELECT email FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo "email ~ Already Exists";
    exit();
}

// Check if username exists
$stmt = $conn->prepare("SELECT username FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo "username ~ Already Exists";
    exit();
}

// Validate contact number
if (!validateContactNumber($contactNumber)) {
    echo "Invalid contact number format. Please enter 11 digits.";
    exit();
}

// Validate password strength
if (!isPasswordStrong($password)) {
    echo "Password must be at least 8 characters and contain uppercase, lowercase, and numbers";
    exit();
}

// Check password match
if ($password !== $cpassword) {
    echo "Confirm password doesn't match.";
    exit();
}

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Handle image upload
if (!isset($_FILES['ValidID']) || $_FILES['ValidID']['error'] !== UPLOAD_ERR_OK) {
    echo "Please select a valid ID image.";
    exit();
}

$img_name = $_FILES['ValidID']['name'];
$tmp_name = $_FILES['ValidID']['tmp_name'];
$img_extension = strtolower(pathinfo($img_name, PATHINFO_EXTENSION));

if (!in_array($img_extension, ALLOWED_EXTENSIONS)) {
    echo "Please select a valid image file (JPG, PNG, JPEG).";
    exit();
}

$newimagename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $img_extension;
$image_path = UPLOAD_PATH . $newimagename;

if (!move_uploaded_file($tmp_name, $image_path)) {
    echo "Failed to upload image.";
    exit();
}

// Generate random ID and OTP
$random_id = rand(time(), 10000000);
$otp = mt_rand(111111, 999999);

try {
    // Configure and send email
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'nonamemister28@gmail.com'; // Consider moving to config file
    $mail->Password = 'limm dgni spms buqq'; // Consider moving to config file
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->setFrom('nonamemister28@gmail.com', 'MindSpace');
    $mail->addAddress($email);
    $mail->Subject = "Account Verification OTP";
    $mail->Body = "Hello $firstName $lastName,\n\n"
                . "Your OTP for email verification is: $otp\n\n"
                . "Thank you for registering with MindSpace!";
    
    $mail->send();

    // Begin transaction
    $conn->begin_transaction();

    // Insert user data
    $stmt = $conn->prepare("
        INSERT INTO users (
            unique_id, firstName, lastName, username, password, 
            email, contactNumber, Pronouns, Address, ValidID, 
            otp, verification_status, Role, RegisterDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
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
        $otp, 
        $verification_status, 
        $Role
    );

    if (!$stmt->execute()) {
        throw new Exception("Failed to insert user data");
    }

    // Commit transaction
    $conn->commit();

    // Set session variables
    $_SESSION['unique_id'] = $random_id;
    $_SESSION['email'] = $email;
    $_SESSION['otp'] = $otp;
    
    echo "Success";

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    // Delete uploaded image if database insertion fails
    if (file_exists($image_path)) {
        unlink($image_path);
    }
    
    error_log("Registration Error: " . $e->getMessage());
    echo "Registration failed. Please try again later.";
}

$conn->close();
?>