# EEN Login Application

A modern Vue 3 application demonstrating secure authentication 
with [Eagle Eye Networks](https://www.een.com/) (EEN) services 
using OAuth2. The application provides two proxy implementations for handling the OAuth flow securely:
1. A Cloudflare Worker implementation for production deployments
2. A built-in Vite plugin proxy for local development without third-party dependencies

This dual-proxy approach allows developers to start working immediately with the local proxy while providing a production-ready Cloudflare Worker implementation when needed. The application also provides a direct access method for scenarios where an access token and API endpoint details are already known.

This project serves as a foundation or starting point for applications needing to integrate with Eagle
Eye Networks services securely. There is no guarantee for current or future functionality, or forward or backward compatibility. 
The application uses the EEN APIs, but is otherwise not supported 
by Eagle Eye Networks. Visit the [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com/)
for more information about the Eagle Eye Networks APIs. 


![GH Pages Deployment](https://github.com/klaushofrichter/een-login/actions/workflows/deploy.yml/badge.svg?event=push&label=GH%20Pages) 
![CodeQL Check](https://github.com/klaushofrichter/een-login/actions/workflows/codeql.yml/badge.svg?label=CodeQL) 
![Dev Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fklaushofrichter%2Feen-login%2Frefs%2Fheads%2Fdevelop%2Fpackage.json&query=version&label=develop&color=%2333ca55) 
![Prod Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fklaushofrichter%2Feen-login%2Frefs%2Fheads%2Fproduction%2Fpackage.json&query=version&label=prod&color=%2333ca55) 
![GH Pages Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fklaushofrichter%2Feen-login%2Frefs%2Fheads%2Fgh-pages%2Fpackage.json&query=version&label=gh-pages&color=%2333ca55)

## Features

-   **Secure EEN OAuth2 Authentication:** Implements the standard OAuth2 Authorization Code flow using proxies to protect secrets.
-   **Direct Token Access:** Allows users to log in directly by providing an Access Token, Base URL, and Port.
-   **Modern Frontend Stack:** Built with Vue 3 (Composition API), Vite, Pinia, and Tailwind CSS.
-   **Backend Proxy:** Includes a Cloudflare Worker (`./cloudflare`) for secure OAuth handling and a local Vite solution.
-   **Responsive Design:** Adapts to various screen sizes.
-   **State Management:** Uses Pinia (`authStore`, `themeStore`, etc) for managing application state predictably.
-   **Routing:** Implements protected routes using Vue Router and navigation guards.
-   **User Profile Display:** Shows basic user information and allows access to system information.
-   **Theme Switching:** Supports Light, Dark, and System themes with persistence.
-   **Logout Flow:** Includes a countdown modal with options to cancel or logout immediately.
-   **Testing:** Comes with Playwright end-to-end tests covering key user flows with focus on authentication.

## Technology Stack

-   **Frontend:** Vue 3, Vite, Pinia, Vue Router, Tailwind CSS
-   **Authentication:** OAuth2 (Authorization Code Grant), Eagle Eye Networks API
-   **Backend Proxy:** Cloudflare Workers
-   **State Persistence:** `localStorage`
-   **Testing:** Playwright
-   **CI/CD:** Github based CI/CD pipeline including deployment at Github Pages

## Dual Proxy Implementation

This application provides two different proxy implementations for handling the OAuth flow:

### 1. Vite Plugin Proxy (Development)
- Perfect for local development and testing
- Built directly into the Vite development server
- No need for external services or deployments
- Implements the same OAuth flow as the Cloudflare Worker
- Stores refresh tokens in memory (development only)
- Located in `vite.config.js`

### 2. Cloudflare Worker Proxy (Production)
- Recommended for production deployments
- Provides secure, serverless backend functionality
- Handles OAuth token exchange and refresh token management
- Stores secrets and refresh tokens securely in Cloudflare's infrastructure
- Requires a Cloudflare account and worker deployment
- Located in `./cloudflare/src/index.js`

Both implementations provide identical functionality and API endpoints, making them interchangeable from the frontend's perspective. 
The frontend code automatically adapts to whichever proxy is configured via the `VITE_AUTH_PROXY_URL` environment variable.

> **Development Tip**: Start with the Vite Plugin Proxy for local development. When ready for production, deploy the Cloudflare Worker and update your environment configuration accordingly.

## Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or yarn
-   An Eagle Eye Networks (EEN) Developer Account:
    -   Create an account at [EEN Developer Portal](https://developer.eagleeyenetworks.com/docs/getting-started#get-an-account)
    -   Create Client Credentials (OAuth API Key) in the [My Application section](https://developer.eagleeyenetworks.com/my-apps)
    -   Configure the **Redirect URI** in your EEN application settings to exactly match your development URL (e.g., `http://127.0.0.1:3333`)
    -   Note: The redirect URI must match exactly - variations like `https://127.0.0.1:3333`, `http://localhost:3333`, or trailing slashes will not work
    -   For production deployments, you'll need to [whitelist your domain for CORS](https://developer.eagleeyenetworks.com/docs/getting-started#cors-domain-whitelisting) by contacting EEN support
-   Cloudflare Account (for deploying the included Worker proxy)
-   Wrangler CLI (for deploying the Cloudflare Worker): `npm install -g wrangler`

> **Development Tip**: While this application provides both local and production-ready proxy implementations, you still need valid EEN Client Credentials for development. These credentials are used differently in development (stored in `.env`) versus production (stored in Cloudflare Worker secrets).

## Setup

This setup involves configuring both the frontend Vue application and deploying the Cloudflare Worker proxy.

**1. Clone the repository:**
   ```bash
   git clone git@github.com:klaushofrichter/een-login.git
   cd een-login
   ```

**2. Configure Frontend Application:**
   -   Install frontend dependencies:
       ```bash
       npm install
       # or
       yarn install
       ```
   -   Create a `.env` file in the **root** directory. Add the following variables:
       ```env
       # === Frontend Configuration ===
       # Your EEN Application Client ID (needed by frontend to initiate login)
       VITE_EEN_CLIENT_ID=YOUR_EEN_CLIENT_ID

       # The URL of your DEPLOYED Cloudflare Worker (from step 3)
       VITE_AUTH_PROXY_URL=https://your-worker-name.your-account.workers.dev

       # === E2E Testing Configuration (Optional) ===
       TEST_USER=your_test_een_username@example.com
       TEST_PASSWORD=your_test_een_password
       ```
       *   Replace `YOUR_EEN_CLIENT_ID` with your EEN Client ID.
       *   Replace `VITE_AUTH_PROXY_URL` with your actual deployed worker URL.
       *   **`VITE_EEN_CLIENT_SECRET`: This is **not used by the frontend application** when targeting the deployed worker (it lives securely in the worker environment). However, it **is required** in this `.env` file **if you use the `./cloudflare/deploy.sh` script** to push secrets to Cloudflare.
       *   Add `TEST_USER` and `TEST_PASSWORD` if you intend to run the full end-to-end tests.

**3. Configure Cloudflare Worker:**
   -   Navigate to the worker directory: `cd cloudflare`
   -   Rename `wrangler.toml.example` to `wrangler.toml`.
   -   Edit `wrangler.toml` and set your Cloudflare `account_id`.
   -   Login to Cloudflare by calling `wrangler login`.
   -   Configure secrets for the worker.  Use the Wrangler CLI:
       ```bash
       # Run these commands within the ./cloudflare directory
       wrangler secret put EEN_CLIENT_ID
       # Paste your EEN Client ID when prompted

       wrangler secret put EEN_CLIENT_SECRET
       # Paste your EEN Client Secret when prompted
       ```
       **These can also be stored in `.env`**. You can use the included script `./deploy.sh`
       to push the secrets from the `.env` file to the Cloudflare worker. This also deploys
       the worker itself.

**4. Deploy Cloudflare Worker:**
   Unless you use the above mentioned `./deploy.sh` script, please manually deploy the worker: 
   ```bash
   # Run this command within the ./cloudflare directory
   wrangler deploy
   ```
   -   Note the URL of your deployed worker (e.g., `https://your-worker-name.your-account.workers.dev`). You will need this for the frontend configuration.

**5. Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will typically be available at `http://127.0.0.1:3333`.

## Configuring the Authentication Proxy

The application needs to communicate with an authentication proxy to handle the OAuth token exchange with Eagle Eye Networks securely. You can configure the application to use either a local proxy running within the Vite development server or a deployed Cloudflare Worker.

This is controlled by the `VITE_AUTH_PROXY_URL` variable in your root `.env` file:

*   **Using the Local Vite Proxy (for Development):**
    *   Set `VITE_AUTH_PROXY_URL` to your local Vite server address (e.g., `http://127.0.0.1:3333`).
    *   **This is the default behavior if `VITE_AUTH_PROXY_URL` is not set.**
    *   Requires the following in the `.env` file:
        *   `VITE_EEN_CLIENT_ID`
        *   `VITE_EEN_CLIENT_SECRET`
    *   Example (`.env`):
        ```env
        # Required for Local Vite Proxy:
        VITE_EEN_CLIENT_ID=YOUR_EEN_CLIENT_ID
        VITE_EEN_CLIENT_SECRET=YOUR_EEN_CLIENT_SECRET
        # Set to local server (or leave unset to default to local):
        VITE_AUTH_PROXY_URL=http://127.0.0.1:3333
        ```
    *   When configured this way, the frontend will make requests to `/proxy/getAccessToken` and `/proxy/refreshAccessToken` on the Vite server, which are handled by the built-in plugin in `vite.config.js`. 

*   **Using the Deployed Cloudflare Worker (Recommended for Production / Testing Deployment):**
    *   Set `VITE_AUTH_PROXY_URL` to the full URL of your deployed Cloudflare worker.
    *   Requires `VITE_EEN_CLIENT_ID` in the `.env` file (the frontend needs this).
    *   The `VITE_EEN_CLIENT_SECRET` is **not used by the frontend application** itself, but **must be in `.env` if using the `./cloudflare/deploy.sh` script** to configure the worker.
    *   Example:
        ```env
        VITE_EEN_CLIENT_ID=YOUR_EEN_CLIENT_ID
        VITE_EEN_CLIENT_SECRET=YOUR_EEN_CLIENT_SECRET
        VITE_AUTH_PROXY_URL=https://your-worker-name.your-account.workers.dev
        ```
    *   When configured this way, the frontend will make requests directly to `/getAccessToken` and `/refreshAccessToken` on your Cloudflare worker URL.

**Important:**
*   The `VITE_AUTH_PROXY_URL` variable **must be set** in your `.env` file for the authentication flow to function correctly.
*   If `VITE_AUTH_PROXY_URL` is **not set**, the application will default to using the **Local Vite Proxy** (`http://127.0.0.1:3333`). Ensure `VITE_EEN_CLIENT_SECRET` is also set in `.env` in this case.
*   Remember to **restart the Vite development server** after changing the `.env` file for the changes to take effect.

## Project Structure

```
een-login/
├── cloudflare/        # Cloudflare Worker source code and config
│   ├── src/
│   │   └── index.js   # Worker entry point/logic
│   ├── wrangler.toml  # Worker configuration & secrets bindings
│   └── package.json   # Worker dependencies (if any)
├── public/            # Static assets directly served
├── scripts/           # Build/utility scripts (version bumping, etc.)
├── src/               # Frontend Vue application source
│   ├── assets/        # Processed assets (CSS, images)
│   ├── components/    # Reusable Vue components (if any were created)
│   ├── constants.js   # Application-wide constants (e.g., APP_NAME)
│   ├── router/        # Vue Router configuration (routes, navigation guards)
│   ├── services/      # Business logic, API interactions (auth.js, user.js)
│   ├── stores/        # Pinia state management (auth.js, theme.js)
│   ├── views/         # Page-level components (Login.vue, Home.vue, etc.)
│   ├── App.vue        # Root Vue component (layout, nav, router-view)
│   └── main.js        # Application entry point (Vue app creation, plugins)
├── tests/             # Playwright end-to-end tests (auth.spec.js)
├── .env               # Frontend environment variables (local only, DO NOT COMMIT)
├── .env.example       # Example environment variables file
├── .eslintrc.cjs      # ESLint configuration
├── .gitignore         # Git ignore rules
├── .prettierrc.json   # Prettier configuration
├── index.html         # Main HTML entry point
├── LICENSE            # Project license (MIT)
├── package.json       # Project metadata and dependencies
├── playwright.config.js # Playwright test configuration
├── postcss.config.js  # PostCSS configuration
├── README.md          # This file
├── tailwind.config.js # Tailwind CSS configuration
└── vite.config.js     # Vite configuration
```

-   **`cloudflare/`:** Contains the source code and configuration (`wrangler.toml`) for the Cloudflare Worker acting as the secure OAuth proxy.
-   **`src/services`:** Interacts with the deployed Cloudflare Worker (`VITE_AUTH_PROXY_URL`) for authentication operations.
-   **`src/stores`:** Houses Pinia stores. `authStore` manages the access token received *from* the worker.

## Key Components Explained

-   **`cloudflare/src/index.js` (Worker):**
    -   Handles requests from the frontend for `/api/auth/callback` and `/api/auth/refresh`.
    -   Securely uses `EEN_CLIENT_ID` and `EEN_CLIENT_SECRET` (from worker secrets) to talk to EEN.
    -   Manages refresh token storage and usage.
-   **`stores/auth.js` (Pinia Store - Frontend):**
    -   Manages the user's authentication state within the browser (access token, user profile).
    -   Provides actions to initiate login, complete login (storing the token received from the worker), logout, and trigger token refresh via the worker.
-   **`services/auth.js` (Frontend):**
    -   Constructs the initial EEN OAuth URL.
    -   Sends the authorization `code` to the `/api/auth/callback` endpoint of the deployed Cloudflare Worker.
    -   Calls the `/api/auth/refresh` endpoint of the worker when a token refresh is needed.

## Authentication Flow (with Included Cloudflare Worker Proxy)

This flow uses the included Cloudflare Worker in `./cloudflare` for enhanced security.

1.  User clicks "Sign in with Eagle Eye Networks".
2.  Frontend redirects to EEN OAuth server (using `VITE_EEN_CLIENT_ID`).
3.  User logs into EEN.
4.  EEN redirects back to frontend (`VITE_REDIRECT_URI`) with an authorization `code`.
5.  Frontend (`Login.vue`) sends the `code` to the **Deployed Cloudflare Worker**'s `/api/auth/callback` endpoint (using `VITE_AUTH_PROXY_URL`).
6.  The **Cloudflare Worker** (`cloudflare/src/index.js`):
    a. Receives the `code`.
    b. Makes a secure request to EEN's token endpoint using the `code` and the `EEN_CLIENT_ID`, `EEN_CLIENT_SECRET` configured in the Worker secrets.
    c. Receives `access_token` and `refresh_token`.
    d. Securely stores the `refresh_token` (e.g., using KV and the `REFRESH_TOKEN_SECRET`).
    e. Returns **only the `access_token`** to the frontend.
7.  Frontend (`services/auth.js`) receives the `access_token`.
8.  `access_token` is stored in the `authStore`.
9.  User profile is fetched (`userService.getUserProfile`).
10. User data stored in `authStore`.
11. User redirected to `/home`.

### Token Refresh (with Worker)

1.  Frontend needs a new token (e.g., `authStore` action triggered before API call).
2.  Frontend calls the **Deployed Cloudflare Worker**'s `/api/auth/refresh` endpoint.
3.  The **Cloudflare Worker**:
    a. Retrieves the stored `refresh_token` for the user session.
    b. Makes a secure request to EEN using the `refresh_token` grant and worker secrets.
    c. Gets a new `access_token` (and possibly a new `refresh_token`).
    d. Updates stored `refresh_token` if necessary.
    e. Returns the new `access_token` to the frontend.
4.  Frontend updates the `access_token` in `authStore`.

### Direct Access Flow

(Remains the same - bypasses OAuth and worker proxy)

## Cloudflare Worker OAuth Proxy (Included)

This application includes a Cloudflare Worker implementation (`./cloudflare`) designed to act as a secure proxy for the OAuth flow, significantly enhancing security compared to handling the token exchange directly in the frontend.

-   **Purpose:** Intermediates communication between the frontend SPA and EEN, protecting sensitive credentials.
-   **Included Functionality:**
    -   Handles the `/api/auth/callback` endpoint to exchange the authorization code for tokens using secrets configured *only* in the worker environment.
    -   Handles the `/api/auth/refresh` endpoint to securely use the refresh token (stored server-side by the worker) to obtain new access tokens.
    -   Requires deployment using Wrangler CLI and secure configuration of `EEN_CLIENT_ID`, `EEN_CLIENT_SECRET`, and `REFRESH_TOKEN_SECRET` via `wrangler secret put`.
-   **Benefits:**
    -   **Client Secret Protection:** The `client_secret` never reaches the browser.
    -   **Refresh Token Security:** Refresh tokens are managed securely by the worker, not stored in the browser.

**Configuration:** Ensure the frontend's `.env` file has the correct `VITE_AUTH_PROXY_URL` pointing to your *deployed* worker URL. The functions in `src/services/auth.js` are designed to interact with these worker endpoints.

## Running Tests

This project uses Playwright for end-to-end testing.

1.  **Ensure Test Credentials:** Make sure you have added valid `TEST_USER` and `TEST_PASSWORD` to your frontend `.env` file if you want to run the full login flow test.
2.  **Run Tests:**
    ```bash
    # Run all tests in headless mode
    npm run test

    # Run tests with the Playwright UI (useful for debugging)
    npm run test:ui

    # Run tests in headed mode (shows browser window)
    npm run test:headed

    # Run tests in debug mode
    npm run test:debug
    ```

The tests cover:
-   Login page element rendering and styling.
-   Direct Access page element rendering and styling.
-   Full EEN OAuth login flow (requires test credentials).
-   Navigation between authenticated pages (Home, Profile, About, Settings).
-   Theme switching functionality.
-   Logout flow (including modal interactions and redirection).
-   Direct Access login flow using credentials captured during the OAuth test.

## Available Scripts

-   `npm run dev`: Start frontend development server.
-   `npm run build`: Build frontend for production.
-   `npm run preview`: Preview frontend production build.
-   `npm run lint`: Lint frontend code.
-   `npm run format`: Format frontend code.
-   `npm run test`: Run frontend Playwright tests (headless).
-   `npm run test:ui`: Run Playwright tests with UI mode.
-   `npm run test:headed`: Run Playwright tests in headed mode.
-   `npm run test:debug`: Run Playwright tests in debug mode.
-   `npm run version:patch`: Increment frontend version.
-   **(In ./cloudflare directory)** `wrangler deploy`: Deploy the Cloudflare worker.
-   **(In ./cloudflare directory)** `wrangler dev`: Run the Cloudflare worker locally for development/testing.

## Extending the Application

-   **Adding New Pages/Views:** (Same as before)
-   **Modifying UI:** (Same as before)
-   **Changing Frontend State Management:** (Same as before)
-   **Modifying Worker Logic:** Edit code in `cloudflare/src/index.js` and redeploy using `wrangler deploy`.
-   **Interacting with More EEN APIs:** Add functions in `src/services/` to make authenticated calls (using the access token from `authStore`). The worker is generally only involved in the *authentication* part, not subsequent API calls.

## Security Considerations

-   **Client Secret:** Protected within the Cloudflare Worker environment secrets. **Do not** add it to the frontend `.env` file.
-   **Refresh Token:** Managed securely by the Cloudflare Worker. **Do not** attempt to store or handle refresh tokens in the frontend browser storage.
-   **Access Token:** Stored in the frontend's memory (Pinia store). While less sensitive than the refresh token, minimize its exposure and rely on short expiry times enforced by EEN.
-   **Worker Security:** Ensure your worker code handles errors correctly and doesn't inadvertently log sensitive information.
-   **HTTPS:** Essential for both the frontend application and the Cloudflare Worker URL.

## Contributing

Contributions are welcome! If you plan to contribute back to the original repository:

1.  Check for existing issues or open a new issue to discuss your proposed changes.
2.  Fork the repository.
3.  Create your feature branch (`git checkout -b feature/your-feature-name`).
4.  Commit your changes (`git commit -m 'Add some amazing feature'`). Ensure commit messages are descriptive.
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request, linking it to the relevant issue if applicable.
7.  Ensure your code adheres to the existing style (ESLint, Prettier) and that tests pass.

> **Note on Contributing**: This repository is intended to serve as a generic login framework for EEN applications. While forks are welcome for your own customization, pull requests should focus on enhancing the core authentication functionality, security, or developer experience. For application-specific features, we recommend cloning this repository as a starting point rather than forking.
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
