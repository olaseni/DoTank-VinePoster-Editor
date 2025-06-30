const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const path = require('path');

// Add or adjust entries as needed
module.exports = {
    ...defaultConfig,
    entry: {
        // Spread the default entries (important for block detection and compatibility)
        ...defaultConfig.entry(),
        // Each of these SCSS files will output a separate CSS file in /build
        'style-views': path.resolve(process.cwd(), 'src/style-view.scss'),
        'style-blocks-combined': path.resolve(process.cwd(), 'src/style-blocks-combined.scss'),
        // 'editor': path.resolve(process.cwd(), 'src/editor.js'),
    },
    plugins: [
        ...defaultConfig.plugins,
        // Remove empty JS files after asset PHP files are generated
        new RemoveEmptyScriptsPlugin({
            stage: RemoveEmptyScriptsPlugin.STAGE_AFTER_PROCESS_PLUGINS,
        }),
    ],
};
