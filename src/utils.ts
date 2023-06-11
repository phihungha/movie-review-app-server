export function calcDateOfBirthFromAge(age: number): Date {
  const today = new Date();
  today.setFullYear(today.getFullYear() - age);
  return today;
}
