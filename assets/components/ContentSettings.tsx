import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { PanelBody, SelectControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useMeta } from '@/hooks/useMeta';
import { AuthorModal } from './AuthorModal';
import type { ContentMeta } from '@types';

const CONTENT_TYPE_OPTIONS = [
  { label: 'Article', value: 'article' as const },
  { label: 'Video', value: 'video' as const },
] as const;

const AUDIENCE_OPTIONS = [
  { label: 'Group 1', value: 'group1' },
  { label: 'Group 2', value: 'group2' },
  { label: 'Group 3', value: 'group3' },
  { label: 'Group 4', value: 'group4' },
] as const;

export const ContentSettings: React.FC = () => {
  const [showAuthorModal, setShowAuthorModal] = useState<boolean>(false);
  const { meta, updateMeta } = useMeta();
  
  const handleContentTypeChange = (value: string): void => {
    updateMeta('content_type', value as ContentMeta['content_type']);
  };
  
  const handleAudienceChange = (value: string): void => {
    updateMeta('target_audience', value);
  };
  
  return (
    <PluginDocumentSettingPanel
      name="content-settings"
      title="Content Settings"
      className="content-manager-panel"
    >
      <PanelBody title="Content Type" initialOpen>
        <SelectControl
          value={meta.content_type ?? 'article'}
          options={CONTENT_TYPE_OPTIONS}
          onChange={handleContentTypeChange}
        />
      </PanelBody>
      
      <PanelBody title="Authors" initialOpen>
        <div className="authors-section">
          <Button 
            variant="secondary"
            onClick={() => setShowAuthorModal(true)}
          >
            Manage Authors ({meta.content_authors?.length ?? 0})
          </Button>
          
          {meta.content_authors?.length > 0 && (
            <div className="authors-list">
              {meta.content_authors.map((author, index) => (
                <div key={`${author.id}-${index}`} className="author-item">
                  <strong>{author.name}</strong>
                  {author.title && <span> - {author.title}</span>}
                  {author.company && <span> ({author.company})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </PanelBody>
      
      <PanelBody title="Target Audience" initialOpen>
        <SelectControl
          value={meta.target_audience ?? 'group1'}
          options={AUDIENCE_OPTIONS}
          onChange={handleAudienceChange}
        />
      </PanelBody>
      
      <PanelBody title="Reading Time">
        <div className="read-time">
          Estimated: {meta.estimated_read_time ?? 10} mins read
        </div>
      </PanelBody>
      
      {showAuthorModal && (
        <AuthorModal onClose={() => setShowAuthorModal(false)} />
      )}
    </PluginDocumentSettingPanel>
  );
};