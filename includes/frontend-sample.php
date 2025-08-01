<html>
	<head>
		<title>Plain Text Editor</title>
		<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
		<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
		<script src="../../build-browser/isolated-block-editor.js"></script>
		<link rel="stylesheet" href="../../build-browser/core.css" />
		<link rel="stylesheet" href="../../build-browser/isolated-block-editor.css" />
		<meta charset="UTF-8">

		<style>
			body {
				margin: 0;
				padding: 40px;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
				width: 80%;
				margin: 0 auto;
			}

			textarea {
				width: 100%;
			}

			.editor {
				min-height: 200px;
				width: 100%;
			}

			.block-editor-block-list__layout p {
				font-size: 22px;
			}

			.add-another {
				margin-top: 50px;
				padding: 1em;
				font-weight: 400;
				border-radius: 9999px;
				background-color: rgba(45,55,72,1);
				color: white;
			}

			.cloner {
				display: none;
			}
		</style>
	</head>

	<body>
		<h1>Gutenberg attached to a plain textarea</h1>
		<p>The textarea can be converted into a Gutenberg editor. Any existing content will be converted into blocks. Multiple editors can be added, with a seperate edit history for each.</p>

		<div class="editors">
			<div class="editor-container cloner">
				<p>
					<button onClick="toggleEditor( this );">Toggle Gutenberg</button>
				</p>
				<textarea rows="10"></textarea>
			</div>
			<div class="editor-container">
				<p>
					<button onClick="toggleEditor( this );">Toggle Gutenberg</button>
				</p>
				<textarea rows="10"></textarea>
			</div>
		</div>

		<button class="add-another" onClick="addEditor()">Add another editor</button>
	</body>

	<script>
		function toggleEditor( button ) {
			const textarea = button.parentNode.parentNode.querySelector( 'textarea' );

			if ( textarea.style.display === 'none' ) {
				wp.detachEditor( textarea );
			} else {
				wp.attachEditor( textarea );
			}
		}

		function addEditor() {
			const editor = document.querySelector( '.cloner' );
			const clone = editor.cloneNode( true );

			clone.classList.remove( 'cloner' );

			editor.parentNode.appendChild( clone );
		}
	</script>
</html>