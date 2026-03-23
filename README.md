### Ramotion Theme

Ramotion-inspired UI customization app for Frappe Desk

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
