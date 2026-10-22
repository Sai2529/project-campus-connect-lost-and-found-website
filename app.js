/**
 * ============================================================================
 * CampusConnect - GKM College of Engineering and Technology
 * Application Controller (app.js)
 * ============================================================================
 */

// Application UI State
const AppUI = {
    typeFilter: 'all',          // 'all' | 'lost' | 'found' | 'pending' | 'Returned'
    categoryFilter: 'all',      // 'all' or specific category id
    searchKeyword: '',
    uploadedImageBase64: null,
    activeClaimReportId: null
};

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    populateFormSelectOptions();
    renderSmartMatches();
    applyFiltersAndRenderReports();
    updateStatsDashboard();
    initSearchInput();
    setDefaultDateInput();
});

/* ==========================================================================
   Theme Management (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
    const savedTheme = localStorage.getItem('GKM_THEME') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('GKM_THEME', nextTheme);
    updateThemeToggleIcon(nextTheme);
    showToast('Theme Changed', `Switched to ${nextTheme} mode`, 'info');
}

function updateThemeToggleIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        btn.innerHTML = theme === 'dark' 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
    }
}

function toggleMobileNav() {
    const drawer = document.getElementById('mobileDrawer');
    if (drawer) {
        drawer.classList.toggle('open');
    }
}

/* ==========================================================================
   Form Dropdown Population
   ========================================================================== */
function populateFormSelectOptions() {
    const modalCatSelect = document.getElementById('selectItemCategory');
    const filterCatSelect = document.getElementById('categorySelectFilter');

    if (modalCatSelect) {
        modalCatSelect.innerHTML = `<option value="" disabled selected>-- Choose Category --</option>` +
            GKM_CATEGORIES.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
    }

    if (filterCatSelect) {
        filterCatSelect.innerHTML = `<option value="all">All Categories (${GKM_CATEGORIES.length})</option>` +
            GKM_CATEGORIES.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
    }

    const modalLocSelect = document.getElementById('selectItemLocation');
    if (modalLocSelect) {
        modalLocSelect.innerHTML = `<option value="" disabled selected>-- Choose Campus Location --</option>` +
            GKM_CAMPUS_LOCATIONS.map(l => `<option value="${l.id}">${l.name} (${l.block})</option>`).join('');
    }
}

function setDefaultDateInput() {
    const dateInput = document.getElementById('inputItemDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

/* ==========================================================================
   Reports Rendering & Filtering (Features 5, 6, 10)
   ========================================================================== */
function setTypeFilter(type) {
    AppUI.typeFilter = type;

    // Update active class on filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-type') === type);
    });

    applyFiltersAndRenderReports();
}

function handleCategoryFilterChange() {
    const select = document.getElementById('categorySelectFilter');
    if (select) {
        AppUI.categoryFilter = select.value;
        applyFiltersAndRenderReports();
    }
}

function initSearchInput() {
    const searchInput = document.getElementById('keywordSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            AppUI.searchKeyword = e.target.value.toLowerCase().trim();
            applyFiltersAndRenderReports();
        });
    }
}

function applyFiltersAndRenderReports(newlyCreatedReportId = null) {
    const allReports = DataService.getAllReports();

    let filtered = allReports.filter(report => {
        // 1. Type / Status filter
        if (AppUI.typeFilter === 'lost') {
            if (report.type !== 'lost') return false;
        } else if (AppUI.typeFilter === 'found') {
            if (report.type !== 'found') return false;
        } else if (AppUI.typeFilter === 'pending') {
            if (report.status !== 'Claim Pending') return false;
        } else if (AppUI.typeFilter === 'Returned') {
            if (report.status !== 'Returned') return false;
        }

        // 2. Category filter
        if (AppUI.categoryFilter !== 'all' && report.category !== AppUI.categoryFilter) return false;

        // 3. Keyword search
        if (AppUI.searchKeyword) {
            const loc = DataService.getLocationById(report.locationId);
            const searchableText = `${report.title} ${report.description} ${report.locationDetail || ''} ${loc.name} ${loc.block}`.toLowerCase();
            if (!searchableText.includes(AppUI.searchKeyword)) return false;
        }

        return true;
    });

    renderReportsGrid(filtered, newlyCreatedReportId);
    updateFilterCounts(allReports, filtered.length);
}

