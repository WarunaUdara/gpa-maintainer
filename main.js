// Grade to Grade Point mapping (University Standard)
const gradePoints = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'E': 0.0,
  'F': 0.0
};

// Non-GPA grades (ignored in calculations)
const nonGpaGrades = ['CA-AB', 'ESA-AB', 'N', 'CA-N', 'ESA-N', 'W'];

// Function to extract credits from module code
function getCreditsFromCode(moduleCode) {
  const lastChar = moduleCode.trim().slice(-1);
  return parseInt(lastChar) || 0;
}

// Hardcoded semester data
const semesterData = {
  semester1: [
    { sno: 1, code: 'ITC1013', title: 'Mathematics I', grade: 'A-', ngpa: 'No', remarks: '' },
    { sno: 2, code: 'ITC1023', title: 'Physics for Technology', grade: 'A-', ngpa: 'No', remarks: '' },
    { sno: 3, code: 'ITC1032', title: 'Principles of Statistics', grade: 'A', ngpa: 'No', remarks: '' },
    { sno: 4, code: 'ITC1052', title: 'Software Engineering I', grade: 'A', ngpa: 'No', remarks: '' },
    { sno: 5, code: 'ITC1063', title: 'Fundamentals of Programming', grade: 'A', ngpa: 'No', remarks: '' },
    { sno: 6, code: 'ITC1082', title: 'Communication Skills I', grade: 'A-', ngpa: 'No', remarks: '' },
    { sno: 7, code: 'ITC1091', title: 'Ethical Conduct of Learners', grade: 'A-', ngpa: 'Yes', remarks: 'NGPA Module' },
    { sno: 8, code: 'ITC1142', title: 'Computer Organization and Architecture', grade: 'A', ngpa: 'No', remarks: '' }
  ],
  semester2: [
    { sno: 1, code: 'ITC1102', title: 'Mathematics II', grade: 'A-', ngpa: 'No', remarks: '' },
    { sno: 2, code: 'ITC1112', title: 'Statistical Methods', grade: 'A-', ngpa: 'No', remarks: '' },
    { sno: 3, code: 'ITC1153', title: 'Object Oriented Analysis and Design', grade: 'A', ngpa: 'No', remarks: '' },
    { sno: 4, code: 'ITC1163', title: 'Database Systems', grade: 'A-', ngpa: 'No', remarks: 'A expected' },
    { sno: 5, code: 'ITC1172', title: 'Communication Skills II', grade: 'B+', ngpa: 'No', remarks: '' },
    { sno: 6, code: 'ITC1181', title: 'Personality Development', grade: 'A-', ngpa: 'Yes', remarks: 'NGPA Module' },
    { sno: 7, code: 'ITC1233', title: 'Object Oriented Programming', grade: 'A-', ngpa: 'No', remarks: 'A expected' }
  ],
  semester3: [
    { sno: 1, code: 'ITC2192', title: 'Mathematics for ICT', grade: 'A', ngpa: 'No', remarks: 'A,A-' },
    { sno: 2, code: 'ITC2212', title: 'Data Structures and Algorithms', grade: 'A', ngpa: 'No', remarks: '' },
    { sno: 3, code: 'ITC2243', title: 'Networking Essentials', grade: 'B', ngpa: 'No', remarks: '' },
    { sno: 4, code: 'ITC2272', title: 'Operating Systems', grade: 'B-', ngpa: 'No', remarks: '' },
    { sno: 5, code: 'ITC2303', title: 'Visual Application Programming', grade: 'A', ngpa: 'No', remarks: 'A' },
    { sno: 6, code: 'ITC2342', title: 'Fundamentals of Multimedia', grade: 'B+', ngpa: 'No', remarks: 'A,A-' }
  ],
  semester4: [
    { sno: 1, code: 'ITC2223', title: 'Web Application Development', grade: 'A', ngpa: 'No', remarks: 'A' },
    { sno: 2, code: 'ITC2252', title: 'Introduction to Machine Learning', grade: 'A', ngpa: 'No', remarks: 'A' },
    { sno: 3, code: 'ITC2282', title: 'Advanced Data Structures and Algorithms', grade: 'A', ngpa: 'No', remarks: 'A' },
    { sno: 4, code: 'ITC2292', title: 'Digital Control Systems Technology', grade: 'A', ngpa: 'No', remarks: 'A' },
    { sno: 5, code: 'ITC2302', title: 'Network Systems Design', grade: 'A-', ngpa: 'No', remarks: 'A-' },
    { sno: 6, code: 'ITC2353', title: 'Introduction to Graphic Design', grade: 'A-', ngpa: 'No', remarks: 'A-' },
    { sno: 7, code: 'ITC2242', title: 'Economics and Financial Management', grade: 'A', ngpa: 'No', remarks: 'A' }
  ],
  semester5: [],
  semester6: [],
  semester7: [],
  semester8: []
};

