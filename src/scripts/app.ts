import { transcript } from '../data/transcript';
import {
  applyOverrides, formatGPA, getCreditsFromCode, gradeOptions, gradePoints,
  isGpaModule, isRecordedGrade, overallStats, resultNote, semesterStats,
  type GradeOverride, type Semester,
} from '../lib/gpa';
import { chartData } from '../lib/chart';
import { transcriptCSV } from '../lib/export';
import { firstClassPlan } from '../lib/targets';

const STORAGE_KEY = 'gpa-maintainer:grade-overrides:v2';
let overrides: Record<string, GradeOverride> = {};
let storageAvailable = true;
try {
  const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    // Normalize rather than trust the saved object, retaining only valid edits.
    const checked = applyOverrides(transcript, stored);
    for (const semester of checked) {
      for (const module of semester.modules) {
        const original = transcript.find(item => item.id === semester.id)!.modules.find(item => item.code === module.code)!;
        if (module.grade !== original.grade) overrides[`${semester.id}:${module.code}`] = { original: original.grade, grade: module.grade };
      }
    }
  }
} catch { storageAvailable = false; }

let semesters = applyOverrides(transcript, overrides);
let selectedSemester = 5;
const dialog = document.querySelector<HTMLDialogElement>('#grade-dialog')!;
const form = document.querySelector<HTMLFormElement>('#grade-form')!;
let toastTimeout: ReturnType<typeof setTimeout>;

