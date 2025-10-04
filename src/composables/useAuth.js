import axios from "axios";

export function useAuth() {
    const login = (username, password) => {
        const host = import.meta.env.VITE_GLPI_URL;
        const client_id = import.meta.env.VITE_CLIENT_ID;
        const client_secret = import.meta.env.VITE_CLIENT_SECRET;

        const auth_url = `${host}/api.php/token`;
        return axios.post(auth_url, {
            grant_type: 'password',
            client_id: client_id,
            client_secret: client_secret,
            username: username,
            password: password,
            scope: 'api graphql',
        }).then(response => {
            localStorage.setItem('auth_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            localStorage.removeItem('api_schema'); // Clear cached schema on new login
            const expires_in_secs = response.data.expires_in;
            // Set up a timer to keep the token refreshed
            setTimeout(() => {
                refreshAuthToken();
            }, (expires_in_secs - (5 * 60)) * 1000); // Refresh 5 minutes before expiry

            console.log('Login successful, tokens received');
        }).catch(error => {
            console.error('Login failed:', error);
        });
    };

    const refreshAuthToken = () => {
        //TODO Smarter refresh. Have the expires time checked before each API call and then refresh if needed (if less than 5 minutes left)
        const host = import.meta.env.VITE_GLPI_URL;
        const client_id = import.meta.env.VITE_CLIENT_ID;
        const client_secret = import.meta.env.VITE_CLIENT_SECRET;

        const auth_url = `${host}/api.php/token`;
        return axios.post(auth_url, {
            grant_type: 'refresh_token',
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: localStorage.getItem('refresh_token'),
        }).then(response => {
            localStorage.setItem('auth_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            const expires_in_secs = response.data.expires_in;
            // Set up a timer to keep the token refreshed
            setTimeout(() => {
                refreshAuthToken();
            }, (expires_in_secs - (5 * 60)) * 1000); // Refresh 5 minutes before expiry

            console.log('Token refreshed successfully');
        }).catch(error => {
            console.error('Token refresh failed:', error);
            logout(); // Log out if refresh fails
        });
    };

    const getAuthToken = () => {
        return localStorage.getItem('auth_token');
    }

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
    };

    const isAuthenticated = () => {
        return !!localStorage.getItem('auth_token');
    };

    return {
        login,
        logout,
        isAuthenticated,
        getAuthToken,
    };
}