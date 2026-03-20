import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

let currentUser = null;

// Get role from URL query string
const urlParams = new URLSearchParams(window.location.search);
const role = urlParams.get('role') || 'recruiter'; // default to recruiter if none provided

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        // If they circumvent setup without an account, kick them to sign in
        window.location.href = 'signin.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Show appropriate form
    const activeForm = document.getElementById(`${role}-setup`);
    if (activeForm) {
        activeForm.classList.add('active');

        // Add required to active form inputs
        const visibleInputs = activeForm.querySelectorAll('input, select');
        visibleInputs.forEach(input => input.setAttribute('required', 'true'));
    }

    // Update text based on role
    const subtitle = document.getElementById('role-subtitle');
    const features = document.getElementById('role-features');

    if (role === 'recruiter') {
        if (subtitle) subtitle.textContent = "Tell us about your company and hiring goals.";
        if (features) {
            features.innerHTML = `
                <li>Post job openings fast</li>
                <li>Filter top candidates</li>
                <li>Schedule interviews easily</li>
            `;
        }
    } else if (role === 'admin') {
        if (subtitle) subtitle.textContent = "Configure your administrative capabilities.";
        if (features) {
            features.innerHTML = `
                <li>Manage student data</li>
                <li>Organize placement drives</li>
                <li>Track live attendance</li>
            `;
        }
    }
});

// Handle submission integration into Firestore
const setupForm = document.getElementById('profile-setup-form');
if (setupForm) {
    setupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!currentUser) {
            alert("You aren't authenticated. Please return to the sign in page.");
            return;
        }

        const submitBtn = this.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving Profile...';
        submitBtn.disabled = true;

        try {
            let profileData = {};

            if (role === 'recruiter') {
                profileData = {
                    companyWebsite: document.getElementById('company-site').value,
                    industry: document.getElementById('industry').value,
                    designation: document.getElementById('designation').value,
                    companySize: document.getElementById('company-size').value,
                    profileSetupComplete: true
                };
            } else if (role === 'admin') {
                profileData = {
                    adminTitle: document.getElementById('admin-title').value,
                    officeLocation: document.getElementById('office').value,
                    contactPhone: document.getElementById('contact-number').value,
                    profileSetupComplete: true
                };
            }

            await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });

            if (role === 'recruiter') {
                window.location.href = 'recruiter_dashboard.html';
            } else if (role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            }

        } catch (error) {
            console.error("Profile Setup Error:", error);
            alert("There was an issue saving your profile. Please try again.");
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}