function setText(selector: string, value: string | number, root: ParentNode = document) {
  const element = root.querySelector(selector);
  if (element) element.textContent = String(value);
}
function notify(message: string) {
  const toast = document.querySelector<HTMLElement>('#toast')!;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { toast.hidden = true; }, 4500);
}
function cell(row: HTMLTableRowElement, text: string | number, className = '') {
  const td = row.insertCell();
  td.textContent = String(text);
  td.className = className;
  return td;
}
function renderRows(semester: Semester, tbody: HTMLTableSectionElement) {
  tbody.replaceChildren();
  if (!semester.modules.length) {
    const td = cell(tbody.insertRow(), 'No modules recorded yet. This semester is still ahead.', 'empty-state');
    td.colSpan = 6;
    return;
  }
  for (const module of semester.modules) {
    const row = tbody.insertRow();
    cell(row, module.code, 'module-code');
    const title = cell(row, module.title, 'module-title');
    if (module.ngpa === 'Yes') {
      const badge = document.createElement('span');
      badge.className = 'mini-badge';
      badge.textContent = 'NGPA';
      title.append(document.createTextNode(' '), badge);
    }
    const mobileCode = document.createElement('span');
    mobileCode.className = 'mobile-code';
    const credits = getCreditsFromCode(module.code);
    mobileCode.textContent = `${module.code} · ${credits} ${credits === 1 ? 'credit' : 'credits'}`;
    title.append(mobileCode);
    cell(row, getCreditsFromCode(module.code), 'numeric');
    const grade = document.createElement('span');
    grade.className = module.grade ? 'grade' : 'grade pending';
    grade.textContent = module.grade || 'Pending';
    row.insertCell().append(grade);
    cell(row, isGpaModule(module) ? gradePoints[module.grade].toFixed(2) : '—', 'numeric');
    cell(row, resultNote(module), 'result-note');
  }
}
function renderChart() {
  const chart = chartData(semesters);
  document.querySelector('#sgpa-line')!.setAttribute('points', chart.filter(point => point.sy !== null).map(point => `${point.x},${point.sy}`).join(' '));
  document.querySelector('#cgpa-line')!.setAttribute('points', chart.filter(point => point.cy !== null).map(point => `${point.x},${point.cy}`).join(' '));
  const dots = document.querySelector('#chart-dots')!;
  dots.replaceChildren();
  for (const point of chart) {
    if (point.sy === null) continue;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'chart-dot');
    circle.setAttribute('cx', String(point.x));
    circle.setAttribute('cy', String(point.sy));
    circle.setAttribute('r', '3.5');
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `Semester ${point.id}: ${formatGPA(point.sgpa)}`;
    circle.append(title);
    dots.append(circle);
  }
  setText('#chart-desc', `Recorded semester GPAs are ${chart.filter(point => point.sgpa !== null).map(point => `semester ${point.id}: ${formatGPA(point.sgpa)}`).join(', ')}. Unrecorded semesters are left blank.`);
}
function refreshFirstClassPlan() {
  const plan = firstClassPlan(semesters);
  setText('#target-current-cgpa', formatGPA(plan.currentGpa));
  setText('#target-current-margin', plan.currentMargin === null ? '—'
    : plan.currentMargin > 0 ? `${plan.currentMargin.toFixed(2)} above`
      : plan.currentMargin < 0 ? `${Math.abs(plan.currentMargin).toFixed(2)} below` : 'on');
  setText('#past-weighted-gpa', formatGPA(plan.historicalGpa));
  setText('#target-minimum-gpa', plan.minimumTarget?.toFixed(2) ?? '—');
  setText('#target-floor-rule', plan.minimumTarget === null ? '—' : `${plan.minimumTarget.toFixed(2)} or higher`);
  setText('#target-outstanding-credits', plan.outstandingCredits);
  setText('#target-a-credits', plan.requiredAGrades);
  setText('#target-minimum-caption', !plan.outstandingCredits ? 'No ungraded GPA credits are listed.'
    : plan.minimumReachable ? `Minimum weighted average on these ${plan.outstandingCredits} ungraded GPA credits to finish above 3.70.`
      : `These listed credits alone cannot restore a 3.70 CGPA. Semesters 7–8 need published module lists.`);
  setText('#target-projection-caption', plan.outstandingCredits
    ? `At a 3.80 average over those ${plan.outstandingCredits} listed credits, your projected CGPA is ${formatGPA(plan.projectedAtTarget)}. Later course credits are not yet listed.`
    : `Your current projected CGPA is ${formatGPA(plan.projectedAtTarget)}. Record your future course credits to set the next target.`);
}
function refresh() {
  const overall = overallStats(semesters);
  setText('#overall-gpa', formatGPA(overall.gpa));
  setText('#overall-credits', overall.credits);
  setText('#completed-count', overall.completed);
  setText('#recorded-count', overall.recorded);
  document.querySelector<HTMLElement>('#gpa-progress')!.style.width = `${(overall.gpa ?? 0) / 4 * 100}%`;
  setText('#overall-formula', overall.credits ? `${overall.weightedPoints.toFixed(2)} ÷ ${overall.credits} = ${formatGPA(overall.gpa)}` : 'No graded GPA credits');
  const listedModules = overall.recorded + overall.pending;
  setText('#overall-results-count', `${overall.recorded} / ${listedModules} results`);
  const overallResultsBar = document.querySelector<HTMLElement>('#overall-results-bar')!;
  overallResultsBar.style.width = `${listedModules ? overall.recorded / listedModules * 100 : 0}%`;
  const overallResultsProgress = overallResultsBar.parentElement!;
  overallResultsProgress.setAttribute('aria-valuemax', String(listedModules));
  overallResultsProgress.setAttribute('aria-valuenow', String(overall.recorded));
  overallResultsProgress.setAttribute('aria-valuetext', `${overall.recorded} of ${listedModules} listed modules have a result`);
  const summary = document.querySelector<HTMLTableSectionElement>('#summary-rows')!;
  summary.replaceChildren();
  for (const semester of semesters) {
    const stats = semesterStats(semester);
    const progressRow = document.querySelector<HTMLElement>(`[data-progress-semester="${semester.id}"]`)!;
    const bar = progressRow.querySelector<HTMLElement>('.progress-bar')!;
    const fill = progressRow.querySelector<HTMLElement>('.progress-fill');
    if (stats.total) {
      const pct = stats.recorded / stats.total * 100;
      if (fill) fill.style.width = `${pct}%`;
      else {
        const newFill = document.createElement('span');
        newFill.className = 'progress-fill';
        newFill.style.width = `${pct}%`;
        bar.replaceChildren(newFill);
        bar.classList.remove('progress-unlisted');
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-label', `Semester ${semester.id} results recorded`);
        bar.setAttribute('aria-valuemin', '0');
      }
      bar.setAttribute('aria-valuemax', String(stats.total));
      bar.setAttribute('aria-valuenow', String(stats.recorded));
      bar.setAttribute('aria-valuetext', `${stats.recorded} of ${stats.total} results recorded`);
      setText('.progress-count', `${stats.recorded} / ${stats.total}`, progressRow);
      setText('.progress-status', stats.recorded === stats.total ? 'Complete' : `${stats.total - stats.recorded} pending`, progressRow);
    } else {
      bar.classList.add('progress-unlisted');
      bar.removeAttribute('role');
      bar.removeAttribute('aria-label');
      bar.removeAttribute('aria-valuemin');
      bar.removeAttribute('aria-valuemax');
      bar.removeAttribute('aria-valuenow');
      bar.removeAttribute('aria-valuetext');
      bar.replaceChildren();
      setText('.progress-count', '—', progressRow);
      setText('.progress-status', 'Modules not listed', progressRow);
    }
    const panel = document.querySelector<HTMLElement>(`#semester-${semester.id}`)!;
    setText('[data-semester-gpa]', formatGPA(stats.gpa), panel);
    setText('[data-semester-progress]', `${stats.recorded} of ${stats.total} results recorded · ${stats.credits} graded GPA credits`, panel);
    setText('[data-semester-status]', stats.status, panel);
    setText('[data-semester-note]', stats.pending > 0 ? `${stats.pending} results pending. SGPA reflects recorded GPA results only.`
      : stats.total ? 'All results recorded. NGPA modules are excluded from calculations.' : 'Results will appear here when modules are added.', panel);
    setText('[data-semester-formula]', stats.credits ? `${stats.weightedPoints.toFixed(2)} ÷ ${stats.credits} = ${formatGPA(stats.gpa)}` : 'No graded GPA credits', panel);
    renderRows(semester, panel.querySelector<HTMLTableSectionElement>('[data-module-rows]')!);
    const nav = document.querySelector(`.semester-nav [data-view="semester-${semester.id}"]`)!;
    nav.querySelector('.tab-dot')!.classList.toggle('is-complete', stats.status === 'Completed');
    const row = summary.insertRow();
    const link = document.createElement('a');
    link.href = `#semester-${semester.id}`;
    link.dataset.view = `semester-${semester.id}`;
    link.textContent = `Semester ${String(semester.id).padStart(2, '0')}`;
    row.insertCell().append(link);
    cell(row, formatGPA(stats.gpa), 'mono');
    cell(row, stats.credits, 'mono');
    cell(row, `${stats.recorded} / ${stats.total}`);
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = stats.status;
    row.insertCell().append(pill);
  }
  renderChart();
  refreshFirstClassPlan();
  const savedCount = Object.keys(overrides).length;
  setText('#storage-note', !storageAvailable ? 'Browser storage unavailable · Changes last for this session. Export CSV to keep a copy.'
    : savedCount ? `${savedCount} local grade ${savedCount === 1 ? 'edit' : 'edits'} · Saved in this browser. Export CSV to keep a copy.`
    : 'Published transcript · Grade edits stay in this browser.');
}
function selectView(view: string, updateHash = true) {
  if (!/^(semester-[1-8]|summary)$/.test(view)) return;
  if (view.startsWith('semester-')) selectedSemester = Number(view.split('-')[1]);
  document.querySelectorAll('.transcript-panel').forEach(panel => panel.classList.toggle('active-panel', panel.id === view));
  document.querySelectorAll<HTMLAnchorElement>('.semester-nav [data-view]').forEach(link => {
    const active = link.dataset.view === view;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
  });
  document.querySelector('#edit-button')!.setAttribute('aria-label', `Update semester ${selectedSemester} grades`);
  const nav = document.querySelector<HTMLElement>('.semester-nav')!;
  const activeLink = nav.querySelector<HTMLElement>('.active')!;
  nav.scrollLeft = Math.max(0, activeLink.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + activeLink.clientWidth / 2);
  if (updateHash) history.replaceState(null, '', `#${view}`);
}
document.addEventListener('click', event => {
  const target = (event.target as Element).closest<HTMLAnchorElement>('a[data-view]');
  if (!target || event instanceof MouseEvent && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return;
  event.preventDefault();
  selectView(target.dataset.view!);
});
window.addEventListener('hashchange', () => selectView(location.hash.slice(1), false));
window.addEventListener('resize', () => selectView(document.querySelector('.active-panel')!.id, false));
document.querySelector('.semester-nav')!.addEventListener('keydown', event => {
  const key = event as KeyboardEvent;
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.semester-nav a')];
  const index = links.indexOf(document.activeElement as HTMLAnchorElement);
  if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key.key)) return;
  key.preventDefault();
  const next = key.key === 'Home' ? 0 : key.key === 'End' ? links.length - 1 : (index + (key.key === 'ArrowRight' ? 1 : -1) + links.length) % links.length;
  links[next].focus();
  selectView(links[next].dataset.view!);
});

