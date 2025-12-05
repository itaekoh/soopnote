// ============================================
// Soopnote Database Types
// ============================================

export type UserRole = 'super_admin' | 'writer' | 'user';
export type PostStatus = 'draft' | 'published' | 'archived';
export type CategoryType = 'menu' | 'attribute';

// 사용자 프로필
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// 카테고리 (계층형)
export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  type: CategoryType;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 카테고리 계층 구조 (부모 정보 포함)
export interface CategoryWithParent extends Category {
  parent_name?: string;
  parent_slug?: string;
}

// 게시글
export interface Post {
  id: number;
  author_id: string;
  category_id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published_date: string;
  featured_image_url: string | null;
  location: string | null;
  read_time: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  status: PostStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// 게시글 전체 정보 (작성자, 카테고리 포함)
export interface PostFull extends Post {
  author_name: string | null;
  author_avatar: string | null;
  category_name: string;
  category_slug: string;
  subcategory_ids: number[] | null;
  subcategory_names: string[] | null;
}

// 게시글-카테고리 매핑
export interface PostCategory {
  id: number;
  post_id: number;
  category_id: number;
  created_at: string;
}

// 댓글
export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  parent_id: number | null;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// 댓글 (사용자 정보 포함)
export interface CommentWithUser extends Comment {
  user: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

// 좋아요
export interface Like {
  id: number;
  post_id: number;
  user_id: string;
  created_at: string;
}

// 이미지
export interface Image {
  id: number;
  post_id: number | null;
  user_id: string;
  storage_path: string;
  url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: string;
}

// ============================================
// API Request/Response Types
// ============================================

// 게시글 생성 요청
export interface CreatePostRequest {
  title: string;
  excerpt: string;
  content: string;
  category_id: number;
  published_date: string;
  location?: string;
  read_time?: string;
  featured_image_url?: string;
  subcategory_ids?: number[];
  status?: PostStatus;
}

// 게시글 업데이트 요청
export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: number;
}

// 댓글 생성 요청
export interface CreateCommentRequest {
  post_id: number;
  content: string;
  parent_id?: number;
}

// 페이지네이션
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 필터 옵션
export interface PostFilterParams extends Partial<PaginationParams> {
  category_id?: number;
  subcategory_ids?: number[];
  status?: PostStatus;
  search?: string;
  author_id?: string;
}
