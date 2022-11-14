# Mesh Bed Leveling Wizard (MBL Wizard)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Languages / Frameworks

This project uses the following frameworks and languages. I'll admit, this is probably over the top for the intended
functionality of the app, but I wanted to do some learning while I built it.

* Electron
* React
* Redux
* Typescript
* Material UI

## Other Technology

The serial communication was done with WebSerialApi, which is still a new technology, so please create an issue or PR if
you find any unsupported functionality with your printers.

# Getting Started

Install dependencies with `yarn`

```
yarn
```

Start the server on `localhost:3001`

```
yarn start
```

# Contributing

The app should be configured to automatically update as you make changes and save them.

# Releases

In order to kick off a patch, minor or major release, use the following git commit messages:

* Breaking Changes should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit
  message is then used for this.
* `feat:` A new feature
* `fix:` A bug fix
* `docs:` Documentation only changes
* `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* `refactor:` A code change that neither fixes a bug nor adds a feature
* `perf:` A code change that improves performance
* `test:` Adding missing or correcting existing tests
* `chore:` Changes to the build process or auxiliary tools and libraries such as documentation generation