// Module class for proper calculation
class Module {
  constructor(sno, code, title, grade, ngpa, remarks) {
    this.sno = sno;
    this.code = code;
    this.title = title;
    this.grade = grade;
    this.ngpa = ngpa;
    this.remarks = remarks;
    this.credits = getCreditsFromCode(code);
    this.gradePoint = grade ? (gradePoints[grade] || 0) : 0;
  }

  isGpaModule() {
    return this.ngpa !== 'Yes' && this.grade && !nonGpaGrades.includes(this.grade);
  }

  getWeightedPoints() {
    return this.credits * this.gradePoint;
  }
}

// Calculate SGPA for a semester
function calculateSGPA(modules) {
  const gpaModules = modules.filter(m => {
    const mod = new Module(m.sno, m.code, m.title, m.grade, m.ngpa, m.remarks);
    return mod.isGpaModule();
  });

  if (gpaModules.length === 0) return 0;

  let totalWeightedPoints = 0;
  let totalCredits = 0;

  gpaModules.forEach(m => {
    const mod = new Module(m.sno, m.code, m.title, m.grade, m.ngpa, m.remarks);
    totalWeightedPoints += mod.getWeightedPoints();
    totalCredits += mod.credits;
  });

  return totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;
}

// Calculate CGPA across all semesters
function calculateCGPA() {
  let totalWeightedPoints = 0;
  let totalCredits = 0;

  Object.values(semesterData).forEach(semesterModules => {
    semesterModules.forEach(m => {
      const mod = new Module(m.sno, m.code, m.title, m.grade, m.ngpa, m.remarks);
      if (mod.isGpaModule()) {
        totalWeightedPoints += mod.getWeightedPoints();
        totalCredits += mod.credits;
      }
    });
  });

  return totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;
}

// SGPA data
const sgpaData = [
  { semester: 1, sgpa: 0, status: 'Pending' },
  { semester: 2, sgpa: 0, status: 'Pending' },
  { semester: 3, sgpa: 0, status: 'Pending' },
  { semester: 4, sgpa: 0, status: 'Pending' },
  { semester: 5, sgpa: 0, status: 'Pending' },
  { semester: 6, sgpa: 0, status: 'Pending' },
  { semester: 7, sgpa: 0, status: 'Pending' },
  { semester: 8, sgpa: 0, status: 'Pending' }
];

// Update SGPA values based on actual data
function updateAllSGPA() {
  for (let i = 1; i <= 8; i++) {
    const semesterKey = `semester${i}`;
    if (semesterData[semesterKey] && semesterData[semesterKey].length > 0) {
      sgpaData[i-1].sgpa = calculateSGPA(semesterData[semesterKey]);
      sgpaData[i-1].status = sgpaData[i-1].sgpa > 0 ? 'Completed' : 'Pending';
    } else {
      sgpaData[i-1].sgpa = 0;
      sgpaData[i-1].status = 'Pending';
    }
  }
}

// Function to get grade badge class
function getGradeBadgeClass(grade) {
  if (grade === 'A' || grade === 'A+') return 'grade-badge grade-A';
  if (grade === 'A-') return 'grade-badge grade-A-minus';
  if (grade === 'B+') return 'grade-badge grade-B-plus';
  if (grade === 'B') return 'grade-badge grade-B';
  if (grade === 'B-') return 'grade-badge grade-B-minus';
  if (grade === '') return 'grade-badge grade-pending';
  return 'grade-badge';
}

