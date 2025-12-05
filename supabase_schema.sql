-- ============================================
-- Soopnote Database Schema
-- ============================================
-- 접두어: sn_ (soopnote)
-- Supabase Auth 사용 (auth.users)
-- ============================================

-- 1. 사용자 프로필 및 권한 테이블
CREATE TABLE IF NOT EXISTS sn_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'writer', 'user')),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 프로필 인덱스
CREATE INDEX idx_sn_users_role ON sn_users(role);
CREATE INDEX idx_sn_users_email ON sn_users(email);

-- 사용자 프로필 업데이트 트리거
CREATE OR REPLACE FUNCTION update_sn_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sn_users_updated_at
    BEFORE UPDATE ON sn_users
    FOR EACH ROW
    EXECUTE FUNCTION update_sn_users_updated_at();

-- ============================================
-- 2. 카테고리 테이블 (계층형 구조)
-- ============================================
CREATE TABLE IF NOT EXISTS sn_categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES sn_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT CHECK (type IN ('menu', 'attribute')), -- menu: 상위 카테고리, attribute: 속성(서브카테고리)
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 인덱스
CREATE INDEX idx_sn_categories_parent_id ON sn_categories(parent_id);
CREATE INDEX idx_sn_categories_slug ON sn_categories(slug);
CREATE INDEX idx_sn_categories_type ON sn_categories(type);

-- 카테고리 업데이트 트리거
CREATE TRIGGER trigger_update_sn_categories_updated_at
    BEFORE UPDATE ON sn_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_sn_users_updated_at();

