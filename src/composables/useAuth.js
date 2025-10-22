import axios from "axios";
import { useSessionStore} from "@/composables/useSessionStore.js";
import { useApi } from "@/composables/useApi.js";
import { useRouter } from "vue-router";

export function useAuth() {
    const REFRESH_GRACE_PERIOD = 5 * 60 * 1000; // 5 minutes
    let refresh_timer = null;

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

            // Timer to keep trying to refresh the token every 30 minutes to ensure it stays valid even when the app is left open
            refresh_timer = setInterval(() => {
                refreshAuthToken().catch(() => {
                    console.warn('Automatic token refresh failed, user may need to log in again');
                });
            });

            // Immediately load the API schema, session info, and locales
            const { getApiSchema } = useApi();
            console.log('Loading initial data post-login');
            return Promise.all([
                getApiSchema(),
                loadSession(),
                loadLocales(),
            ]);
        }).catch(error => {
            console.error('Login failed:', error);
        });
    };

    const loadSession = () => {
        const { doApiRequest } = useApi();
        console.log('Loading session information');
        return doApiRequest('Session').then(response => {
            const store = useSessionStore();
            store.loadSession(response.data);
            console.log('Session information loaded');
        });
    }

    const loadLocales = () => {
        const { doApiRequest } = useApi();
        console.log('Loading localization data');
        return doApiRequest('locales').then(response => {
            localStorage.setItem('locales', JSON.stringify(response.data));
            console.log('Localization data loaded');
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
            if (!force && jwt.expiration && (Date.now() < (jwt.expiration - REFRESH_GRACE_PERIOD))) {
                return resolve();
            }

            axios.post(auth_url, {
                grant_type: 'refresh_token',
                client_id: client_id,
                client_secret: client_secret,
                refresh_token: jwt.refresh_token,
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
                // Log out if refresh fails
                logout();
                const router = useRouter();
                return router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } }).then(reject);
            });
        });
    };

    const getAuthToken = () => {
        const jwt = JSON.parse(localStorage.getItem('jwt'));
        return jwt ? jwt.access_token : null;
    }

    const logout = () => {
        if (refresh_timer) {
            clearInterval(refresh_timer);
        }
        localStorage.removeItem('jwt');
        localStorage.removeItem('api_schema');
        localStorage.removeItem('locales');
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