// Post data structure
let posts = [];
let isLoading = false;
let currentPage = 1;
const postsPerPage = 5;

// Initialize the community features
document.addEventListener('DOMContentLoaded', () => {
    initializePosts();
    setupCreatePost();
    setupHeartReaction();
    setupComments();
});

// Post creation
function setupCreatePost() {
    const createPostBtn = document.createElement('button');
    createPostBtn.className = 'create-post-btn';
    createPostBtn.innerHTML = 'Create Post';
    document.querySelector('.posts').prepend(createPostBtn);

    createPostBtn.addEventListener('click', () => {
        const postModal = `
            <div class="post-modal">
                <div class="post-modal-content">
                    <h3>Create a Post</h3>
                    <textarea id="post-content" placeholder="What's on your mind?"></textarea>
                    <button id="submit-post">Post</button>
                    <button id="cancel-post">Cancel</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', postModal);
        setupPostModalListeners();
    });
}

// Add these functions after setupCreatePost()
function setupPostModalListeners() {
    const modal = document.querySelector('.post-modal');
    const submitBtn = document.getElementById('submit-post');
    const cancelBtn = document.getElementById('cancel-post');
    const textarea = document.getElementById('post-content');

    submitBtn.addEventListener('click', () => {
        if (textarea.value.trim()) {
            submitPost(textarea.value.trim());
            closeModal(modal);
        }
    });

    cancelBtn.addEventListener('click', () => closeModal(modal));
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

function closeModal(modal) {
    modal.remove();
}

// Handle post creation
function submitPost(content) {
    const newPost = {
        id: Date.now(),
        content,
        author: 'Current User', // Replace with actual user
        timestamp: new Date(),
        votes: 0,
        hearts: 0,
        comments: [],
    };
    posts.unshift(newPost);
    renderPosts();
}

// Replace setupVoting with setupHeartReaction
function setupHeartReaction() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.heart-btn')) {
            const post = e.target.closest('[data-post-id]');
            const postId = post.dataset.postId;
            toggleHeart(postId);
        }
    });
}

function toggleHeart(postId) {
    const post = posts.find(p => p.id.toString() === postId.toString());
    if (post) {
        post.hearts = post.hearts ? 0 : 1; // Toggle between 0 and 1
        renderPosts();
    }
}

// Comment system
function setupComments() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.comment-btn')) {
            const post = e.target.closest('[data-post-id]');
            const postId = post.dataset.postId;
            toggleCommentSection(postId);
        }

        if (e.target.classList.contains('submit-comment')) {
            const post = e.target.closest('[data-post-id]');
            const postId = post.dataset.postId;
            const textarea = post.querySelector('.add-comment textarea');
            const content = textarea.value.trim();
            
            if (content) {
                addComment(postId, content);
                textarea.value = '';
            }
        }
    });
}

function toggleCommentSection(postId) {
    const post = document.querySelector(`[data-post-id="${postId}"]`);
    const commentSection = post.querySelector('.comments-section');
    
    if (commentSection.style.display === 'none') {
        commentSection.style.display = 'block';
        commentSection.querySelector('textarea').focus();
    } else {
        commentSection.style.display = 'none';
    }
}

function addComment(postId, content) {
    const post = posts.find(p => p.id.toString() === postId.toString());
    if (post) {
        post.comments.push({
            id: Date.now(),
            content,
            author: 'Current User', // Replace with actual user later
            timestamp: new Date()
        });
        renderPosts();
    }
}

// Render posts
function renderPosts(append = false) {
    const postsContainer = document.querySelector('.posts');
    const postsToShow = posts.slice(0, currentPage * postsPerPage);
    
    const postsHTML = postsToShow.map(post => `
        <article class="post2" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-info">
                    <i class="circle-user-solid-1-icon fa-solid fa-circle-user"></i>
                    <b class="username">${post.author}</b>
                    <div class="div">${formatDate(post.timestamp)}</div>
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
                <div class="post-text">${post.content}</div>
            </div>
            <div class="post-actions">
                <div class="actions-group">
                    <button class="heart-btn ${post.hearts ? 'active' : ''}">
                        <i class="fa-${post.hearts ? 'solid' : 'regular'} fa-heart"></i>
                        <span class="heart-count">${post.hearts || 0}</span>
                    </button>
                    <button class="comment-btn">
                        <i class="fa-regular fa-comment"></i>
                        <span>${post.comments.length} comments</span>
                    </button>
                </div>
            </div>
            <div class="comments-section" style="display: none;">
                <div class="comments-list">
                    ${renderComments(post.comments)}
                </div>
                <div class="add-comment">
                    <textarea placeholder="Add a comment"></textarea>
                    <button class="submit-comment">Comment</button>
                </div>
            </div>
        </article>
    `).join('');

    if (append) {
        // Remove loading indicator if it exists
        const loader = postsContainer.querySelector('.loader');
        if (loader) loader.remove();
        
        // Append new posts
        postsContainer.insertAdjacentHTML('beforeend', postsHTML);
    } else {
        postsContainer.innerHTML = postsHTML;
    }

    // Add loading indicator if there are more posts
    if (postsToShow.length < posts.length) {
        postsContainer.insertAdjacentHTML('beforeend', '<div class="loader"></div>');
    }
}

// Utility functions
function formatDate(date) {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
        return 'Just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return postDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

function renderComments(comments) {
    return comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <i class="fa-solid fa-user"></i>
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${formatDate(comment.timestamp)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

// Add comment event listener to the post rendering
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('submit-comment')) {
        const post = e.target.closest('[data-post-id]');
        const postId = post.dataset.postId;
        const textarea = post.querySelector('.add-comment textarea');
        const content = textarea.value.trim();
        
        if (content) {
            const postIndex = posts.findIndex(p => p.id.toString() === postId);
            if (postIndex !== -1) {
                posts[postIndex].comments.push({
                    id: Date.now(),
                    content,
                    author: 'Current User',
                    timestamp: new Date()
                });
                textarea.value = '';
                renderPosts();
            }
        }
    }
});

// Add this after other event listeners
document.addEventListener('click', (e) => {
    // Close all dropdowns when clicking outside
    if (!e.target.closest('.post-options')) {
        document.querySelectorAll('.options-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
    
    // Toggle dropdown when clicking options button
    if (e.target.closest('.options-btn')) {
        const dropdown = e.target.closest('.post-options').querySelector('.options-dropdown');
        dropdown.classList.toggle('show');
    }

    // Handle report button click
    if (e.target.classList.contains('report-btn')) {
        const postId = e.target.closest('[data-post-id]').dataset.postId;
        handleReport(postId);
    }
});

function handleReport(postId) {
    // You can customize this function to handle reports
    alert('Post reported. Our moderators will review it.');
    // Close the dropdown
    const dropdown = document.querySelector(`[data-post-id="${postId}"] .options-dropdown`);
    dropdown.classList.remove('show');
}

// Initialize with sample data
function initializePosts() {
    posts = [
        {
            id: 1,
            content: "Welcome to our mental health community! Share your thoughts and experiences in a safe and supportive environment. Remember, you're not alone in this journey. 💚",
            author: "MindSpace_Admin",
            timestamp: new Date(),
            hearts: 5,
            comments: [
                {
                    id: 101,
                    content: "Thank you for creating this space! It's so important to have a place where we can openly discuss mental health.",
                    author: "User123",
                    timestamp: new Date(Date.now() - 30 * 60 * 1000)
                },
                {
                    id: 102,
                    content: "Looking forward to connecting with others and sharing experiences. Together we are stronger! 🌟",
                    author: "WellnessJourney",
                    timestamp: new Date(Date.now() - 25 * 60 * 1000)
                }
            ]
        },
        {
            id: 2,
            content: "Today I learned a new meditation technique called '4-7-8 breathing'. Has anyone tried mindful breathing exercises? They really help with anxiety! Would love to hear your experiences. 🧘‍♀️",
            author: "WellnessSeeker",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            hearts: 3,
            comments: [
                {
                    id: 201,
                    content: "Yes! Breathing exercises have been a game-changer for my anxiety. I use them every morning!",
                    author: "MindfulMoments",
                    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
                },
                {
                    id: 202,
                    content: "Could you share more details about the 4-7-8 technique? I'm interested in learning more.",
                    author: "NewToMeditation",
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
                }
            ]
        },
        {
            id: 3,
            content: "Just completed my first therapy session today. Feeling nervous but hopeful. It's okay to ask for help when you need it. 💫",
            author: "HealingStep",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            hearts: 7,
            comments: [
                {
                    id: 301,
                    content: "So proud of you for taking this step! The first session is always the hardest. It gets better! 💕",
                    author: "SupportiveSoul",
                    timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000)
                }
            ]
        }
    ];
    
    currentPage = 1;
    renderPosts();
    setupInfiniteScroll();
}

function setupInfiniteScroll() {
    const handleScroll = () => {
        if (isLoading) return;

        const postsContainer = document.querySelector('.posts');
        const containerBottom = postsContainer.getBoundingClientRect().bottom;
        const isNearBottom = containerBottom <= window.innerHeight + 100; // 100px threshold

        if (isNearBottom && currentPage * postsPerPage < posts.length) {
            loadMorePosts();
        }
    };

    // Throttle scroll event
    let timeout;
    window.addEventListener('scroll', () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(handleScroll, 100);
    });
}

function loadMorePosts() {
    isLoading = true;
    
    // Simulate loading delay
    setTimeout(() => {
        currentPage++;
        renderPosts(true);
        isLoading = false;
    }, 500);
}
