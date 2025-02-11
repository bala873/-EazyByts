document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.getElementById('homeLink');
    const loginLink = document.getElementById('loginLink');
    const signUpLink = document.getElementById('signUpLink');
    const logoutLink = document.getElementById('logoutLink');
    const homeSection = document.getElementById('homeSection');
    const loginForm = document.getElementById('loginForm');
    const signUpForm = document.getElementById('signUpForm');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    // Event listeners for navigation links
    homeLink.addEventListener('click', () => {
        homeSection.classList.add('active');
        loginForm.classList.add('hidden');
        signUpForm.classList.add('hidden');
        welcomeMessage.classList.remove('hidden');
        navLinks.classList.remove('active');  // Close the menu
    });

    loginLink.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        signUpForm.classList.add('hidden');
        welcomeMessage.classList.add('hidden');
        navLinks.classList.remove('active');  // Close the menu
    });

    signUpLink.addEventListener('click', () => {
        signUpForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        welcomeMessage.classList.add('hidden');
        navLinks.classList.remove('active');  // Close the menu
    });

    logoutLink.addEventListener('click', () => {
        logoutLink.classList.add('hidden');
        loginLink.classList.remove('hidden');
        signUpLink.classList.remove('hidden');
        homeSection.classList.add('active');
        loginForm.classList.add('hidden');
        signUpForm.classList.add('hidden');
        welcomeMessage.classList.remove('hidden');
        welcomeMessage.innerHTML = `<p>Welcome to Royal Chat! Connect with your friends and family in real-time.</p>
                                    <p>Our platform offers secure and private messaging with a touch.</p>`;
        navLinks.classList.remove('active');  // Close the menu
    });

    // Event listener for login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        loginLink.classList.add('hidden');
        signUpLink.classList.add('hidden');
        logoutLink.classList.remove('hidden');
        loginForm.classList.add('hidden');


		
        
    });
	// Event listener for sign-up form submission
	    signUpForm.addEventListener('submit', (e) => {
	        e.preventDefault();
	        const username = document.getElementById('signUpUsername').value;
	        signUpLink.classList.add('hidden');
	        loginLink.classList.add('hidden');
	        logoutLink.classList.remove('hidden');
	        signUpForm.classList.add('hidden');
	        welcomeMessage.classList.remove('hidden');
	        welcomeMessage.innerHTML = `<p>Welcome, ${username}! Connect with your friends and family in real-time.</p>
	                                    <p>Our platform offers secure and private messaging with a touch.</p>`;
	    });

    // Event listener for hamburger menu
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
});