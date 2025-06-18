export interface Author {
  readonly id: string;
  name: string;
  title: string;
  company: string;
}

export interface ContentMeta {
  content_authors: Author[];
  target_audience: string;
  content_type: 'article' | 'video';
  estimated_read_time: number;
}

export interface WPSelect {
  (storeName: string): any;
}

export interface WPDispatch {
  (storeName: string): any;
}