module.exports = {
    "packagerConfig": {},
    "makers": [
        {
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "name": "mbl-wizard"
            }
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {}
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {}
        },
        {
            "name": "@electron-forge/maker-dmg",
            "config": {
                "format": "ULFO"
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
                                "js": "./src/preload.ts"
                            }
                        }
                    ]
                },
                "port": 3001,
                "loggerPort": 9001
            }
        }
    ]
}