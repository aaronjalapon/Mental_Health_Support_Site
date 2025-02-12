document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-toggle btn';
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    document.body.appendChild(mobileToggle);
    
    mobileToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('show');
    });
});
