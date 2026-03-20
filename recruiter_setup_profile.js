import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        // Not logged in — redirect to sign in
        window.location.href = 'index.html';
    }
});

const setupForm = document.getElementById('profile-setup-form');
if (setupForm) {
    setupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!currentUser) {
            alert("You aren't authenticated. Please return to the sign in page.");
            return;
        }

        const submitBtn = this.querySelector('.btn-submit');
        submitBtn.textContent = 'Saving Profile...';
        submitBtn.disabled = true;

        try {
            const profileData = {
                uid: currentUser.uid,
                companyWebsite: document.getElementById('company-site').value,
                industry: document.getElementById('industry').value,
                designation: document.getElementById('designation').value,
                companySize: document.getElementById('company-size').value,
                linkedin: document.getElementById('linkedin').value,
                updatedAt: new Date()
            };

            // 1. Save detailed info to 'recruiters' collection
            await setDoc(doc(db, 'recruiters', currentUser.uid), profileData);

            // 2. Update 'users' doc with status and reference
            await setDoc(doc(db, 'users', currentUser.uid), {
                profileSetupComplete: true
            }, { merge: true });

            alert('Profile setup complete! Your account is now pending admin approval.');
            window.location.href = 'recruiter_dashboard.html';

        } catch (error) {
            console.error("Profile Setup Error:", error);
            alert("There was an issue saving your profile. Please try again.");
            submitBtn.textContent = 'Finish Setup & Go to Dashboard';
            submitBtn.disabled = false;
        }
    });
}
