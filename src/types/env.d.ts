/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GLPI_URL: string,
    readonly VITE_CLIENT_ID: string,
    /** Optional. Public (PKCE) clients have no secret; only set this for a confidential GLPI OAuth client. */
    readonly VITE_CLIENT_SECRET?: string,
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}