module.exports = {
    "packagerConfig": {
        "icon": './src/media/mbl-wizard'
    },
    "makers": [
        {
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "name": "mbl-wizard",
                "iconUrl": 'https://github.com/modern-hobbyist/mbl-wizard/blob/master/src/media/mbl-wizard.ico',
                "setupIcon": './src/media/mbl-wizard.ico'
            }
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {
                "options": {
                    "icon": './src/media/mbl-wizard.png'
                }
            }
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {
                "options": {
                    "icon": './src/media/mbl-wizard.png'
                }
            }
        },
        {
            "name": "@electron-forge/maker-dmg",
            "config": {
                "format": "ULFO",
                "options": {
                    "icon": './src/media/mbl-wizard'
                }
            },
            "platforms": [
                "darwin"
            ]
        }
    ],
    "plugins": [
        {
            "name": "@electron-forge/plugin-webpack",
            "config": {
                "mainConfig": "./webpack.main.config.js",
                "renderer": {
                    "config": "./webpack.renderer.config.js",
                    "entryPoints": [
                        {
                            "html": "./src/index.html",
                            "js": "./src/renderer/renderer.ts",
                            "name": "main_window",
                            "preload": {
                                "js": "./src/preload/preload.ts"
                            }
                        }
                    ]
                },
                "port": 3000,
                "loggerPort": 9000
            }
        }
    ]
}