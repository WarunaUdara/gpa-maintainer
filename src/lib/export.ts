import { getCreditsFromCode, gradePoints, isGpaModule, type Semester } from './gpa';

function csvCell(value: string | number) {
  const text = String(value);
  // Keep formula-like module titles and remarks as text when imported.
  return `"${(/^[=+\-@\t\r]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`;
}
export function transcriptCSV(semesters: Semester[]) {
  const rows: (string | number)[][] = [['Semester', 'Module code', 'Module title', 'Credits', 'Grade', 'Grade points', 'NGPA', 'Remarks']];
  semesters.forEach(semester => semester.modules.forEach(module => rows.push([semester.id, module.code, module.title, getCreditsFromCode(module.code), module.grade, isGpaModule(module) ? gradePoints[module.grade] : '', module.ngpa, module.remarks])));
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}
