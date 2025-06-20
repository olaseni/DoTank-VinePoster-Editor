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
    public static function log(string ...$messages)
    {
        // Convert the entire messages array to string and log it
        error_log(PHP_EOL . 'ERROR_LOG:' . print_r($messages, true));
    }

    public function __construct()
    {
        add_action('init', [$this, 'register_post_type']);
        add_action('init', [$this, 'register_meta_fields']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        add_action('save_post_managed_content', [$this, 'calculate_read_time'], 10, 3);
        add_action('template_redirect', [$this, 'frontend_editor_redirect']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_editor_assets']);
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
        if (isset($_GET['frontend-editor']) && $_GET['frontend-editor'] === '1') {
            include plugin_dir_path(__FILE__) . 'frontend-editor.php';
            exit;
        }
    }

    public function enqueue_frontend_editor_assets()
    {
        if (isset($_GET['frontend-editor']) && $_GET['frontend-editor'] === '1') {
            // Enqueue our simple frontend editor script
            wp_enqueue_script(
                'frontend-editor',
                plugin_dir_url(__FILE__) . 'build/frontend-editor.js',
                [],
                '1.0.0',
                true
            );

            // Enqueue our custom styles
            wp_enqueue_style(
                'frontend-editor',
                plugin_dir_url(__FILE__) . 'assets/css/frontend-editor.css',
                [],
                '1.0.0'
            );

            // Localize script with REST API data
            wp_localize_script('frontend-editor', 'frontendEditor', [
                'restUrl' => rest_url(),
                'nonce' => wp_create_nonce('wp_rest'),
                'templates' => $this->get_content_templates()
            ]);
        }
    }
}

// Initialize the plugin
new ContentManager();