function renderReportsGrid(reports, highlightId = null) {
    const grid = document.getElementById('reportsGrid');
    if (!grid) return;

    if (reports.length === 0) {
        grid.innerHTML = `
        <div class="empty-results-box">
            <i class="fa-solid fa-folder-open"></i>
            <h3>No Reports Found</h3>
            <p>No lost or found items matched your current search filters. Try clearing keywords or selecting "All Reports".</p>
            <button class="btn-primary-action" onclick="resetFilters()">
                <i class="fa-solid fa-rotate-left"></i> Reset Search Filters
            </button>
        </div>`;
        return;
    }

    let cardsHtml = '';
    reports.forEach(item => {
        const location = DataService.getLocationById(item.locationId);
        const category = DataService.getCategoryById(item.category);
        const isLost = item.type === 'lost';
        const isHighlighted = highlightId && item.id === highlightId;

        // Format Status Badge
        let statusBadgeClass = 'status-open';
        let statusIcon = 'fa-circle-dot';
        if (item.status === 'Claim Pending') {
            statusBadgeClass = 'status-claim-pending';
            statusIcon = 'fa-clock';
        } else if (item.status === 'Returned') {
            statusBadgeClass = 'status-returned';
            statusIcon = 'fa-circle-check';
        }

        // Action button customized for LOST vs FOUND items
        let actionButtonHtml = '';
        if (item.status === 'Returned') {
            actionButtonHtml = `<button class="btn-card-claim" style="background-color: var(--status-returned-bg); color: var(--status-returned-text); cursor: default;" disabled><i class="fa-solid fa-circle-check"></i> Reunited &amp; Returned</button>`;
        } else if (item.status === 'Claim Pending') {
            actionButtonHtml = `<button class="btn-card-review" onclick="openDetailsModal('${item.id}')"><i class="fa-solid fa-hourglass-half"></i> Review Claims (${item.claims ? item.claims.length : 1})</button>`;
        } else {
            // Open state
            if (isLost) {
                actionButtonHtml = `<button class="btn-card-found" onclick="openClaimModal('${item.id}')"><i class="fa-solid fa-hand-holding-heart"></i> I Found This!</button>`;
            } else {
                actionButtonHtml = `<button class="btn-card-claim" onclick="openClaimModal('${item.id}')"><i class="fa-solid fa-hand-holding-check"></i> Claim Item</button>`;
            }
        }

        const imageSource = item.imageUrl || generateFallbackSvg(item.title, category.label, isLost);

        cardsHtml += `
        <div class="report-card ${isHighlighted ? 'card-highlight-pulse' : ''}" id="card-${item.id}" data-id="${item.id}">
            <div style="height: 160px; background-color: var(--bg-muted); overflow: hidden; position: relative;">
                <img src="${imageSource}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
            </div>

            <div class="card-top-bar">
                <span class="report-type-badge ${isLost ? 'lost' : 'found'}">
                    ${isLost ? '<i class="fa-solid fa-circle-question"></i> LOST' : '<i class="fa-solid fa-hand-holding-heart"></i> FOUND'}
                </span>
                <span class="status-badge ${statusBadgeClass}">
                    <i class="fa-solid ${statusIcon}"></i> ${item.status}
                </span>
            </div>

            <div class="card-body">
                <div class="card-category-label">
                    <i class="fa-solid ${category.icon}"></i> ${category.label}
                </div>
                <h3 class="card-title">${escapeHtml(item.title)}</h3>
                <p class="card-description">${escapeHtml(item.description)}</p>

                <div class="card-meta-list">
                    <div class="meta-item">
                        <i class="fa-solid fa-location-dot"></i>
                        <span><strong>${location.name}</strong> (${escapeHtml(item.locationDetail || location.block)})</span>
                    </div>
                    <div class="meta-item">
                        <i class="fa-regular fa-calendar"></i>
                        <span>Reported on: ${item.date}</span>
                    </div>
                </div>
            </div>

            <div class="card-footer">
                <button class="btn-card-details" onclick="openDetailsModal('${item.id}')" title="View Dossier & Status Options">
                    <i class="fa-solid fa-circle-info"></i> Details
                </button>
                ${actionButtonHtml}
            </div>
        </div>`;
    });

    grid.innerHTML = cardsHtml;
}

