<?php

class Utilities
{
    /**
     * Combine style.css and editor.css files in a directory tree
     * (excluding *.min.css and *-rtl.css) into a single file.
     *
     * @param string $baseDir   Base directory to search in
     * @param string $outputFile Output file path
     */
    public static function combineBlockStyles(string $baseDir, string $outputFile): void
    {
        $styleFiles = [];
        $editorFiles = [];

        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($baseDir));

        foreach ($iterator as $file) {
            if (!$file->isFile()) continue;

            $filename = $file->getFilename();
            $filepath = $file->getPathname();

            // Skip .min.css and -rtl.css
            if (preg_match('/(\.min\.css$|-rtl\.css$)/i', $filename)) {
                continue;
            }

            // Collect style.css and editor.css
            if (strcasecmp($filename, 'style.css') === 0) {
                $styleFiles[] = $filepath;
            } elseif (strcasecmp($filename, 'editor.css') === 0) {
                $editorFiles[] = $filepath;
            }
        }

        // Merge content
        $combinedCss = '';

        foreach ($styleFiles as $file) {
            $combinedCss .= "/* " . $file . " */\n" . file_get_contents($file) . "\n\n";
        }

        foreach ($editorFiles as $file) {
            $combinedCss .= "/* " . $file . " */\n" . file_get_contents($file) . "\n\n";
        }

        // Write to output
        file_put_contents($outputFile, $combinedCss);

        echo "✅ Combined CSS written to: $outputFile\n";
    }
}