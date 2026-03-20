/**
 * Pre-Placement Talks (PPT) Management Logic
 * Handles form submission, QR code generation, and list management.
 */

document.addEventListener('DOMContentLoaded', function () {
    let qrCodeInstance = null;

    /**
     * Generates a random alphanumeric string for event IDs.
     * @returns {string}
     */
    function generateUniqueId() {
        return Math.random().toString(36).substring(2, 15);
    }

    /**
     * Displays the QR code and session details in the QR card.
     * @param {string} company 
     * @param {string} dateText 
     * @param {string} timeText 
     * @param {string} venue 
     * @param {string} payload - JSON string for the QR code
     */
    function displayQR(company, dateText, timeText, venue, payload) {
        const qrCard = document.getElementById('qr-card');
        if (!qrCard) return;

        qrCard.style.display = 'flex';

        // Set text details
        const companyNameEl = document.getElementById('qr-company-name');
        const dateTimeEl = document.getElementById('qr-date-time');
        const venueEl = document.getElementById('qr-venue');

        if (companyNameEl) companyNameEl.textContent = company;
        if (dateTimeEl) dateTimeEl.textContent = `${dateText} • ${timeText}`;
        if (venueEl) venueEl.textContent = venue;

        // Generate QR Code
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return;

        qrContainer.innerHTML = ''; // Clear previous

        if (typeof QRCode !== 'undefined') {
            qrCodeInstance = new QRCode(qrContainer, {
                text: payload,
                width: 200,
                height: 200,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            console.error("QRCode.js is not loaded.");
            qrContainer.textContent = "Error: QR library not loaded.";
        }

        // Scroll to it on mobile
        qrCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Adds a new talk item to the scheduled list.
     * @param {string} company 
     * @param {string} date 
     * @param {string} time 
     * @param {string} venue 
     * @param {string} payload 
     */
    function addToScheduledList(company, date, time, venue, payload) {
        const list = document.getElementById('talk-list');
        if (!list) return;

        const item = document.createElement('div');
        item.className = 'talk-item newly-added';

        item.innerHTML = `
            <div class="talk-info">
                <h3>${company}</h3>
                <p>${date} • ${time} • ${venue}</p>
            </div>
            <button class="btn-icon" title="View QR">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <rect x="7" y="7" width="3" height="3"></rect>
                    <rect x="14" y="7" width="3" height="3"></rect>
                    <rect x="7" y="14" width="3" height="3"></rect>
                    <rect x="14" y="14" width="3" height="3"></rect>
                </svg>
            </button>
        `;

        // Add listener to the new button
        const btn = item.querySelector('.btn-icon');
        if (btn) {
            btn.addEventListener('click', () => {
                displayQR(company, date, time, venue, payload);
            });
        }

        // Insert at the top
        list.insertBefore(item, list.firstChild);

        // Remove highlight class after animation
        setTimeout(() => {
            item.classList.remove('newly-added');
        }, 1000);
    }

    // Handle Form Submission
    const pptForm = document.getElementById('ppt-form');
    if (pptForm) {
        pptForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get Field Values
            const company = document.getElementById('company-name').value;
            const date = document.getElementById('talk-date').value;
            const time = document.getElementById('talk-time').value;
            const venue = document.getElementById('talk-venue').value;

            // Format Date & Time for display
            const dateObj = new Date(date + 'T' + time);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            // Generate unique event ID for QR code payload
            const eventId = "PPT-" + generateUniqueId();
            const qrPayload = JSON.stringify({
                eventId: eventId,
                company: company,
                type: "attendance"
            });

            // Display in QR Card
            displayQR(company, formattedDate, formattedTime, venue, qrPayload);

            // Add to scheduled list
            addToScheduledList(company, formattedDate, formattedTime, venue, qrPayload);
        });
    }

    // Expose functions for inline onclick handlers (legacy support)
    window.showDummyQR = function (company, date, time, venue, id) {
        const payload = JSON.stringify({ eventId: id, company: company, type: "attendance" });
        displayQR(company, date, time, venue, payload);
    };

    window.printQR = function () {
        window.print();
    };
});
