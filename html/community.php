<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Debug logging
error_log('Community page loaded. Session data: ' . print_r($_SESSION, true));

if(!isset($_SESSION['unique_id'])) {
    header("Location: ../html/login.php");
    exit();
}

// Make sure client_id is set
if(!isset($_SESSION['client_id'])) {
    $_SESSION['client_id'] = $_SESSION['unique_id']; // or however you get the client_id
}

// Optional: You can add role-specific features
$isAdmin = $_SESSION['role'] === 'admin';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="MindSpace Community - A space for mental health discussion and support">
    <title>MindSpace Community</title>
    <link rel="stylesheet" href="../css/community.css">
    <link rel="stylesheet" href="../css/header.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <?php include '../components/header.php'; ?>

    <div class="sidebar-overlay"></div>
    
    <div class="community-chat">
        <main class="main">
            <aside class="sidebar">
                <div class="frame-div">
                    <div class="resources-wrapper">
                        <b>Resources</b>
                    </div>
                    <a href="#" class="about-community-mindspace-wrapper">
                        <p>About Community MindSpace</p>
                    </a>
                    <a href="#" class="about-community-mindspace-wrapper">
                        <p>Policies</p>
                    </a>
                </div>
            </aside>

            <section class="posts" aria-label="Community Posts">
                <?php
                // This div will be used as a container for dynamically loaded posts
                echo '<div class="posts-container"></div>';
                
                // Add loading indicator
                echo '<div class="loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i> Loading more posts...
                </div>';
                
                // Add a template for new posts
                echo '<template id="post-template">
                    <article class="post" data-post-id="">
                        <div class="post-header">
                            <div class="user-info">
                                <img src="" alt="User avatar" class="user-avatar">
                                <span class="username"></span>
                                <span class="post-date"></span>
                            </div>
                            <div class="post-actions">
                                <button class="heart-btn">
                                    <i class="far fa-heart"></i>
                                    <span class="heart-count">0</span>
                                </button>
                                <button class="comment-btn">
                                    <i class="far fa-comment"></i>
                                    <span class="comment-count">0</span>
                                </button>
                            </div>
                        </div>
                        <div class="post-content"></div>
                        <div class="comments-section">
                            <div class="comments-container"></div>
                            <form class="comment-form">
                                <textarea placeholder="Write a comment..."></textarea>
                                <button type="submit">Post</button>
                            </form>
                        </div>
                    </article>
                </template>';
                ?>
            </section>

            <aside class="wordoftheday">
                <div class="wordoftheday-header">
                    <h2 class="word-of-the">Word of the Day</h2>
                    <time class="div2" datetime="2025-01-01">01/01/25</time>
                    <hr class="wordoftheday-header-child">
                </div>
                <p class="wordofday">Mindfulness</p>
                <div class="definition">
                    <h3 class="definition1">DEFINITION:</h3>
                    <p class="the-practice-of">-The practice of maintaining a nonjudgmental state of heightened awareness.</p>
                </div>
            </aside>
           
        </main>
    </div>

    <!-- Add the modal template -->
    <template id="post-modal-template">
        <div class="post-modal">
            <div class="post-modal-content">
                <h3>Create a Post</h3>
                <textarea id="post-content" placeholder="What's on your mind?"></textarea>
                <div class="modal-actions">
                    <button id="submit-post" class="btn-primary">Post</button>
                    <button id="cancel-post" class="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    </template>

    <!-- Add the post template -->
    <template id="post-template">
        <article class="post2">
            <div class="post-header">
                <div class="post-info">
                    <i class="circle-user-solid-1-icon fa-solid fa-circle-user"></i>
                    <b class="username"></b>
                    <div class="div post-date"></div>
                </div>
                <div class="post-options">
                    <button class="options-btn">
                        <i class="fas fa-ellipsis"></i>
                    </button>
                    <div class="options-dropdown">
                        <button class="report-btn">Report</button>
                    </div>
                </div>
            </div>
            <div class="post-content">
                <div class="post-text"></div>
            </div>
            <div class="post-actions">
                <div class="actions-group">
                    <button class="heart-btn">
                        <i class="fa-regular fa-heart"></i>
                        <span class="heart-count">0</span>
                    </button>
                    <button class="comment-btn">
                        <i class="fa-regular fa-comment"></i>
                        <span>0 comments</span>
                    </button>
                </div>
            </div>
            <div class="comments-section" style="display: none;">
                <div class="comments-list"></div>
                <div class="add-comment">
                    <textarea placeholder="Add a comment"></textarea>
                    <button class="submit-comment">Comment</button>
                </div>
            </div>
        </article>
    </template>

    <button class="sidebar-toggle">
        <i class="fas fa-bars"></i>
    </button>
    
    <script src="/js/community.js"></script>
    <script src="/js/landing_page.js"></script>
    
</body>
</html>