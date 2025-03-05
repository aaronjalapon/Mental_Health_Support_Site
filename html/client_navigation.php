<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get the current script path to determine active page
$currentPage = basename($_SERVER['PHP_SELF']);

// Function to determine if a link is active
function isActive($pageName) {
    global $currentPage;
    return $currentPage === $pageName ? 'active' : '';
}
?>

<header class="navbar">
    <div class="logo">
        <a href="/index.php">
            <img class="logo-mindspace-1-1-icon" alt="" src="/images/Logo.svg">
            <h1>MindSpace</h1>
        </a>
    </div>
    <button class="burger-menu" id="burgerMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
    </button>
    <nav class="nav-links" id="navLinks">
        <a id="home" class="<?php echo isActive('index.php'); ?>" href="/index.php">Home</a>
        <a id="about_us" href="/index.php#self-help">About us</a>
        <div class="dropdown">
            <button class="dropbtn">
                Self-Help
                <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                </svg>
            </button>
            <div class="dropdown-content">
                <a href="#">Self-Help</a>
                <a href="#">Professional Support</a>
                <a href="#" onclick="redirectToCommunity()">Community</a>
            </div>
        </div>
        <?php if (!isset($_SESSION['unique_id'])): ?>
            <button id="btn-login" class="auth-button">Log In</button>
        <?php else: ?>
            <div class="user-dropdown">
                <button class="dropdown-btn">
                    Welcome, <?php echo htmlspecialchars($_SESSION['username'] ?? ''); ?>
                </button>
                <div class="dropdown-logout">
                    <a href="/profile.php" class="dropdown-item">Profile</a>
                    <a href="#" class="dropdown-item" onclick="handleLogout()">Logout</a>
                </div>
            </div>
        <?php endif; ?>
    </nav>
</header>
