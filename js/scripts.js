// Sample functionality to display a modal for joining the community
document.addEventListener("DOMContentLoaded", () => {
    const communityLink = document.querySelector("#community a");
    communityLink.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Redirecting to the community forum...");
    });
  });
  
  document.querySelector('.btn-get-started').addEventListener('click', () => {
    alert('Welcome to MindCare!');
  });
  