function updateFilterCounts(allReports, visibleCount) {
    const countAll = allReports.length;
    const countLost = allReports.filter(r => r.type === 'lost').length;
    const countFound = allReports.filter(r => r.type === 'found').length;
    const countPending = allReports.filter(r => r.status === 'Claim Pending').length;
    const countReturned = allReports.filter(r => r.status === 'Returned').length;

    const elAll = document.getElementById('countAll');
    const elLost = document.getElementById('countLost');
    const elFound = document.getElementById('countFound');
    const elPending = document.getElementById('countPending');
    const elReturned = document.getElementById('countReturned');
    const elVisible = document.getElementById('visibleItemsCount');

    if (elAll) elAll.textContent = countAll;
    if (elLost) elLost.textContent = countLost;
    if (elFound) elFound.textContent = countFound;
    if (elPending) elPending.textContent = countPending;
    if (elReturned) elReturned.textContent = countReturned;
    if (elVisible) elVisible.textContent = visibleCount;
}

function resetFilters() {
    AppUI.typeFilter = 'all';
    AppUI.categoryFilter = 'all';
    AppUI.searchKeyword = '';

    const searchInput = document.getElementById('keywordSearchInput');
    const catSelect = document.getElementById('categorySelectFilter');

    if (searchInput) searchInput.value = '';
    if (catSelect) catSelect.value = 'all';

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-type') === 'all');
    });

    applyFiltersAndRenderReports();
    showToast('Filters Reset', 'Showing all campus lost and found reports', 'info');
}

/* ==========================================================================
   Smart Match Suggestions (Features 7 & 8)
   ========================================================================== */
function renderSmartMatches() {
    const container = document.getElementById('smartMatchesGrid');
    if (!container) return;

    const reports = DataService.getAllReports();
    const suggestions = SmartMatchEngine.findMatches(reports);

    if (suggestions.length === 0) {
        container.innerHTML = `
        <div style="grid-column: 1 / -1; background: var(--bg-surface); padding: 24px; border-radius: var(--radius-md); text-align: center; color: var(--text-muted); border: 1px dashed var(--border-color);">
            <i class="fa-solid fa-sparkles" style="color: var(--primary); font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
            <strong>No active cross-matches detected right now.</strong><br>
            When new lost or found items are reported with matching categories, buildings, or keywords, suggestions will appear here automatically.
        </div>`;
        return;
    }

    let html = '';
    suggestions.slice(0, 4).forEach(match => {
        const lostLoc = DataService.getLocationById(match.lostItem.locationId);
        const foundLoc = DataService.getLocationById(match.foundItem.locationId);
        const reasonsListHtml = match.reasons.map(r => `<li><i class="fa-solid fa-check"></i> ${escapeHtml(r)}</li>`).join('');

        html += `
        <div class="match-card">
            <div class="match-header">
                <span class="match-score-badge">
                    <i class="fa-solid fa-circle-check"></i> ${match.confidence}% Probable Match
                </span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Automated Analysis</span>
            </div>

            <!-- Comparison Block -->
            <div class="match-comparison">
                <div class="match-col lost">
                    <div class="match-col-tag">Lost Report</div>
                    <div class="match-col-title">${escapeHtml(match.lostItem.title)}</div>
                    <div class="match-col-loc"><i class="fa-solid fa-location-dot"></i> ${lostLoc.block}</div>
                </div>

                <div class="match-icon-middle">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                </div>

                <div class="match-col found">
                    <div class="match-col-tag">Found Property</div>
                    <div class="match-col-title">${escapeHtml(match.foundItem.title)}</div>
                    <div class="match-col-loc"><i class="fa-solid fa-location-dot"></i> ${foundLoc.block}</div>
                </div>
            </div>

            <!-- Feature 8: Why this match was suggested -->
            <div class="match-reasons-box">
                <div class="match-reasons-label">
                    <i class="fa-solid fa-lightbulb"></i> Why this match was suggested:
                </div>
                <ul class="match-reasons-list">
                    ${reasonsListHtml}
                </ul>
            </div>

            <button class="btn-match-action" onclick="openMatchBridge('${match.lostItem.id}', '${match.foundItem.id}')">
                <i class="fa-solid fa-handshake"></i> Bridge Match &amp; View Dossier
            </button>
        </div>`;
    });

    container.innerHTML = html;
}

