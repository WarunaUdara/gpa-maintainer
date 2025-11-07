// Grade to Grade Point mapping
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
  'F': 0.0
};

// Hardcoded semester data
const semesterData = {
  semester1: [
    { sno: 1, code: 'ITC 1013', title: 'Mathematics I', grade: 'A-', gradePoint: 3.7, ngpa: 'No', remarks: '' },
    { sno: 2, code: 'ITC 1023', title: 'Physics for Technology', grade: 'A-', gradePoint: 3.7, ngpa: 'No', remarks: '' },
    { sno: 3, code: 'ITC 1032', title: 'Principles of Statistics', grade: 'A', gradePoint: 4.0, ngpa: 'No', remarks: '' },
    { sno: 4, code: 'ITC 1052', title: 'Software Engineering I', grade: 'A', gradePoint: 4.0, ngpa: 'No', remarks: '' },
    { sno: 5, code: 'ITC 1063', title: 'Fundamentals of Programming', grade: 'A', gradePoint: 4.0, ngpa: 'No', remarks: '' },
    { sno: 6, code: 'ITC 1082', title: 'Communication Skills I', grade: 'A-', gradePoint: 3.7, ngpa: 'No', remarks: '' },
    { sno: 7, code: 'ITC 1091', title: 'Ethical Conduct of Learners', grade: 'A-', gradePoint: 3.7, ngpa: 'Yes', remarks: 'NGPA Module' },
    { sno: 8, code: 'ITC 1142', title: 'Computer Organization and Architecture', grade: 'A', gradePoint: 4.0, ngpa: 'No', remarks: '' }
  ],
  semester2: [
    { sno: 1, code: 'ITC 1102', title: 'Mathematics II', grade: 'A-', gradePoint: 3.7, ngpa: 'No', remarks: '' },
    { sno: 2, code: 'ITC 1112', title: 'Statistical Methods', grade: 'A-', gradePoint: 3.7, ngpa: 'No', remarks: '' },
    { sno: 3, code: 'ITC 1153', title: 'Object Oriented Analysis and Design', grade: 'A', gradePoint: 4.0, ngpa: 'No', remarks: '' },
    { sno: 4, code: 'ITC 1163', title: 'Database Systems', grade: 'A-', gradePoint: 3.7, ngpa: 'No', remarks: 'A expected' },
    { sno: 5, code: 'ITC 1172', title: 'Communication Skills II', grade: 'B+', gradePoint: 3.3, ngpa: 'No', remarks: '' },
    { sno: 6, code: 'ITC 1181', title: 'Personality Development', grade: 'A-', gradePoint: 3.7, ngpa: 'Yes', remarks: 'NGPA Module' },
    { sno: 7, code: 'ITC 1233', title: 'Object Oriented Programming', grade: 'A-', gradePoint: 3.7, ngpa: 'No', remarks: 'A expected' }
  ],
  semester3: [
    { sno: 1, code: 'ITC 2192', title: 'Mathematics for ICT', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A,A-' },
    { sno: 2, code: 'ITC 2212', title: 'Data Structures and Algorithms', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A' },
    { sno: 3, code: 'ITC 2243', title: 'Networking Essentials', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A' },
    { sno: 4, code: 'ITC 2272', title: 'Operating Systems', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'B+' },
    { sno: 5, code: 'ITC 2303', title: 'Visual Application Programming', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A' },
    { sno: 6, code: 'ITC 2342', title: 'Fundamentals of Multimedia', grade: 'B+', gradePoint: 3.3, ngpa: 'No', remarks: 'A,A-' }
  ],
  semester4: [
    { sno: 1, code: 'ITC 2223', title: 'Web Application Development', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A expected' },
    { sno: 2, code: 'ITC 2252', title: 'Introduction to Machine Learning', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A expected' },
    { sno: 3, code: 'ITC 2282', title: 'Advanced Data Structures and Algorithms', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A expected' },
    { sno: 4, code: 'ITC 2292', title: 'Digital Control Systems Technology', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A expected' },
    { sno: 5, code: 'ITC 2302', title: 'Network Systems Design', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A expected' },
    { sno: 6, code: 'ITC 2353', title: 'Introduction to Graphic Design', grade: '', gradePoint: 0, ngpa: 'No', remarks: 'A expected' },
    { sno: 7, code: 'ITC 2242', title: 'Economics and Financial Management', grade: '', gradePoint: 0, ngpa: 'No', remarks: '' }
  ]
};

// SGPA data
const sgpaData = [
  { semester: 1, sgpa: 3.85, status: 'Completed' },
  { semester: 2, sgpa: 3.71, status: 'Completed' },
  { semester: 3, sgpa: 0.00, status: 'Pending' },
  { semester: 4, sgpa: 0.00, status: 'Pending' },
  { semester: 5, sgpa: 0.00, status: 'Pending' },
  { semester: 6, sgpa: 0.00, status: 'Pending' },
  { semester: 7, sgpa: 0.00, status: 'Pending' },
  { semester: 8, sgpa: 0.00, status: 'Pending' }
];

// Function to get grade badge class
function getGradeBadgeClass(grade) {
  if (grade === 'A' || grade === 'A+') return 'grade-badge grade-A';
  if (grade === 'A-') return 'grade-badge grade-A-minus';
  if (grade === 'B+') return 'grade-badge grade-B-plus';
  if (grade === '') return 'grade-badge grade-pending';
  return 'grade-badge';
}

// Function to render semester table
function renderSemesterTable(semesterId, data) {
  const tableBody = document.getElementById(`${semesterId}-table`);
  if (!tableBody) return;

  tableBody.innerHTML = '';

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.sno}</td>
      <td><strong>${row.code}</strong></td>
      <td class="text-start">${row.title}</td>
      <td><span class="${getGradeBadgeClass(row.grade)}">${row.grade || 'Pending'}</span></td>
      <td>${row.gradePoint > 0 ? row.gradePoint.toFixed(2) : '-'}</td>
      <td>${row.ngpa === 'Yes' ? '<span class="ngpa-badge">NGPA</span>' : row.ngpa}</td>
      <td class="remarks-cell">${row.remarks}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Function to render summary table
function renderSummaryTable() {
  const summaryTable = document.getElementById('summary-table');
  if (!summaryTable) return;

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

// Initialize the app
function init() {
  // Render all semester tables
  renderSemesterTable('sem1', semesterData.semester1);
  renderSemesterTable('sem2', semesterData.semester2);
  renderSemesterTable('sem3', semesterData.semester3);
  renderSemesterTable('sem4', semesterData.semester4);

  // Render summary table
  renderSummaryTable();

  // Calculate completed semesters
  const completedCount = sgpaData.filter(s => s.status === 'Completed').length;
  document.getElementById('completedSemesters').textContent = `${completedCount}/8`;
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);

// Admin Functions - Easy to modify data

// Function to update a grade
function updateGrade(semester, moduleCode, newGrade) {
  const semesterKey = `semester${semester}`;
  const data = semesterData[semesterKey];
  
  if (!data) {
    console.error('Semester not found');
    return;
  }

  const module = data.find(m => m.code === moduleCode);
  if (!module) {
    console.error('Module not found');
    return;
  }

  module.grade = newGrade;
  module.gradePoint = gradePoints[newGrade] || 0;

  // Re-render the table
  renderSemesterTable(`sem${semester}`, data);
  console.log(`Updated ${moduleCode} to grade ${newGrade}`);
}

// Function to update SGPA
function updateSGPA(semester, newSGPA) {
  const semData = sgpaData.find(s => s.semester === semester);
  if (semData) {
    semData.sgpa = newSGPA;
    semData.status = newSGPA > 0 ? 'Completed' : 'Pending';
    renderSummaryTable();
    
    // Update CGPA
    const completedSemesters = sgpaData.filter(s => s.sgpa > 0);
    const totalSGPA = completedSemesters.reduce((sum, s) => sum + s.sgpa, 0);
    const cgpa = completedSemesters.length > 0 ? (totalSGPA / completedSemesters.length).toFixed(2) : '0.00';
    
    document.getElementById('overallCGPA').textContent = cgpa;
    document.getElementById('completedSemesters').textContent = `${completedSemesters.length}/8`;
    
    console.log(`Updated Semester ${semester} SGPA to ${newSGPA}`);
  }
}

// Expose admin functions globally for easy console access
window.adminPanel = {
  updateGrade,
  updateSGPA,
  viewData: () => console.log({ semesterData, sgpaData }),
  gradePoints
};

console.log('🎓 GPA Calculator loaded!');
console.log('Admin panel available at: window.adminPanel');
console.log('Example usage:');
console.log('  adminPanel.updateGrade(3, "ITC 2192", "A")');
console.log('  adminPanel.updateSGPA(3, 3.75)');
