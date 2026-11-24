// ============================================================
// MediLab & Drug Store Information System (MLDIS) — App Engine
// Interactive Role-Based Management, Clinical & Pharmacy State
// ============================================================

// --- 1. USER ACCOUNTS & CURRENT SESSION ---
const appUsers = [
  { id: 'USR01', name: 'Shristi Srivastava', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 'USR02', name: 'Dr. Shristi Singh', username: 'doctor_shristi', password: 'doc123', role: 'doctor' },
  { id: 'USR03', name: 'Raushni Kumari', username: 'tech_raushni', password: 'lab123', role: 'lab' },
  { id: 'USR04', name: 'Sneha Kumari', username: 'pharma_sneha', password: 'pharma123', role: 'pharmacist' },
  { id: 'USR05', name: 'Riya Sharma', username: 'patient_riya', password: 'pat123', role: 'patient' }
];

let currentUser = null;

// --- 2. IN-MEMORY MEDICAL DATABASE ---
const store = {
  patients: [
    { id:'P1001', name:'Riya Sharma', age:28, gender:'Female', contact:'9801234567', address:'12 MG Road, Kolkata', history:'Seasonal Asthma, No known drug allergies' },
    { id:'P1002', name:'Arjun Mehta', age:45, gender:'Male', contact:'9812345678', address:'34 Lake Town, Kolkata', history:'Type 2 Diabetes Mellitus' },
    { id:'P1003', name:'Priya Das', age:33, gender:'Female', contact:'9823456789', address:'56 Salt Lake, Kolkata', history:'Mild Chronic Gastritis' },
    { id:'P1004', name:'Rohit Verma', age:60, gender:'Male', contact:'9834567890', address:'78 Howrah Bridge Rd', history:'Hypertension, Dyslipidemia' }
  ],
  labTests: [
    { id:'SCH001', pid:'P1001', test:'CBC (Complete Blood Count)', date:'2026-11-10', tech:'Raushni Kumari', result:'Hb: 12.8 g/dL, WBC: 7,200 /mcL', ref:'12.0 - 15.5 g/dL', status:'Done' },
    { id:'SCH002', pid:'P1002', test:'LFT (Liver Function Test)', date:'2026-11-15', tech:'Raushni Kumari', result:'SGPT: 34 U/L, Bilirubin: 0.9 mg/dL', ref:'SGPT: 7-56 U/L', status:'Done' },
    { id:'SCH003', pid:'P1003', test:'Blood Sugar Fasting', date:'2026-11-20', tech:'Raushni Kumari', result:'Pending sample processing', ref:'70 - 99 mg/dL', status:'Booked' },
    { id:'SCH004', pid:'P1004', test:'Lipid Profile', date:'2026-11-25', tech:'Raushni Kumari', result:'Total Chol: 210 mg/dL, Triglycerides: 160 mg/dL', ref:'Chol: <200 mg/dL', status:'Done' }
  ],
  prescriptions: [
    { id:'PR101', pid:'P1001', doctor:'Dr. Shristi Singh', medicine:'Amoxicillin 500 mg', dosage:'1-0-1', duration:'5 days', qty: 15, status:'Dispensed' },
    { id:'PR102', pid:'P1002', doctor:'Dr. Shristi Singh', medicine:'Metformin 500 mg', dosage:'0-0-1', duration:'30 days', qty: 30, status:'Dispensed' },
    { id:'PR103', pid:'P1003', doctor:'Dr. Shristi Singh', medicine:'Paracetamol 500 mg', dosage:'1-1-1', duration:'3 days', qty: 9, status:'Pending' },
    { id:'PR104', pid:'P1004', doctor:'Dr. Shristi Singh', medicine:'Atorvastatin 10 mg', dosage:'0-0-1', duration:'30 days', qty: 30, status:'Pending' }
  ],
  stock: [
    { id:'MED001', name:'Amoxicillin 500 mg', qty:120, reorder:50, price: 8.50, status:'ok' },
    { id:'MED002', name:'Metformin 500 mg', qty:200, reorder:60, price: 4.00, status:'ok' },
    { id:'MED003', name:'Paracetamol 500 mg', qty:300, reorder:100, price: 2.50, status:'ok' },
    { id:'MED004', name:'Atorvastatin 10 mg', qty:80, reorder:40, price: 11.00, status:'ok' },
    { id:'MED005', name:'Pantoprazole 40 mg', qty:25, reorder:50, price: 9.00, status:'low' },
    { id:'MED006', name:'Azithromycin 500 mg', qty:12, reorder:30, price: 22.00, status:'low' }
  ],
  bills: [
    { id:'BILL001', pid:'P1001', service:'Lab Diagnostic Test', amount:500, tax:18, discount:0, total:590.00, date:'2026-11-10', status:'Paid' },
    { id:'BILL002', pid:'P1001', service:'Pharmacy Medicines', amount:127.50, tax:5, discount:10, total:120.48, date:'2026-11-10', status:'Paid' },
    { id:'BILL003', pid:'P1002', service:'Lab Diagnostic Test', amount:800, tax:18, discount:0, total:944.00, date:'2026-11-15', status:'Paid' },
    { id:'BILL004', pid:'P1003', service:'Pharmacy Medicines', amount:75, tax:5, discount:0, total:78.75, date:'2026-11-20', status:'Due' }
  ],
  config: {
    labTax: 18,
    drugTax: 5,
    discount: 10
  }
};

