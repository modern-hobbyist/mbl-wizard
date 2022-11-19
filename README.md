# Mesh Bed Leveling Wizard (Work in progress)

The goal of this project was to streamline the process of creating or updating the bed-leveling mesh for each of my 3d
printers. Not all 3d printer beds are perfectly flat, and if print quality is a concern to you, then Mesh Bed Leveling
could be a very useful tool to add to your arsenal.

Mesh Bed Leveling is a process of creating an approximate 3d model of your 3d printer's bed, which the firmware then
accounts for automatically during a print.

There are several ways to utilize mesh bed leveling, but this project in particular is currently aimed at Manual Mesh
Bed Leveling. Some printers come with a method to automatically create a mesh, like the Prusa's sensor or the BLTouch
probe, but the beginner printers that I usually find myself buying, usually come with nothing. So, if you're like me and
your printer supports MBL, but doesn't provide a method of creating a mesh, the MBL Wizard is for you!

I should also mention that if you don't have MBL enabled in your firmware, this could be a perfect time for you to learn
how to compile your own Marlin firmware! I've set up a few versions myself with (at the time) the most recent version of
Marlin. Feel free to use them or fork them as you need.

The following are based on Marlin bugfix-2.1.x

* [Anycubic i3 Mega (With TMC2208 drivers)](https://github.com/modern-hobbyist/Marlin-2.1.x-Anycubic-i3-Mega)
* [Ender 3 Pro (With V4.2.2 Board)](https://github.com/modern-hobbyist/Marlin-2.1.x-Ender-3-Pro)
* [Newereal M18 S (With Robin Nano V1.2 Board)](https://github.com/modern-hobbyist/Marlin-2.1.x-Newereal-M18-S)

# Requirements

`To Be Updated As I Learn More and as the project grows.`

* Marlin Firmware
* Manual Mesh Bed Leveling Enabled in Firmware
* TODO...

# Disclaimer

This project is a work in progress, and it was started as an interesting way to get familiar with the Electron
framework.
As such, there are probably many things that aren't done quite by the book, which is exactly why I'm trying to start
this up as an open source software. I'm still learning this whole Electron thing, but I'm hoping some of you aren't, so
please feel free to add your contribution to this project, all PR's are welcome!

I also mention this, as a sort-of warning. Please use this software at your own risk. Is utilizes GCode to move your
printhead around and if your printer isn't properly configured, it may cause damage.

# Usage

* Add note about soft endstop (Use M211 S0 to allow printer to go below z0)
* Don't forget to add M501 & M420 S1 to your start gcode to enable
* Make sure to get the correct baud rate
* Only work on printers with manual mesh bed leveling installed and enabled.

# Languages / Frameworks

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

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