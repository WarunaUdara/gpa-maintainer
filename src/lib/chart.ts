import { calculateGPA, semesterStats, type Semester } from './gpa';

export function chartData(semesters: Semester[]) {
  return semesters.map((semester, index) => {
    const sgpa = semesterStats(semester).gpa;
    const cgpa = calculateGPA(semesters.slice(0, index + 1).flatMap(item => item.modules)).gpa;
    const x = 30 + index * 54;
    const y = (value: number) => 26 + (4 - value) * 37.5;
    return { id: semester.id, x, sgpa, cgpa: sgpa === null ? null : cgpa,
      sy: sgpa === null ? null : y(sgpa), cy: sgpa === null || cgpa === null ? null : y(cgpa) };
  });
}