// --- 3. AUTHENTICATION & ROLE SWITCHING ---

function quickFill(user, pass, role) {
  document.getElementById('loginUsername').value = user;
  document.getElementById('loginPassword').value = pass;
  document.getElementById('loginRole').value = role;
}

function handleLogin(e) {
  if (e) e.preventDefault();
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value.trim();
  const r = document.getElementById('loginRole').value;

  const found = appUsers.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);

  if (found) {
    currentUser = { ...found, role: r }; // respect chosen role
  } else {
    // allow guest / self-created user
    currentUser = {
      id: 'USR' + Math.floor(100 + Math.random() * 900),
      name: u.toUpperCase(),
      username: u,
      role: r
    };
  }

  showAppLayout();
  showToast(`Authenticated as ${currentUser.name} (${currentUser.role.toUpperCase()})`);
}

function handleLogout() {
  currentUser = null;
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  showToast('Logged out successfully.');
}

function showAppLayout() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appContainer').style.display = 'flex';

  // Apply user details to top and sidebar
  document.getElementById('sideUserName').textContent = currentUser.name;
  document.getElementById('topUserName').textContent = currentUser.name;
  document.getElementById('bannerUserGreeting').textContent = currentUser.name;

  const roleNameMap = {
    admin: 'Administrator (Shristi Srivastava)',
    doctor: 'Doctor (Dr. Shristi Singh)',
    lab: 'Lab Technician (Raushni Kumari)',
    pharmacist: 'Pharmacist (Sneha Kumari)',
    patient: 'Patient (Self-Service View)'
  };

  const roleLabel = roleNameMap[currentUser.role] || currentUser.role;
  document.getElementById('sideRoleBadge').textContent = currentUser.role.toUpperCase();
  document.getElementById('topRoleBadge').textContent = currentUser.role.toUpperCase();
  document.getElementById('bannerRoleDesc').textContent = roleLabel;

  // Set avatar icon
  const avatarIcons = {
    admin: '<i class="fas fa-user-shield text-blue"></i>',
    doctor: '<i class="fas fa-user-doctor text-green"></i>',
    lab: '<i class="fas fa-microscope text-orange"></i>',
    pharmacist: '<i class="fas fa-prescription-bottle-medical text-purple"></i>',
    patient: '<i class="fas fa-user-injured text-teal"></i>'
  };
  document.getElementById('sideAvatar').innerHTML = avatarIcons[currentUser.role] || '<i class="fas fa-user-circle"></i>';

  // Role permissions notice
  const notices = {
    admin: { title: 'Administrator Capabilities:', desc: 'Manage hospital user accounts, departments, doctors schedule, tax & discount parameters.' },
    doctor: { title: 'Doctor Capabilities:', desc: 'Examine patient profiles, record diagnoses, order pathology/radiology tests, prescribe medicines.' },
    lab: { title: 'Lab Technician Capabilities:', desc: 'Process lab orders, track physical specimens, input measured test parameters & issue verified reports.' },
    pharmacist: { title: 'Pharmacist Capabilities:', desc: 'Verify incoming prescriptions, dispense medication batches, monitor drug stock & calculate bills.' },
    patient: { title: 'Patient Portal Capabilities:', desc: 'Review your medical prescriptions, diagnostic test results, download bills and pay dues.' }
  };
  const n = notices[currentUser.role] || notices.patient;
  document.getElementById('roleNoticeTitle').textContent = n.title;
  document.getElementById('roleNoticeText').textContent = n.desc;

  // Show/Hide Role-Specific Menu Items
  document.querySelectorAll('.role-menu-item').forEach(item => {
    const allowed = item.getAttribute('data-role').split(',');
    if (allowed.includes(currentUser.role)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });

  // Populate dynamic select dropdowns
  populateDocSelect();

  // If patient logs in, directly navigate to their portal
  if (currentUser.role === 'patient') {
    navigate('myportal');
    loadPatientPortalData('P1001');
  } else if (currentUser.role === 'doctor') {
    navigate('doctor');
  } else if (currentUser.role === 'pharmacist') {
    navigate('pharmacy');
  } else if (currentUser.role === 'lab') {
    navigate('lab');
  } else {
    navigate('dashboard');
  }

  // Refresh all components
  renderAll();
}

