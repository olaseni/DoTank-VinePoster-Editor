# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WordPress Gutenberg plugin called "Vine Poster Editor" that provides a custom content management system with block editor integration. The plugin registers a custom post type `managed_content` with specialized metadata fields and editor customizations.

## Development Commands

### Build & Development
- `npm run build` - Build production assets using WordPress scripts
- `npm run start` - Start development build with watch mode  
- `just build` - Alternative build command via Justfile
- `just build-dev` - Start development build via Justfile

### Development Server
- `just start` - Start local WordPress development server on port 8881 using wp-now
- `just start-and-watch` - Start both dev server and build watching simultaneously
- `just clean-start` - Clean install, build, and start
- `just stop` - Stop all running development processes

### Utilities
- `just clean` - Clean all dependencies and build artifacts
- `just install` - Clean install of dependencies
- `just logs` - View development logs (requires multitail or uses tail -f)
- `just clear-logs` - Clear all log files

### Git Integration
- `just git-push` - Push to git and update parent repo (triggers submodule update)

## Architecture

### WordPress Plugin Structure
- **Main Plugin File**: `plugin.php` - Contains `ContentManager` class that handles all plugin functionality
- **Custom Post Type**: `managed_content` with specialized Gutenberg integration
- **Meta Fields**: Authors (array of objects), target audience, content type, estimated read time
- **Frontend Editor Assets**: `assets/js/frontend-editor.js` (simple editor), `assets/css/frontend-editor.css`
- **Build Output**: `build/` directory (created by webpack)

### Key Components
- **ContentManager Class**: Handles post type registration, meta fields, REST API, and frontend editor
- **Simple Frontend Editor**: Clean, full-screen editor accessible via `?frontend-editor=1` query parameter
- **WordPress Integration**: Uses wp-now for local development, blueprint.json for configuration

### Development Environment
- **WordPress Playground**: Uses remote WordPress playground for testing
- **Blueprint Configuration**: `blueprint.json` configures the development environment
- **Process Management**: PIDs stored in `pid/` directory, logs in `logs/` directory

### Template System
- **Block Templates**: Predefined templates for different content types (article, video)
- **Template Lock**: Insert mode to prevent template modification
- **Custom Blocks**: Integration with Gutenberg editor for specialized content management

## File Structure Notes
- `src-wordpress/` contains a full WordPress installation for development
- `assets/js/frontend-editor.js` contains the simple frontend editor code
- `assets/css/frontend-editor.css` contains frontend editor styling
- `frontend-editor.php` contains the frontend editor template
- `build/` contains compiled assets (not committed to git)
- `justfile` provides development workflow automation
- `blueprint.json` configures the WordPress Playground environment and sets landing page to frontend editor

## Frontend Editor
The plugin includes a simple, clean frontend editor accessible by adding `?frontend-editor=1` to any URL. Features:
- Full-screen editing interface
- Title and content editing with contenteditable
- Clean WordPress-like styling
- Keyboard shortcuts (Ctrl+S to save)
- No complex dependencies or recursion issues