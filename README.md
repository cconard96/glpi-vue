# glpi-vue

A modern frontend for GLPI with with Vue.js, PrimeVue, and TailwindCSS.

This is still a work in progress and is not yet ready for production use.

This project is working with the latest improvements to the GLPI API and so may it may not be fully compatible with the latest stable release of GLPI.
It is recommended to use the [hlapi/vue_frontend_testing](https://github.com/cconard96/glpi/tree/hlapi/vue_frontend_testing) branch on my GLPI fork which contains the latest API changes used in this project.

## .env file required
- VITE_CLIENT_ID=GLPI OAuth Client ID (Must have api and graphql scopes and authorization code grant)
- VITE_CLIENT_SECRET=OAuth Client Secret
- VITE_GLPI_URL=GLPI URL