// --- 4. RENDERERS & DATA BINDING ---

function renderAll() {
  renderPatients();
  renderLabTests();
  renderPrescriptions();
  renderStock();
  renderBills();
  renderStaff();
  updatePortalPatientDropdown();
  updateKPIs();
}

function renderPatients() {
  const tbody = document.getElementById('patientBody');
  if (!tbody) return;
  tbody.innerHTML = store.patients.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.name}</td>
      <td>${p.age} yrs</td>
      <td>${p.gender}</td>
      <td>${p.contact}</td>
      <td>${p.address}</td>
      <td><small>${p.history || 'N/A'}</small></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="quickViewPatient('${p.id}')" title="View Portal"><i class="fas fa-folder-open"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteRecord('patients','${p.id}', renderPatients)"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function renderLabTests() {
  const tbody = document.getElementById('labBody');
  if (!tbody) return;
  tbody.innerHTML = store.labTests.map(t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td><a href="#" onclick="quickViewPatient('${t.pid}')">${t.pid}</a></td>
      <td><strong>${t.test}</strong></td>
      <td>${t.date}</td>
      <td>${t.tech}</td>
      <td>${t.result}</td>
      <td><small>${t.ref || 'Standard'}</small></td>
      <td><span class="badge ${t.status.toLowerCase()}">${t.status}</span></td>
      <td>
        ${t.status === 'Booked' ? `<button class="btn btn-sm btn-success" onclick="enterLabResultPrompt('${t.id}')"><i class="fas fa-edit"></i> Result</button>` : `<button class="btn btn-sm btn-secondary" onclick="printLabReport('${t.id}')"><i class="fas fa-print"></i></button>`}
      </td>
    </tr>
  `).join('');
}

function renderPrescriptions() {
  const tbody = document.getElementById('rxBody');
  if (!tbody) return;
  tbody.innerHTML = store.prescriptions.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td><a href="#" onclick="quickViewPatient('${r.pid}')">${r.pid}</a></td>
      <td>${r.doctor}</td>
      <td><strong>${r.medicine}</strong></td>
      <td>${r.dosage}</td>
      <td>${r.duration}</td>
      <td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td>
      <td>
        ${r.status === 'Pending' ? `<button class="btn btn-sm btn-success" onclick="selectForDispense('${r.id}')"><i class="fas fa-pills"></i> Dispense</button>` : `<span class="text-green"><i class="fas fa-check-double"></i> Complete</span>`}
      </td>
    </tr>
  `).join('');
}

function renderStock() {
  const tbody = document.getElementById('stockBody');
  if (!tbody) return;
  tbody.innerHTML = store.stock.map(s => `
    <tr>
      <td><strong>${s.id}</strong></td>
      <td>${s.name}</td>
      <td><strong>${s.qty}</strong> units</td>
      <td>${s.reorder} units</td>
      <td>₹${s.price.toFixed(2)}</td>
      <td><span class="badge ${s.status}">${s.status === 'low' ? 'Low Stock' : 'In Stock'}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="restockMedicine('${s.id}')"><i class="fas fa-cart-plus"></i> +50</button>
      </td>
    </tr>
  `).join('');
}

function renderBills() {
  const tbody = document.getElementById('billBody');
  if (!tbody) return;
  tbody.innerHTML = store.bills.map(b => `
    <tr>
      <td><strong>${b.id}</strong></td>
      <td><a href="#" onclick="quickViewPatient('${b.pid}')">${b.pid}</a></td>
      <td>${b.service}</td>
      <td>₹${b.amount.toFixed(2)}</td>
      <td>${b.tax}%</td>
      <td>${b.discount}%</td>
      <td><strong>₹${b.total.toFixed(2)}</strong></td>
      <td>${b.date}</td>
      <td><span class="badge ${b.status.toLowerCase()}">${b.status}</span></td>
      <td>
        ${b.status === 'Due' ? `<button class="btn btn-sm btn-success" onclick="payBill('${b.id}')"><i class="fas fa-credit-card"></i> Pay Now</button>` : `<span class="badge paid"><i class="fas fa-receipt"></i> Paid</span>`}
      </td>
    </tr>
  `).join('');
}

function renderStaff() {
  const tbody = document.getElementById('staffBody');
  if (!tbody) return;
  tbody.innerHTML = appUsers.map(u => `
    <tr>
      <td><strong>${u.id}</strong></td>
      <td>${u.name}</td>
      <td><code>${u.username}</code></td>
      <td><span class="role-tag ${u.role}">${u.role.toUpperCase()}</span></td>
      <td><span class="badge ok">Active</span></td>
      <td><button class="btn btn-sm btn-secondary" onclick="quickFill('${u.username}', '${u.password}', '${u.role}'); handleLogin();"><i class="fas fa-shuffle"></i> Switch</button></td>
    </tr>
  `).join('');
}

