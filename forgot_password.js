import { auth } from './firebase_setup.js';
import { sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

window.updateResetFields = function (role) {
    const label = document.getElementById('contact-label');
    const input = document.getElementById('contact-info');

    if (role === 'student') {
        label.textContent = 'University ID / Email';
        input.placeholder = 'Enter your ID or email';
    } else if (role === 'recruiter') {
        label.textContent = 'Work Email';
        input.placeholder = 'name@company.com';
    } else if (role === 'admin') {
        label.textContent = 'Staff Email';
        input.placeholder = 'staff@university.edu';
    }
};

window.sendVerificationCode = async function () {
    const submitBtn = document.querySelector('.btn-submit');
    const contactVal = document.getElementById('contact-info').value;
    if (!contactVal.trim()) {
        alert('Please enter your email.');
        return;
    }

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        await sendPasswordResetEmail(auth, contactVal);
        alert('Password reset link sent! Please check your email inbox to reset your password.');
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Password Reset Error:", error);
        alert("Failed to send reset email: " + error.message);
        submitBtn.textContent = 'Send Verification Code';
        submitBtn.disabled = false;
    }
};

window.moveFocus = function (el, direction) {
    if (direction === 'next' && el.value.length === el.maxLength) {
        const next = el.nextElementSibling;
        if (next && next.classList.contains('otp-input')) {
            next.focus();
        }
    }
};

// These functions were in the original step logic but current flow only uses step 1 (Email Reset)
window.verifyOTP = function () {
    alert("This feature is handled via Firebase Email Reset. Please check your email.");
};

window.finalizeReset = function () {
    alert("Please use the link sent to your email to reset your password.");
};
