<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

try {
    // Get total approved clients
    $clientQuery = "SELECT COUNT(*) as total FROM client WHERE Status = 'Approved' AND Role = 'client'";
    $clientResult = $conn->query($clientQuery);
    $totalClients = $clientResult->fetch_assoc()['total'];

    // Get today's active sessions
    $today = date('Y-m-d');
    $sessionQuery = "SELECT COUNT(*) as total FROM appointments 
                    WHERE DATE(appointment_date) = ? 
                    AND status = 'upcoming'";
    $stmt = $conn->prepare($sessionQuery);
    $stmt->bind_param('s', $today);
    $stmt->execute();
    $activeSessions = $stmt->get_result()->fetch_assoc()['total'];

    // Get client growth data based on RegisterDate for all months
    $growthQuery = "SELECT 
                        DATE_FORMAT(RegisterDate, '%b') as month,
                        MONTH(RegisterDate) as month_num,
                        COUNT(*) as count
                    FROM client
                    WHERE Role = 'client'
                    AND Status = 'Approved'
                    AND YEAR(RegisterDate) = YEAR(CURRENT_DATE())
                    GROUP BY month, month_num
                    ORDER BY month_num ASC";
    $growthResult = $conn->query($growthQuery);
    
    // Initialize all months with 0 count
    $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $growthData = array_fill_keys($months, 0);
    
    // Fill in actual counts where data exists
    while($row = $growthResult->fetch_assoc()) {
        $growthData[$row['month']] = (int)$row['count'];
    }
    
    // Convert to array format for chart
    $finalGrowthData = [];
    foreach ($growthData as $month => $count) {
        $finalGrowthData[] = [
            'month' => $month,
            'count' => $count
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'totalClients' => $totalClients,
            'activeSessions' => $activeSessions,
            'growthData' => $finalGrowthData
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
