<?php
session_start();
header('Content-Type: application/json');

$response = array(
    'loggedIn' => isset($_SESSION['unique_id']),
    'user' => isset($_SESSION['unique_id']) ? array(
        'firstName' => $_SESSION['firstName'],
        'lastName' => $_SESSION['lastName']
    ) : null
);

echo json_encode($response);
?>