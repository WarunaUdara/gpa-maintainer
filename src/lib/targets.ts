import { calculateGPA, getCreditsFromCode, overallStats, type Semester } from './gpa';

export const FIRST_CLASS_THRESHOLD = 3.7;
export const RECOMMENDED_GPA_TARGET = 3.8;

export function firstClassPlan(semesters: Semester[]) {
  const current = overallStats(semesters);
  const outstandingCredits = semesters.flatMap(semester => semester.modules)
    .filter(module => module.ngpa === 'No' && module.grade === '')
    .reduce((sum, module) => sum + getCreditsFromCode(module.code), 0);
  const lockedCredits = current.credits;
  const minimumExact = outstandingCredits
    ? (FIRST_CLASS_THRESHOLD * (lockedCredits + outstandingCredits) - current.weightedPoints) / outstandingCredits
    : current.gpa !== null && current.gpa > FIRST_CLASS_THRESHOLD ? 0 : Number.POSITIVE_INFINITY;
  // Round up: the required average must remain strictly above the first-class line.
  const minimumTarget = Number.isFinite(minimumExact)
    ? Math.ceil((minimumExact - 1e-10) * 100) / 100
    : null;
  const projectedAtTarget = outstandingCredits
    ? (current.weightedPoints + outstandingCredits * RECOMMENDED_GPA_TARGET) / (lockedCredits + outstandingCredits)
    : current.gpa;
  const pastSemesters = semesters.filter(semester => semester.id <= 4);
  const past = calculateGPA(pastSemesters.flatMap(semester => semester.modules));
  const totalListedModules = semesters.reduce((sum, semester) => sum + semester.modules.length, 0);
  const unlistedSemesters = semesters.filter(semester => semester.id >= 7 && semester.modules.length === 0).length;

  return {
    currentGpa: current.gpa,
    currentCredits: current.credits,
    weightedPoints: current.weightedPoints,
    currentMargin: current.gpa === null ? null : current.gpa - FIRST_CLASS_THRESHOLD,
    firstClassThreshold: FIRST_CLASS_THRESHOLD,
    recommendedTarget: RECOMMENDED_GPA_TARGET,
    outstandingCredits,
    minimumExact,
    minimumTarget,
    minimumReachable: minimumExact <= 4,
    projectedAtTarget,
    historicalGpa: past.gpa,
    historicalCredits: past.credits,
    requiredAGrades: outstandingCredits ? Math.ceil((RECOMMENDED_GPA_TARGET - 3.7) / 0.3 * outstandingCredits - 1e-10) : 0,
    listedModuleCount: totalListedModules,
    recordedResultCount: current.recorded,
    unlistedSemesters,
  };
}
