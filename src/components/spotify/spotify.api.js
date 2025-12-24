/**
 * Spotify API handler
 * Handles authentication and playback control using Spotify Web API
 */
class SpotifyApi {
  static CLIENT_ID = null;
  static REDIRECT_URI = window.location.origin + window.location.pathname;
  static SCOPES = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state'
  ];

  /**
   * Initialize Spotify API with client ID from config
   */
  static init(clientId) {
    this.CLIENT_ID = clientId;
  }

  /**
   * Generate authorization URL for Spotify OAuth
   * @returns {string} Authorization URL
   */
  static getAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      response_type: 'token',
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPES.join(' '),
      show_dialog: false
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Extract access token from URL hash after OAuth redirect
   * @returns {string|null} Access token or null
   */
  static getAccessTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  static isAuthenticated() {
    const token = localStorage.getItem('spotify_access_token');
    const expiry = localStorage.getItem('spotify_token_expiry');

    if (!token || !expiry) return false;

    // Check if token is expired
    return Date.now() < parseInt(expiry);
  }

  /**
   * Save access token to localStorage
   * @param {string} token - Access token
   * @param {number} expiresIn - Expiry time in seconds (default: 3600)
   */
  static saveToken(token, expiresIn = 3600) {
    localStorage.setItem('spotify_access_token', token);
    localStorage.setItem('spotify_token_expiry', Date.now() + (expiresIn * 1000));
  }

  /**
   * Get stored access token
   * @returns {string|null} Access token or null
   */
  static getToken() {
    if (!this.isAuthenticated()) return null;
    return localStorage.getItem('spotify_access_token');
  }

  /**
   * Clear authentication
   */
  static logout() {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
  }

  /**
   * Make authenticated request to Spotify API
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {object} body - Request body
   * @returns {Promise<object>} Response data
   */
  static async request(endpoint, method = 'GET', body = null) {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, options);

    if (response.status === 204) return null; // No content
    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Token expired');
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get currently playing track
   * @returns {Promise<object|null>} Current track data or null
   */
  static async getCurrentlyPlaying() {
    try {
      const data = await this.request('/me/player/currently-playing');
      if (!data || !data.item) return null;

      return {
        isPlaying: data.is_playing,
        track: {
          name: data.item.name,
          artists: data.item.artists.map(a => a.name).join(', '),
          album: data.item.album.name,
          albumArt: data.item.album.images[0]?.url || null,
          duration: data.item.duration_ms,
          progress: data.progress_ms,
          uri: data.item.uri
        }
      };
    } catch (error) {
      console.error('Error fetching current track:', error);
      return null;
    }
  }

  /**
   * Play/Resume playback
   * @returns {Promise<void>}
   */
  static async play() {
    try {
      await this.request('/me/player/play', 'PUT');
    } catch (error) {
      console.error('Error playing:', error);
      throw error;
    }
  }

  /**
   * Pause playback
   * @returns {Promise<void>}
   */
  static async pause() {
    try {
      await this.request('/me/player/pause', 'PUT');
    } catch (error) {
      console.error('Error pausing:', error);
      throw error;
    }
  }

  /**
   * Skip to next track
   * @returns {Promise<void>}
   */
  static async next() {
    try {
      await this.request('/me/player/next', 'POST');
    } catch (error) {
      console.error('Error skipping to next:', error);
      throw error;
    }
  }

  /**
   * Skip to previous track
   * @returns {Promise<void>}
   */
  static async previous() {
    try {
      await this.request('/me/player/previous', 'POST');
    } catch (error) {
      console.error('Error skipping to previous:', error);
      throw error;
    }
  }
}
