//Placeholder , utils will be ready soon
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// Example formatters:
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

export function formatPoints(points: number) {
  return `${points} pts`;
}
