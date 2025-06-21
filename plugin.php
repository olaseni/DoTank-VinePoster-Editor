<?php

/**
 * Plugin Name: Vine Poster Editor
 * Description: Custom content management system with Gutenberg integration
 * Version: 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ContentManager
{
    private bool $isFrontendEditorEnabled = false;

    public static function log(string ...$messages)
    {
        // Convert the entire messages array to string and log it
        error_log(PHP_EOL . 'ERROR_LOG:' . print_r($messages, true));
    }

    public function __construct()
    {
        $this->isFrontendEditorEnabled = ($_GET['frontend-editor'] ?? '') === '1';
        add_action('init', [$this, 'register_post_type']);
        add_action('init', [$this, 'register_meta_fields']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        add_action('save_post_managed_content', [$this, 'calculate_read_time'], 10, 3);
        add_action('template_redirect', [$this, 'frontend_editor_redirect']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_editor_assets']);
        add_action('wp_print_scripts', [$this, 'debug_enqueued_scripts']);
        add_action('wp_ajax_nopriv_save_post_content', [$this, 'ajax_save_post_content']);
        add_action('wp_ajax_save_post_content', [$this, 'ajax_save_post_content']);
        add_action('wp_ajax_nopriv_publish_post_content', [$this, 'ajax_publish_post_content']);
        add_action('wp_ajax_publish_post_content', [$this, 'ajax_publish_post_content']);
        add_filter('upload_mimes', [$this, 'allow_upload_mimes']);
        add_filter('map_meta_cap', [$this, 'grant_frontend_editor_caps'], 10, 4);
        
        // Grant capabilities for all media/REST API requests when frontend editor is detected
        if ($this->isFrontendEditorEnabled || $this->is_frontend_editor_ajax()) {
            add_filter('user_has_cap', [$this, 'grant_temporary_caps'], 10, 3);
        }
    }

    public function register_post_type()
    {
        register_post_type('managed_content', [
            'labels' => [
                'name' => 'Content Manager',
                'singular_name' => 'Content',
                'add_new' => 'Create Post Type',
                'add_new_item' => 'Add New Content',
                'edit_item' => 'Edit Content',
            ],
            'public' => true,
            'show_in_rest' => true,
            'show_in_menu' => true,
            'supports' => ['title', 'editor', 'custom-fields', 'revisions'],
            'menu_icon' => 'dashicons-edit-page',
            'template' => [
                ['core/paragraph', [
                    'placeholder' => 'A short description'
                ]],
                [
                    'core/columns',
                    [],
                    [
                        ['core/column', [], [['core/paragraph', ['placeholder' => 'This content fits in a column 1']]]],
                        ['core/column', [], [['core/paragraph', ['placeholder' => 'This content fits in a column 2']]]],
                    ]
                ],
                ['core/image', ['placeholder' => 'Featured Image']],
            ],
            'template_lock' => 'insert',
        ]);
    }

    public function register_meta_fields()
    {

        $meta_fields = [
            'content_authors' => ['type' => 'array', 'default' => []],
            'target_audience' => ['type' => 'string', 'default' => 'group1'],
            'content_type' => ['type' => 'string', 'default' => 'article'],
            'estimated_read_time' => ['type' => 'number', 'default' => 10],
        ];

        /*
        foreach ($meta_fields as $key => $args) {
            register_meta('post', $key, array_merge([
                'show_in_rest' => true,
                'single' => true,
            ], $args));
        }     */

        // Authors meta field
        register_post_meta('managed_content', 'content_authors', [
            'show_in_rest' => [
                'schema' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'name' => ['type' => 'string'],
                            'job_title' => ['type' => 'string'],
                            'company' => ['type' => 'string'],
                        ]
                    ]
                ]
            ],
            'single' => true,
            'type' => 'array',
            'default' => [],
        ]);

        // Target audience
        register_post_meta('managed_content', 'target_audience', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'default' => 'Group 1',
        ]);

        // Content type
        register_post_meta('managed_content', 'content_type', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'default' => 'Article',
        ]);

        // Estimated read time
        register_post_meta('managed_content', 'estimated_read_time', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'number',
            'default' => 10,
        ]);
    }


    public function register_rest_routes()
    {
        register_rest_route('content-manager/v1', '/templates', [
            'methods' => 'GET',
            'callback' => [$this, 'get_content_templates'],
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ]);
    }

    public function get_content_templates()
    {
        return [
            'article' => [
                'name' => 'Article',
                'template' => [
                    ['core/heading', ['level' => 1, 'placeholder' => 'Article Title']],
                    ['core/paragraph', ['placeholder' => 'Brief description...']],
                    ['core/columns'],
                    ['core/paragraph', ['placeholder' => 'Main content...']],
                ]
            ],
            'video' => [
                'name' => 'Video',
                'template' => [
                    ['core/heading', ['level' => 1, 'placeholder' => 'Video Title']],
                    ['core/video'],
                    ['core/paragraph', ['placeholder' => 'Video description...']],
                ]
            ]
        ];
    }

    public function calculate_read_time($post_id, $post, $update)
    {
        $content = get_post_field('post_content', $post_id);
        $word_count = str_word_count(strip_tags($content));
        $read_time = ceil($word_count / 200); // 200 words per minute
        update_post_meta($post_id, 'estimated_read_time', $read_time);

        self::log($post_id, $content, $word_count, $read_time);
    }

    public function frontend_editor_redirect()
    {
        if ($this->isFrontendEditorEnabled) {
            // Temporarily grant admin capabilities for frontend editor
            add_filter('user_has_cap', [$this, 'grant_temporary_caps'], 10, 3);
            include plugin_dir_path(__FILE__) . 'frontend-editor.php';
            exit;
        }
    }

    public function enqueue_frontend_editor_assets()
    {
        // Log every time this function runs
        error_log('enqueue_frontend_editor_assets called with GET: ' . print_r($_GET, true));

        if (! $this->isFrontendEditorEnabled) {
            error_log('Frontend editor NOT detected');
            return;
        }

        error_log('Frontend editor detected, starting enqueue process');

        // Use the auto-generated asset file for dependencies
        $asset_file = plugin_dir_path(__FILE__) . 'build/index.asset.php';
        $asset = file_exists($asset_file) ? include $asset_file : ['dependencies' => [], 'version' => '1.0.0'];

        error_log('Asset file exists: ' . (file_exists($asset_file) ? 'YES' : 'NO'));
        error_log('Asset data: ' . print_r($asset, true));

        $script_enqueued = wp_enqueue_script(
            'frontend-editor',
            plugin_dir_url(__FILE__) . 'build/index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        error_log('Script enqueue result: ' . ($script_enqueued ? 'SUCCESS' : 'FAILED'));
        error_log('Script URL: ' . plugin_dir_url(__FILE__) . 'build/index.js');

        // Enqueue our custom styles
        $style_enqueued = wp_enqueue_style(
            'frontend-editor',
            plugin_dir_url(__FILE__) . 'build/style-index.css',
            ['wp-edit-post', 'wp-block-editor', 'wp-components'],
            $asset['version']
        );

        error_log('Style enqueue result: ' . ($style_enqueued ? 'SUCCESS' : 'FAILED'));

        // Localize script with REST API data
        wp_localize_script('frontend-editor', 'frontendEditorData', [
            'restUrl' => rest_url(),
            'homeUrl' => home_url(),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'postData' => [],
            'nonce' => wp_create_nonce('wp_rest'),
            'templates' => $this->get_content_templates()
        ]);

        error_log('Localization completed');
    }

    public function debug_enqueued_scripts()
    {
        if ($this->isFrontendEditorEnabled) {
            global $wp_scripts;
            error_log('=== DEBUG ENQUEUED SCRIPTS ===');
            error_log('Enqueued scripts: ' . print_r($wp_scripts->queue, true));
            error_log('Is frontend-editor enqueued? ' . (wp_script_is('frontend-editor', 'enqueued') ? 'YES' : 'NO'));
            error_log('Is frontend-editor registered? ' . (wp_script_is('frontend-editor', 'registered') ? 'YES' : 'NO'));
        }
    }

    public function ajax_save_post_content()
    {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'wp_rest')) {
            wp_die(json_encode(['success' => false, 'data' => ['message' => 'Invalid nonce']]));
        }

        $post_id = intval($_POST['post_id']);
        $title = sanitize_text_field($_POST['title']);
        $content = wp_kses_post($_POST['content']);
        $excerpt = sanitize_textarea_field($_POST['excerpt']);

        $post_data = [
            'post_title' => $title,
            'post_content' => $content,
            'post_excerpt' => $excerpt,
            'post_type' => 'managed_content',
            'post_status' => 'draft'
        ];

        if ($post_id > 0) {
            $post_data['ID'] = $post_id;
            $result = wp_update_post($post_data);
        } else {
            $result = wp_insert_post($post_data);
        }

        if (is_wp_error($result)) {
            wp_die(json_encode(['success' => false, 'data' => ['message' => $result->get_error_message()]]));
        }

        wp_die(json_encode([
            'success' => true, 
            'data' => [
                'message' => 'Post saved successfully',
                'post_id' => $result
            ]
        ]));
    }

    public function ajax_publish_post_content()
    {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'wp_rest')) {
            wp_die(json_encode(['success' => false, 'data' => ['message' => 'Invalid nonce']]));
        }

        $post_id = intval($_POST['post_id']);
        $title = sanitize_text_field($_POST['title']);
        $content = wp_kses_post($_POST['content']);
        $excerpt = sanitize_textarea_field($_POST['excerpt']);

        $post_data = [
            'post_title' => $title,
            'post_content' => $content,
            'post_excerpt' => $excerpt,
            'post_type' => 'managed_content',
            'post_status' => 'publish'
        ];

        if ($post_id > 0) {
            $post_data['ID'] = $post_id;
            $result = wp_update_post($post_data);
        } else {
            $result = wp_insert_post($post_data);
        }

        if (is_wp_error($result)) {
            wp_die(json_encode(['success' => false, 'data' => ['message' => $result->get_error_message()]]));
        }

        $post_url = get_permalink($result);

        wp_die(json_encode([
            'success' => true, 
            'data' => [
                'message' => 'Post published successfully',
                'post_id' => $result,
                'post_url' => $post_url
            ]
        ]));
    }

    public function allow_upload_mimes($mimes)
    {
        if ($this->isFrontendEditorEnabled) {
            // Allow common image types
            $mimes['jpg|jpeg|jpe'] = 'image/jpeg';
            $mimes['gif'] = 'image/gif';
            $mimes['png'] = 'image/png';
            $mimes['webp'] = 'image/webp';
        }
        return $mimes;
    }

    public function grant_frontend_editor_caps($caps, $cap, $user_id, $args)
    {
        if ($this->isFrontendEditorEnabled) {
            // Grant media upload capabilities for frontend editor
            if (in_array($cap, ['upload_files', 'edit_posts', 'publish_posts'])) {
                return ['exist']; // Minimal capability that everyone has
            }
        }
        return $caps;
    }

    public function is_frontend_editor_ajax()
    {
        return (defined('DOING_AJAX') && DOING_AJAX && 
                (isset($_POST['action']) && in_array($_POST['action'], ['save_post_content', 'publish_post_content']))) ||
               (wp_doing_ajax() && isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], 'frontend-editor=1') !== false);
    }

    public function grant_temporary_caps($allcaps, $caps, $args)
    {
        // Grant essential capabilities for frontend editing
        $editor_caps = [
            'upload_files',
            'edit_posts',
            'edit_others_posts',
            'publish_posts',
            'read',
            'edit_files',
            'manage_options', // For media library access
            'unfiltered_html'
        ];

        foreach ($editor_caps as $cap) {
            $allcaps[$cap] = true;
        }

        return $allcaps;
    }
}

// Initialize the plugin
new ContentManager();
