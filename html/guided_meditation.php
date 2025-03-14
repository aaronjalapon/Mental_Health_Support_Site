<?php
session_start();
// Check if user is logged in
if(!isset($_SESSION['unique_id'])) {
    header("Location: ../html/login.php");
    exit();
}

// Set role variable safely
$isAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guided Meditation - MindSpace</title>
    <link rel="stylesheet" href="/css/guided_meditation.css">
    <link rel="stylesheet" href="/css/header.css">
    <link rel="stylesheet" href="../css/community.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="icon" href="/images/Logo.svg" type="image/x-icon">
</head>
<body>
    
    <?php include '../components/header.php'; ?>

    <main>
        <section class="hero">
            <div class="hero-content">
                <h1>Guided Meditation</h1>
                <p>Find peace and balance through our curated meditation sessions</p>
            </div>
        </section>

        <section id="meditation-categories" class="categories">
            <h2>Meditation Categories</h2>
            <div class="category-grid">
                <div class="category-card beginner">
                    <h3>Beginner's Guide</h3>
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/inpok4MKVLM" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <p>Perfect for those new to meditation. Learn the basics of mindfulness and breathing techniques.</p>
                </div>

                <div class="category-card stress-relief">
                    <h3>Stress Relief</h3>
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/z6X5oEIg6Ak" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <p>Release tension and find calm with guided stress relief meditation sessions.</p>
                </div>

                <div class="category-card sleep">
                    <h3>Sleep Meditation</h3>
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/aEqlQvczMJQ" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <p>Peaceful meditations to help you relax and prepare for restful sleep.</p>
                </div>

                <div class="category-card mindfulness">
                    <h3>Mindfulness Practice</h3>
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/ZToicYcHIOU" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <p>Develop present-moment awareness and enhance your mindfulness practice.</p>
                </div>

                <div class="category-card anxiety">
                    <h3>Anxiety Relief</h3>
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/O-6f5wQXSu8" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <p>Calm your anxious thoughts and find inner peace with these targeted meditation practices.</p>
                </div>

                <div class="category-card focus">
                    <h3>Focus & Concentration</h3>
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/ez3GgRqhNvA" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <p>Enhance your focus and mental clarity through concentration meditation techniques.</p>
                </div>
            </div>
        </section>
    </main>

    <?php include $_SERVER['DOCUMENT_ROOT'] . '/components/footer.php'; ?>

   
    <script src="/js/guided_meditation.js"></script>
    <script src="../js/landing_page.js"></script>
</body>
</html>
