# 🎓 CampusConnect — GKM College of Engineering and Technology
### Hackathon Edition | Official Student Lost & Found Recovery Portal

> **Institution:** GKM College of Engineering and Technology (GKMCET), Chennai  
> **Technology Stack:** HTML5, Modern CSS3, Vanilla JavaScript (ES6+)  
> **Data Layer:** Browser Local Storage (`localStorage`) with clean abstraction layer for easy cloud database integration.

---

## 💡 1. Problem Statement & Solution

### The Campus Problem:
At GKM College of Engineering and Technology, students move between the **APJ Abdul Kalam Central Library**, **Turing Computing Labs**, **Visvesvaraya Mechanical Workshops**, **Drawing Halls**, and the **College Bus Bay**. Every week:
- Scientific calculators (Casio fx-991), engineering mini-drafters, college smart ID cards, vehicle keys, and lab records are misplaced.
- Lost items were previously broadcasted across unofficial WhatsApp groups where posts quickly get buried.
- Students lacked a secure way to verify ownership, exposing them to false claims or privacy risks.

### The Solution — CampusConnect:
CampusConnect is a centralized, privacy-protected digital portal that:
1. Enables students and staff to log Lost or Found items in under 60 seconds.
2. Uses a **Smart Match Algorithm** to cross-examine reports and **explain why** two listings might be the same item.
3. Protects student privacy: personal contact details and secret verification details are **never published on public cards**.
4. Enforces a structured claim verification workflow before an item can be marked as **Returned**.

---

## 🏆 2. Features Implemented (All 12 Hackathon Requirements)

| # | Feature | How It Works in CampusConnect |
|---|---|---|
| **1** | **Home Page Explaining Problem & Solution** | Top Hero section highlights GKMCET challenges, showing side-by-side problem and solution breakdown cards and campus recovery stats. |
| **2** | **Report Lost Item Form** | Dedicated "I Lost an Item" workflow with red badging, custom prompts, and verification challenge fields. |
| **3** | **Report Found Item Form** | Dedicated "I Found an Item" workflow with green badging, helping good Samaritans report discovered property. |
| **4** | **Rich Form Fields** | Includes Item Name, Category, GKM Campus Facility, Specific Room/Spot, Date, Description, Optional Photo Upload, Private Contact, and Secret Identifier. |
| **5** | **Keyword Search & Category Filter** | Instant live search across titles, descriptions, and building locations, plus dropdown category filter and status tabs. |
| **6** | **Display Sample & Submitted Reports** | Modern, responsive grid of accessible cards showing status badges, facility tags, category icons, and dates. |
| **7** | **Smart Match Engine** | Compares Lost and Found listings across Category (35%), Building Proximity (30%), Keyword Overlap (35%), and Timelines. |
| **8** | **Explicit Match Explanations** | Every suggested match clearly states **WHY** it was suggested (e.g. *"Category Match: Both items are classified as Calculators, Laptops & Tech"*, *"Location Match: Both reported at Turing Computing Center"*). |
| **9** | **Submit Ownership Claim** | Students click "Claim Item", view the secret challenge question, and submit their Name, Reg No, College Email, and proof. |
| **10** | **Report Status Tracking** | Three clear states: <br>• <span style="color:#0369a1; font-weight:bold;">Open</span>: Active listing.<br>• <span style="color:#92400e; font-weight:bold;">Claim Pending</span>: Claim submitted, awaiting review.<br>• <span style="color:#166534; font-weight:bold;">Returned</span>: Ownership verified and handed over. |
| **11** | **Form Validation & Helpful Errors** | Real-time validation checks for missing fields, minimum characters, and email format with inline error highlights (`.is-invalid`) and alert toasts. |
| **12** | **GKM College Live Sample Data** | Pre-loaded with realistic campus records (Casio Calculator in Turing Lab, Student ID Card at Bus Bay #12, Mini Drafter in Mech Hall, Royal Enfield Key, Milton Flask in Library). |

---

## 🛡️ 3. Safety & Privacy Design

- **Private Contact Details:** Student emails and phone numbers are masked (`v***@gkmcet.edu.in`) and stored safely in the data layer. They are never exposed on public cards.
- **Hidden Secret Verification:** The reporter sets a secret answer (e.g., *initials inside the battery cover* or *sticker under the lid*). Claimants must answer the question, and only authorized reviews can mark the item as **Returned**.

---

## 🏗️ 4. Beginner-Friendly Code Architecture

The project has a clear separation of concerns so any student can understand and present it to judges:

```
website/
├── index.html            # Semantic HTML5 layout, accessible modals, and forms
├── css/
│   └── styles.css        # Responsive styling, color variables, Dark/Light modes
├── js/
│   ├── data-service.js   # DATA LAYER: Manages localStorage, sample data & CRUD operations
│   ├── smart-match.js    # ALGORITHM: Match scoring & human-readable explanation engine
│   └── app.js            # CONTROLLER: Handles DOM events, form validations & toasts
├── server.ps1            # Optional local HTTP web server
├── start-server.bat      # 1-click Windows launcher
└── README.md             # Project documentation
```

### 💡 Hackathon Note on the Data Layer (`data-service.js`):
> All data is persisted in browser `localStorage` for the prototype. When scaling to a full-stack production app, a developer only needs to update `data-service.js` to call API endpoints using `fetch()` to connect to Node.js, Express, Firebase, or MongoDB!

---

## 🚀 5. How to Run the Website Step-by-Step

### Option 1: Direct File Launch (No setup needed!)
1. Open the folder: `c:\Users\Dell\Documents\website`.
2. Double-click **`index.html`** (or right-click and select *Open with > Google Chrome / Microsoft Edge*).
3. The website runs with full functionality completely offline!

### Option 2: 1-Click Local Web Server
1. In the same folder, double-click **`start-server.bat`**.
2. It starts a lightweight PowerShell HTTP server and automatically opens `http://localhost:8080/`.

---

## 🎤 6. Hackathon Live Demo Script (2 Minutes for Judges)

1. **Introduction (15s):**  
   *"Welcome judges! CampusConnect is a web portal built for GKM College of Engineering and Technology to solve lost belongings across our campus labs and bus bays."*
2. **Explore Existing Items (20s):**  
   Show the **Browse Reports** directory. Demonstrate filtering by **Lost**, **Found**, and **Returned**, or searching for *"Casio"* or *"Turing"*.
3. **Smart Matches with Explanations (30s):**  
   Scroll to the **Smart Match Suggestions** section. Highlight:  
   *"Notice how our algorithm matched the lost Casio calculator with the found Casio calculator in Turing Lab, and explicitly lists the reasons why!"*
4. **Submit a New Report (30s):**  
   Click **"Report Item"**, intentionally leave a field empty to demonstrate the **helpful validation error messages**, then fill it out with a photo to show the instant preview and toast notification.
5. **Submit & Verify a Claim (25s):**  
   Click **"Claim Item"** on a found report, enter student registration number and proof. Show the status update to **Claim Pending**, open the Dossier, and click **"Verify Proof & Mark as Returned"** to complete the lifecycle!
