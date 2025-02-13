<!-- <?php
    session_start();
    include_once '../php/db.php';

    // Redirect if not logged in
    if(!isset($_SESSION['unique_id'])){
        header('Location: login.php');
        exit();
    }

    $unique_id = $_SESSION['unique_id'];
    
    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT verification_status FROM users WHERE unique_id = ?");
    $stmt->bind_param("i", $unique_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0){
        $row = $result->fetch_assoc();
        if($row['verification_status'] == '1'){ // Changed from 'Verified' to '1'
            header('Location: index.html');
            exit();
        }
    } else {
        header('Location: login.php');
        exit();
    }

    // Only show the HTML if user is not verified
?> -->



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
   
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

            <div class="submit">
                <input type="submit" class="button" class="otp_field" value="Verify Now" >
            </div>

        </form>


    </div>
    <script src="../js/verfiy.js"></script>

</body>
</html>