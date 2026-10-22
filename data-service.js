/**
 * ============================================================================
 * CampusConnect - GKM College of Engineering and Technology
 * Data Layer Service (data-service.js)
 * ============================================================================
 * 
 * 💡 BEGINNER HACKATHON NOTE:
 * This file separates the data management layer from the UI.
 * Currently, it uses the browser's `localStorage` so the website runs locally
 * without needing any backend server or database setup.
 * 
 * If you want to scale this in a hackathon to a full-stack cloud app:
 * Simply replace the `localStorage` functions here with API calls
 * using `fetch()` to your Node.js, Express, Firebase, or Supabase backend!
 * 
 * ⚠️ Note on Local Data:
 * Browser local storage only stores data inside YOUR current browser.
 * It is not synced across different devices or phones without a cloud database.
 */

// Key used in browser's localStorage
const STORAGE_KEY = 'GKM_CAMPUS_CONNECT_REPORTS_V2';

// Campus Zones & Buildings at GKM College of Engineering & Technology
const GKM_CAMPUS_LOCATIONS = [
    { id: 'lib', name: 'Central Library & Reading Hall', block: 'APJ Abdul Kalam Library' },
    { id: 'mech', name: 'Mechanical & Civil Workshop Block', block: 'Visvesvaraya Lab Wing' },
    { id: 'cse', name: 'Computer Science & IT Labs', block: 'Turing Computing Center' },
    { id: 'main', name: 'Main Academic Block (Admin & Dean Office)', block: 'Kamarajar Block' },
    { id: 'cafe', name: 'Student Cafeteria & Food Court', block: 'Campus Pavilion' },
    { id: 'audi', name: 'Main Auditorium & Seminar Hall', block: 'Golden Jubilee Hall' },
    { id: 'sports', name: 'Sports Complex & Cricket Ground', block: 'Athletic Pavilion' },
    { id: 'bus', name: 'College Bus Bay & Vehicle Parking', block: 'Gate 1 Transport Hub' },
    { id: 'hostel', name: 'Campus Hostels (Boys & Girls)', block: 'Residential Quarters' }
];

// Standardized Item Categories
const GKM_CATEGORIES = [
    { id: 'ids-wallets', label: 'College IDs, Purses & Wallets', icon: 'fa-id-card' },
    { id: 'electronics', label: 'Calculators, Laptops & Tech', icon: 'fa-laptop' },
    { id: 'keys', label: 'Keys, Lanyards & Bike Fobs', icon: 'fa-key' },
    { id: 'books', label: 'Lab Manuals, Records & Textbooks', icon: 'fa-book-open' },
    { id: 'bags', label: 'Backpacks & Drawing Instrument Kits', icon: 'fa-briefcase' },
    { id: 'bottles', label: 'Water Flasks & Personal Belongings', icon: 'fa-bottle-water' },
    { id: 'clothing', label: 'Lab Coats, Hoodies & Umbrellas', icon: 'fa-shirt' },
    { id: 'other', label: 'Miscellaneous Belongings', icon: 'fa-shapes' }
];

/**
 * Realistic Sample Demo Data for GKM College of Engineering and Technology
 * Tailored for live hackathon presentations.
 */
