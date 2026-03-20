/**
 * Live Attendance Dashboard Logic
 * Handles session selection, data simulation, and table population.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Dummy data for students
    const firstNames = ["Rahul", "Priya", "Amit", "Neha", "Rohit", "Sneha", "Vikram", "Anjali", "Karan", "Pooja"];
    const lastNames = ["Sharma", "Verma", "Singh", "Patel", "Gupta", "Deshmukh", "Joshi", "Kumar", "Yadav", "Iyer"];
    const branches = ["CSE", "ECE", "EEE", "Mech", "Civil", "IT"];

    /**
     * Generates dummy log entries for students.
     * @param {number} count 
     * @returns {Array}
     */
    function generateDummyLog(count) {
        const logs = [];
        const now = new Date();
        for (let i = 0; i < count; i++) {
            const scanTime = new Date(now.getTime() - Math.floor(Math.random() * 3600000)); // Random time in last hour
            const name = firstNames[Math.floor(Math.random() * firstNames.length)] + " " + lastNames[Math.floor(Math.random() * lastNames.length)];

            logs.push({
                id: "21" + branches[Math.floor(Math.random() * branches.length)] + Math.floor(100 + Math.random() * 899),
                name: name,
                branch: branches[Math.floor(Math.random() * branches.length)],
                time: scanTime,
            });
        }
        // Sort by latest time
        logs.sort((a, b) => b.time - a.time);
        return logs;
    }

    let currentInterval = null;

    /**
     * Populates the attendance table with log entries.
     * @param {Array} logs 
     */
    function populateTable(logs) {
        const tbody = document.getElementById('attendance-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="stu-id">${log.id}</td>
                <td class="stu-name">${log.name}</td>
                <td><span class="branch-tag">${log.branch}</span></td>
                <td>${log.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                <td><span class="status-badge success">Verified</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Selects a session and updates the dashboard.
     * @param {string} company 
     * @param {string} eventId 
     * @param {string} timeStr 
     * @param {number} registered 
     * @param {number} present 
     * @param {HTMLElement} element - The clicked session card
     */
    function selectSession(company, eventId, timeStr, registered, present, element) {
        // Update UI styling
        document.querySelectorAll('.session-card').forEach(card => card.classList.remove('active'));
        if (element) element.classList.add('active');

        // Update Header
        const dashCompany = document.getElementById('dash-company');
        const dashMeta = document.getElementById('dash-meta');
        if (dashCompany) dashCompany.textContent = company;
        if (dashMeta) dashMeta.textContent = `${eventId} • ${timeStr}`;

        // Check if Live
        const statusIndicator = document.getElementById('dash-status');
        const isLive = element ? element.querySelector('.badge-live') !== null : false;

        if (statusIndicator) {
            if (isLive) {
                statusIndicator.innerHTML = '<span class="pulse-dot"></span> Live Scanning Active';
                statusIndicator.className = 'live-indicator';
                const refreshText = document.querySelector('.auto-refresh-text');
                if (refreshText) refreshText.style.display = 'block';
            } else {
                statusIndicator.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Session Completed';
                statusIndicator.className = 'completed-indicator';
                const refreshText = document.querySelector('.auto-refresh-text');
                if (refreshText) refreshText.style.display = 'none';
            }
        }

        // Update Stats
        const statRegistered = document.getElementById('stat-registered');
        const statPresent = document.getElementById('stat-present');
        const statAbsent = document.getElementById('stat-absent');

        if (statRegistered) statRegistered.textContent = registered;
        if (statPresent) statPresent.textContent = present;
        if (statAbsent) statAbsent.textContent = registered - present;

        // Stop any existing simulation
        if (currentInterval) clearInterval(currentInterval);

        // Generate Logs
        const logs = generateDummyLog(Math.min(present, 50)); // cap at 50 for display
        populateTable(logs);

        // If live, simulate incoming scans
        if (isLive) {
            currentInterval = setInterval(() => {
                if (Math.random() > 0.6) {
                    const newLog = generateDummyLog(1)[0];
                    newLog.time = new Date(); // Right now

                    // Update UI
                    present++;
                    if (statPresent) statPresent.textContent = present;
                    if (statAbsent) statAbsent.textContent = registered - present;

                    // Add to table with animation
                    const tbody = document.getElementById('attendance-tbody');
                    if (tbody) {
                        const tr = document.createElement('tr');
                        tr.className = 'new-row-anim';
                        tr.innerHTML = `
                            <td class="stu-id">${newLog.id}</td>
                            <td class="stu-name">${newLog.name}</td>
                            <td><span class="branch-tag">${newLog.branch}</span></td>
                            <td><span class="just-scanned">Just now</span></td>
                            <td><span class="status-badge success">Verified</span></td>
                        `;
                        tbody.insertBefore(tr, tbody.firstChild);

                        // Keep table rows manageable
                        if (tbody.children.length > 50) {
                            tbody.removeChild(tbody.lastChild);
                        }
                    }

                    // Update the progress bar in the list
                    const activeCard = document.querySelector('.session-card.active');
                    if (activeCard) {
                        const newPct = Math.min(100, Math.round((present / registered) * 100));
                        const progressFill = activeCard.querySelector('.progress-fill');
                        const statsSpanFirst = activeCard.querySelector('.session-stats-mini span:first-child');
                        const statsSpanLast = activeCard.querySelector('.session-stats-mini span:last-child');

                        if (progressFill) progressFill.style.width = newPct + '%';
                        if (statsSpanFirst) statsSpanFirst.textContent = `${present} / ${registered} Present`;
                        if (statsSpanLast) statsSpanLast.textContent = `${newPct}%`;
                    }
                }
            }, 3000);
        }
    }

    // Expose functions for legacy support and card clicks
    window.selectSession = function (company, eventId, timeStr, registered, present) {
        // Find the element that triggered it (since we pass it in the inline handler)
        const element = event.currentTarget;
        selectSession(company, eventId, timeStr, registered, present, element);
    };

    window.exportCSV = function () {
        alert("Attendance report is being generated and will download shortly.");
    };

    // Initialize with first session
    const firstCard = document.querySelector('.session-card');
    if (firstCard) {
        // Trigger click programmatically or call selectSession directly
        // Using a small delay to ensure everything is ready
        setTimeout(() => {
            firstCard.click();
        }, 100);
    }
});
