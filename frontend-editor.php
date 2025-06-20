<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Frontend Editor - <?php bloginfo('name'); ?></title>
    <?php wp_head(); ?>
</head>
<body class="block-editor-page">
    <div id="frontend-editor-app" class="edit-post-layout">
        <!-- Full-screen Gutenberg editor will be mounted here -->
    </div>
    <?php wp_footer(); ?>
</body>
</html>