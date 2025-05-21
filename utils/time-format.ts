export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }

  return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`;
}

export function formatLikes(likes: number): string {
  if (likes >= 1000000) {
    return (likes / 1000000).toFixed(1) + "M";
  }
  if (likes >= 1000) {
    return (likes / 1000).toFixed(1) + "K";
  }
  return likes.toString();
}

export const formatMessageTimestamp = (timestamp: string | Date): string => {
  if (!timestamp) return "";

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  if (isNaN(date.getTime())) {
    return ""; // Handle invalid dates
  }

  // Simple format: HH:MM
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;

  // TODO: Implement more sophisticated time formatting (e.g., "Today 10:30 AM", "Yesterday 5:00 PM", "MM/DD/YYYY")
};

// Optional: Add a formatTimeAgo function if needed elsewhere
/*
export const formatTimeAgo = (timestamp: string | Date): string => {
  if (!timestamp) return '';

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30.4);
  const years = Math.round(days / 365);

  if (seconds < 60) {
    return seconds <= 0 ? 'just now' : `${seconds}s ago`;
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else if (weeks < 4.3) { // Approximate weeks in a month
      return `${weeks}w ago`;
  } else if (months < 12) {
      return `${months}mo ago`;
  } else {
      return `${years}y ago`;
  }
};
*/