function openEditor() {
  const semester = semesters.find(item => item.id === selectedSemester)!;
  setText('#dialog-title', `Update semester ${String(selectedSemester).padStart(2, '0')}`);
  const fields = document.querySelector('#grade-fields')!;
  fields.replaceChildren();
  document.querySelector<HTMLElement>('#save-notice')!.hidden = true;
  if (!semester.modules.length) {
    const message = document.createElement('p');
    message.className = 'notice';
    message.textContent = 'No modules are available for this semester yet. Add them to the published transcript when your module list is available.';
    fields.append(message);
  }
  for (const module of semester.modules) {
    const field = document.createElement('div');
    field.className = 'grade-field';
    const label = document.createElement('label');
    label.htmlFor = `grade-${module.code}`;
    label.textContent = module.title;
    const meta = document.createElement('span');
    const credits = getCreditsFromCode(module.code);
    meta.textContent = `${module.code} · ${credits} ${credits === 1 ? 'credit' : 'credits'}${module.ngpa === 'Yes' ? ' · NGPA' : ''}`;
    label.append(meta);
    const select = document.createElement('select');
    select.id = label.htmlFor;
    select.name = module.code;
    select.append(new Option('Pending', ''));
    gradeOptions.forEach(grade => select.append(new Option(grade, grade)));
    select.value = module.grade;
    field.append(label, select);
    fields.append(field);
  }
  dialog.showModal();
}
document.querySelector('#edit-button')!.addEventListener('click', openEditor);
for (const id of ['#close-dialog', '#cancel-dialog']) document.querySelector(id)!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
document.querySelector('#reset-grades')!.addEventListener('click', () => {
  const original = transcript.find(item => item.id === selectedSemester)!;
  original.modules.forEach(module => { form.querySelector<HTMLSelectElement>(`select[name="${module.code}"]`)!.value = module.grade; });
  const notice = document.querySelector<HTMLElement>('#save-notice')!;
  notice.textContent = 'Published grades restored in this form. Save grades to apply the reset.';
  notice.hidden = false;
});
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)); storageAvailable = true; }
  catch { storageAvailable = false; }
}
function updateGrade(semesterId: number, code: string, grade: string) {
  if (grade !== '' && !isRecordedGrade(grade)) throw new Error(`Unknown grade: ${grade}`);
  const module = semesters.find(item => item.id === semesterId)?.modules.find(item => item.code === code);
  const original = transcript.find(item => item.id === semesterId)?.modules.find(item => item.code === code);
  if (!module || !original) throw new Error('Module not found');
  module.grade = grade;
  const key = `${semesterId}:${code}`;
  if (grade === original.grade) delete overrides[key]; else overrides[key] = { original: original.grade, grade };
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const values = new FormData(form);
  const semester = semesters.find(item => item.id === selectedSemester)!;
  semester.modules.forEach(module => updateGrade(selectedSemester, module.code, String(values.get(module.code) ?? '')));
  persist();
  refresh();
  dialog.close();
  notify(storageAvailable ? 'Grades saved. Your GPA is up to date.' : 'GPA updated for this session. Browser storage is unavailable; export CSV to keep your results.');
});