const SAMPLE_GKM_DATA = [
    {
        id: 'gkm-101',
        type: 'lost',
        title: 'Casio fx-991CW Scientific Calculator',
        category: 'electronics',
        locationId: 'cse',
        locationDetail: 'Turing Lab 3, 2nd Floor, Desk #24 (near projector)',
        date: '2026-10-21',
        description: 'Black Casio non-programmable calculator needed for Engineering Mathematics exam. Has a small yellow smiley sticker on the protective slider case.',
        secretQuestion: 'What initials are engraved or written with marker inside the battery cover?',
        secretAnswer: 'V.K. 2024',
        reporterName: 'Vignesh Kumar',
        reporterEmail: 'vignesh.k.cse@gkmcet.edu.in',
        reporterDepartment: 'CSE - 3rd Year',
        status: 'Open', // 'Open' | 'Claim Pending' | 'Returned'
        imageUrl: null,
        createdAt: 1729500000000,
        claims: []
    },
    {
        id: 'gkm-102',
        type: 'found',
        title: 'Casio fx-991 Scientific Calculator (Black)',
        category: 'electronics',
        locationId: 'cse',
        locationDetail: 'Turing Computer Lab 3, left on table after 4 PM practicals',
        date: '2026-10-21',
        description: 'Found scientific calculator left behind on desk. Sliding cover has stickers. Handed over to CSE Lab Assistant for safekeeping.',
        secretQuestion: 'What initials or mark is on or inside the case?',
        secretAnswer: 'V.K. 2024',
        reporterName: 'Lab Assistant Ramesh',
        reporterEmail: 'cse-lab@gkmcet.edu.in',
        reporterDepartment: 'CSE Department Staff',
        status: 'Open',
        imageUrl: null,
        createdAt: 1729508000000,
        claims: []
    },
    {
        id: 'gkm-103',
        type: 'lost',
        title: 'Official GKM Student ID Card & Metro Pass',
        category: 'ids-wallets',
        locationId: 'bus',
        locationDetail: 'Near College Bus #12 (Tambaram - Perungalathur route)',
        date: '2026-10-22',
        description: 'GKM College of Engineering and Technology official student identity smartcard on a navy blue GKM lanyard. Belonging to Priya S. Urgently needed for campus entry and exam hall ticket.',
        secretQuestion: 'What is the full 12-digit university registration number on the card?',
        secretAnswer: '310822104045',
        reporterName: 'Priya Sundaram',
        reporterEmail: 'priya.s.ece@gkmcet.edu.in',
        reporterDepartment: 'ECE - 2nd Year',
        status: 'Claim Pending',
        imageUrl: null,
        createdAt: 1729560000000,
        claims: [
            {
                id: 'claim-001',
                claimantName: 'Priya Sundaram',
                claimantEmail: 'priya.s.ece@gkmcet.edu.in',
                claimantRegNo: '310822104045',
                claimantDept: 'ECE - 2nd Year',
                proofDetails: 'My registration number is 310822104045 and my photo is in the ECE department database.',
                submittedAt: '2026-10-22 11:30 AM',
                verified: false
            }
        ]
    },
    {
        id: 'gkm-104',
        type: 'found',
        title: 'Navy Blue GKM Lanyard with Student ID Badge',
        category: 'ids-wallets',
        locationId: 'bus',
        locationDetail: 'Found near Bus Bay waiting shelter seat #4',
        date: '2026-10-22',
        description: 'College student smartcard found on pavement near bus bay. Name starts with P., 2nd year student. Safely deposited at Campus Security Office.',
        secretQuestion: 'What is the student name and registration number on the ID?',
        secretAnswer: 'Priya Sundaram 310822104045',
        reporterName: 'Security Officer Murugan',
        reporterEmail: 'security@gkmcet.edu.in',
        reporterDepartment: 'Campus Security Office',
        status: 'Claim Pending',
        imageUrl: null,
        createdAt: 1729564000000,
        claims: []
    },
    {
        id: 'gkm-105',
        type: 'lost',
        title: 'Engineering Graphics Mini Drafter & Instrument Box',
        category: 'bags',
        locationId: 'mech',
        locationDetail: 'Drawing Hall A, Visvesvaraya Block, 1st Floor',
        date: '2026-10-20',
        description: 'Black canvas zip folder containing Omega mini drafter, set squares, and compass box. Essential for tomorrow drawing evaluation.',
        secretQuestion: 'What name is written on the wooden scale or drafter clamp?',
        secretAnswer: 'Karthik MECH',
        reporterName: 'Karthik R.',
        reporterEmail: 'karthik.r.mech@gkmcet.edu.in',
        reporterDepartment: 'Mechanical - 1st Year',
        status: 'Open',
        imageUrl: null,
        createdAt: 1729430000000,
        claims: []
    },
    {
        id: 'gkm-106',
        type: 'found',
        title: 'Milton Thermosteel Water Bottle (Silver & Blue, 750ml)',
        category: 'bottles',
        locationId: 'lib',
        locationDetail: 'Central Library, Reference Book Section, Table 5',
        date: '2026-10-22',
        description: 'Stainless steel insulated water bottle with handle cap. Found near Anna University past question papers shelf. Given to Librarian desk.',
        secretQuestion: 'Is there any sticker or dent on the base?',
        secretAnswer: 'Small dent on bottom rim',
        reporterName: 'Anitha (Library Staff)',
        reporterEmail: 'library@gkmcet.edu.in',
        reporterDepartment: 'Central Library',
        status: 'Open',
        imageUrl: null,
        createdAt: 1729570000000,
        claims: []
    },
    {
        id: 'gkm-107',
        type: 'found',
        title: 'Royal Enfield Bike Key with Red Cord Keychain',
        category: 'keys',
        locationId: 'bus',
        locationDetail: 'Two-wheeler student parking stand near Gate 2',
        date: '2026-10-19',
        description: 'Single black ignition key with classic Royal Enfield emblem and red braided rope ring. Handed over to parking attendant.',
        secretQuestion: 'What is the color of the miniature brass ring on the key?',
        secretAnswer: 'Small brass tag with number 7',
        reporterName: 'Sanjay P.',
        reporterEmail: 'sanjay.p.civil@gkmcet.edu.in',
        reporterDepartment: 'Civil - Final Year',
        status: 'Returned', // Reunited item for demo!
        imageUrl: null,
        createdAt: 1729350000000,
        claims: [
            {
                id: 'claim-000',
                claimantName: 'Arun Mozhi',
                claimantEmail: 'arun.m.mech@gkmcet.edu.in',
                claimantRegNo: '310821114012',
                claimantDept: 'Mechanical - Final Year',
                proofDetails: 'Showed the bike RC book and duplicate key.',
                submittedAt: '2026-10-20 10:15 AM',
                verified: true
            }
        ]
    }
];