function updateKPIs() {
  animateCount('kpiPatients', store.patients.length);
  animateCount('kpiTests', store.labTests.length);
  animateCount('kpiPrescriptions', store.prescriptions.length);
  animateCount('kpiBills', store.bills.length);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let curr = parseInt(el.textContent) || 0;
  if (curr === target) return;
  el.textContent = target;
}

// --- 5. PATIENT PORTAL SELF-SERVICE ENGINE ---

function loadPatientPortalData(pid) {
  const patient = store.patients.find(p => p.id === pid) || store.patients[0];
  const profileDiv = document.getElementById('portalProfileInfo');
  
  if (profileDiv && patient) {
    profileDiv.innerHTML = `
      <div class="patient-detail-grid">
        <div><strong>Patient Name:</strong> ${patient.name}</div>
        <div><strong>Patient ID:</strong> <span class="badge booked">${patient.id}</span></div>
        <div><strong>Age / Gender:</strong> ${patient.age} yrs / ${patient.gender}</div>
        <div><strong>Contact:</strong> ${patient.contact}</div>
        <div><strong>Address:</strong> ${patient.address}</div>
        <div><strong>History:</strong> ${patient.history || 'None'}</div>
      </div>
    `;
  }

  // Prescriptions for this patient
  const rxRows = store.prescriptions.filter(r => r.pid === pid);
  const rxTable = document.getElementById('portalRxTable');
  if (rxTable) {
    rxTable.innerHTML = rxRows.length ? rxRows.map(r => `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td>${r.medicine}</td>
        <td>${r.dosage}</td>
        <td>${r.duration}</td>
        <td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td>
      </tr>
    `).join('') : `<tr><td colspan="5" class="text-center">No prescriptions found.</td></tr>`;
  }

  // Lab tests for this patient
  const labRows = store.labTests.filter(t => t.pid === pid);
  const labTable = document.getElementById('portalLabTable');
  if (labTable) {
    labTable.innerHTML = labRows.length ? labRows.map(t => `
      <tr>
        <td><strong>${t.id}</strong></td>
        <td>${t.test}</td>
        <td>${t.date}</td>
        <td><strong>${t.result}</strong></td>
        <td><span class="badge ${t.status.toLowerCase()}">${t.status}</span></td>
      </tr>
    `).join('') : `<tr><td colspan="5" class="text-center">No lab tests found.</td></tr>`;
  }

  // Invoices for this patient
  const billRows = store.bills.filter(b => b.pid === pid);
  const billTable = document.getElementById('portalBillTable');
  if (billTable) {
    billTable.innerHTML = billRows.length ? billRows.map(b => `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td>${b.service}</td>
        <td><strong>₹${b.total.toFixed(2)}</strong></td>
        <td><span class="badge ${b.status.toLowerCase()}">${b.status}</span></td>
        <td>${b.status === 'Due' ? `<button class="btn btn-sm btn-success" onclick="payBill('${b.id}')">Pay ₹${b.total.toFixed(2)}</button>` : `<span class="badge ok">Cleared</span>`}</td>
      </tr>
    `).join('') : `<tr><td colspan="5" class="text-center">No bills registered.</td></tr>`;
  }
}

function quickViewPatient(pid) {
  navigate('myportal');
  const sel = document.getElementById('portalPatientSelect');
  if (sel) sel.value = pid;
  loadPatientPortalData(pid);
}

// --- 6. CLINICAL DOCTOR DESK ACTIONS ---

function populateDocSelect() {
  const sel = document.getElementById('docPatientSelect');
  if (!sel) return;
  sel.innerHTML = store.patients.map(p => `
    <option value="${p.id}">${p.id} - ${p.name} (${p.age}y, ${p.gender})</option>
  `).join('');
  if (store.patients.length > 0) {
    populateDocPatientInfo(store.patients[0].id);
  }
}

function populateDocPatientInfo(pid) {
  const p = store.patients.find(x => x.id === pid);
  const field = document.getElementById('docPatientDetails');
  if (p && field) {
    field.value = `Age: ${p.age} | History: ${p.history || 'No recorded history'}`;
  }
}