// Function to render semester table
function renderSemesterTable(semesterId, data) {
  const tableBody = document.getElementById(`${semesterId}-table`);
  if (!tableBody) {
    console.warn(`Table body not found for ${semesterId}`);
    return;
  }

  tableBody.innerHTML = '';

  if (!data || data.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="8" class="text-center text-muted">No data available</td>';
    tableBody.appendChild(tr);
    return;
  }

  data.forEach(row => {
    const mod = new Module(row.sno, row.code, row.title, row.grade, row.ngpa, row.remarks);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.sno}</td>
      <td><strong>${row.code}</strong></td>
      <td class="text-start">${row.title}</td>
      <td><span class="${getGradeBadgeClass(row.grade)}">${row.grade || 'Pending'}</span></td>
      <td>${mod.gradePoint > 0 ? mod.gradePoint.toFixed(2) : '-'}</td>
      <td><span class="badge bg-info">${mod.credits} CR</span></td>
      <td>${row.ngpa === 'Yes' ? '<span class="ngpa-badge">NGPA</span>' : row.ngpa}</td>
      <td class="remarks-cell">${row.remarks}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Function to render summary table
function renderSummaryTable() {
  const summaryTable = document.getElementById('summary-table');
  if (!summaryTable) {
    console.warn('Summary table not found');
    return;
  }

  summaryTable.innerHTML = '';

  sgpaData.forEach(sem => {
    const tr = document.createElement('tr');
    const statusClass = sem.status === 'Completed' ? 'text-success' : 'text-muted';
    tr.innerHTML = `
      <td><strong>Semester ${sem.semester}</strong></td>
      <td>${sem.sgpa > 0 ? sem.sgpa.toFixed(2) : '-'}</td>
      <td class="${statusClass}">${sem.status}</td>
    `;
    summaryTable.appendChild(tr);
  });
}

// Update semester headers with calculated SGPA
function updateSemesterHeaders() {
  for (let i = 1; i <= 8; i++) {
    const header = document.getElementById(`sem${i}-header`);
    if (header && sgpaData[i-1]) {
      const sgpa = sgpaData[i-1].sgpa;
      const sgpaText = sgpa > 0 ? sgpa.toFixed(2) : '0.00';
      header.textContent = `Semester ${String(i).padStart(2, '0')} - SGPA: ${sgpaText}`;
    }
  }
}

// Update all UI elements
function updateUI() {
  // Update CGPA
  const cgpa = calculateCGPA();
  const overallCGPAElement = document.getElementById('overallCGPA');
  const summaryCGPAElement = document.getElementById('summary-cgpa');
  
  if (overallCGPAElement) {
    overallCGPAElement.textContent = cgpa.toFixed(2);
  }
  if (summaryCGPAElement) {
    summaryCGPAElement.textContent = cgpa.toFixed(2);
  }

  // Update completed semesters count
  const completedCount = sgpaData.filter(s => s.status === 'Completed').length;
  const completedSemestersElement = document.getElementById('completedSemesters');
  if (completedSemestersElement) {
    completedSemestersElement.textContent = `${completedCount}/8`;
  }

  // Update semester headers
  updateSemesterHeaders();

  // Render summary table
  renderSummaryTable();

  console.log('✅ UI Updated Successfully');
  console.log(`📊 Current CGPA: ${cgpa.toFixed(2)}`);
  console.log(`✅ Completed Semesters: ${completedCount}/8`);
}

// Initialize the app
function init() {
  console.log('🚀 Initializing GPA Calculator...');
  
  // Calculate all SGPA values
  updateAllSGPA();

  // Render all semester tables
  for (let i = 1; i <= 8; i++) {
    const semesterKey = `semester${i}`;
    if (semesterData[semesterKey]) {
      renderSemesterTable(`sem${i}`, semesterData[semesterKey]);
    }
  }

  // Update all UI elements
  updateUI();

  console.log('✅ GPA Calculator Initialized');
  console.log('━'.repeat(60));
  console.log('📱 Admin Panel: window.adminPanel');
  console.log('📖 Help: adminPanel.help()');
  console.log('━'.repeat(60));
}

// Admin Functions

// Function to update a grade
function updateGrade(semester, moduleCode, newGrade) {
  const semesterKey = `semester${semester}`;
  const data = semesterData[semesterKey];
  
  if (!data) {
    console.error('❌ Semester not found');
    return;
  }

  const module = data.find(m => m.code === moduleCode);
  if (!module) {
    console.error('❌ Module not found');
    return;
  }

  const oldGrade = module.grade;
  module.grade = newGrade;

  // Recalculate everything
  updateAllSGPA();
  
  // Update UI
  renderSemesterTable(`sem${semester}`, data);
  updateUI();
  
  const cgpa = calculateCGPA();
  console.log(`✅ Updated ${moduleCode}: ${oldGrade || 'Empty'} → ${newGrade}`);
  console.log(`📊 New SGPA for Semester ${semester}: ${sgpaData[semester-1].sgpa.toFixed(2)}`);
  console.log(`📈 New CGPA: ${cgpa.toFixed(2)}`);
}

// Function to add a new module
function addModule(semester, moduleCode, moduleTitle, grade, isNGPA = false, remarks = '') {
  const semesterKey = `semester${semester}`;
  const data = semesterData[semesterKey];
  
  if (!data) {
    console.error('❌ Semester not found');
    return;
  }

  const newModule = {
    sno: data.length + 1,
    code: moduleCode,
    title: moduleTitle,
    grade: grade,
    ngpa: isNGPA ? 'Yes' : 'No',
    remarks: remarks
  };

  data.push(newModule);
  
  // Recalculate and refresh
  updateAllSGPA();
  renderSemesterTable(`sem${semester}`, data);
  updateUI();
  
  console.log(`✅ Added module ${moduleCode} to Semester ${semester}`);
}

// Function to view semester details
function viewSemesterDetails(semester) {
  const semesterKey = `semester${semester}`;
  const data = semesterData[semesterKey];
  
  if (!data) {
    console.error('❌ Semester not found');
    return;
  }

  console.log(`\n📚 Semester ${semester} Details:`);
  console.log('━'.repeat(80));
  
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  
  data.forEach(m => {
    const mod = new Module(m.sno, m.code, m.title, m.grade, m.ngpa, m.remarks);
    if (mod.isGpaModule()) {
      totalWeightedPoints += mod.getWeightedPoints();
      totalCredits += mod.credits;
      console.log(`${mod.code} | ${mod.grade} | ${mod.credits} CR | GP: ${mod.gradePoint} | Weighted: ${mod.getWeightedPoints().toFixed(2)}`);
    }
  });
  
  const sgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;
  console.log('━'.repeat(80));
  console.log(`Total Credits: ${totalCredits}`);
  console.log(`Total Weighted Points: ${totalWeightedPoints.toFixed(2)}`);
  console.log(`SGPA: ${sgpa.toFixed(2)}`);
  console.log(`Formula: ${totalWeightedPoints.toFixed(2)} ÷ ${totalCredits} = ${sgpa.toFixed(2)}`);
}

// Expose admin functions globally
window.adminPanel = {
  updateGrade,
  addModule,
  viewSemesterDetails,
  calculateSGPA: (sem) => {
    const data = semesterData[`semester${sem}`];
    return data ? calculateSGPA(data).toFixed(2) : 'N/A';
  },
  calculateCGPA: () => calculateCGPA().toFixed(2),
  viewData: () => console.log({ semesterData, sgpaData, gradePoints }),
  gradePoints,
  refresh: () => {
    updateAllSGPA();
    for (let i = 1; i <= 8; i++) {
      const semesterKey = `semester${i}`;
      if (semesterData[semesterKey]) {
        renderSemesterTable(`sem${i}`, semesterData[semesterKey]);
      }
    }
    updateUI();
    console.log('✅ Data refreshed!');
  },
  help: () => {
    console.log(`
🎓 GPA Calculator - Admin Panel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Available Commands:

1. Update a Grade:
   adminPanel.updateGrade(semester, "MODULE_CODE", "GRADE")
   Example: adminPanel.updateGrade(4, "ITC2223", "A+")

2. Add a Module:
   adminPanel.addModule(semester, "CODE", "Title", "GRADE", isNGPA, "remarks")
   Example: adminPanel.addModule(5, "ITC3123", "Web Security", "A", false, "")

3. View Semester Details:
   adminPanel.viewSemesterDetails(semester)
   Example: adminPanel.viewSemesterDetails(4)

4. Calculate SGPA:
   adminPanel.calculateSGPA(semester)
   Example: adminPanel.calculateSGPA(4)

5. Calculate CGPA:
   adminPanel.calculateCGPA()

6. View All Data:
   adminPanel.viewData()

7. Refresh UI:
   adminPanel.refresh()

8. Grade Points Reference:
   adminPanel.gradePoints

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Calculation Formulas:

SGPA = Σ(Credits × Grade Point) / Σ(Credits)
CGPA = Σ(All Credits × Grade Points) / Σ(All Credits)

Credits are extracted from module code's last digit.
Example: ITC2193 → 3 credits

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
};

// Run on page load
document.addEventListener('DOMContentLoaded', init);
