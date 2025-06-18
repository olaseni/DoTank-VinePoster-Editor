import { useSelect, useDispatch } from '@wordpress/data';
import type { ContentMeta } from '@types';

export const useMeta = () => {
  const meta = useSelect((select: any) => 
    select('core/editor').getEditedPostAttribute('meta') as ContentMeta || {}
  );
  
  const { editPost } = useDispatch('core/editor') as any;
  
  const updateMeta = <K extends keyof ContentMeta>(
    key: K, 
    value: ContentMeta[K]
  ): void => {
    editPost({ meta: { [key]: value } });
  };
  
  return { meta, updateMeta } as const;
};