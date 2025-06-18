import { useState, useEffect } from '@wordpress/element';
import { apiFetch } from '@wordpress/api-fetch';
import type { Author } from '@types';

export const useAuthors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchAuthors = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiFetch({ 
        path: '/content-manager/v1/authors' 
      }) as Author[];
      setAuthors(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch authors');
    } finally {
      setLoading(false);
    }
  };
  
  const saveAuthor = async (author: Omit<Author, 'id'>): Promise<void> => {
    try {
      await apiFetch({
        path: '/content-manager/v1/authors',
        method: 'POST',
        data: author,
      });
      await fetchAuthors(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save author');
    }
  };
  
  useEffect(() => {
    fetchAuthors();
  }, []);
  
  return { authors, loading, error, saveAuthor, refetch: fetchAuthors } as const;
};