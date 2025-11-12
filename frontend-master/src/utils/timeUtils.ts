/**
 * Formats a date into a human-readable relative time string
 * e.g. "1 hour ago", "2 days ago", "just now", etc.
 */
export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSecs < 60) {
    return diffInSecs <= 5 ? "Just now" : `${diffInSecs} seconds ago`;
  } else if (diffInMins < 60) {
    return diffInMins === 1 ? "1 minute ago" : `${diffInMins} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
  } else {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  }
} 
