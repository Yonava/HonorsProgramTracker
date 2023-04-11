export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function sanitizeName(name: string) {
  const fullName = name.split(' ').map(name => name.trim().toLowerCase());

  const firstName = fullName[0];
  const lastName = fullName[fullName.length - 1];

  return [firstName, lastName];
}

export function getStudentEmail(name: string) {
  const [firstName, lastName] = sanitizeName(name);
  if (!(firstName && lastName)) return 'Invalid Name';
  return `${firstName}.${lastName}@snhu.edu`;
}

export function getFacultyEmail(name: string) {
  const [firstName, lastName] = sanitizeName(name);
  if (!(firstName && lastName)) return 'Invalid Name';
  return `${firstName[0]}.${lastName}@snhu.edu`;
}
