// ==========================================
// Toggle Icon Navbar (Mobile Menu)
// ==========================================
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// ==========================================
// Scroll Sections Active Link
// ==========================================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    let top = window.scrollY;

    sections.forEach(sec => {
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });

    // ==========================================
    // Sticky Navbar
    // ==========================================
    const header = document.querySelector('header');
    header.classList.toggle('sticky', top > 100);

    // ==========================================
    // Remove Toggle Icon and Navbar when clicking a link
    // ==========================================
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');

    // ==========================================
    // Scroll Progress Bar
    // ==========================================
    const scrollProgress = document.getElementById('scroll-progress');
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progressHeight = (top / totalHeight) * 100;

    if (scrollProgress) {
        scrollProgress.style.width = progressHeight + "%";
    }
};

// ==========================================
// Dark / Light Theme Toggle
// ==========================================
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = themeBtn.querySelector('i');

// Check for saved theme preference or use default dark
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Initialize icon based on theme
if (savedTheme === 'light') {
    themeIcon.classList.replace('bx-moon', 'bx-sun');
} else {
    themeIcon.classList.replace('bx-sun', 'bx-moon');
}

themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let targetTheme = 'light';

    if (currentTheme === 'light') {
        targetTheme = 'dark';
        themeIcon.classList.replace('bx-sun', 'bx-moon');
    } else {
        targetTheme = 'light';
        themeIcon.classList.replace('bx-moon', 'bx-sun');
    }

    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
});

// ==========================================
// Typed.js Animation Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (window.Typed) {
        new window.Typed('.multiple-text', {
            strings: ['Computer Science Undergraduate', 'AI Enthusiast', 'Freelance Web Developer'],
            typeSpeed: 50,
            backSpeed: 50,
            backDelay: 1000,
            loop: true
        });
    }
});

// ==========================================
// Contact Form Submission (Web3Forms)
// ==========================================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('input[type="submit"]');
        const originalText = submitBtn.value;
        submitBtn.value = "Sending...";

        const formData = new FormData(contactForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });

            const result = await response.json();
            if (response.status === 200) {
                alert("Message sent successfully!");
                contactForm.reset();
            } else {
                console.log(response);
                alert(result.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.log(error);
            alert("Something went wrong! Please check your connection.");
        } finally {
            submitBtn.value = originalText;
        }
    });
}

// ==========================================
// Client Reviews (Firebase Firestore API)
// ==========================================

// TODO: Replace with your actual Firebase Configuration!
const firebaseConfig = {
    apiKey: "AIzaSyAZYtqkZPvWExZzZRBcuXV9cBAD0Qwfl88",
    authDomain: "portfolio-cd4d6.firebaseapp.com",
    projectId: "portfolio-cd4d6",
    storageBucket: "portfolio-cd4d6.firebasestorage.app",
    messagingSenderId: "158458114980",
    appId: "1:158458114980:web:1bb45a04d3d7143faf0731",
    measurementId: "G-DT73YQNRBX"
};

let db;
try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} catch (error) {
    console.error("Firebase not configured correctly yet.", error);
}

const reviewForm = document.getElementById('review-form');
const testimonialWrapper = document.getElementById('testimonial-wrapper');

if (reviewForm && testimonialWrapper && db) {
    const reviewsRef = db.collection("reviews");
    const q = reviewsRef.orderBy("createdAt", "desc");

    // Real-time listener
    q.onSnapshot((snapshot) => {
        testimonialWrapper.innerHTML = ''; // Clear current

        if (snapshot.empty) {
            testimonialWrapper.innerHTML = `
                <div class="testimonial-card static-review">
                    <p>"Projects will be updated soon."</p>
                    <div class="client-info">
                        <h4>Placeholder Client</h4>
                        <span>Business Owner</span>
                    </div>
                </div>`;
            return;
        }

        snapshot.forEach((doc) => {
            const review = doc.data();
            renderReview(review);
        });
    }, (error) => {
        console.error("Firebase read error: ", error);
        alert("Could not load reviews: " + error.message);
    });

    reviewForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('reviewer-name').value.trim();
        const email = document.getElementById('reviewer-email').value.trim();
        const role = document.getElementById('reviewer-role').value.trim();
        const message = document.getElementById('reviewer-message').value.trim();

        if (!name || !email || !role || !message) {
            alert("Please fill in all mandatory fields: Name, Email, Role, and Message.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        const submitBtn = reviewForm.querySelector('input[type="submit"]');
        submitBtn.value = "Submitting...";

        try {
            // Firebase will hang forever if the Database hasn't been created in the console yet.
            // This 20 second timeout forces it to stop and alert you instead of hanging if you are on a slow connection.
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Database connection timed out after 20 seconds. Is your network blocking Firebase?")), 20000)
            );

            const firebasePromise = reviewsRef.add({
                name: name,
                email: email,
                role: role,
                message: message,
                createdAt: new Date() // Force local date so the UI updates instantly
            });

            await Promise.race([firebasePromise, timeoutPromise]);
            
            reviewForm.reset();
            alert("Thank you for your review!");
        } catch (error) {
            console.error("Firebase Error: ", error);
            alert("Failed to save review! Reason: " + error.message);
        } finally {
            submitBtn.value = "Submit Review";
        }
    });

    function renderReview(review) {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'testimonial-card';
        reviewCard.innerHTML = `
            <p>"${escapeHTML(review.message || '')}"</p>
            <div class="client-info">
                <h4>${escapeHTML(review.name || '')}</h4>
                <p style="font-size: 1.3rem; color: var(--main-color); margin: 0.5rem 0;">${escapeHTML(review.email || '')}</p>
                <span>${escapeHTML(review.role || '')}</span>
            </div>
        `;
        testimonialWrapper.appendChild(reviewCard);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}