document.querySelector('#export-button')!.addEventListener('click', () => {
  const blob = new Blob([transcriptCSV(semesters)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gpa-transcript.csv';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('Transcript exported as CSV.');
});

// Keep the original console workflow available alongside the grade editor.
const adminPanel = {
  updateGrade(semester: number, code: string, grade: string) { updateGrade(semester, code, grade); persist(); refresh(); },
  calculateSGPA: (semester: number) => { const item = semesters.find(value => value.id === semester); return item ? formatGPA(semesterStats(item).gpa) : 'N/A'; },
  calculateCGPA: () => formatGPA(overallStats(semesters).gpa),
  viewSemesterDetails: (semester: number) => console.table(semesters.find(item => item.id === semester)?.modules ?? []),
  viewData: () => console.log({ semesterData: semesters, gradePoints }),
  gradePoints,
  refresh,
  help: () => console.info('Use adminPanel.updateGrade(5, "IIS3353", "A-") to update a grade. Edits are saved locally; use Export CSV to keep a copy. Published modules live in src/data/transcript.ts.'),
};
declare global { interface Window { adminPanel: typeof adminPanel } }
window.adminPanel = adminPanel;
document.body.classList.add('js-enabled');
selectView(/^(semester-[1-8]|summary)$/.test(location.hash.slice(1)) ? location.hash.slice(1) : 'semester-5', false);
refresh();