function submitDoctorConsultation() {
  const pid = document.getElementById('docPatientSelect').value;
  const symptoms = document.getElementById('docSymptoms').value.trim();
  const diagnosis = document.getElementById('docDiagnosis').value.trim();
  const labTest = document.getElementById('docLabOrder').value;
  const medicine = document.getElementById('docMedicineSelect').value;
  const dosage = document.getElementById('docDosage').value.trim();
  const duration = document.getElementById('docDuration').value.trim();

  if (!diagnosis) {
    showToast('Please specify clinical diagnosis / observations.');
    return;
  }

  // 1. Create prescription entry
  const newRxId = 'PR' + (100 + store.prescriptions.length + 1);
  store.prescriptions.push({
    id: newRxId,
    pid: pid,
    doctor: currentUser.name || 'Dr. Shristi Singh',
    medicine: medicine,
    dosage: dosage,
    duration: duration,
    qty: 15,
    status: 'Pending'
  });

  // 2. If lab test was ordered, schedule it
  let labMsg = '';
  if (labTest) {
    const newLabId = 'SCH' + (100 + store.labTests.length + 1);
    const today = new Date().toISOString().slice(0, 10);
    store.labTests.push({
      id: newLabId,
      pid: pid,
      test: labTest,
      date: today,
      tech: 'Raushni Kumari',
      result: 'Specimen awaited in Lab',
      ref: 'Standard',
      status: 'Booked'
    });
    labMsg = ` & Diagnostic [${labTest}] scheduled!`;
  }

  renderAll();
  showToast(`Consultation saved! Prescription [${newRxId}] generated${labMsg}`);
  navigate('pharmacy');
}

// --- 7. BLACK BOX TEST-CASE VALIDATED PHARMACY DISPENSING ---

function lookupPrescription() {
  const pid = document.getElementById('dispPatientID').value.trim();
  const rxId = document.getElementById('dispPrescriptionID').value.trim();
  const out = document.getElementById('dispConsoleOutput');

  // Black Box Test Case 1 & 2
  const match = store.prescriptions.find(r => r.id.toUpperCase() === rxId.toUpperCase() && r.pid.toUpperCase() === pid.toUpperCase());

  if (match) {
    document.getElementById('dispMedicine').value = match.medicine;
    document.getElementById('dispPrescribedQty').value = match.qty || 15;
    document.getElementById('dispQuantityInput').value = match.qty || 15;
    out.textContent = `Status: "Prescription found" for Patient ${pid} (Status: ${match.status})`;
    out.className = 'console-output text-green';
  } else {
    document.getElementById('dispMedicine').value = '';
    document.getElementById('dispPrescribedQty').value = '';
    out.textContent = `Status: "Invalid prescription". Please verify ID.`;
    out.className = 'console-output text-danger';
  }
}

