### Ramotion Theme

Ramotion-inspired UI customization app for Frappe Desk

### What's New in v0.4.1

- Fixed child table dropdown clipping in Desk forms so Awesomplete menus open cleanly above grid boundaries.
- Reworked Ramotion child table styling to read as a single cohesive table instead of nested boxed rows.
- Aligned grid header typography with Arabic Pro so RTL table headings inherit the active Arabic font and sit correctly inside header cells.

### Requirements

- Frappe v15
- Python 3.10+
- `arabic_pro` is optional and is not required for installation

This repository already includes the runtime assets under `ramotion_theme/public/`, including the studio bundle in `public/dist`. That means a fresh system can install and run the app without rebuilding the frontend first.

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch main
bench install-app ramotion_theme
```

If you later modify files inside `frontend/`, rebuild the studio bundle manually:

```bash
cd apps/ramotion_theme
yarn frontend:install
yarn build
bench build --app ramotion_theme
```

### Upgrade Notes for v0.4.1

After pulling this release, run:

```bash
bench --site <site> migrate
bench --site <site> clear-cache
bench build --app ramotion_theme
```

The build step is recommended if you are deploying from source and want to guarantee the latest bundled studio assets are regenerated locally.

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/ramotion_theme
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

mit
