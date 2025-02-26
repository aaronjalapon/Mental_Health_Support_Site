<?php
session_start();
include_once "db.php";

// Get unique_id from session
$unique_id = $_SESSION['unique_id'];

// Get OTP digits from POST
$otp1 = isset($_POST['otp1']) ? $_POST['otp1'] : '';
$otp2 = isset($_POST['otp2']) ? $_POST['otp2'] : '';
$otp3 = isset($_POST['otp3']) ? $_POST['otp3'] : '';
$otp4 = isset($_POST['otp4']) ? $_POST['otp4'] : '';
$otp5 = isset($_POST['otp5']) ? $_POST['otp5'] : '';
$otp6 = isset($_POST['otp6']) ? $_POST['otp6'] : '';

// Combine OTP digits
$OTP = $otp1.$otp2.$otp3.$otp4.$otp5.$otp6;

if(!empty($OTP)){
    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT * FROM client WHERE unique_id = ? AND otp = ?");
    $stmt->bind_param("is", $unique_id, $OTP);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0){ 
        // OTP matches
        $row = $result->fetch_assoc();
        
        // Update user verification status
        $stmt2 = $conn->prepare("UPDATE client SET verification_status = '1', otp = '0' WHERE unique_id = ?");
        $stmt2->bind_param("i", $unique_id);
        
        if($stmt2->execute()){
            $_SESSION['unique_id'] = $row['unique_id'];
            $_SESSION['username'] = $row['username']; // Set the username session variable
            $_SESSION['verification_status'] = '1';
            echo "Success";
        } else {
            echo "Update failed!";
        }
    } else {
        echo "Wrong OTP!";
    }
} else {
    echo "Enter OTP!";
}
?>