-- ============================================
-- 3. 게시글 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS sn_posts (
    id SERIAL PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES sn_users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES sn_categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- 이미지
    featured_image_url TEXT,

    -- 공통 메타데이터
    location TEXT, -- 야생화 일지, 나무진단에서 사용
    read_time TEXT, -- 칼럼에서 사용 (예: "5분")

    -- 조회수 및 상호작용
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,

    -- 게시 상태
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT FALSE,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 게시글 인덱스
CREATE INDEX idx_sn_posts_author_id ON sn_posts(author_id);
CREATE INDEX idx_sn_posts_category_id ON sn_posts(category_id);
CREATE INDEX idx_sn_posts_slug ON sn_posts(slug);
CREATE INDEX idx_sn_posts_status ON sn_posts(status);
CREATE INDEX idx_sn_posts_published_date ON sn_posts(published_date DESC);
CREATE INDEX idx_sn_posts_created_at ON sn_posts(created_at DESC);

-- 게시글 업데이트 트리거
CREATE TRIGGER trigger_update_sn_posts_updated_at
    BEFORE UPDATE ON sn_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_sn_users_updated_at();

-- ============================================
-- 4. 게시글-카테고리 매핑 테이블 (다대다)
-- ============================================
-- 게시글에 여러 속성(서브카테고리) 연결
CREATE TABLE IF NOT EXISTS sn_post_categories (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES sn_posts(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES sn_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, category_id)
);

-- 게시글-카테고리 매핑 인덱스
CREATE INDEX idx_sn_post_categories_post_id ON sn_post_categories(post_id);
CREATE INDEX idx_sn_post_categories_category_id ON sn_post_categories(category_id);

-- ============================================
-- 5. 댓글 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS sn_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES sn_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES sn_users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES sn_comments(id) ON DELETE CASCADE, -- 대댓글 지원
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 인덱스
CREATE INDEX idx_sn_comments_post_id ON sn_comments(post_id);
CREATE INDEX idx_sn_comments_user_id ON sn_comments(user_id);
CREATE INDEX idx_sn_comments_parent_id ON sn_comments(parent_id);
CREATE INDEX idx_sn_comments_created_at ON sn_comments(created_at DESC);

-- 댓글 업데이트 트리거
CREATE TRIGGER trigger_update_sn_comments_updated_at
    BEFORE UPDATE ON sn_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_sn_users_updated_at();

-- ============================================
-- 6. 좋아요 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS sn_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES sn_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES sn_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 좋아요 인덱스
CREATE INDEX idx_sn_likes_post_id ON sn_likes(post_id);
CREATE INDEX idx_sn_likes_user_id ON sn_likes(user_id);

-- ============================================
-- 7. 이미지 테이블 (선택적)
-- ============================================
CREATE TABLE IF NOT EXISTS sn_images (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES sn_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES sn_users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- Supabase Storage 경로
    url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER, -- bytes
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이미지 인덱스
CREATE INDEX idx_sn_images_post_id ON sn_images(post_id);
CREATE INDEX idx_sn_images_user_id ON sn_images(user_id);

-- ============================================
-- 트리거: 댓글 수 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE sn_posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE sn_posts
        SET comment_count = GREATEST(0, comment_count - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comment_count_insert
    AFTER INSERT ON sn_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_count();

CREATE TRIGGER trigger_update_post_comment_count_delete
    AFTER DELETE ON sn_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_count();

-- ============================================
-- 트리거: 좋아요 수 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE sn_posts
        SET like_count = like_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE sn_posts
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_like_count_insert
    AFTER INSERT ON sn_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_like_count();

CREATE TRIGGER trigger_update_post_like_count_delete
    AFTER DELETE ON sn_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_like_count();

-- ============================================
-- 초기 데이터: 카테고리 (메뉴 및 속성)
-- ============================================

-- 상위 카테고리 (메뉴) - slug가 없으면 추가
DO $$
BEGIN
    -- 야생화 일지
    IF NOT EXISTS (SELECT 1 FROM sn_categories WHERE slug = 'wildflower') THEN
        INSERT INTO sn_categories (parent_id, name, slug, type, display_order, description)
        VALUES (NULL, '야생화 일지', 'wildflower', 'menu', 1, '야생화 관찰 기록');
    END IF;

    -- 나무진단
    IF NOT EXISTS (SELECT 1 FROM sn_categories WHERE slug = 'tree-diagnose') THEN
        INSERT INTO sn_categories (parent_id, name, slug, type, display_order, description)
        VALUES (NULL, '나무진단', 'tree-diagnose', 'menu', 2, '나무의사의 전문 진단 기록');
    END IF;

    -- 칼럼
    IF NOT EXISTS (SELECT 1 FROM sn_categories WHERE slug = 'column') THEN
        INSERT INTO sn_categories (parent_id, name, slug, type, display_order, description)
        VALUES (NULL, '칼럼', 'column', 'menu', 3, '환경 및 자연 관련 칼럼');
    END IF;
END $$;

-- 야생화 일지 속성 (지역별)
DO $$
DECLARE
    wildflower_id INTEGER;
BEGIN
    SELECT id INTO wildflower_id FROM sn_categories WHERE slug = 'wildflower';

    INSERT INTO sn_categories (parent_id, name, slug, type, display_order) VALUES
    (wildflower_id, '서울', 'wildflower-seoul', 'attribute', 1),
    (wildflower_id, '경기', 'wildflower-gyeonggi', 'attribute', 2),
    (wildflower_id, '강원', 'wildflower-gangwon', 'attribute', 3),
    (wildflower_id, '충청', 'wildflower-chungcheong', 'attribute', 4),
    (wildflower_id, '전라', 'wildflower-jeolla', 'attribute', 5),
    (wildflower_id, '경상', 'wildflower-gyeongsang', 'attribute', 6),
    (wildflower_id, '제주', 'wildflower-jeju', 'attribute', 7)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- 야생화 일지 속성 (월별)
DO $$
DECLARE
    wildflower_id INTEGER;
BEGIN
    SELECT id INTO wildflower_id FROM sn_categories WHERE slug = 'wildflower';

    INSERT INTO sn_categories (parent_id, name, slug, type, display_order) VALUES
    (wildflower_id, '1월', 'wildflower-jan', 'attribute', 11),
    (wildflower_id, '2월', 'wildflower-feb', 'attribute', 12),
    (wildflower_id, '3월', 'wildflower-mar', 'attribute', 13),
    (wildflower_id, '4월', 'wildflower-apr', 'attribute', 14),
    (wildflower_id, '5월', 'wildflower-may', 'attribute', 15),
    (wildflower_id, '6월', 'wildflower-jun', 'attribute', 16),
    (wildflower_id, '7월', 'wildflower-jul', 'attribute', 17),
    (wildflower_id, '8월', 'wildflower-aug', 'attribute', 18),
    (wildflower_id, '9월', 'wildflower-sep', 'attribute', 19),
    (wildflower_id, '10월', 'wildflower-oct', 'attribute', 20),
    (wildflower_id, '11월', 'wildflower-nov', 'attribute', 21),
    (wildflower_id, '12월', 'wildflower-dec', 'attribute', 22)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- 나무진단 속성 (수종)
DO $$
DECLARE
    tree_diagnose_id INTEGER;
BEGIN
    SELECT id INTO tree_diagnose_id FROM sn_categories WHERE slug = 'tree-diagnose';

    INSERT INTO sn_categories (parent_id, name, slug, type, display_order) VALUES
    (tree_diagnose_id, '소나무', 'tree-pine', 'attribute', 1),
    (tree_diagnose_id, '잣나무', 'tree-korean-pine', 'attribute', 2),
    (tree_diagnose_id, '느티나무', 'tree-zelkova', 'attribute', 3),
    (tree_diagnose_id, '은행나무', 'tree-ginkgo', 'attribute', 4),
    (tree_diagnose_id, '벚나무', 'tree-cherry', 'attribute', 5),
    (tree_diagnose_id, '단풍나무', 'tree-maple', 'attribute', 6),
    (tree_diagnose_id, '회화나무', 'tree-scholar', 'attribute', 7),
    (tree_diagnose_id, '기타수종', 'tree-other', 'attribute', 8)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- 나무진단 속성 (병해충)
DO $$
DECLARE
    tree_diagnose_id INTEGER;
BEGIN
    SELECT id INTO tree_diagnose_id FROM sn_categories WHERE slug = 'tree-diagnose';

    INSERT INTO sn_categories (parent_id, name, slug, type, display_order) VALUES
    (tree_diagnose_id, '병해충 없음', 'pest-none', 'attribute', 11),
    (tree_diagnose_id, '소나무재선충', 'pest-pinewood-nematode', 'attribute', 12),
    (tree_diagnose_id, '미국선녀벌레', 'pest-flatid-planthopper', 'attribute', 13),
    (tree_diagnose_id, '갈색날개매미충', 'pest-brown-marmorated-stink-bug', 'attribute', 14),
    (tree_diagnose_id, '탄저병', 'pest-anthracnose', 'attribute', 15),
    (tree_diagnose_id, '흰가루병', 'pest-powdery-mildew', 'attribute', 16),
    (tree_diagnose_id, '기타병해충', 'pest-other', 'attribute', 17)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- 나무진단 속성 (장비)
DO $$
DECLARE
    tree_diagnose_id INTEGER;
BEGIN
    SELECT id INTO tree_diagnose_id FROM sn_categories WHERE slug = 'tree-diagnose';

    INSERT INTO sn_categories (parent_id, name, slug, type, display_order) VALUES
    (tree_diagnose_id, '저항측정기', 'equipment-resistograph', 'attribute', 21),
    (tree_diagnose_id, '초음파진단기', 'equipment-ultrasonic', 'attribute', 22),
    (tree_diagnose_id, '토양분석기', 'equipment-soil-analyzer', 'attribute', 23),
    (tree_diagnose_id, '내시경', 'equipment-endoscope', 'attribute', 24),
    (tree_diagnose_id, '드론', 'equipment-drone', 'attribute', 25),
    (tree_diagnose_id, '기타장비', 'equipment-other', 'attribute', 26)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- 나무진단 속성 (상태)
DO $$
DECLARE
    tree_diagnose_id INTEGER;
BEGIN
    SELECT id INTO tree_diagnose_id FROM sn_categories WHERE slug = 'tree-diagnose';

    INSERT INTO sn_categories (parent_id, name, slug, type, display_order) VALUES
    (tree_diagnose_id, '양호', 'status-good', 'attribute', 31),
    (tree_diagnose_id, '치료중', 'status-treating', 'attribute', 32),
    (tree_diagnose_id, '치료완료', 'status-treated', 'attribute', 33),
    (tree_diagnose_id, '위험', 'status-danger', 'attribute', 34)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- 칼럼 속성 (서브카테고리)
DO $$
DECLARE
    column_id INTEGER;
BEGIN
    SELECT id INTO column_id FROM sn_categories WHERE slug = 'column';

    INSERT INTO sn_categories (parent_id, name, slug, type, display_order) VALUES
    (column_id, '정책', 'column-policy', 'attribute', 1),
    (column_id, '나무의사 이야기', 'column-doctor-story', 'attribute', 2),
    (column_id, '도시숲', 'column-urban-forest', 'attribute', 3),
    (column_id, '환경', 'column-environment', 'attribute', 4),
    (column_id, '일상', 'column-daily', 'attribute', 5),
    (column_id, '건강', 'column-health', 'attribute', 6),
    (column_id, '정원', 'column-garden', 'attribute', 7),
    (column_id, '직업', 'column-career', 'attribute', 8),
    (column_id, '기타', 'column-other', 'attribute', 9)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- ============================================
-- Row Level Security (RLS) 정책
-- ============================================

-- sn_users RLS 활성화
ALTER TABLE sn_users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 프로필을 볼 수 있음
CREATE POLICY "Users can view own profile"
    ON sn_users FOR SELECT
    USING (auth.uid() = id);

-- 사용자가 자신의 프로필을 업데이트할 수 있음
CREATE POLICY "Users can update own profile"
    ON sn_users FOR UPDATE
    USING (auth.uid() = id);

-- super_admin만 모든 사용자 정보를 볼 수 있음
CREATE POLICY "Super admins can view all users"
    ON sn_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sn_users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================
-- sn_posts RLS
-- ============================================
ALTER TABLE sn_posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 published 게시글을 볼 수 있음
CREATE POLICY "Anyone can view published posts"
    ON sn_posts FOR SELECT
    USING (status = 'published');

-- writer와 super_admin이 게시글을 생성할 수 있음
CREATE POLICY "Writers and admins can create posts"
    ON sn_posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sn_users
            WHERE id = auth.uid() AND role IN ('writer', 'super_admin')
        )
    );

-- 작성자가 자신의 게시글을 업데이트할 수 있음
CREATE POLICY "Authors can update own posts"
    ON sn_posts FOR UPDATE
    USING (author_id = auth.uid());

-- super_admin이 모든 게시글을 업데이트할 수 있음
CREATE POLICY "Super admins can update all posts"
    ON sn_posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sn_users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- 작성자가 자신의 게시글을 삭제할 수 있음
CREATE POLICY "Authors can delete own posts"
    ON sn_posts FOR DELETE
    USING (author_id = auth.uid());

-- super_admin이 모든 게시글을 삭제할 수 있음
CREATE POLICY "Super admins can delete all posts"
    ON sn_posts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sn_users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================
-- sn_categories RLS
-- ============================================
ALTER TABLE sn_categories ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 카테고리를 볼 수 있음
CREATE POLICY "Anyone can view categories"
    ON sn_categories FOR SELECT
    USING (true);

-- super_admin만 카테고리를 수정할 수 있음
CREATE POLICY "Super admins can manage categories"
    ON sn_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sn_users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================
-- sn_comments RLS
-- ============================================
ALTER TABLE sn_comments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 댓글을 볼 수 있음
CREATE POLICY "Anyone can view comments"
    ON sn_comments FOR SELECT
    USING (is_deleted = false);

-- 로그인한 사용자가 댓글을 작성할 수 있음
CREATE POLICY "Authenticated users can create comments"
    ON sn_comments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 작성자가 자신의 댓글을 업데이트/삭제할 수 있음
CREATE POLICY "Authors can update own comments"
    ON sn_comments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Authors can delete own comments"
    ON sn_comments FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- sn_likes RLS
-- ============================================
ALTER TABLE sn_likes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 좋아요를 볼 수 있음
CREATE POLICY "Anyone can view likes"
    ON sn_likes FOR SELECT
    USING (true);

-- 로그인한 사용자가 좋아요를 추가할 수 있음
CREATE POLICY "Authenticated users can like posts"
    ON sn_likes FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 사용자가 자신의 좋아요를 삭제할 수 있음
CREATE POLICY "Users can unlike posts"
    ON sn_likes FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- 유용한 뷰 (View)
-- ============================================

-- 게시글 전체 정보 뷰 (카테고리, 작성자 포함)
CREATE OR REPLACE VIEW sn_posts_full AS
SELECT
    p.*,
    u.display_name as author_name,
    u.avatar_url as author_avatar,
    c.name as category_name,
    c.slug as category_slug,
    ARRAY_AGG(DISTINCT pc_sub.category_id) FILTER (WHERE pc_sub.category_id IS NOT NULL) as subcategory_ids,
    ARRAY_AGG(DISTINCT c_sub.name) FILTER (WHERE c_sub.name IS NOT NULL) as subcategory_names
FROM sn_posts p
LEFT JOIN sn_users u ON p.author_id = u.id
LEFT JOIN sn_categories c ON p.category_id = c.id
LEFT JOIN sn_post_categories pc_sub ON p.id = pc_sub.post_id
LEFT JOIN sn_categories c_sub ON pc_sub.category_id = c_sub.id AND c_sub.type = 'attribute'
GROUP BY p.id, u.display_name, u.avatar_url, c.name, c.slug;

-- 카테고리 계층 뷰
CREATE OR REPLACE VIEW sn_categories_hierarchy AS
SELECT
    c.*,
    parent.name as parent_name,
    parent.slug as parent_slug
FROM sn_categories c
LEFT JOIN sn_categories parent ON c.parent_id = parent.id;

-- ============================================
-- 완료 메시지
-- ============================================
COMMENT ON TABLE sn_users IS 'Soopnote 사용자 프로필 및 권한 (super_admin, writer, user)';
COMMENT ON TABLE sn_categories IS 'Soopnote 카테고리 (계층형 구조 - 메뉴 및 속성)';
COMMENT ON TABLE sn_posts IS 'Soopnote 게시글';
COMMENT ON TABLE sn_post_categories IS 'Soopnote 게시글-카테고리 매핑 (다대다)';
COMMENT ON TABLE sn_comments IS 'Soopnote 댓글';
COMMENT ON TABLE sn_likes IS 'Soopnote 좋아요';
COMMENT ON TABLE sn_images IS 'Soopnote 이미지';
