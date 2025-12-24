/**
 * Spotify Player Component
 * Displays currently playing track with playback controls
 */
class SpotifyPlayer extends Component {
  refs = {
    loginButton: '[data-ref="loginButton"]',
    playerContainer: '[data-ref="playerContainer"]',
    albumArt: '[data-ref="albumArt"]',
    trackName: '[data-ref="trackName"]',
    trackArtist: '[data-ref="trackArtist"]',
    playPauseButton: '[data-ref="playPauseButton"]',
    previousButton: '[data-ref="previousButton"]',
    nextButton: '[data-ref="nextButton"]',
    progressBar: '[data-ref="progressBar"]',
    progressFill: '[data-ref="progressFill"]',
    currentTime: '[data-ref="currentTime"]',
    totalTime: '[data-ref="totalTime"]'
  };

  constructor() {
    super();
    this.isAuthenticated = false;
    this.currentTrack = null;
    this.updateInterval = null;
  }

  /**
   * Component styles
   */
  style() {
    return `
      .spotify-container {
        display: flex;
        flex-direction: column;
        width: 350px;
        height: 100%;
        background: ${CONFIG.palette.mantle};
        border-radius: 8px 0 0 8px;
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
        padding: 20px;
        overflow: hidden;
        overscroll-behavior: contain;
      }

      .spotify-header {
        font-family: 'Raleway', sans-serif;
        font-size: 16px;
        font-weight: 600;
        color: ${CONFIG.palette.text};
        margin-bottom: 20px;
        opacity: 0.7;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .spotify-logo {
        width: 24px;
        height: 24px;
        fill: ${CONFIG.palette.green};
      }

      .spotify-login {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 15px;
      }

      .login-button {
        background: ${CONFIG.palette.green};
        color: ${CONFIG.palette.base};
        border: none;
        border-radius: 20px;
        padding: 12px 24px;
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .login-button:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .login-text {
        font-family: 'Roboto', sans-serif;
        font-size: 13px;
        color: ${CONFIG.palette.subtext0};
        text-align: center;
      }

      .player-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
        height: 100%;
      }

      .album-art {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 8px;
        object-fit: cover;
        background: ${CONFIG.palette.surface0};
      }

      .track-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .track-name {
        font-family: 'Roboto', sans-serif;
        font-size: 16px;
        font-weight: 600;
        color: ${CONFIG.palette.text};
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .track-artist {
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        color: ${CONFIG.palette.subtext0};
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .progress-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .progress-bar {
        width: 100%;
        height: 4px;
        background: ${CONFIG.palette.surface0};
        border-radius: 2px;
        cursor: pointer;
        position: relative;
      }

      .progress-fill {
        height: 100%;
        background: ${CONFIG.palette.green};
        border-radius: 2px;
        transition: width 0.1s linear;
      }

      .progress-times {
        display: flex;
        justify-content: space-between;
        font-family: 'Roboto', sans-serif;
        font-size: 11px;
        color: ${CONFIG.palette.subtext0};
      }

      .controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
      }

      .control-button {
        background: transparent;
        border: none;
        color: ${CONFIG.palette.text};
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .control-button:hover {
        background: ${CONFIG.palette.surface0};
        color: ${CONFIG.palette.green};
      }

      .control-button.play-pause {
        background: ${CONFIG.palette.green};
        color: ${CONFIG.palette.base};
        width: 48px;
        height: 48px;
      }

      .control-button.play-pause:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .control-icon {
        width: 24px;
        height: 24px;
      }

      .control-icon.small {
        width: 20px;
        height: 20px;
      }

      .no-track {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: ${CONFIG.palette.subtext0};
        font-family: 'Roboto', sans-serif;
        font-size: 13px;
        text-align: center;
      }
    `;
  }

