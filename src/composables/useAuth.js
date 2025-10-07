import axios from "axios";
import { useSessionStore} from "@/composables/useSessionStore.js";
import { useApi } from "@/composables/useApi.js";

export function useAuth() {
    const REFRESH_GRACE_PERIOD = 5 * 60 * 1000; // 5 minutes

    const login = (username, password) => {
        const host = import.meta.env.VITE_GLPI_URL;
        const client_id = import.meta.env.VITE_CLIENT_ID;
        const client_secret = import.meta.env.VITE_CLIENT_SECRET;

        const auth_url = `${host}/api.php/token`;
        localStorage.removeItem('api_schema');

        return axios.post(auth_url, {
            grant_type: 'password',
            client_id: client_id,
            client_secret: client_secret,
            username: username,
            password: password,
            scope: 'api graphql',
        }).then(response => {
            const jwt = response.data;
            // Add expiration time (current time + expires_in seconds)
            jwt.expiration = Date.now() + (jwt.expires_in * 1000);
            localStorage.setItem('jwt', JSON.stringify(jwt));
            localStorage.removeItem('api_schema'); // Clear cached schema on new login
            console.log('Login successful, tokens received');
            return loadSession();
        }).catch(error => {
            console.error('Login failed:', error);
        });
    };

    const loadSession = () => {
        const { doApiRequest } = useApi();
        return doApiRequest('Session').then(response => {
            const store = useSessionStore();
            store.loadSession(response.data);
        });
    }

    /**
     * Refresh the authentication token using the refresh token if needed.
     * @param {boolean} force Force refresh even if the token is still valid.
     * @returns {Promise<void>}
     */
    const refreshAuthToken = (force = false) => {
        const host = import.meta.env.VITE_GLPI_URL;
        const client_id = import.meta.env.VITE_CLIENT_ID;
        const client_secret = import.meta.env.VITE_CLIENT_SECRET;
        const auth_url = `${host}/api.php/token`;

        return new Promise((resolve, reject) => {
            const jwt = JSON.parse(localStorage.getItem('jwt') || '{}');
            // If JWT empty, reject immediately
            if (!jwt || !jwt.refresh_token) {
                console.warn('No refresh token available');
                logout();
                return reject();
            }
            // If not forcing and won't expire in the next 5 minutes, resolve immediately
            if (!force && jwt.expiration && (Date.now() < jwt.expiration - REFRESH_GRACE_PERIOD)) {
                return resolve();
            }

            axios.post(auth_url, {
                grant_type: 'refresh_token',
                client_id: client_id,
                client_secret: client_secret,
                refresh_token: localStorage.getItem('refresh_token'),
            }).then(response => {
                const jwt = JSON.parse(localStorage.getItem('jwt')) || {};
                jwt.access_token = response.data.access_token;
                jwt.refresh_token = response.data.refresh_token;
                // Add expiration time (current time + expires_in seconds)
                jwt.expiration = Date.now() + (jwt.expires_in * 1000);
                localStorage.setItem('jwt', JSON.stringify(jwt));
                console.log('Token refreshed successfully');
                resolve();
            }).catch(error => {
                console.error('Token refresh failed:', error);
                logout(); // Log out if refresh fails
                reject();
            });
        });
    };

    const getAuthToken = () => {
        const jwt = JSON.parse(localStorage.getItem('jwt'));
        return jwt ? jwt.access_token : null;
    }

    const logout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('api_schema');
        const store = useSessionStore();
        store.clearSession();
    };

    const isAuthenticated = () => {
        return !!localStorage.getItem('jwt');
    };

    return {
        login,
        logout,
        isAuthenticated,
        getAuthToken,
        refreshAuthToken,
    };
}