/**
 * RSS Feed API handler
 * Fetches and parses RSS feeds using rss2json service
 */
class RSSApi {
  /**
   * Fetches RSS feed and converts to JSON
   * @param {string} feedUrl - The URL of the RSS feed
   * @param {number} count - Number of items to fetch (default: 10)
   * @returns {Promise<Object>} Parsed feed data
   */
  static async fetchFeed(feedUrl, count = 10) {
    try {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=${count}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(`RSS API error: ${data.message || 'Unknown error'}`);
      }

      return {
        title: data.feed.title,
        description: data.feed.description,
        link: data.feed.link,
        items: data.items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: new Date(item.pubDate),
          description: this.stripHtml(item.description),
          thumbnail: item.thumbnail || item.enclosure?.link || null
        }))
      };
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return {
        title: 'Error loading feed',
        description: error.message,
        link: '#',
        items: []
      };
    }
  }

  /**
   * Strips HTML tags from a string
   * @param {string} html - HTML string to clean
   * @returns {string} Plain text
   */
  static stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Formats a date to relative time (e.g., "2 hours ago")
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
