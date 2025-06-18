import { registerPlugin } from '@wordpress/plugins';
import { ContentSettings } from '@components/ContentSettings';
import '@/styles/editor.css';

registerPlugin('content-manager', {
  render: ContentSettings,
});
