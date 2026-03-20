import { auth, db } from './firebase_setup.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    const role = 'admin';
    const fullname = document.getElementById('fullname').value;
    const department = document.getElementById('department').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
            uid: user.uid,
            role: role,
            email: email,
            fullname: fullname,
            department: department,
            phone: phone,
            isApproved: false, // Admin needs verification too
            profileSetupComplete: false,
            createdAt: serverTimestamp()
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        alert('Admin account successfully created! Please complete your profile.');
        window.location.href = 'admin_setup_profile.html';
    } catch (error) {
        console.error("Firebase Sign Up Error:", error);
        alert("Error creating account: " + error.message);
        submitBtn.textContent = 'Sign Up';
        submitBtn.disabled = false;
    }
});
