<?php
include_once '../db.php';

function autoCancelExpiredAppointments() {
    global $conn;
    
    try {
        // Cancel pending appointments that have passed their scheduled time
        $sql = "UPDATE appointments 
                SET status = 'cancelled', 
                    cancellation_reason = 'Automatically cancelled due to expired pending status'
                WHERE status = 'pending' 
                AND CONCAT(date, ' ', time) < NOW()";
        $conn->query($sql);

        // Cancel pending reschedule requests that have expired (after 24 hours)
        $sql = "UPDATE appointments 
                SET status = 'cancelled', 
                    cancellation_reason = 'Automatically cancelled due to expired reschedule request'
                WHERE (status IN ('reschedule_pending', 'reschedule_requested') 
                AND request_expiry IS NOT NULL 
                AND request_expiry < NOW())";
        $conn->query($sql);

        // Cancel pending cancellation requests that have expired (after 24 hours)
        $sql = "UPDATE appointments 
                SET status = 'cancelled', 
                    cancellation_reason = 'Automatically cancelled due to expired cancellation request'
                WHERE status = 'cancellation_pending' 
                AND request_expiry IS NOT NULL 
                AND request_expiry < NOW()";
        $conn->query($sql);

        return true;
    } catch (Exception $e) {
        error_log("Error in autoCancelExpiredAppointments: " . $e->getMessage());
        return false;
    }
}
