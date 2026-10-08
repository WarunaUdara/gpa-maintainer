import assert from 'node:assert/strict';
import test from 'node:test';
import { transcript } from '../src/data/transcript';
import { applyOverrides, calculateGPA, formatGPA, getCreditsFromCode, isGpaModule, overallStats, semesterStats, type Module } from '../src/lib/gpa';
import { transcriptCSV } from '../src/lib/export';

const module = (grade: string, code = 'TEST0033', ngpa: 'Yes' | 'No' = 'No'): Module => ({ sno: 1, code, title: 'Test module', grade, ngpa, remarks: '' });

test('semester 5 matches all five supplied results, while unpublished results stay pending', () => {
  const semester = transcript[4];
  assert.deepEqual(Object.fromEntries(semester.modules.filter(item => item.grade).map(item => [item.code, item.grade])), {
    IIC3303: 'B', IIC3322: 'A-', IIS3353: 'A-', IIN3372: 'A-', IIN3382: 'A',
  });
  const stats = semesterStats(semester);
  assert.equal(stats.credits, 12);
  assert.ok(Math.abs(stats.weightedPoints - 42.9) < 1e-10);
  assert.equal(formatGPA(stats.gpa), '3.58');
  assert.equal(stats.recorded, 5);
  assert.equal(stats.pending, 4);
  assert.equal(stats.status, 'In progress');
});

test('CGPA weights all recorded module credits without rounding semester values first', () => {
  const overall = overallStats(transcript);
  assert.equal(overall.credits, 72);
  assert.ok(Math.abs(overall.weightedPoints - 267.9) < 1e-10);
  assert.equal(formatGPA(overall.gpa), '3.72');
  assert.equal(overall.completed, 3);
  assert.equal(overall.recorded, 32);
  assert.equal(semesterStats(transcript[3]).status, 'In progress');
});

test('failure grades count as zero points with credits; pending, NGPA, and special grades are excluded', () => {
  const result = calculateGPA([module('A'), module('F', 'TEST0022'), module('E', 'TEST0011'), module(''), module('W'), module('toString'), module('A', 'TEST0044', 'Yes')]);
  assert.equal(result.credits, 6);
  assert.equal(result.weightedPoints, 12);
  assert.equal(result.gpa, 2);
  assert.equal(isGpaModule(module('toString')), false);
  assert.equal(formatGPA(calculateGPA([module('F')]).gpa), '0.00');
  assert.equal(formatGPA(calculateGPA([]).gpa), '—');
});

test('semester completion requires every listed result, including NGPA modules', () => {
  assert.equal(semesterStats({ id: 1, modules: [module('A'), module('', 'TEST0011', 'Yes')] }).status, 'In progress');
  assert.equal(semesterStats({ id: 1, modules: [module('F'), module('A', 'TEST0011', 'Yes')] }).status, 'Completed');
  assert.equal(semesterStats({ id: 1, modules: [module('')] }).status, 'Pending');
  assert.equal(semesterStats({ id: 1, modules: [] }).status, 'Pending');
});

test('local edits do not mutate the source, accept zero grades, and reject stale or corrupt storage', () => {
  const edits = { '5:IIS3353': { original: 'A-', grade: 'F' }, '5:IIC3303': { original: '', grade: 'A' }, '5:IIC3322': { original: 'A-', grade: 'toString' } };
  const local = applyOverrides(transcript, edits);
  assert.equal(local[4].modules.find(item => item.code === 'IIS3353')!.grade, 'F');
  assert.equal(transcript[4].modules.find(item => item.code === 'IIS3353')!.grade, 'A-');
  assert.equal(local[4].modules.find(item => item.code === 'IIC3303')!.grade, 'B');
  assert.equal(local[4].modules.find(item => item.code === 'IIC3322')!.grade, 'A-');
  for (const corrupt of [null, 'invalid', [], { '5:IIS3353': null }]) assert.deepEqual(applyOverrides(transcript, corrupt), transcript);
  assert.equal(getCreditsFromCode('IIN3372 '), 2);
  assert.equal(getCreditsFromCode('invalid'), 0);
});

test('CSV contains all module results, quotes text, and retains zero-point failures', () => {
  const csv = transcriptCSV(transcript);
  assert.equal(csv.split('\r\n').length, 45);
  assert.ok(csv.includes('"5","IIS3353","Advanced Database Systems","3","A-","3.7","No",""'));
  assert.ok(csv.includes('"5","IIC3331","Professional Ethics","1","","","Yes","NGPA Module"'));
  const failure = { ...module('F'), title: 'A "quoted", title', remarks: '=1+1' };
  const exported = transcriptCSV([{ id: 1, modules: [failure] }]);
  assert.ok(exported.includes('"A ""quoted"", title"'));
  assert.ok(exported.includes('"F","0"'));
  assert.ok(exported.includes('"\'=1+1"'));
});