/**
 * DataService Object: Simple, clean methods to manage reports and claims.
 */
const DataService = {
    /**
     * Fetch all items from localStorage or initialize with demo data
     */
    getAllReports: function() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                this.resetToSampleData();
                return [...SAMPLE_GKM_DATA];
            }
            return JSON.parse(raw);
        } catch (err) {
            console.error('[DataService] Error reading from localStorage:', err);
            return [...SAMPLE_GKM_DATA];
        }
    },

    /**
     * Save items array to localStorage
     */
    saveAllReports: function(reports) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
            return true;
        } catch (err) {
            console.error('[DataService] Failed to save to localStorage:', err);
            return false;
        }
    },

    /**
     * Create a new Lost or Found Report
     */
    addReport: function(reportData) {
        const reports = this.getAllReports();
        const newReport = {
            id: 'gkm-' + Date.now(),
            type: reportData.type, // 'lost' | 'found'
            title: reportData.title.trim(),
            category: reportData.category,
            locationId: reportData.locationId,
            locationDetail: reportData.locationDetail ? reportData.locationDetail.trim() : '',
            date: reportData.date,
            description: reportData.description.trim(),
            // Safety: Secret verification answer is kept securely in data store and never rendered on public cards
            secretQuestion: reportData.secretQuestion ? reportData.secretQuestion.trim() : 'Can you describe a specific hidden mark, sticker, or lock screen?',
            secretAnswer: reportData.secretAnswer ? reportData.secretAnswer.trim() : '',
            reporterName: reportData.reporterName.trim(),
            reporterEmail: reportData.reporterEmail.trim(),
            reporterDepartment: reportData.reporterDepartment ? reportData.reporterDepartment.trim() : 'GKM Student / Faculty',
            status: 'Open',
            imageUrl: reportData.imageUrl || null,
            createdAt: Date.now(),
            claims: []
        };

        reports.unshift(newReport);
        this.saveAllReports(reports);
        return newReport;
    },

    /**
     * Submit an ownership claim for a report
     */
    submitClaim: function(reportId, claimData) {
        const reports = this.getAllReports();
        const report = reports.find(r => r.id === reportId);
        if (!report) return { success: false, message: 'Report not found' };

        if (!report.claims) report.claims = [];

        const newClaim = {
            id: 'claim-' + Date.now(),
            claimantName: claimData.claimantName.trim(),
            claimantEmail: claimData.claimantEmail.trim(),
            claimantRegNo: claimData.claimantRegNo ? claimData.claimantRegNo.trim() : 'N/A',
            claimantDept: claimData.claimantDept ? claimData.claimantDept.trim() : '',
            proofDetails: claimData.proofDetails.trim(),
            submittedAt: new Date().toLocaleString(),
            verified: false
        };

        report.claims.push(newClaim);

        // Update status to 'Claim Pending' if it was 'Open'
        if (report.status === 'Open') {
            report.status = 'Claim Pending';
        }

        this.saveAllReports(reports);
        return { success: true, claim: newClaim, report };
    },

    /**
     * Verify an ownership claim and update status to 'Returned'
     */
    verifyAndResolveClaim: function(reportId, claimId) {
        const reports = this.getAllReports();
        const report = reports.find(r => r.id === reportId);
        if (!report) return { success: false, message: 'Report not found' };

        const claim = report.claims.find(c => c.id === claimId);
        if (claim) {
            claim.verified = true;
        }

        report.status = 'Returned';
        this.saveAllReports(reports);
        return { success: true, report };
    },

    /**
     * Direct status update (Open, Claim Pending, Returned)
     */
    updateReportStatus: function(reportId, newStatus) {
        const reports = this.getAllReports();
        const report = reports.find(r => r.id === reportId);
        if (!report) return false;

        report.status = newStatus;
        this.saveAllReports(reports);
        return true;
    },

    /**
     * Reset to default GKM sample data
     */
    resetToSampleData: function() {
        this.saveAllReports(SAMPLE_GKM_DATA);
        return [...SAMPLE_GKM_DATA];
    },

    /**
     * Helper to get location details by ID
     */
    getLocationById: function(locationId) {
        return GKM_CAMPUS_LOCATIONS.find(loc => loc.id === locationId) || {
            id: 'other',
            name: 'GKM Campus Premises',
            block: 'General Campus'
        };
    },

    /**
     * Helper to get category details by ID
     */
    getCategoryById: function(categoryId) {
        return GKM_CATEGORIES.find(cat => cat.id === categoryId) || {
            id: 'other',
            label: 'General Item',
            icon: 'fa-box'
        };
    }
};
