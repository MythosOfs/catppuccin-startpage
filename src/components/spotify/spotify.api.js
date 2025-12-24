/**
 * Spotify API handler
 * Handles authentication and playback control using Spotify Web API
 * Uses Authorization Code Flow with PKCE (no client secret required)
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
   * Generate a random string for PKCE code verifier
   * @param {number} length - Length of the string
   * @returns {string} Random string
   */
  static generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  }

  /**
   * Generate SHA256 hash for PKCE code challenge
   * @param {string} plain - Plain text to hash
   * @returns {Promise<string>} Base64 URL encoded hash
   */
  static async sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  /**
   * Generate authorization URL for Spotify OAuth with PKCE
   * @returns {Promise<string>} Authorization URL
   */
  static async getAuthUrl() {
    const codeVerifier = this.generateRandomString(64);
    localStorage.setItem('spotify_code_verifier', codeVerifier);

    const codeChallenge = await this.sha256(codeVerifier);

    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      response_type: 'code',
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPES.join(' '),
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      show_dialog: false
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Extract authorization code from URL after OAuth redirect
   * @returns {string|null} Authorization code or null
   */
  static getAuthCodeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code
   * @returns {Promise<object>} Token response
   */
  static async exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');

    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.REDIRECT_URI,
      code_verifier: codeVerifier
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    localStorage.removeItem('spotify_code_verifier');
    return data;
  }

  /**
   * Extract access token from URL hash after OAuth redirect (legacy)
   * @returns {string|null} Access token or null
   * @deprecated Use getAuthCodeFromUrl and exchangeCodeForToken instead
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
