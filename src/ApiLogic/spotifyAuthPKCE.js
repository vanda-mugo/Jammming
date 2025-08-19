// Modern Spotify Authentication using Authorization Code with PKCE
// This is the recommended and secure authentication method for web applications

const clientId = import.meta.env.VITE_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

const scopes = [
    'playlist-modify-public',
    'playlist-modify-private', 
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
    'user-library-modify',
    'user-read-private',
    'user-read-email',
    'streaming', // For Web Playback SDK if needed later
];

// PKCE Helper Functions
const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};

class SpotifyAuthPKCE {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
        this.restoreFromStorage();
    }

    // Generate PKCE code challenge
    async generateCodeChallenge() {
        const codeVerifier = generateRandomString(64);
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);
        
        // Store code verifier for later use
        localStorage.setItem('spotify_code_verifier', codeVerifier);
        
        return { codeVerifier, codeChallenge };
    }

    // Redirect to Spotify authorization
    async authorize() {
        const { codeChallenge } = await this.generateCodeChallenge();
        const state = generateRandomString(16);
        
        localStorage.setItem('spotify_auth_state', state);
        
        const authUrl = new URL("https://accounts.spotify.com/authorize");
        const params = {
            response_type: 'code',
            client_id: clientId,
            scope: scopes.join(' '),
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            redirect_uri: redirectUri,
            state: state,
        };
        
        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    }

    // Handle the callback and exchange code for tokens
    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            console.error('Authorization error:', error);
            throw new Error(`Authorization failed: ${error}`);
        }

        if (!code) {
            return false; // No code in URL, not a callback
        }

        // Verify state parameter
        const storedState = localStorage.getItem('spotify_auth_state');
        if (state !== storedState) {
            throw new Error('State parameter mismatch - potential security issue');
        }

        // Exchange code for tokens
        const codeVerifier = localStorage.getItem('spotify_code_verifier');
        if (!codeVerifier) {
            throw new Error('Code verifier not found');
        }

        const tokens = await this.exchangeCodeForTokens(code, codeVerifier);
        
        // Clean up stored values
        localStorage.removeItem('spotify_code_verifier');
        localStorage.removeItem('spotify_auth_state');
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return tokens;
    }

    // Exchange authorization code for access and refresh tokens
    async exchangeCodeForTokens(code, codeVerifier) {
        const url = "https://accounts.spotify.com/api/token";
        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier,
            }),
        };

        try {
            const response = await fetch(url, payload);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
            }
            
            const data = await response.json();
            
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.expiresAt = Date.now() + (data.expires_in * 1000);
            
            this.saveToStorage();
            
            return {
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
                expiresIn: data.expires_in
            };
        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            throw error;
        }
    }

    // Refresh the access token using refresh token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        const url = "https://accounts.spotify.com/api/token";
        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken,
                client_id: clientId,
            }),
        };

        try {
            const response = await fetch(url, payload);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
            }
            
            const data = await response.json();
            
            this.accessToken = data.access_token;
            if (data.refresh_token) {
                this.refreshToken = data.refresh_token;
            }
            this.expiresAt = Date.now() + (data.expires_in * 1000);
            
            this.saveToStorage();
            
            return this.accessToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.clearStorage();
            throw error;
        }
    }

    // Get valid access token, refreshing if necessary
    async getAccessToken() {
        // If no token, return null
        if (!this.accessToken) {
            return null;
        }

        // If token is still valid (with 5 minute buffer), return it
        if (this.expiresAt && Date.now() < (this.expiresAt - 300000)) {
            return this.accessToken;
        }

        // Try to refresh token
        if (this.refreshToken) {
            try {
                return await this.refreshAccessToken();
            } catch (error) {
                console.error('Failed to refresh token:', error);
                return null;
            }
        }

        return null;
    }

    // Check if user is authenticated
    async isAuthenticated() {
        const token = await this.getAccessToken();
        return !!token;
    }

    // Logout user
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
        this.clearStorage();
    }

    // Save tokens to localStorage
    saveToStorage() {
        const data = {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expiresAt: this.expiresAt,
        };
        localStorage.setItem('spotify_auth_data', JSON.stringify(data));
    }

    // Restore tokens from localStorage
    restoreFromStorage() {
        const data = localStorage.getItem('spotify_auth_data');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.accessToken = parsed.accessToken;
                this.refreshToken = parsed.refreshToken;
                this.expiresAt = parsed.expiresAt;
            } catch (error) {
                console.error('Error parsing stored auth data:', error);
                this.clearStorage();
            }
        }
    }

    // Clear stored data
    clearStorage() {
        localStorage.removeItem('spotify_auth_data');
        localStorage.removeItem('spotify_code_verifier');
        localStorage.removeItem('spotify_auth_state');
    }

    // Get user profile
    async getUserProfile() {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }

        return response.json();
    }
}

// Create singleton instance
export const spotifyAuthPKCE = new SpotifyAuthPKCE();
