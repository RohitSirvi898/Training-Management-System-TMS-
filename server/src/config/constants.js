// ─── User Roles ──────────────────────────────────────────────
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TRAINER: 'trainer',
  COLLEGE_STAFF: 'college_staff',
};

// ─── Batch Statuses ──────────────────────────────────────────
const BATCH_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  UPCOMING: 'upcoming',
};

// ─── Attendance Statuses ─────────────────────────────────────
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

// ─── Exam Types ──────────────────────────────────────────────
const EXAM_TYPES = {
  MID_TEST: 'mid_test',
  FINAL_MOCK: 'final_mock',
};

// ─── Result Statuses ─────────────────────────────────────────
const RESULT_STATUS = {
  PASS: 'pass',
  FAIL: 'fail',
  PENDING: 'pending',
};

// ─── Certificate Statuses ────────────────────────────────────
const CERTIFICATE_STATUS = {
  ASSIGNED: 'assigned',
  NOT_ASSIGNED: 'not_assigned',
  REDEEMED: 'redeemed',
};

// ─── College Staff Permission Types ─────────────────────────
const STAFF_PERMISSIONS = {
  VIEW_STUDENTS: 'view_students',
  VIEW_ATTENDANCE: 'view_attendance',
  VIEW_RESULTS: 'view_results',
  VIEW_EXAMS: 'view_exams',
  VIEW_CERTIFICATES: 'view_certificates',
};

module.exports = {
  ROLES,
  BATCH_STATUS,
  ATTENDANCE_STATUS,
  EXAM_TYPES,
  RESULT_STATUS,
  CERTIFICATE_STATUS,
  STAFF_PERMISSIONS,
};
