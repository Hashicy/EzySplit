export function timeAgo(date) {
  const d = new Date(date);
  const secs = Math.floor((Date.now() - d.getTime())/1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs/60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins/60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours/24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default { timeAgo };
