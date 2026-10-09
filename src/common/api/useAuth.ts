import axios from "axios";
import { useSessionStore} from "@/common/useSessionStore";
import { useApi } from "@/common/api/useApi";
import { usePreferencesStore } from "@/common/usePreferencesStore.ts";
import { useIndexedDB } from "@/common/useIndexedDB.ts";

interface StoredToken {
    access_token?: string,
    refresh_token?: string,
    token_type?: string,
    expires_in?: number,
    /** Absolute epoch milliseconds at which access_token expires. Derived locally from expires_in. */
    expiration?: number,
}

const REFRESH_GRACE_PERIOD = 5 * 60 * 1000; // Refresh when the access token has less than 5 minutes left
const REFRESH_CHECK_INTERVAL = 60 * 1000; // How often the background timer re-checks the token

// Keys used to hold the PKCE state across the redirect to the authorization server.
const CODE_VERIFIER_KEY = 'pkce_code_verifier';
const STATE_KEY = 'pkce_state';
const POST_LOGIN_REDIRECT_KEY = 'pkce_redirect';

// Module scoped so that every useAuth() caller shares the same timer and in-flight refresh.
let refresh_timer: ReturnType<typeof setInterval> | null = null;
let refresh_promise: Promise<void> | null = null;

export function useAuth() {

    const getStoredToken = (): StoredToken => {
        try {
            return JSON.parse(localStorage.getItem('jwt') || '{}') || {};
        } catch {
            // Corrupt entry, treat as logged out rather than throwing out of every API call
            return {};
        }
    }

    const storeToken = (token: StoredToken) => {
        localStorage.setItem('jwt', JSON.stringify(token));
    }

    const postLogin = (): Promise<void> => {
        // Timer to keep checking the token so it stays valid even when the app is left open
        if (refresh_timer) {
            clearInterval(refresh_timer);
        }
        refresh_timer = setInterval(() => {
            refreshAuthToken().catch(() => {
                console.warn('Automatic token refresh failed, user may need to log in again');
            });
        }, REFRESH_CHECK_INTERVAL);

        // Immediately load the API schema, session info, and locales
        const { apollo_client } = useApi();
        const { clearAllStores } = useIndexedDB();
        return Promise.all([
            apollo_client.resetStore(),
            clearAllStores(),
            loadApiSchema(),
            loadSession(),
            loadEntityTree(),
            //loadLocales(),

        ]).then(() => {
            // Need to wait for session to load before loading preferences since it needs the user ID
            return loadPreferences();
        });
    }

    const loadApiSchema = () => {
        const { doApiRequest } = useApi();
        const { saveOpenAPIComponenets } = useIndexedDB();
        return doApiRequest('doc.json').then(response => {
            return saveOpenAPIComponenets(response.data.components.schemas);
        }).catch(error => {
            console.error('Failed to fetch API schema:', error);
            throw error;
        });
    }

    const loadSession = () => {
        const { doApiRequest } = useApi();
        return doApiRequest('Session').then(response => {
            const store = useSessionStore();
            store.loadSession(response.data);
        });
    }

    const loadEntityTree = () => {
        const { doApiRequest } = useApi();
        return doApiRequest('/Session/EntityTree').then((res) => {
            const store = useSessionStore();
            store.loadEntityTreeData(res.data);
        });
    }

    // const loadLocales = () => {
    //     const { doApiRequest } = useApi();
    //     console.log('Loading localization data');
    //     return doApiRequest('locales').then(response => {
    //         localStorage.setItem('locales', JSON.stringify(response.data));
    //         console.log('Localization data loaded');
    //     });
    // }

    const loadPreferences = () => {
        const { doApiRequest } = useApi();
        const { getUserID } = useSessionStore();
        return doApiRequest(`Administration/User/${getUserID}/Preference`).then(response => {
            const store = usePreferencesStore();
            store.loadPreferences(response.data);
        });
    }

    /**
     * Send the user back to the login screen after the session could not be kept alive.
     * A full navigation is used instead of the router since this can be triggered from outside a component context.
     * @param {string} error_code Error code understood by LoginView.
     */
    const redirectToLogin = (error_code: string) => {
        const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        const params = new URLSearchParams({ error: error_code });
        if (!current.startsWith('/login') && !current.startsWith('/auth-callback')) {
            params.set('redirect', current);
        }
        window.location.assign(`/login?${params.toString()}`);
    }

    /**
     * Refresh the authentication token using the refresh token if needed.
     *
     * Concurrent callers share a single in-flight request. Refresh tokens are single use, so firing several
     * refreshes in parallel would invalidate all but one of them and log the user out.
     *
     * @param {boolean} force Force refresh even if the token is still valid.
     * @returns {Promise<void>}
     */
    const refreshAuthToken = (force = false): Promise<void> => {
        const jwt = getStoredToken();
        if (!jwt.refresh_token) {
            console.warn('No refresh token available');
            return logout().then(() => {
                return Promise.reject(new Error('No refresh token available'));
            });
        }
        // If not forcing and won't expire in the next 5 minutes, resolve immediately
        if (!force && jwt.expiration && (Date.now() < (jwt.expiration - REFRESH_GRACE_PERIOD))) {
            return Promise.resolve();
        }
        // A refresh is already running, wait on it instead of consuming the refresh token a second time
        if (refresh_promise) {
            return refresh_promise;
        }

        const host = import.meta.env.VITE_GLPI_URL;
        const auth_url = `${host}/api.php/token`;

        refresh_promise = axios.post(auth_url, {
            grant_type: 'refresh_token',
            refresh_token: jwt.refresh_token,
            ...getClientCredentials(),
        }).then(response => {
            storeToken(withExpiration({
                ...getStoredToken(),
                ...response.data,
            }));
        }).catch(error => {
            console.error('Token refresh failed:', error);
            // Log out if refresh fails
            return logout().then(() => {
                redirectToLogin('1');
                throw error;
            });
        }).finally(() => {
            refresh_promise = null;
        });

        return refresh_promise;
    };

    const getAuthToken = () => {
        return getStoredToken().access_token ?? null;
    }

    /**
     * Turn the token endpoint's relative expires_in into an absolute timestamp we can compare against.
     */
    const withExpiration = (token: StoredToken): StoredToken => {
        return {
            ...token,
            expiration: token.expires_in ? Date.now() + (token.expires_in * 1000) : undefined,
        };
    }

    /**
     * Credentials sent to the token endpoint.
     *
     * With PKCE the app is a public client and has no usable secret (anything bundled into the SPA is readable by
     * the user), so only the client ID is sent. VITE_CLIENT_SECRET is only included when it is set, which allows
     * pointing at a GLPI OAuth client that is still registered as confidential.
     */
    const getClientCredentials = (): Record<string, string> => {
        const client_id = import.meta.env.VITE_CLIENT_ID;
        const client_secret = import.meta.env.VITE_CLIENT_SECRET;
        return {
            client_id: client_id,
            ...(client_secret ? { client_secret: client_secret } : {}),
        };
    }

    const getRedirectUri = () => `${window.location.origin}/auth-callback`;

    const base64UrlEncode = (bytes: Uint8Array): string => {
        let binary = '';
        bytes.forEach(byte => binary += String.fromCharCode(byte));
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    const generateRandomString = (byte_length: number): string => {
        const bytes = new Uint8Array(byte_length);
        window.crypto.getRandomValues(bytes);
        return base64UrlEncode(bytes);
    }

    /**
     * RFC 7636 requires a verifier of 43-128 characters from the unreserved set.
     * 64 random bytes base64url encodes to 86 characters.
     */
    const generateCodeVerifier = () => generateRandomString(64);

    const generateCodeChallenge = async (code_verifier: string): Promise<string> => {
        const data = new TextEncoder().encode(code_verifier);
        const hash_buffer = await window.crypto.subtle.digest('SHA-256', data);
        return base64UrlEncode(new Uint8Array(hash_buffer));
    }

    const clearPKCEState = () => {
        sessionStorage.removeItem(CODE_VERIFIER_KEY);
        sessionStorage.removeItem(STATE_KEY);
    }

    /**
     * Start the authorization code flow with PKCE.
     *
     * The code verifier and state are kept in sessionStorage so they survive the redirect to GLPI and back but are
     * scoped to this tab and dropped when it closes.
     *
     * @param {string|null} redirect Path to return to once the login completes.
     */
    const authorize = async (redirect: string | null = null) => {
        const host = import.meta.env.VITE_GLPI_URL;
        const code_verifier = generateCodeVerifier();
        const code_challenge = await generateCodeChallenge(code_verifier);
        const state = generateRandomString(16);

        sessionStorage.setItem(CODE_VERIFIER_KEY, code_verifier);
        sessionStorage.setItem(STATE_KEY, state);
        // The authorization server only echoes back `code` and `state`, so any post-login destination has to be
        // stashed here or it is lost across the redirect.
        if (redirect) {
            sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirect);
        } else {
            sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
        }

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: import.meta.env.VITE_CLIENT_ID,
            redirect_uri: getRedirectUri(),
            scope: 'api graphql',
            state: state,
            code_challenge: code_challenge,
            code_challenge_method: 'S256',
        });
        window.location.assign(`${host}/api.php/authorize?${params.toString()}`);
    }

    /**
     * Exchange the authorization code for tokens, proving ownership of the code challenge sent in authorize().
     *
     * @param {string} code Authorization code from the callback query string.
     * @param {string|null} state State from the callback query string, matched against the value we generated.
     */
    const handleAuthCallback = (code: string, state: string | null = null): Promise<void> => {
        const host = import.meta.env.VITE_GLPI_URL;
        const auth_url = `${host}/api.php/token`;

        const code_verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
        const expected_state = sessionStorage.getItem(STATE_KEY);

        if (!code_verifier) {
            clearPKCEState();
            return Promise.reject(new Error('Missing PKCE code verifier. The login was not started by this tab.'));
        }
        if (!expected_state || state !== expected_state) {
            clearPKCEState();
            return Promise.reject(new Error('Authorization state mismatch. The login request may have been tampered with.'));
        }

        return axios.post(auth_url, {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: getRedirectUri(),
            code_verifier: code_verifier,
            ...getClientCredentials(),
        }).then(response => {
            storeToken(withExpiration(response.data));
            return postLogin();
        }).catch(error => {
            console.error('Authorization code exchange failed:', error);
            throw error;
        }).finally(() => {
            // The verifier is single use either way
            clearPKCEState();
        });
    }

    /**
     * Consume the destination saved before the redirect to the authorization server.
     */
    const takePostLoginRedirect = (): string | null => {
        const redirect = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
        sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
        return redirect;
    }

    const logout = async () => {
        if (refresh_timer) {
            clearInterval(refresh_timer);
            refresh_timer = null;
        }
        localStorage.removeItem('jwt');
        localStorage.removeItem('locales');
        clearPKCEState();
        const store = useSessionStore();
        store.clearSession();
        await useIndexedDB().clearAllStores();
    };

    const isAuthenticated = () => {
        return !!getStoredToken().access_token;
    };

    return {
        logout,
        isAuthenticated,
        getAuthToken,
        refreshAuthToken,
        loadSession,
        authorize,
        handleAuthCallback,
        takePostLoginRedirect,
    };
}
