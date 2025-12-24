/**
 * RSS Feed Reader Component
 * Displays RSS feeds with dropdown selector
 */
class RSSReader extends Component {
  refs = {};

  constructor() {
    super();
    this.feeds = CONFIG.rssFeeds || [];
    this.currentFeedIndex = 0;
    this.feedData = null;
    this.maxItems = CONFIG.rssFeedMaxItems || 10;
  }

  /**
   * Component styles
   */
  style() {
    return `
      rss-reader {
        display: block;
        width: 350px;
        height: 100%;
        background: ${CONFIG.palette.mantle};
        border-left: 2px solid ${CONFIG.palette.surface0};
        overflow: hidden;
      }

      .rss-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 20px;
      }

      .rss-header {
        margin-bottom: 15px;
      }

      .rss-dropdown {
        width: 100%;
        padding: 10px;
        background: ${CONFIG.palette.base};
        color: ${CONFIG.palette.text};
        border: 1px solid ${CONFIG.palette.surface0};
        border-radius: 4px;
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        cursor: pointer;
        outline: none;
      }

      .rss-dropdown:hover {
        border-color: var(--accent);
      }

      .rss-feed-title {
        font-family: 'Raleway', sans-serif;
        font-size: 16px;
        font-weight: 600;
        color: ${CONFIG.palette.text};
        margin: 10px 0;
        opacity: 0.7;
      }

      .rss-items {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .rss-items::-webkit-scrollbar {
        width: 6px;
      }

      .rss-items::-webkit-scrollbar-track {
        background: ${CONFIG.palette.base};
      }

      .rss-items::-webkit-scrollbar-thumb {
        background: ${CONFIG.palette.surface0};
        border-radius: 3px;
      }

      .rss-items::-webkit-scrollbar-thumb:hover {
        background: ${CONFIG.palette.surface1};
      }

      .rss-item {
        background: ${CONFIG.palette.base};
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-left: 3px solid transparent;
      }

      .rss-item:hover {
        border-left-color: var(--accent);
        transform: translateX(3px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .rss-item-title {
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: ${CONFIG.palette.text};
        margin-bottom: 6px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .rss-item-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        color: ${CONFIG.palette.subtext0};
        opacity: 0.7;
      }

      .rss-item-date {
        font-family: 'Roboto', sans-serif;
      }

      .rss-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: ${CONFIG.palette.subtext0};
        font-family: 'Roboto', sans-serif;
      }

      .rss-error {
        color: ${CONFIG.palette.red};
        padding: 20px;
        text-align: center;
        font-family: 'Roboto', sans-serif;
        font-size: 13px;
      }

      .rss-empty {
        color: ${CONFIG.palette.subtext0};
        padding: 20px;
        text-align: center;
        font-family: 'Roboto', sans-serif;
        font-size: 13px;
      }
    `;
  }

  /**
   * Component template
   */
  template() {
    if (!this.feeds || this.feeds.length === 0) {
      return `
        <div class="rss-container">
          <div class="rss-empty">No RSS feeds configured</div>
        </div>
      `;
    }

    return `
      <div class="rss-container">
        <div class="rss-header">
          <select class="rss-dropdown" data-ref="feedSelector">
            ${this.feeds.map((feed, index) => `
              <option value="${index}" ${index === this.currentFeedIndex ? 'selected' : ''}>
                ${feed.name}
              </option>
            `).join('')}
          </select>
          <div class="rss-feed-title" data-ref="feedTitle">Loading...</div>
        </div>
        <div class="rss-items" data-ref="feedItems">
          <div class="rss-loading">Loading feed...</div>
        </div>
      </div>
    `;
  }

  /**
   * Renders feed items
   */
  renderFeedItems() {
    const container = this.refs.feedItems;
    if (!container || !this.feedData) return;

    if (this.feedData.items.length === 0) {
      container.innerHTML = '<div class="rss-empty">No items in this feed</div>';
      return;
    }

    container.innerHTML = this.feedData.items
      .slice(0, this.maxItems)
      .map(item => `
        <div class="rss-item" onclick="window.open('${item.link}', '_blank')">
          <div class="rss-item-title">${item.title}</div>
          <div class="rss-item-meta">
            <span class="rss-item-date">${RSSApi.formatDate(item.pubDate)}</span>
          </div>
        </div>
      `).join('');
  }

  /**
   * Loads current feed
   */
  async loadFeed() {
    if (!this.feeds || this.feeds.length === 0) return;

    const currentFeed = this.feeds[this.currentFeedIndex];
    if (!currentFeed) return;

    try {
      this.feedData = await RSSApi.fetchFeed(currentFeed.url, this.maxItems);

      if (this.refs.feedTitle) {
        this.refs.feedTitle.textContent = this.feedData.title;
      }

      this.renderFeedItems();
    } catch (error) {
      console.error('Error loading feed:', error);
      if (this.refs.feedItems) {
        this.refs.feedItems.innerHTML = `<div class="rss-error">Error loading feed: ${error.message}</div>`;
      }
    }
  }

  /**
   * Handles feed selector change
   */
  onFeedChange(event) {
    this.currentFeedIndex = parseInt(event.target.value);
    if (this.refs.feedItems) {
      this.refs.feedItems.innerHTML = '<div class="rss-loading">Loading feed...</div>';
    }
    this.loadFeed();
  }

  /**
   * Component connected callback
   */
  connectedCallback() {
    this.render().then(() => {
      if (this.refs.feedSelector) {
        this.refs.feedSelector.addEventListener('change', (e) => this.onFeedChange(e));
      }
      this.loadFeed();
    });
  }
}
