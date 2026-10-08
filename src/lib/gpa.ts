export const gradePoints: Record<string, number> = {
  'A+': 4, A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7,
  'C+': 2.3, C: 2, 'C-': 1.7, 'D+': 1.3, D: 1, E: 0, F: 0,
};
export const nonGpaGrades = ['CA-AB', 'ESA-AB', 'N', 'CA-N', 'ESA-N', 'W'];
export const gradeOptions = [...Object.keys(gradePoints), ...nonGpaGrades];

export interface Module {
  sno: number;
  code: string;
  title: string;
  grade: string;
  ngpa: 'Yes' | 'No';
  remarks: string;
}
export interface Semester { id: number; modules: Module[]; label?: string }

export function getCreditsFromCode(code: string): number {
  const finalDigit = code.trim().slice(-1);
  return /^\d$/.test(finalDigit) ? Number(finalDigit) : 0;
}
export function isKnownGrade(grade: string): boolean {
  return Object.hasOwn(gradePoints, grade);
}
export function isRecordedGrade(grade: string): boolean {
  return isKnownGrade(grade) || nonGpaGrades.includes(grade);
}
export function isGpaModule(module: Module): boolean {
  return module.ngpa === 'No' && isKnownGrade(module.grade);
}
export function calculateGPA(modules: Module[]) {
  let credits = 0;
  let weightedPoints = 0;
  for (const module of modules) {
    if (isGpaModule(module)) {
      const moduleCredits = getCreditsFromCode(module.code);
      credits += moduleCredits;
      weightedPoints += moduleCredits * gradePoints[module.grade];
    }
  }
  return { credits, weightedPoints, gpa: credits ? weightedPoints / credits : null };
}
export function semesterStats(semester: Semester) {
  const recorded = semester.modules.filter(module => isRecordedGrade(module.grade)).length;
  const status = !semester.modules.length || !recorded ? 'Pending'
    : recorded === semester.modules.length ? 'Completed' : 'In progress';
  return {
    ...calculateGPA(semester.modules),
    recorded,
    pending: semester.modules.length - recorded,
    total: semester.modules.length,
    availableCredits: semester.modules.filter(module => module.ngpa === 'No')
      .reduce((sum, module) => sum + getCreditsFromCode(module.code), 0),
    status,
  };
}
export function resultStatusLabel(
  stats: Pick<ReturnType<typeof semesterStats>, 'recorded' | 'pending' | 'total'>,
  semesterLabel?: string,
): string {
  if (!stats.total) return semesterLabel ? `${semesterLabel} next` : 'Modules not listed';
  if (!stats.recorded) return 'Awaiting results';
  if (!stats.pending) return 'All results recorded';
  return `${stats.pending} ${stats.pending === 1 ? 'result' : 'results'} pending`;
}
export function overallStats(semesters: Semester[]) {
  const modules = semesters.flatMap(semester => semester.modules);
  return {
    ...calculateGPA(modules),
    completed: semesters.filter(semester => semesterStats(semester).status === 'Completed').length,
    recorded: modules.filter(module => isRecordedGrade(module.grade)).length,
    pending: modules.filter(module => !isRecordedGrade(module.grade)).length,
  };
}
export function formatGPA(gpa: number | null): string {
  return gpa === null ? '—' : (Math.round((gpa + Number.EPSILON) * 100) / 100).toFixed(2);
}
export function resultNote(module: Module): string {
  if (!module.grade) return module.remarks && module.remarks !== 'NGPA Module' ? `Estimate: ${module.remarks}` : 'Awaiting result';
  return module.ngpa === 'Yes' || !isKnownGrade(module.grade) ? 'Excluded from GPA' : 'Recorded';
}

// Ignore malformed, outdated, or unrecognized local overrides. New published
// grades take precedence when an override was based on an older result.
export interface GradeOverride { original: string; grade: string }
export function applyOverrides(semesters: Semester[], value: unknown): Semester[] {
  const copy = structuredClone(semesters);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return copy;
  const entries = value as Record<string, unknown>;
  for (const semester of copy) {
    for (const module of semester.modules) {
      const override = entries[`${semester.id}:${module.code}`];
      if (!override || typeof override !== 'object') continue;
      const { original, grade } = override as Partial<GradeOverride>;
      if (original === module.grade && typeof grade === 'string' && (grade === '' || isRecordedGrade(grade))) {
        module.grade = grade;
      }
    }
  }
  return copy;
}