function selectForDispense(rxId) {
  const r = store.prescriptions.find(x => x.id === rxId);
  if (!r) return;
  document.getElementById('dispPatientID').value = r.pid;
  document.getElementById('dispPrescriptionID').value = r.id;
  lookupPrescription();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function executeDispense() {
  const pid = document.getElementById('dispPatientID').value.trim();
  const rxId = document.getElementById('dispPrescriptionID').value.trim();
  let medicine = document.getElementById('dispMedicine').value.trim();
  let prescribedLimit = parseInt(document.getElementById('dispPrescribedQty').value);
  const inputQty = parseInt(document.getElementById('dispQuantityInput').value);
  const out = document.getElementById('dispConsoleOutput');

  const match = store.prescriptions.find(r => r.id.toUpperCase() === rxId.toUpperCase() && r.pid.toUpperCase() === pid.toUpperCase());

  // If matched, use prescription values unless user manually specified in the inputs
  if (match) {
    if (!medicine) medicine = match.medicine;
    if (isNaN(prescribedLimit)) prescribedLimit = match.qty || 15;
  } else {
    // If not matched in mock list, check if user manually provided input
    if (!medicine || isNaN(prescribedLimit)) {
      out.textContent = `"Invalid prescription"`;
      out.className = 'console-output text-danger';
      showToast('Invalid prescription. Verify IDs or fill in prescribed details.');
      return;
    }
  }

  // Black Box Test Case 4: Quantity = 0
  if (isNaN(inputQty) || inputQty <= 0) {
    out.textContent = `"Invalid quantity"`;
    out.className = 'console-output text-danger';
    showToast('Invalid quantity provided.');
    return;
  }

  // Black Box Test Case 5: Quantity exceeds prescribed amount
  if (inputQty > prescribedLimit) {
    out.textContent = `"Quantity exceeds prescribed amount" (Prescribed: ${prescribedLimit}, Requested: ${inputQty})`;
    out.className = 'console-output text-danger';
    showToast('Quantity exceeds prescribed amount.');
    return;
  }

  // Find stock
  const stockItem = store.stock.find(s => medicine.toLowerCase().includes(s.name.split(' ')[0].toLowerCase())) || store.stock[0];

  // Alternate Flow 4a: Out of stock
  if (!stockItem || stockItem.qty < inputQty) {
    out.textContent = `"Medicine is currently out of stock." Available units: ${stockItem ? stockItem.qty : 0}`;
    out.className = 'console-output text-danger';
    showToast('Medicine is out of stock.');
    return;
  }

  // Success flow: Dispense & update inventory
  stockItem.qty -= inputQty;
  if (stockItem.qty <= stockItem.reorder) stockItem.status = 'low';
  if (match) match.status = 'Dispensed';

  // Automatically generate drug bill (Level 2 DFD 0.6)
  const itemTotal = (stockItem.price || 10) * inputQty;
  const billTax = store.config.drugTax;
  const totalDue = itemTotal + (itemTotal * billTax / 100);
  const newBillId = 'BILL' + (100 + store.bills.length + 1);
  const today = new Date().toISOString().slice(0, 10);

  store.bills.push({
    id: newBillId,
    pid: pid || 'P1001',
    service: `Medicine: ${medicine} (x${inputQty})`,
    amount: itemTotal,
    tax: billTax,
    discount: 0,
    total: totalDue,
    date: today,
    status: 'Due'
  });

  out.textContent = `"Medicine dispensed successfully" (Medicine: ${medicine}, Quantity: ${inputQty}) & Bill [${newBillId}] generated!`;
  out.className = 'console-output text-green';

  renderAll();
  showToast(`Dispensed ${inputQty} units of ${medicine}!`);
}

// --- 8. LAB RESULT ENTRY & SPECIMEN TRACKING ---

function enterLabResultPrompt(tid) {
  const test = store.labTests.find(t => t.id === tid);
  if (!test) return;
  const val = prompt(`Enter Lab Test Parameter Results for ${test.test} (Patient: ${test.pid}):`, 'Normal / Value: 13.5');
  if (val) {
    test.result = val;
    test.status = 'Done';
    renderLabTests();
    showToast(`Lab report updated for ${tid}`);
  }
}

function printLabReport(tid) {
  const t = store.labTests.find(x => x.id === tid);
  if (!t) return;
  alert(`=== MEDILAB DIAGNOSTIC REPORT ===\nReport ID: REP-${t.id}\nPatient ID: ${t.pid}\nTest Name: ${t.test}\nDate: ${t.date}\nTechnician: ${t.tech}\nResult: ${t.result}\nReference Range: ${t.ref}\nStatus: VERIFIED & SIGNED`);
}

function trackSample() {
  const bc = document.getElementById('sampleBarcode').value.trim();
  const type = document.getElementById('sampleType').value;
  const msg = document.getElementById('sampleStatusMsg');

  if (!bc) {
    alert('Please enter a sample barcode');
    return;
  }
  msg.innerHTML = `<span class="badge ok"><i class="fas fa-check"></i> Specimen [${bc}] of type [${type}] received, centrifuged & accessioned.</span>`;
  showToast(`Specimen ${bc} logged into lab database.`);
}

// --- 9. BILLING & PAYMENTS ENGINE ---

function calcBill() {
  const amt = parseFloat(document.getElementById('bAmount').value) || 0;
  const tax = parseFloat(document.getElementById('bTax').value) || 0;
  const disc = parseFloat(document.getElementById('bDiscount').value) || 0;
  const tot = amt + (amt * tax / 100) - (amt * disc / 100);
  document.getElementById('bTotal').textContent = '₹' + tot.toFixed(2);
}

function payBill(bid) {
  const b = store.bills.find(x => x.id === bid);
  if (!b) return;
  b.status = 'Paid';
  renderBills();
  if (currentUser && currentUser.role === 'patient') {
    loadPatientPortalData(b.pid);
  }
  showToast(`Payment of ₹${b.total.toFixed(2)} received for Bill ${bid}! Receipt generated.`);
}

function saveTaxConfig() {
  store.config.labTax = parseFloat(document.getElementById('cfgLabTax').value) || 18;
  store.config.drugTax = parseFloat(document.getElementById('cfgDrugTax').value) || 5;
  store.config.discount = parseFloat(document.getElementById('cfgDiscount').value) || 10;
  showToast('Tax and discount rate parameters saved.');
}

function openPatientRegisterFromAuth() {
  openModal('patientModal');
}

function updatePortalPatientDropdown(selectedId) {
  const sel = document.getElementById('portalPatientSelect');
  if (!sel) return;
  sel.innerHTML = store.patients.map(p => `
    <option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.id} - ${p.name} (${p.age}y, ${p.gender})</option>
  `).join('');
}

// --- 10. MODAL CREATIONS ---

function generateNextPatientId() {
  const nums = store.patients
    .map(p => parseInt(p.id.replace(/\D/g, '')))
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return 'P' + (max + 1);
}

function addPatient(e) {
  if (e) e.preventDefault();

  let id = document.getElementById('pID').value.trim();
  const name = document.getElementById('pName').value.trim();
  const age = parseInt(document.getElementById('pAge').value) || 25;
  const gender = document.getElementById('pGender').value;
  const contact = document.getElementById('pContact').value.trim();
  const address = document.getElementById('pAddress').value.trim();
  const history = document.getElementById('pHistory').value.trim();

  if (!name) {
    showToast('Please enter Patient Full Name.');
    return;
  }

  // Auto-generate Patient ID if empty
  if (!id) {
    id = generateNextPatientId();
  }

  // Check duplicate
  if (store.patients.find(p => p.id.toUpperCase() === id.toUpperCase())) {
    showToast(`Patient ID ${id} already exists! Generating new ID...`);
    id = generateNextPatientId();
  }

  const newPatient = {
    id: id,
    name: name,
    age: age,
    gender: gender,
    contact: contact || 'Not provided',
    address: address || 'Kolkata',
    history: history || 'No known allergies'
  };

  store.patients.push(newPatient);

  // Clear modal inputs
  document.getElementById('pID').value = '';
  document.getElementById('pName').value = '';
  document.getElementById('pAge').value = '';
  document.getElementById('pContact').value = '';
  document.getElementById('pAddress').value = '';
  document.getElementById('pHistory').value = '';

  // Update views
  renderPatients();
  populateDocSelect();
  updatePortalPatientDropdown(id);
  updateKPIs();
  closeAllModals();

  // If user registered from Auth screen, automatically log them in
  const authScreen = document.getElementById('authScreen');
  if (authScreen && authScreen.style.display !== 'none') {
    const userSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    currentUser = {
      id: 'USR_' + id,
      name: name,
      username: userSlug,
      role: 'patient',
      patientId: id
    };
    showAppLayout();
    navigate('myportal');
    loadPatientPortalData(id);
    showToast(`Welcome ${name}! Registered with ID: ${id}`);
  } else {
    showToast(`Patient ${name} registered successfully with ID: ${id}!`);
    if (currentUser && currentUser.role === 'patient') {
      loadPatientPortalData(id);
    }
  }
}

function addLabTest() {
  const id = document.getElementById('lID').value.trim();
  const pid = document.getElementById('lPatientID').value.trim();
  const test = document.getElementById('lTestName').value;
  const date = document.getElementById('lDate').value || new Date().toISOString().slice(0, 10);
  const tech = document.getElementById('lTech').value.trim();

  if (!id || !pid) { showToast('Please enter Schedule ID and Patient ID'); return; }

  store.labTests.push({ id, pid, test, date, tech, result: 'Specimen in Queue', ref: 'Normal', status: 'Booked' });
  renderLabTests();
  closeAllModals();
  showToast(`Test ${test} booked.`);
}

function addPrescription() {
  const id = document.getElementById('rxID').value.trim();
  const pid = document.getElementById('rxPatient').value.trim();
  const doctor = document.getElementById('rxDoctor').value.trim();
  const medicine = document.getElementById('rxMedicine').value.trim();
  const dosage = document.getElementById('rxDosage').value.trim();
  const duration = document.getElementById('rxDuration').value.trim();

  if (!id || !pid || !medicine) { showToast('Please fill all prescription fields'); return; }

  store.prescriptions.push({ id, pid, doctor, medicine, dosage, duration, qty: 15, status: 'Pending' });
  renderPrescriptions();
  closeAllModals();
  showToast(`Prescription ${id} logged.`);
}

function addBill() {
  const id = document.getElementById('bID').value.trim();
  const pid = document.getElementById('bPatient').value.trim();
  const service = document.getElementById('bService').value;
  const amount = parseFloat(document.getElementById('bAmount').value) || 0;
  const tax = parseFloat(document.getElementById('bTax').value) || 0;
  const discount = parseFloat(document.getElementById('bDiscount').value) || 0;

  if (!id || !pid || !amount) { showToast('Please fill all bill fields'); return; }

  const total = amount + (amount * tax / 100) - (amount * discount / 100);
  const date = new Date().toISOString().slice(0, 10);

  store.bills.push({ id, pid, service, amount, tax, discount, total, date, status: 'Due' });
  renderBills();
  closeAllModals();
  showToast(`Bill ${id} generated for ₹${total.toFixed(2)}`);
}

function addMedicineStock() {
  const id = document.getElementById('medID').value.trim();
  const name = document.getElementById('medName').value.trim();
  const qty = parseInt(document.getElementById('medQty').value) || 50;
  const reorder = parseInt(document.getElementById('medReorder').value) || 20;
  const price = parseFloat(document.getElementById('medPrice').value) || 10;

  if (!id || !name) { showToast('Provide Medicine ID and Name'); return; }

  store.stock.push({ id, name, qty, reorder, price, status: qty <= reorder ? 'low' : 'ok' });
  renderStock();
  closeAllModals();
  showToast(`Medicine ${name} added to catalog.`);
}

function restockMedicine(mid) {
  const m = store.stock.find(x => x.id === mid);
  if (!m) return;
  m.qty += 50;
  m.status = m.qty <= m.reorder ? 'low' : 'ok';
  renderStock();
  showToast(`+50 units added to ${m.name}`);
}

function addStaffAccount() {
  const name = document.getElementById('usrName').value.trim();
  const username = document.getElementById('usrUsername').value.trim();
  const password = document.getElementById('usrPassword').value.trim();
  const role = document.getElementById('usrRole').value;

  if (!name || !username || !password) { showToast('Please enter all user credentials.'); return; }

  appUsers.push({ id: 'USR0' + (appUsers.length + 1), name, username, password, role });
  renderStaff();
  closeAllModals();
  showToast(`Staff member ${name} (${role}) added!`);
}

function deleteRecord(collection, id, renderFn) {
  const idx = store[collection].findIndex(x => x.id === id);
  if (idx > -1) {
    store[collection].splice(idx, 1);
    renderFn();
    showToast('Record deleted.');
  }
}

// --- 11. MODAL HELPERS & UTILITIES ---

function openModal(id) {
  document.getElementById('modalOverlay').classList.add('active');
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    // If opening patient modal, pre-fill with next available Patient ID
    if (id === 'patientModal') {
      const pidField = document.getElementById('pID');
      if (pidField && !pidField.value) {
        pidField.value = generateNextPatientId();
      }
    }
  }
}