  /**
   * Component template
   */
  template() {
    if (!this.isAuthenticated) {
      return `
        <div class="spotify-container">
          <div class="spotify-header">
            <svg class="spotify-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotify
          </div>
          <div class="spotify-login">
            <div class="login-text">Connect your Spotify account<br>to control playback</div>
            <button class="login-button" data-ref="loginButton">
              Connect Spotify
            </button>
          </div>
        </div>
      `;
    }

    if (!this.currentTrack) {
      return `
        <div class="spotify-container">
          <div class="spotify-header">
            <svg class="spotify-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotify
          </div>
          <div class="no-track">
            No track playing<br>
            Start playing on Spotify
          </div>
        </div>
      `;
    }

    return `
      <div class="spotify-container" data-ref="playerContainer">
        <div class="spotify-header">
          <svg class="spotify-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Now Playing
        </div>
        <div class="player-content">
          <img class="album-art" data-ref="albumArt" src="${this.currentTrack.track.albumArt || ''}" alt="Album Art">

          <div class="track-info">
            <div class="track-name" data-ref="trackName">${this.currentTrack.track.name}</div>
            <div class="track-artist" data-ref="trackArtist">${this.currentTrack.track.artists}</div>
          </div>

          <div class="progress-container">
            <div class="progress-bar" data-ref="progressBar">
              <div class="progress-fill" data-ref="progressFill" style="width: ${(this.currentTrack.track.progress / this.currentTrack.track.duration) * 100}%"></div>
            </div>
            <div class="progress-times">
              <span data-ref="currentTime">${this.formatTime(this.currentTrack.track.progress)}</span>
              <span data-ref="totalTime">${this.formatTime(this.currentTrack.track.duration)}</span>
            </div>
          </div>

          <div class="controls">
            <button class="control-button" data-ref="previousButton">
              <i class="ti ti-player-skip-back control-icon small"></i>
            </button>
            <button class="control-button play-pause" data-ref="playPauseButton">
              <i class="ti ${this.currentTrack.isPlaying ? 'ti-player-pause' : 'ti-player-play'} control-icon"></i>
            </button>
            <button class="control-button" data-ref="nextButton">
              <i class="ti ti-player-skip-forward control-icon small"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Format milliseconds to MM:SS
   */
  formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Handle login button click
   */
  handleLogin() {
    const authUrl = SpotifyApi.getAuthUrl();
    window.location.href = authUrl;
  }

  /**
   * Handle play/pause button click
   */
  async handlePlayPause() {
    try {
      if (this.currentTrack.isPlaying) {
        await SpotifyApi.pause();
      } else {
        await SpotifyApi.play();
      }
      await this.updateCurrentTrack();
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }

  /**
   * Handle previous button click
   */
  async handlePrevious() {
    try {
      await SpotifyApi.previous();
      setTimeout(() => this.updateCurrentTrack(), 500);
    } catch (error) {
      console.error('Error going to previous track:', error);
    }
  }

  /**
   * Handle next button click
   */
  async handleNext() {
    try {
      await SpotifyApi.next();
      setTimeout(() => this.updateCurrentTrack(), 500);
    } catch (error) {
      console.error('Error going to next track:', error);
    }
  }

  /**
   * Update current track information
   */
  async updateCurrentTrack() {
    const track = await SpotifyApi.getCurrentlyPlaying();
    this.currentTrack = track;
    await this.render();
  }

  /**
   * Start update interval
   */
  startUpdateInterval() {
    this.updateInterval = setInterval(() => {
      this.updateCurrentTrack();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Stop update interval
   */
  stopUpdateInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Component connected callback
   */
  async connectedCallback() {
    // Initialize Spotify API
    if (typeof CONFIG !== 'undefined' && CONFIG.spotifyClientId && CONFIG.spotifyClientId !== 'YOUR_CLIENT_ID_HERE') {
      SpotifyApi.init(CONFIG.spotifyClientId);

      // Check for access token in URL (after OAuth redirect)
      const token = SpotifyApi.getAccessTokenFromUrl();
      if (token) {
        SpotifyApi.saveToken(token);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Check authentication status
      this.isAuthenticated = SpotifyApi.isAuthenticated();
    } else {
      console.warn('Spotify Client ID not configured. Please set it in userconfig.js');
      this.isAuthenticated = false;
    }

    await this.render();

    // Add event listeners
    if (!this.isAuthenticated) {
      const loginButton = this.shadow.querySelector('[data-ref="loginButton"]');
      if (loginButton) {
        loginButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleLogin();
        });
      }
    }

    if (this.isAuthenticated) {
      await this.updateCurrentTrack();

      if (this.refs.playPauseButton) {
        this.refs.playPauseButton.addEventListener('click', () => this.handlePlayPause());
      }
      if (this.refs.previousButton) {
        this.refs.previousButton.addEventListener('click', () => this.handlePrevious());
      }
      if (this.refs.nextButton) {
        this.refs.nextButton.addEventListener('click', () => this.handleNext());
      }

      // Start update interval
      this.startUpdateInterval();
    }
  }

  /**
   * Component disconnected callback
   */
  disconnectedCallback() {
    this.stopUpdateInterval();
  }
}
