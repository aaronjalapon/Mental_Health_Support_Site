<?php
    session_start();
    include_once '../php/db.php';

    // Redirect if not logged in
    if(!isset($_SESSION['unique_id'])){
        header('Location: ../html/login.php');
        exit();
    }

    $unique_id = $_SESSION['unique_id'];
    
    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT verification_status FROM client WHERE unique_id = ?");
    $stmt->bind_param("i", $unique_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0){
        $row = $result->fetch_assoc();
        if($row['verification_status'] == '1'){
            header('Location: ../html/login.php');
            exit();
        }
    } else {
        header('Location: login.php');
        exit();
    }

    // Handle form submission for OTP verification
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $otp = $_POST['otp1'] . $_POST['otp2'] . $_POST['otp3'] . $_POST['otp4'] . $_POST['otp5'] . $_POST['otp6'];
        
        // Verify OTP against the stored value in database
        $stmt = $conn->prepare("SELECT otp, username FROM client WHERE unique_id = ?");
        $stmt->bind_param("i", $unique_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($result->num_rows > 0 && $otp === $row['otp']) {
            // Update verification status in the database
            $stmt = $conn->prepare("UPDATE client SET verification_status = '1' WHERE unique_id = ?");
            $stmt->bind_param("i", $unique_id);
            $stmt->execute();

            // Optionally, clear the OTP from database after successful verification
            $stmt = $conn->prepare("UPDATE client SET otp = NULL WHERE unique_id = ?");
            $stmt->bind_param("i", $unique_id);
            $stmt->execute();

            // Set the username session variable
            $_SESSION['username'] = $row['username'];

            // Redirect to login page after successful verification
            header('Location: ../html/login.php');
            exit();
        } else {
            $error = "Invalid OTP. Please try again.";
        }
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <link rel="stylesheet" href="../css/verify.css">
   
</head>
<body>
    <div class="form" style="text-align: center; ">
        <h2>Verify your Account</h2>
        <p>We emailed you the six digit otp code to Enter the code below to confirm your email address..</p>

        <form action="" method="post" autocomplete="off">
           
            <div class="fields-input">
                <input type="number" name="otp1" class="otp_field" placeholder="0" min="0" max="9" required onpaste="false">
                <input type="number" name="otp2" class="otp_field" placeholder="0" min="0" max="9" required onpaste="false">
                <input type="number" name="otp3" class="otp_field" placeholder="0" min="0" max="9" required onpaste="false">
                <input type="number" name="otp4" class="otp_field" placeholder="0" min="0" max="9" required onpaste="false">
                <input type="number" name="otp5" class="otp_field" placeholder="0" min="0" max="9" required onpaste="false">
                <input type="number" name="otp6" class="otp_field" placeholder="0" min="0" max="9" required onpaste="false">

            </div>
            <!-- Add this before the closing </form> tag in verify.php -->
            <div class="resend-code">
                <a href="#" id="resendCode">Resend verification code</a>
                <div class="resend-timer" id="resendTimer"></div>
            </div>


            <div class="submit">
                <input type="submit" class="button" class="otp_field" value="Verify Now" >
            </div>

        </form>


    </div>
    <script src="../js/verify.js"></script>

</body>
</html>