# glpi-vue

An unofficial frontend for GLPI with with Vue.js, PrimeVue, and TailwindCSS.

Don't use this in production.

.env file required.
- VITE_CLIENT_ID=GLPI OAuth Client ID (Must have api and graphql scopes and password grant)
- VITE_CLIENT_SECRET=OAuth Client Secret
- VITE_GLPI_URL=GLPI URL

Requires some GLPI High-Level API features not yet merged into the GLPI codebase.
For convenience, the required patches are being centralized in this branch on my fork:
https://github.com/cconard96/glpi/tree/hlapi/v2.1