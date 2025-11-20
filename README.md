# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Package-lock

- Only commit the `package-lock.json` if you make changes to `package.jsons`

## Setup

Make sure to install dependencies:

```bash
# npm 
- always run `npm ci` NOT `npm install`, npm ci uses the package-lock.json file in the repo rather than creating a new one. throws error if out of sync with package.json
npm ci
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