function openMatchBridge(lostId, foundId) {
    openDetailsModal(foundId);
    showToast('Match Inspected', 'Reviewing found property against your lost report.', 'info');
}

/* ==========================================================================
   Stats Dashboard Counter
   ========================================================================== */
function updateStatsDashboard() {
    const reports = DataService.getAllReports();

    const openLost = reports.filter(r => r.type === 'lost' && r.status === 'Open').length;
    const openFound = reports.filter(r => r.type === 'found' && r.status === 'Open').length;
    const claimsPending = reports.filter(r => r.status === 'Claim Pending').length;
    const returned = reports.filter(r => r.status === 'Returned').length;

    const elLost = document.getElementById('statOpenLost');
    const elFound = document.getElementById('statOpenFound');
    const elPending = document.getElementById('statClaimsPending');
    const elReturned = document.getElementById('statReturned');

    if (elLost) elLost.textContent = openLost;
    if (elFound) elFound.textContent = openFound;
    if (elPending) elPending.textContent = claimsPending;
    if (elReturned) elReturned.textContent = returned;
}

/* ==========================================================================
   Report Modal & Form Validation (Features 2, 3, 4, 11)
   ========================================================================== */
function openReportModal(defaultType = 'lost') {
    const modal = document.getElementById('reportModal');
    if (!modal) return;

    resetReportFormErrors();
    updateFormForType(defaultType);

    const radioLost = document.getElementById('typeRadioLost');
    const radioFound = document.getElementById('typeRadioFound');
    if (defaultType === 'lost' && radioLost) radioLost.checked = true;
    if (defaultType === 'found' && radioFound) radioFound.checked = true;

    setDefaultDateInput();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReportModal() {
    const modal = document.getElementById('reportModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateFormForType(type) {
    const modalTitle = document.getElementById('reportModalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = type === 'lost' 
            ? `<i class="fa-solid fa-circle-question" style="color: var(--lost-accent);"></i> Report Lost Belonging`
            : `<i class="fa-solid fa-hand-holding-heart" style="color: var(--found-accent);"></i> Report Found Belonging`;
    }
}

function handleImageFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Invalid File', 'Please select an image file (PNG, JPG, WebP)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        AppUI.uploadedImageBase64 = event.target.result;
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewTag = document.getElementById('imagePreviewTag');
        if (previewContainer && previewTag) {
            previewTag.src = AppUI.uploadedImageBase64;
            previewContainer.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

function removeImagePreview() {
    AppUI.uploadedImageBase64 = null;
    const fileInput = document.getElementById('inputItemImage');
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (fileInput) fileInput.value = '';
    if (previewContainer) previewContainer.style.display = 'none';
}

function resetReportFormErrors() {
    document.querySelectorAll('.form-field').forEach(field => {
        field.classList.remove('has-error');
    });
    document.querySelectorAll('.form-control').forEach(ctrl => {
        ctrl.classList.remove('is-invalid');
    });
}

function handleReportSubmit(e) {
    e.preventDefault();
    resetReportFormErrors();

    const checkedRadio = document.querySelector('input[name="reportType"]:checked');
    const type = checkedRadio ? checkedRadio.value : 'lost';

    const title = document.getElementById('inputItemTitle').value.trim();
    const category = document.getElementById('selectItemCategory').value;
    const locationId = document.getElementById('selectItemLocation').value;
    const locationDetail = document.getElementById('inputLocationDetail').value.trim();
    const date = document.getElementById('inputItemDate').value;
    const description = document.getElementById('inputItemDescription').value.trim();
    const secretQuestion = document.getElementById('inputSecretQuestion').value.trim();
    const secretAnswer = document.getElementById('inputSecretAnswer').value.trim();
    const reporterName = document.getElementById('inputReporterName').value.trim();
    const reporterEmail = document.getElementById('inputReporterEmail').value.trim();
    const reporterDept = document.getElementById('inputReporterDept').value.trim();

    // Validation
    let isValid = true;
    let firstInvalidInput = null;

    if (!title || title.length < 2) {
        setFieldError('fieldTitleWrap', 'inputItemTitle');
        if (!firstInvalidInput) firstInvalidInput = document.getElementById('inputItemTitle');
        isValid = false;
    }
    if (!category) {
        setFieldError('fieldCategoryWrap', 'selectItemCategory');
        if (!firstInvalidInput) firstInvalidInput = document.getElementById('selectItemCategory');
        isValid = false;
    }
    if (!locationId) {
        setFieldError('fieldLocationWrap', 'selectItemLocation');
        if (!firstInvalidInput) firstInvalidInput = document.getElementById('selectItemLocation');
        isValid = false;
    }
    if (!date) {
        setFieldError('fieldDateWrap', 'inputItemDate');
        if (!firstInvalidInput) firstInvalidInput = document.getElementById('inputItemDate');
        isValid = false;
    }
    if (!description || description.length < 5) {
        setFieldError('fieldDescWrap', 'inputItemDescription');
        if (!firstInvalidInput) firstInvalidInput = document.getElementById('inputItemDescription');
        isValid = false;
    }
    if (!reporterName) {
        setFieldError('fieldReporterNameWrap', 'inputReporterName');
        if (!firstInvalidInput) firstInvalidInput = document.getElementById('inputReporterName');
        isValid = false;
    }
    if (!reporterEmail || !reporterEmail.includes('@')) {
        setFieldError('fieldReporterEmailWrap', 'inputReporterEmail');
        if (!firstInvalidInput) firstInvalidInput = document.getElementById('inputReporterEmail');
        isValid = false;
    }

    if (!isValid) {
        // Auto-scroll to first invalid input inside modal so the form never feels "stuck"
        if (firstInvalidInput) {
            firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidInput.focus();
        }
        showToast('Incomplete Form', 'Please fill in all required fields indicated by red highlights.', 'error');
        return;
    }

    // Call Data Layer
    const newReport = DataService.addReport({
        type,
        title,
        category,
        locationId,
        locationDetail,
        date,
        description,
        secretQuestion,
        secretAnswer,
        reporterName,
        reporterEmail,
        reporterDepartment: reporterDept,
        imageUrl: AppUI.uploadedImageBase64
    });

    // Reset Form & Close Modal
    document.getElementById('reportForm').reset();
    removeImagePreview();
    closeReportModal();

    // Set filter to the type of item reported so it is immediately visible!
    AppUI.typeFilter = type;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-type') === type);
    });

    // Reset search so it's not filtered out
    AppUI.searchKeyword = '';
    const sInput = document.getElementById('keywordSearchInput');
    if (sInput) sInput.value = '';

    // Re-render and highlight the newly added item
    applyFiltersAndRenderReports(newReport.id);
    renderSmartMatches();
    updateStatsDashboard();

    // Smoothly scroll the screen to the reports directory so the user sees the item arrive!
    const reportsDir = document.getElementById('reportsDirectory');
    if (reportsDir) {
        reportsDir.scrollIntoView({ behavior: 'smooth' });
    }

    showToast(
        type === 'lost' ? 'Lost Report Published!' : 'Found Property Registered!',
        `"${title}" has been successfully posted to GKM CampusConnect.`,
        'success'
    );
}

function setFieldError(fieldWrapId, inputId) {
    const wrap = document.getElementById(fieldWrapId);
    const input = document.getElementById(inputId);
    if (wrap) wrap.classList.add('has-error');
    if (input) input.classList.add('is-invalid');
}

/* ==========================================================================
   Claim Modal (Feature 9)
   ========================================================================== */
function openClaimModal(reportId) {
    const report = DataService.getAllReports().find(r => r.id === reportId);
    if (!report) return;

    AppUI.activeClaimReportId = reportId;
    const modal = document.getElementById('claimModal');
    const form = document.getElementById('claimForm');
    if (form) form.reset();

    document.querySelectorAll('#claimForm .form-field').forEach(f => f.classList.remove('has-error'));
    document.querySelectorAll('#claimForm .form-control').forEach(c => c.classList.remove('is-invalid'));

    const loc = DataService.getLocationById(report.locationId);
    const isLost = report.type === 'lost';

    const modalTitle = document.getElementById('claimModalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = isLost 
            ? `<i class="fa-solid fa-hand-holding-heart" style="color: var(--found-accent);"></i> Report Found for This Lost Item`
            : `<i class="fa-solid fa-hand-holding-check" style="color: var(--primary);"></i> Submit Ownership Claim`;
    }

    document.getElementById('claimModalItemTitle').textContent = report.title;
    document.getElementById('claimModalItemMeta').textContent = `${isLost ? 'Lost' : 'Found'} at ${loc.name} on ${report.date}`;

    const questionText = document.getElementById('claimChallengeQuestionText');
    if (questionText) {
        questionText.textContent = isLost 
            ? `Owner's verification note: "${report.secretQuestion || 'Can you confirm where you found it or any unique mark?'}"`
            : (report.secretQuestion || 'Please provide any hidden identifier or unique mark to prove ownership.');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeClaimModal() {
    const modal = document.getElementById('claimModal');
    if (modal) modal.classList.remove('active');
    AppUI.activeClaimReportId = null;
    document.body.style.overflow = '';
}

function handleClaimSubmit(e) {
    e.preventDefault();
    if (!AppUI.activeClaimReportId) return;

    const claimantName = document.getElementById('inputClaimantName').value.trim();
    const claimantEmail = document.getElementById('inputClaimantEmail').value.trim();
    const claimantReg = document.getElementById('inputClaimantReg').value.trim();
    const claimProof = document.getElementById('inputClaimProof').value.trim();

    let isValid = true;
    if (!claimantName) {
        setFieldError('fieldClaimantNameWrap', 'inputClaimantName');
        isValid = false;
    }
    if (!claimantEmail || !claimantEmail.includes('@')) {
        setFieldError('fieldClaimantEmailWrap', 'inputClaimantEmail');
        isValid = false;
    }
    if (!claimantReg) {
        setFieldError('fieldClaimantRegWrap', 'inputClaimantReg');
        isValid = false;
    }
    if (!claimProof || claimProof.length < 3) {
        setFieldError('fieldClaimProofWrap', 'inputClaimProof');
        isValid = false;
    }

    if (!isValid) {
        showToast('Claim Incomplete', 'Please provide your identity details and verification proof.', 'error');
        return;
    }

    DataService.submitClaim(AppUI.activeClaimReportId, {
        claimantName,
        claimantEmail,
        claimantRegNo: claimantReg,
        proofDetails: claimProof
    });

    closeClaimModal();
    applyFiltersAndRenderReports(AppUI.activeClaimReportId);
    renderSmartMatches();
    updateStatsDashboard();

    showToast(
        'Status Moved to "Claim Pending"',
        'Verification claim submitted! The report status has moved to "Claim Pending".',
        'success'
    );
}

/* ==========================================================================
   Details Modal & Direct Status Progression (Features 9, 10 & Safety)
   ========================================================================== */
function openDetailsModal(reportId) {
    const report = DataService.getAllReports().find(r => r.id === reportId);
    if (!report) return;

    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('detailsModalContent');
    const footer = document.getElementById('detailsModalFooter');
    if (!modal || !content) return;

    const loc = DataService.getLocationById(report.locationId);
    const cat = DataService.getCategoryById(report.category);
    const isLost = report.type === 'lost';
    const maskedEmail = maskEmail(report.reporterEmail);

    let claimsHtml = '';
    if (report.claims && report.claims.length > 0) {
        claimsHtml = `
        <div style="margin-top: 18px; border-top: 1px solid var(--border-color); padding-top: 14px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-clipboard-check" style="color: var(--gkm-gold);"></i> Submitted Claims for Verification (${report.claims.length})
            </h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${report.claims.map(c => `
                    <div style="background: var(--bg-muted); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <strong>${escapeHtml(c.claimantName)} (Reg: ${escapeHtml(c.claimantRegNo)})</strong>
                            <span style="font-size: 0.72rem; color: var(--text-muted);">${c.submittedAt}</span>
                        </div>
                        <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">
                            <strong>Submitted Proof:</strong> "${escapeHtml(c.proofDetails)}"
                        </div>
                        ${report.status !== 'Returned' ? `
                            <button class="btn-card-claim" style="font-size: 0.78rem; padding: 6px 12px;" onclick="verifyAndMarkReturned('${report.id}', '${c.id}')">
                                <i class="fa-solid fa-badge-check"></i> Verify Proof &amp; Mark as Returned
                            </button>
                        ` : `<span style="font-size: 0.75rem; color: #166534; font-weight: 700;"><i class="fa-solid fa-check"></i> Verified &amp; Returned</span>`}
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    content.innerHTML = `
    <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span class="report-type-badge ${isLost ? 'lost' : 'found'}">${isLost ? 'LOST REPORT' : 'FOUND PROPERTY'}</span>
            <span class="status-badge ${report.status === 'Returned' ? 'status-returned' : (report.status === 'Claim Pending' ? 'status-claim-pending' : 'status-open')}">
                ${report.status}
            </span>
        </div>

        <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 10px;">${escapeHtml(report.title)}</h3>
        <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 18px;">
            ${escapeHtml(report.description)}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--bg-muted); padding: 14px; border-radius: var(--radius-md); font-size: 0.82rem;">
            <div><span style="color: var(--text-muted); font-weight: 600;">Campus Facility:</span><div style="font-weight: 700;">${loc.name}</div></div>
            <div><span style="color: var(--text-muted); font-weight: 600;">Specific Area:</span><div style="font-weight: 700;">${escapeHtml(report.locationDetail || loc.block)}</div></div>
            <div><span style="color: var(--text-muted); font-weight: 600;">Category:</span><div style="font-weight: 700;">${cat.label}</div></div>
            <div><span style="color: var(--text-muted); font-weight: 600;">Date Reported:</span><div style="font-weight: 700;">${report.date}</div></div>
            <div><span style="color: var(--text-muted); font-weight: 600;">Reporter:</span><div style="font-weight: 700;">${escapeHtml(report.reporterName)} (${escapeHtml(report.reporterDepartment)})</div></div>
            <div><span style="color: var(--text-muted); font-weight: 600;">Contact Privacy:</span><div style="font-weight: 700; color: var(--primary);"><i class="fa-solid fa-lock"></i> ${maskedEmail}</div></div>
        </div>

        <!-- Hidden Secret Challenge Notice -->
        <div style="margin-top: 14px; background: var(--gkm-blue-light); border: 1px solid var(--primary-border); padding: 12px; border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--text-muted);">
            <strong style="color: var(--primary);"><i class="fa-solid fa-shield-halved"></i> Verification Challenge:</strong>
            ${escapeHtml(report.secretQuestion || 'Descriptive physical proof required for return.')}
        </div>

        <!-- DIRECT STATUS PROGRESSION CONTROLLER (Guarantees Report Moves Smoothly!) -->
        <div class="status-progression-box">
            <div class="status-box-title">
                <i class="fa-solid fa-sliders"></i> Move Report Status (Instant Control):
            </div>
            <div class="status-btn-group">
                <button class="status-change-btn open-status ${report.status === 'Open' ? 'active' : ''}" onclick="changeStatusDirectly('${report.id}', 'Open')">
                    <i class="fa-solid fa-circle-dot"></i> Move to Open
                </button>
                <button class="status-change-btn pending-status ${report.status === 'Claim Pending' ? 'active' : ''}" onclick="changeStatusDirectly('${report.id}', 'Claim Pending')">
                    <i class="fa-solid fa-clock"></i> Move to Claim Pending
                </button>
                <button class="status-change-btn returned-status ${report.status === 'Returned' ? 'active' : ''}" onclick="changeStatusDirectly('${report.id}', 'Returned')">
                    <i class="fa-solid fa-circle-check"></i> Move to Returned
                </button>
            </div>
        </div>

        ${claimsHtml}
    </div>`;

    if (footer) {
        footer.innerHTML = `
            <button type="button" class="btn-card-details" onclick="closeDetailsModal()">Close</button>
            ${report.status !== 'Returned' ? `
                <button type="button" class="btn-primary-action" onclick="closeDetailsModal(); openClaimModal('${report.id}');">
                    <i class="fa-solid fa-hand-holding-check"></i> ${isLost ? 'I Have Found This Item' : 'Submit Ownership Claim'}
                </button>
            ` : ''}
        `;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Direct Status Changer: Instantly moves the report between Open, Claim Pending, and Returned!
 */
function changeStatusDirectly(reportId, newStatus) {
    DataService.updateReportStatus(reportId, newStatus);
    openDetailsModal(reportId); // refresh modal UI
    applyFiltersAndRenderReports(reportId);
    renderSmartMatches();
    updateStatsDashboard();
    showToast('Report Status Moved', `Successfully updated status to "${newStatus}".`, 'success');
}

function verifyAndMarkReturned(reportId, claimId) {
    if (confirm('Confirm official verification? This will mark the item as "Returned" and conclude the handover.')) {
        DataService.verifyAndResolveClaim(reportId, claimId);
        closeDetailsModal();
        applyFiltersAndRenderReports(reportId);
        renderSmartMatches();
        updateStatsDashboard();
        showToast(
            'Item Returned Successfully!',
            'Ownership proof verified. Report marked as "Returned".',
            'success'
        );
    }
}

/* ==========================================================================
   Utilities: SVG Placeholders, Masking & Toasts
   ========================================================================== */
function generateFallbackSvg(title, categoryName, isLost) {
    const bgStart = isLost ? '#ef4444' : '#10b981';
    const bgEnd = isLost ? '#991b1b' : '#047857';
    const icon = isLost ? '❓' : '🎁';

    const safeTitle = title.replace(/[<>&"]/g, '');
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180" width="100%" height="100%">
        <defs>
            <linearGradient id="grad-${isLost ? 'lost' : 'found'}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${bgStart}" />
                <stop offset="100%" stop-color="${bgEnd}" />
            </linearGradient>
        </defs>
        <rect width="360" height="180" fill="url(#grad-${isLost ? 'lost' : 'found'})" />
        <circle cx="180" cy="75" r="40" fill="#ffffff" fill-opacity="0.2" />
        <text x="180" y="88" font-size="32" text-anchor="middle">${icon}</text>
        <rect x="20" y="130" width="320" height="36" rx="6" fill="#000000" fill-opacity="0.3" />
        <text x="180" y="152" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${categoryName.toUpperCase()}</text>
    </svg>`;

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
}

function maskEmail(email) {
    if (!email || !email.includes('@')) return 'Private';
    const parts = email.split('@');
    const name = parts[0];
    const maskedName = name.length > 2 ? name[0] + '***' + name[name.length - 1] : name[0] + '***';
    return `${maskedName}@${parts[1]}`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;

    let icon = '<i class="fa-solid fa-circle-info" style="color:var(--primary);"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check" style="color:var(--found-accent);"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation" style="color:var(--lost-accent);"></i>';

    toast.innerHTML = `
        <div style="font-size: 1.2rem; flex-shrink: 0;">${icon}</div>
        <div>
            <div style="font-size: 0.88rem; font-weight: 700; margin-bottom: 2px;">${escapeHtml(title)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(message)}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function handleResetSampleData() {
    if (confirm('Reset to standard GKM College sample records? This will clear custom submissions in this browser.')) {
        DataService.resetToSampleData();
        applyFiltersAndRenderReports();
        renderSmartMatches();
        updateStatsDashboard();
        showToast('Sample Data Reloaded', 'Default GKM demo records restored successfully.', 'info');
    }
}
