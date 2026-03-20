import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const jobForm = document.getElementById('jobPostingForm');
const postBtn = document.getElementById('postBtn');
const statusMsg = document.getElementById('statusMsg');

let currentUser = null;
let recruiterData = null;

const recruiterAvatar = document.getElementById('recruiterAvatar');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Fetch recruiter company info
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                recruiterData = userDoc.data();
                if (recruiterData.fullname) {
                    // Update avatar initials
                    recruiterAvatar.textContent = recruiterData.fullname.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
                    recruiterAvatar.title = `${recruiterData.fullname} (${recruiterData.company_name || 'Recruiter'})`;
                }
            }
        } catch (error) {
            console.error("Error fetching recruiter info:", error);
        }
    } else {
        window.location.href = 'index.html';
    }
});

recruiterAvatar.onclick = () => {
    window.location.href = 'recruiter_profile.html';
};

function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg ${type}`;
    statusMsg.style.display = 'block';
    if (type === 'success') {
        setTimeout(() => {
            window.location.href = 'recruiter_dashboard.html';
        }, 2000);
    }
}

jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    postBtn.textContent = 'Posting Job...';
    postBtn.disabled = true;

    const jobData = {
        jobTitle: document.getElementById('jobTitle').value,
        jobCategory: document.getElementById('jobCategory').value,
        jobType: document.getElementById('jobType').value,
        location: document.getElementById('location').value,
        salaryRange: document.getElementById('salaryRange').value,
        deadline: document.getElementById('deadline').value,
        experience: document.getElementById('experience').value,
        description: document.getElementById('jobDescription').value,
        recruiterUid: currentUser.uid,
        recruiterName: recruiterData?.fullname || 'Unknown Recruiter',
        companyName: recruiterData?.company_name || 'N/A',
        postedAt: serverTimestamp(),
        status: 'active'
    };

    try {
        await addDoc(collection(db, 'jobs'), jobData);
        showStatus("Job posted successfully! Redirecting...", "success");
    } catch (error) {
        console.error("Error posting job:", error);
        showStatus("Failed to post job. Please try again.", "error");
        postBtn.textContent = 'Post Job Opportunity';
        postBtn.disabled = false;
    }
});
