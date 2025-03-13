document.addEventListener('DOMContentLoaded', function() {
    // Keep only smooth scrolling functionality
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Function to load videos by category
    async function loadVideosByCategory() {
        try {
            const response = await fetch('../php/CRUDSettings/meditation_video_functions.php');
            const data = await response.json();
            
            if (data.status === 'success') {
                const categoryGrid = document.querySelector('.category-grid');
                if (!categoryGrid) return;

                const categories = ['beginner', 'stress', 'sleep', 'mindfulness', 'anxiety', 'focus'];
                const categoryTitles = {
                    beginner: "Beginner's Guide",
                    stress: 'Stress Relief',
                    sleep: 'Sleep Meditation',
                    mindfulness: 'Mindfulness Practice',
                    anxiety: 'Anxiety Relief',
                    focus: 'Focus & Concentration'
                };

                // Group videos by category
                const videosByCategory = data.data.reduce((acc, video) => {
                    if (!acc[video.category]) {
                        acc[video.category] = [];
                    }
                    acc[video.category].push(video);
                    return acc;
                }, {});

                // Create HTML for each category
                categoryGrid.innerHTML = categories.map(category => {
                    const videos = videosByCategory[category] || [];
                    const video = videos[0]; // Take the first video for each category
                    
                    return video ? `
                        <div class="category-card ${category}">
                            <h3>${categoryTitles[category]}</h3>
                            <div class="video-container">
                                <iframe src="https://www.youtube.com/embed/${video.youtube_id}" 
                                        frameborder="0" 
                                        allowfullscreen></iframe>
                            </div>
                            <p>${video.description}</p>
                        </div>
                    ` : '';
                }).join('');
            }
        } catch (error) {
            console.error('Error loading videos:', error);
        }
    }

    // Load videos when page loads
    loadVideosByCategory();
});
