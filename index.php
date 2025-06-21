<!DOCTYPE html>
<html>

<head>
    <title>WordPress Playground - Vine Poster</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        html,
        body,
        #wp-playground {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }

        #wp-playground {
            overflow: hidden;
        }
    </style>
</head>

<body>
    <iframe id="wp-playground"></iframe>
    <script type="module">
        import { startPlaygroundWeb } from 'https://playground.wordpress.net/client/index.js';
        const pluginZipURL = `https://333608b5aa.nxcli.io/vine-poster-editor/plugin.zip?_=${Date.now()}`;

        const client = await startPlaygroundWeb({
            iframe: document.getElementById('wp-playground'),
            remoteUrl: `https://playground.wordpress.net/remote.html`,
            blueprint: {
                landingPage: '/?frontend-editor=1',
                login: true,
                "plugins": [
                    "gutenberg",
                    pluginZipURL
                ],
                steps: [],
            },
        });
    </script>
</body>

</html>