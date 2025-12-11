// Google Tag Manager 타입 정의

export interface GTMEvent {
  event: string;
  [key: string]: any;
}

export interface ViewPostEvent extends GTMEvent {
  event: 'view_post';
  post_id: number;
  post_title: string;
  category: string;
  subcategories?: string[];
}

export interface LikePostEvent extends GTMEvent {
  event: 'like_post';
  post_id: number;
  post_title: string;
  action: 'add' | 'remove';
}

export interface SharePostEvent extends GTMEvent {
  event: 'share_post';
  post_id: number;
  post_title: string;
  share_method: 'link' | 'kakao' | 'twitter' | 'facebook';
}

export interface SubmitCommentEvent extends GTMEvent {
  event: 'submit_comment';
  post_id: number;
  comment_length: number;
}

export interface SearchEvent extends GTMEvent {
  event: 'search';
  search_query: string;
  category?: string;
}

export interface FilterEvent extends GTMEvent {
  event: 'filter_subcategory';
  category: string;
  subcategory: string;
}

// Window 객체에 dataLayer 추가
declare global {
  interface Window {
    dataLayer: GTMEvent[];
  }
}

// GTM 유틸리티 함수
export const pushToDataLayer = (event: GTMEvent) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }
};
