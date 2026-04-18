// Returns a new Date at 23:59:59.999 (local time) of the same calendar day as `date`.
export function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

// True once the current moment is past the end-of-day of `dueDate`.
// Submissions are allowed up to and including 23:59:59.999 of the due day.
export function isPastDueDate(dueDate) {
    return Date.now() > endOfDay(dueDate).getTime();
}

// An assignment is "closed" once its due day has fully elapsed.
export function isAssignmentClosed(assignment) {
    if (!assignment?.dueDate) return false;
    return isPastDueDate(assignment.dueDate);
}
