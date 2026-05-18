# glpi-vue

A modern frontend for GLPI with with Vue.js, PrimeVue, and TailwindCSS.

This UI is designed to work well even on mobile devices and is built with a focus on user experience, accessibility and performance.
Some existing, popular plugins will have support baked in (once they add integrations with the GLPI API) and a plugin API will be coming soon to allow for easy integration of custom plugins and features while working in tandem with plugins on the server side.
This is still a work in progress and is not yet ready for production use.

This project is working with the latest improvements to the GLPI API and so may it may not be fully compatible with the latest stable release of GLPI.
It is recommended to use the [hlapi/vue_frontend_testing](https://github.com/cconard96/glpi/tree/hlapi/vue_frontend_testing) branch on my GLPI fork which contains the latest API changes used in this project.

## .env file required
- VITE_CLIENT_ID=GLPI OAuth Client ID (Must have api and graphql scopes and authorization code grant)
- VITE_CLIENT_SECRET=OAuth Client Secret
- VITE_GLPI_URL=GLPI URL

## Legal Notice
This project is not open-source, but rather source available under the terms of the Business Source License version 1.1. You can find the full license text in the LICENSE file.

### Why BUSL and not Open Source?
There is a lot of work that is going into this project and I am doing it completely for free, and personally, under an exception in my non-compete agreement with Teclib.
The purpose of this work was to show the potential of a modern frontend for GLPI and to generate community support to eventually get it adopted as the official frontend for GLPI.
As such, it isn't fair to put myself in a position where a company (including competitors that based their apps on GLPI) could profit from this extensive work without so much as a discussion let alone compensation, only the contribution legally required by open-source license.

The BUSL feels like a good middle ground that allows me to maintain financial control while also allowing the project to be open and available for non-commercial use.
It also ensures the project will eventually become open-source under GPLv3+ within 4 years.
There are no current plans to gate each release version behind new time locks given the hope this becomes redundant with an official frontend rework; Once the code reaches 4 years since the license switch, it will be fully relicensed under GPLv3+ and available for commercial use without any restrictions.
The current GPLv3+ relicensing date is April 13th, 2030.

Some individual components may released separately under GPLv3+ as they are developed if they may be useful as standalone components (such as a Kanban or Scheduler component).

## Credits

- Illustrations by [unDraw](https://undraw.co/). The illustrations used within GLPI are licensed under CC-BY-SA-4.0, which is not compatible with the BUSL.
  The illustrations from unDraw however are provided under a compatible license.
  Illustrations set within GLPI are mapped to unDraw alternatives within this application, but not all illustrations have a direct alternative.
