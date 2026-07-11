# Bendella School - Complete Feature Guide

## 1. Voice Messages & Audio Playback

### For Students
1. **Sending Voice Messages**
   - Click the 🎤 Microphone button in chat
   - Button turns RED while recording
   - Release/click again to stop recording
   - Message sends automatically

2. **Playing Voice Messages**
   - Click the ▶️ Play button on any voice message
   - Audio plays with progress bar
   - Shows: `[Time] Current/Total Duration`
   - Click again to pause
   - Blue progress bar fills as audio plays

3. **Features**
   - ✅ Works with any audio format (MP3, AAC, OGG, WebM, M4A)
   - ✅ Shows loading spinner while buffering
   - ✅ Displays error message if audio unavailable
   - ✅ Safe duration calculations (won't break on bad data)
   - ✅ Cross-origin audio support (CORS enabled)

### Status Indicators
- `⏳ Loading` - Audio is buffering
- `♪ Playing` - Audio currently playing
- Empty - Audio paused/stopped
- `✕ Error` - Could not load audio

---

## 2. Student QR Code (Profile)

### For Students
1. **Accessing Your QR Code**
   - Go to Dashboard → Profile
   - Scroll to "Membership Status" section
   - Click "Show Code" button
   - Your QR code appears

2. **What's In Your QR**
   - Student ID
   - Full name
   - Email address
   - Membership status (Active/Inactive/Pending)
   - Monthly amount
   - Billing cycle dates
   - Generation timestamp

3. **How Admins Use It**
   - Admins scan to quickly verify you
   - One scan shows all membership info
   - Can determine payment status instantly

---

## 3. Admin QR Scanner & Payment

### For Admins

#### Starting a Scan
1. Go to Dashboard → Admin Section
2. Find "Student QR Scanner" panel
3. **Select Module dropdown:**
   - Mathematics
   - Physics
   - Informatics
   - Any custom modules in system
4. Click "Start Scanning"
5. Camera opens automatically
6. Point at student's QR code
7. System auto-detects and processes

#### What You See After Scanning

**Student Information Card Shows:**
```
Name: Mohammed Laidi
ID: student-12345
Age: 22 years
Level (Niveau): 3ème Année L3
Specialty (Spécialité): Informatique

Account Status: ✓ Active
Paid Modules: [Mathematics] [Informatics]

Sessions Remaining: 4
✓ Student can attend sessions
```

#### Payment Status Legend

**Status Colors:**
- 🟢 **Green/Active**: Account is active, can attend sessions
- 🔴 **Red/Inactive**: Account locked, cannot attend
- 🟠 **Orange/Pending**: Waiting for payment

#### Session Logic

**Three Scenarios:**

1. **Student Has Sessions** (Balance > 0)
   ```
   Selected Module: Mathematics
   Remaining Sessions: 4
   ✓ Student can attend sessions
   Status: GREEN
   ```
   - Click "Record Session" or similar action
   - System deducts 1 session: 4 → 3

2. **Student Has NO Sessions** (Balance = 0)
   ```
   Selected Module: Physics  
   Remaining Sessions: 0
   ❌ No sessions available - Payment required
   Status: RED
   ```
   - Student cannot attend
   - Click "Pay Month" button to add sessions

3. **Student Didn't Pay This Module**
   ```
   Paid Modules: [Mathematics] [Informatics]
   Physics is NOT in the list = 0 sessions
   ❌ No sessions available - Payment required
   ```
   - Module not shown in "Paid Modules"
   - Must pay first

#### Payment Process

1. **Admin Finds Student with 0 Sessions**
2. **Clicks "Pay Month" Button**
3. **System:**
   - Adds 4 sessions: `0 → 4`
   - Updates status to "active"
   - Creates immutable payment record
   - Generates payment ID (PAY_timestamp)
   - Records admin operator ID
4. **Result:**
   - Student can now attend 4 sessions
   - Session balance visible in scanner
   - Payment tracked in audit log

#### Module-by-Module Tracking

**Example Student:**
```
Paid Modules: [Mathematics] [Informatics]
NOT Paid: [Physics]

Remaining Sessions:
- Mathematics: 3 (paid, can use)
- Informatics: 2 (paid, can use)
- Physics: 0 (not paid, cannot use)
```

Each module has independent payment and session tracking!

---

## 4. Complete Workflow Example

### Scenario: First-Time Student Attendance

**Step 1: Student Creates Profile**
- Student sign up on Bendella
- Profile → Click "Show Code"
- QR code generated and visible

**Step 2: Admin Prepares for Class**
- Admin dashboard → Admin section
- Opens QR Scanner
- Selects "Mathematics" module
- Clicks "Start Scanning"

**Step 3: Student Arrives at Class**
- Shows phone with QR code visible
- Admin scans with camera
- System processes QR instantly

**Step 4: Admin Sees Student Status**
- **Problem**: "❌ No sessions available"
- Student hasn't paid yet

**Step 5: Admin Processes Payment**
- Clicks "Pay Month" button
- System adds 4 sessions
- Student status: ✓ Active
- Remaining: 4 sessions

**Step 6: Student Attends Class**
- Student seated, class begins
- Admin records attendance
- System deducts 1 session
- Remaining: 3 sessions

**Step 7: Next 3 Classes**
- Same process
- Each class: sessions decrease (3 → 2 → 1 → 0)

**Step 8: Session Balance Empty**
- Student shows up for 5th class
- Admin scans QR
- Shows: "❌ No sessions available"
- Student must pay again
- Admin clicks "Pay Month"
- Adds 4 more sessions
- Cycle continues

---

## 5. Payment & Session Rules

### Payment Rules
- ✅ Admin adds 4 sessions per "Pay Month" click
- ✅ Each module has independent payment
- ✅ Can pay for Math without paying for Physics
- ✅ Payment recorded with date, time, admin ID
- ✅ Immutable audit trail (cannot be deleted)

### Session Rules
- ✅ Sessions decrease by 1 per attendance
- ✅ When balance reaches 0 → Automatic lock
- ✅ No manual unlock - must pay to re-enable
- ✅ Each scan shows accurate current balance
- ✅ Cannot attend if balance = 0

### Status Rules
- ✅ "Active" = Can attend sessions
- ✅ "Inactive" = Cannot attend (0 sessions)
- ✅ "Pending Payment" = Waiting for payment
- ✅ Status updates automatically with payment

---

## 6. Data Shown to Admin

### From QR Scan

**Personal Info**
- Full name
- Student ID
- Age (calculated from birth date)
- Specialty (Spécialité) - e.g., "Informatique"
- Academic Level (Niveau) - e.g., "3ème Année L3"

**Payment & Session Info**
- Account Status (Active/Inactive/Pending)
- Paid Modules list
- Remaining sessions for selected module
- Payment status (Green/Red/Orange)

### From Admin Dashboard

**Student List**
- All students
- Their tiers/levels
- Overall status
- Option to generate PDF reports

---

## 7. PDF Reports

### Generating Reports
1. Admin Dashboard → Reports section
2. Select tier: "3ème Année L3", "Bac", "CEM-3", etc.
3. Click "Generate PDF"
4. System creates professional report showing:
   - All students in that tier
   - Name, age, status
   - Sessions remaining per module
   - Generation date and admin name

### Report Contents
```
BENDELLA SCHOOL - STUDENT REPORT
Generated: July 11, 2026 by Admin
Tier: 3ème Année L3 Informatique

Student Name          Age    Status        Math    Physics    Informatics
Mohammed Laidi        22     Active        3       0          2
Amira Khan           21     Inactive      0       0          0
Karim Raoui          23     Pending       4       1          3
```

---

## 8. Technical Features

### Voice Messages
- **Supported Formats**: MP3, AAC, OGG, WebM, M4A
- **Max Size**: 25 MB
- **Progress Tracking**: Real-time progress bar
- **Error Handling**: Graceful degradation with error messages

### QR Codes
- **Format**: High-contrast QR (200x200px)
- **Data**: JSON-encoded student info
- **Scannable**: Works with any QR scanner app
- **Security**: Admin-only scanner access

### Payment Audit
- **Immutable**: Cannot be deleted or modified
- **Tracked**: Admin operator ID, timestamp, amount, sessions added
- **Searchable**: Can query by student, date, admin, module

### API Rate Limiting
- **Limit**: 60 requests per minute per IP
- **Protection**: Prevents abuse and DDOS
- **Response**: 429 "Too many requests" error if exceeded

---

## 9. Troubleshooting

### Voice Messages Not Playing
- **Check**: Is audio URL valid? (see browser console)
- **Check**: Browser allows audio playback?
- **Check**: Is crossOrigin set correctly?
- **Fix**: Refresh page, try again

### QR Scanner Won't Scan
- **Check**: Camera permissions granted?
- **Check**: QR code visible and well-lit?
- **Check**: Hold steady for 1-2 seconds
- **Fix**: Click "Stop" then "Start Scanning" to retry

### Payment Not Applying
- **Check**: Are you logged in as admin?
- **Check**: Is student in system?
- **Check**: Did you see success message?
- **Fix**: Refresh scanner and try again

### Sessions Show 0
- **Check**: Is module in "Paid Modules" list?
- **Check**: Did admin click "Pay Month"?
- **Check**: Is there a payment audit record?
- **Fix**: Admin must pay for module first

---

## 10. Security Features

### Authentication
- ✅ Bearer token required for all admin APIs
- ✅ Admin role verified on server
- ✅ Rate limiting prevents brute force
- ✅ Unauthorized users get 401 error

### Data Protection
- ✅ Payment records immutable (write-only)
- ✅ Admin operator ID logged (accountability)
- ✅ Timestamp on all transactions
- ✅ Database RLS (Row Level Security) on Supabase

### CORS & Cross-Origin
- ✅ Audio elements support crossOrigin
- ✅ QR codes validate format before processing
- ✅ API endpoints check authorization first

---

## Summary Table

| Feature | Status | Working | Notes |
|---------|--------|---------|-------|
| Voice Messages | ✅ | Yes | Full playback with controls |
| Audio Upload | ✅ | Yes | Any common audio format |
| QR Generation | ✅ | Yes | In membership profile |
| QR Scanning | ✅ | Yes | Real-time camera input |
| Payment Tracking | ✅ | Yes | Per-module immutable logs |
| Session Management | ✅ | Yes | Auto-lock at 0 balance |
| Admin Reports | ✅ | Yes | PDF export ready |
| Rate Limiting | ✅ | Yes | 60 req/min per IP |
| Error Handling | ✅ | Yes | Graceful with user feedback |

---

Everything is production-ready and fully tested! 🚀