function closeAllModals() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

function filterTable(tableId, query) {
  const q = query.toLowerCase();
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const target = document.getElementById(`page-${page}`);
  const navBtn = document.querySelector(`[data-page="${page}"]`);

  if (target) target.classList.add('active');
  if (navBtn) {
    navBtn.classList.add('active');
    document.getElementById('pageTitle').textContent = navBtn.querySelector('span').textContent;
  }

  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

function updateClock() {
  const el = document.getElementById('liveClock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString('en-IN', {
    hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit',
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// --- 12. MS PROJECT GANTT CHART BUILDER ---

function buildGantt() {
  const data = [
    { label:'Requirement Analysis (22d)', start:0, dur:22, type:'phase' },
    { label:'  User Interviews', start:0, dur:5, type:'task' },
    { label:'  Gather Information', start:0, dur:4, type:'task' },
    { label:'  Analyze Info', start:5, dur:10, type:'task' },
    { label:'  Create SRS', start:15, dur:7, type:'task' },
    { label:'  SRS Signoff ◆', start:22, dur:0, type:'milestone' },
    { label:'Design Phase (48d)', start:23, dur:48, type:'phase' },
    { label:'  UI Design', start:23, dur:14, type:'task' },
    { label:'  Process Design', start:37, dur:34, type:'task' },
    { label:'  Design Signoff ◆', start:71, dur:0, type:'milestone' },
    { label:'Coding Phase (15d)', start:72, dur:15, type:'phase' },
    { label:'Testing Phase (27d)', start:87, dur:27, type:'phase' },
    { label:'  Unit Testing', start:87, dur:10, type:'task' },
    { label:'  Integration Testing', start:97, dur:7, type:'task' },
    { label:'  System Testing', start:104, dur:5, type:'task' },
    { label:'  Acceptance Testing', start:109, dur:5, type:'task' },
    { label:'Implementation Signoff ◆', start:114, dur:0, type:'milestone' }
  ];

  const totalDays = 115;
  const wrap = document.getElementById('ganttChart');
  if (!wrap) return;

  wrap.innerHTML = data.map(d => {
    const leftPct = (d.start / totalDays * 100).toFixed(2);
    const widthPct = Math.max((d.dur / totalDays * 100), 0.8).toFixed(2);
    return `
      <div class="gantt-row">
        <div class="gantt-label">${d.label}</div>
        <div class="gantt-bar-area">
          <div class="gantt-bar ${d.type}" style="left:${leftPct}%; width:${widthPct}%">
            ${d.type !== 'milestone' && d.dur > 3 ? d.dur + 'd' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- 13. BOOTSTRAP ON LOAD ---

document.addEventListener('DOMContentLoaded', () => {
  // Navigation hook
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigate(link.dataset.page);
    });
  });

  // Mobile toggles
  const mob = document.getElementById('sidebarToggleMobile');
  if (mob) mob.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  const tog = document.getElementById('sidebarToggle');
  if (tog) tog.addEventListener('click', () => document.getElementById('sidebar').classList.remove('open'));

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Initialize Gantt
  buildGantt();

  // Render initial tables
  renderAll();
});
