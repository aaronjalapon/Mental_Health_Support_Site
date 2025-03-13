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
    // Check if this is a password reset verification
    if (isset($_SESSION['reset_email'])) {
        $stmt = $conn->prepare("SELECT * FROM client WHERE email = ? AND otp = ?");
        $stmt->bind_param("ss", $_SESSION['reset_email'], $OTP);
    } else {
        // Regular registration verification
        $stmt = $conn->prepare("SELECT * FROM client WHERE unique_id = ? AND otp = ?");
        $stmt->bind_param("is", $unique_id, $OTP);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0){ 
        $row = $result->fetch_assoc();
        
        if (isset($_SESSION['reset_email'])) {
            $_SESSION['reset_verified'] = true;
            echo json_encode([
                'status' => 'success',
                'type' => 'reset_password',
                'message' => 'OTP verified successfully'
            ]);
        } else {
            // Regular registration verification
            $stmt2 = $conn->prepare("UPDATE client SET verification_status = '1', otp = '0' WHERE unique_id = ?");
            $stmt2->bind_param("i", $unique_id);
            
            if($stmt2->execute()){
                // Check client's status
                $status_stmt = $conn->prepare("SELECT Status FROM client WHERE unique_id = ?");
                $status_stmt->bind_param("i", $unique_id);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                $status_row = $status_result->fetch_assoc();
                
                session_unset();
                session_destroy();

                echo json_encode([
                    'status' => 'success',
                    'type' => 'registration',
                    'message' => 'Email verified successfully',
                    'accountStatus' => $status_row['Status']
                ]);
                $status_stmt->close();
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Update failed!'
                ]);
            }
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Wrong OTP!'
        ]);
    }
} else {
    echo "Enter OTP!";
}
?>