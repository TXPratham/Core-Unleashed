/**
 * Project Upload & Certificate Generation Logic
 * Handles file selection, form submission, and PDF generation.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Handle File Selection
    const projectFileInput = document.getElementById('project-file');
    const fileNameDisplay = document.getElementById('file-name');
    const fileUploadLabelSpan = document.querySelector('.file-upload-label span');

    if (projectFileInput) {
        projectFileInput.addEventListener('change', function (e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : '';
            if (fileName) {
                if (fileNameDisplay) fileNameDisplay.textContent = fileName;
                if (fileUploadLabelSpan) fileUploadLabelSpan.textContent = 'File selected';
            } else {
                if (fileNameDisplay) fileNameDisplay.textContent = '';
                if (fileUploadLabelSpan) fileUploadLabelSpan.textContent = 'Upload Project Files (.zip, .pdf)';
            }
        });
    }

    // Handle Form Submission
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const nameInput = document.getElementById('student-name');
            const projectInput = document.getElementById('project-title');

            if (!nameInput || !projectInput) return;

            const name = nameInput.value;
            const project = projectInput.value;

            // Set certificate values
            const certNameEl = document.getElementById('cert-name');
            const certProjectEl = document.getElementById('cert-project');
            const certDateEl = document.getElementById('cert-date');

            if (certNameEl) certNameEl.textContent = name;
            if (certProjectEl) certProjectEl.textContent = project;

            // Set current date
            const today = new Date();
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            if (certDateEl) certDateEl.textContent = today.toLocaleDateString('en-US', options);

            // Show certificate section
            const certSection = document.getElementById('certificate-section');
            if (certSection) {
                certSection.style.display = 'flex';
                // Smooth scroll to certificate on mobile or adjust view
                certSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Expose download function for legacy inline support
    window.downloadCertificate = function () {
        const element = document.getElementById('certificate-wrapper');
        if (!element) return;

        if (typeof html2pdf === 'undefined') {
            alert('PDF generation library not loaded.');
            return;
        }

        const opt = {
            margin: 0,
            filename: 'project-certificate.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
        };

        const btn = document.querySelector('.btn-secondary');
        const originalText = btn ? btn.innerHTML : 'Download PDF';

        if (btn) {
            btn.innerHTML = 'Generating...';
            btn.disabled = true;
        }

        html2pdf().set(opt).from(element).save().then(() => {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }).catch(err => {
            console.error(err);
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
            alert('Error generating certificate PDF');
        });
    };
});
