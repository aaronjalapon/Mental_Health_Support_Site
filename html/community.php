<?php
session_start();
// Check if user is logged in and is admin
if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../html/login.php");
    exit();
}

?>
<!DOCTYPE html>
<<<<<<< HEAD
<!DOCTYPE html>
=======
>>>>>>> c71376b6b6a2be8b5290e553121158f63c249d0a
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="MindSpace Community - A space for mental health discussion and support">
    <title>MindSpace Community</title>
    
    <link rel="stylesheet" href="/css/community.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header class="navbar">
        <div class="logo">
            <a href="../index.html">
                <img class="logo-mindspace-1-1-icon" alt="" src="../images/Logo.svg">
                <h1>MindSpace</h1>
            </a>
        </div>
        <button class="burger-menu" id="burgerMenu">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </button>
        <nav class="nav-links" id="navLinks">
            <a id="home" href="../index.html">Home</a>
            <a id="about_us" href="../index.html#self-help">About us</a>
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
                    <a href="#">Community</a>
                </div>
            </div>
            <button id="btn-login" class="auth-button">Log In</button>
            <div class="user-dropdown" style="display: none;">
                <button class="dropdown-btn">Welcome, Username</button>
                <div class="dropdown-logout">
                    <a href="#" class="dropdown-item" onclick="handleLogout()">Profile</a>
                    <a href="#" class="dropdown-item" onclick="handleLogout()">Logout</a>
                </div>
            </div>
        </nav>
    </header>
    
    <div class="community-chat">
        <main class="main">
            <aside class="sidebar">
                <div class="sidebar-inner">
                    <div class="frame-group">
                        <div class="frame-container">
                            <div class="communities-wrapper">
                                <b class="about-us">Communities</b>
                            </div>
                            <div class="create-a-community-parent">
                                <div class="about-us">Create a Community </div>
                                <img class="plus-icon" alt="" src="Plus.svg">
                            </div>
                            <div class="join-a-community-wrapper">
                                <div class="join-a-community">Join a Community  </div>
                            </div>
                        </div>
                        <div class="frame-div">
                            <div class="resources-wrapper">
                                <b class="about-us">Resources</b>
                            </div>
                            <div class="about-community-mindspace-wrapper">
                                <div class="about-us">
                                    <a href="#" class="about-community">About Community MindSpace</a>
                                </div>
                            </div>
                            <div class="about-community-mindspace-wrapper">
                                <a href="#">Policies</a>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
<<<<<<< HEAD

            <section class="posts" aria-label="Community Posts">
                <article class="post2">
                    <div class="post-header">
                        <div class="post-info">
                            <img class="circle-user-solid-1-icon" alt="" src="circle-user-solid 1.svg">
                            <b class="username">Username</b>
                            <div class="div">01/01/25</div>
                        </div>
                        <div class="ellipsis-solid-1">
                            <img class="vector-icon1" alt="" src="Vector.svg">
                        </div>
                    </div>
                    <div class="post-content">
                        <div class="lorem-ipsum-dolor">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac nunc condimentum, rhoncus neque id, euismod tellus. Nunc nec nisl in tellus hendrerit elementum quis et leo.</div>
                    </div>
                    <div class="post-actions">
                        <img class="post-actions-child" alt="" src="Line 3.svg">
                        <div class="actoins-group">
                            <div class="heart-action">
                                <img class="heart-regular-1-icon" alt="" src="heart-regular 1.svg">
                                <div class="heart">heart</div>
                            </div>
                            <div class="comments-action">
                                <img class="heart-regular-1-icon" alt="" src="comment-regular 1.svg">
                                <div class="comments">comments</div>
                            </div>
                        </div>
                    </div>
                </article>
                <article class="post1">
                    <div class="post-header">
                        <div class="post-info">
                            <img class="circle-user-solid-1-icon" alt="" src="circle-user-solid 1.svg">
                            <b class="username">Username</b>
                            <div class="div">01/01/25</div>
                        </div>
                        <div class="ellipsis-solid-1">
                            <img class="vector-icon1" alt="" src="Vector.svg">
                        </div>
                    </div>
                    <div class="post-content">
                        <div class="lorem-ipsum-dolor1">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac nunc condimentum, rhoncus neque id, euismod tellus. Nunc nec nisl in tellus hendrerit elementum quis et leo.</div>
                    </div>
                    <div class="post-actions">
                        <img class="post-actions-child" alt="" src="Line 3.svg">
                        <div class="actoins-group">
                            <div class="heart-action">
                                <img class="heart-regular-1-icon" alt="" src="heart-solid 1.svg">
                                <div class="heart">heart</div>
                            </div>
                            <div class="comments-action">
                                <img class="heart-regular-1-icon" alt="" src="comment-regular 1.svg">
                                <div class="comments">comments</div>
                            </div>
                        </div>
                    </div>
                </article>
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
	<script src="/js/landing_page.js"></script>
</body>
</html>
=======
>>>>>>> c71376b6b6a2be8b5290e553121158f63c249d0a

            <section class="posts" aria-label="Community Posts">
                <article class="post2">
                    <div class="post-header">
                        <div class="post-info">
                            <img class="circle-user-solid-1-icon" alt="" src="circle-user-solid 1.svg">
                            <b class="username">Username</b>
                            <div class="div">01/01/25</div>
                        </div>
                        <div class="ellipsis-solid-1">
                            <img class="vector-icon1" alt="" src="Vector.svg">
                        </div>
                    </div>
                    <div class="post-content">
                        <div class="lorem-ipsum-dolor">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac nunc condimentum, rhoncus neque id, euismod tellus. Nunc nec nisl in tellus hendrerit elementum quis et leo.</div>
                    </div>
                    <div class="post-actions">
                        <img class="post-actions-child" alt="" src="Line 3.svg">
                        <div class="actoins-group">
                            <div class="heart-action">
                                <img class="heart-regular-1-icon" alt="" src="heart-regular 1.svg">
                                <div class="heart">heart</div>
                            </div>
                            <div class="comments-action">
                                <img class="heart-regular-1-icon" alt="" src="comment-regular 1.svg">
                                <div class="comments">comments</div>
                            </div>
                        </div>
                    </div>
                </article>
                <article class="post1">
                    <div class="post-header">
                        <div class="post-info">
                            <img class="circle-user-solid-1-icon" alt="" src="circle-user-solid 1.svg">
                            <b class="username">Username</b>
                            <div class="div">01/01/25</div>
                        </div>
                        <div class="ellipsis-solid-1">
                            <img class="vector-icon1" alt="" src="Vector.svg">
                        </div>
                    </div>
                    <div class="post-content">
                        <div class="lorem-ipsum-dolor1">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac nunc condimentum, rhoncus neque id, euismod tellus. Nunc nec nisl in tellus hendrerit elementum quis et leo.</div>
                    </div>
                    <div class="post-actions">
                        <img class="post-actions-child" alt="" src="Line 3.svg">
                        <div class="actoins-group">
                            <div class="heart-action">
                                <img class="heart-regular-1-icon" alt="" src="heart-solid 1.svg">
                                <div class="heart">heart</div>
                            </div>
                            <div class="comments-action">
                                <img class="heart-regular-1-icon" alt="" src="comment-regular 1.svg">
                                <div class="comments">comments</div>
                            </div>
                        </div>
                    </div>
                </article>
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
	<script src="/js/landing_page.js"></script>
</body>
</html>