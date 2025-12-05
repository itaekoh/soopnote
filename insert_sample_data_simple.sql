-- ============================================
-- 예제 컨텐츠 DB에 저장 (간단 버전)
-- ============================================

-- ============================================
-- 1. 첫 번째 사용자 자동 선택
-- ============================================
DO $$
DECLARE
    author_id UUID;
    author_name TEXT;
BEGIN
    -- sn_users에서 첫 번째 사용자 가져오기
    SELECT id, display_name INTO author_id, author_name
    FROM sn_users
    WHERE role IN ('writer', 'super_admin')
    ORDER BY created_at ASC
    LIMIT 1;

    IF author_id IS NULL THEN
        -- writer 권한이 없으면 첫 번째 사용자 가져오기
        SELECT id, display_name INTO author_id, author_name
        FROM sn_users
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    IF author_id IS NULL THEN
        RAISE EXCEPTION '사용자가 없습니다. 먼저 회원가입을 해주세요.';
    END IF;

    RAISE NOTICE '작성자: % (%)', author_name, author_id;

    -- 임시 테이블에 작성자 ID 저장
    CREATE TEMP TABLE IF NOT EXISTS temp_author (id UUID);
    DELETE FROM temp_author;
    INSERT INTO temp_author VALUES (author_id);
END $$;

-- ============================================
-- 2. 야생화 일지 예제 데이터 삽입
-- ============================================

DO $$
DECLARE
    wildflower_id INTEGER;
    author_id UUID;
BEGIN
    -- 카테고리 ID 조회
    SELECT id INTO wildflower_id FROM sn_categories WHERE slug = 'wildflower';
    -- 작성자 ID
    SELECT id INTO author_id FROM temp_author;

    RAISE NOTICE '야생화 일지 데이터 삽입 시작...';

    -- 1. 산책로에서 만난 작은 봄, 현호색의 연분홍 이야기
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at, is_featured
    ) VALUES (
        author_id,
        wildflower_id,
        '산책로에서 만난 작은 봄, 현호색의 연분홍 이야기',
        'wildflower-hyunhosaek-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '늦가을 산책로를 걷다가 우연히 발견한 작은 꽃들. 흙 위에 자리잡은 연분홍 빛깔의 현호색은 이 계절에 피어나는 수줍은 봄의 선물이었다.',
        '<p>늦가을 산책로를 걷다가 우연히 발견한 작은 꽃들. 흙 위에 자리잡은 연분홍 빛깔의 현호색은 이 계절에 피어나는 수줍은 봄의 선물이었다.</p>
<p>현호색은 미나리아재비과의 봄꽃인데, 겨울을 지나고 초봄에 피는 것으로 알려져 있다. 그런데 여름을 지나 가을이 깊어가는 이맘때 이렇게 아름다운 꽃을 만나다니. 온난화의 영향일까, 아니면 이곳의 미세한 환경 덕분일까.</p>
<div style="background: linear-gradient(to right, #f0fdf4, #d1fae5); padding: 24px; border-radius: 12px; border-left: 4px solid #059669; margin: 24px 0;">
<h3 style="color: #065f46; margin-bottom: 12px;">현호색 (Corydalis incisa)</h3>
<ul style="list-style: none; padding: 0;">
<li><strong>과명:</strong> 미나리아재비과</li>
<li><strong>개화기:</strong> 3월~5월 (이상 개화 사례 증가)</li>
<li><strong>서식지:</strong> 산림 가장자리, 숲 속 습기 있는 곳</li>
<li><strong>특징:</strong> 연분홍 꽃, 섬세한 엽맥, 작은 씨주머니</li>
</ul>
</div>',
        '2024-10-12',
        '강원도 강릉시',
        'published',
        NOW(),
        true
    );

    -- 2. 숲 속에 피어난 하얀 별, 노루귀를 만나다
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        wildflower_id,
        '숲 속에 피어난 하얀 별, 노루귀를 만나다',
        'wildflower-norugwi-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '이른 봄, 아직 눈이 녹지 않은 숲길에서 노루귀를 발견했다. 하얀 꽃잎이 마치 별처럼 빛나고 있었다.',
        '<p>이른 봄, 아직 눈이 녹지 않은 숲길에서 노루귀를 발견했다. 하얀 꽃잎이 마치 별처럼 빛나고 있었다.</p>
<p>노루귀는 이른 봄, 눈이 채 녹기도 전에 꽃을 피우는 용감한 야생화입니다. 이름은 잎의 모양이 노루의 귀를 닮았다고 해서 붙여졌다고 합니다.</p>
<p>아직 추운 날씨에도 불구하고 꿋꿋하게 피어있는 모습이 감동적이었습니다.</p>',
        '2024-09-28',
        '경기도 남양주시',
        'published',
        NOW()
    );

    -- 3. 계곡을 따라 피어난 노란 붓꽃의 향연
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        wildflower_id,
        '계곡을 따라 피어난 노란 붓꽃의 향연',
        'wildflower-butkkot-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '계곡물 소리를 따라 걷다 보니 노란 붓꽃이 군락을 이루고 있었다. 햇살에 반짝이는 꽃잎이 아름다웠다.',
        '<p>계곡물 소리를 따라 걷다 보니 노란 붓꽃이 군락을 이루고 있었다. 햇살에 반짝이는 꽃잎이 아름다웠다.</p>
<p>붓꽃은 주로 계곡 주변이나 습한 곳에서 자라는 야생화로, 붓을 닮은 꽃봉오리 때문에 이런 이름이 붙었습니다.</p>
<p>노란 붓꽃 군락이 만들어내는 장관은 정말 자연이 주는 선물 같았습니다.</p>',
        '2024-09-15',
        '충청북도 단양군',
        'published',
        NOW()
    );

    -- 4. 돌담길 옆 작은 제비꽃의 보랏빛 속삭임
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        wildflower_id,
        '돌담길 옆 작은 제비꽃의 보랏빛 속삭임',
        'wildflower-jebikkot-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '마을 어귀 돌담길을 걷다 발견한 제비꽃. 작지만 진한 보랏빛이 인상적이었다.',
        '<p>마을 어귀 돌담길을 걷다 발견한 제비꽃. 작지만 진한 보랏빛이 인상적이었다.</p>
<p>제비꽃은 봄철 어디서나 쉽게 볼 수 있는 친근한 야생화입니다. 작지만 강렬한 색깔로 봄이 왔음을 알려줍니다.</p>',
        '2024-08-30',
        '전라남도 담양군',
        'published',
        NOW()
    );

    -- 5. 이슬 머금은 하늘색 물망초의 아침
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        wildflower_id,
        '이슬 머금은 하늘색 물망초의 아침',
        'wildflower-mulmangcho-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '새벽 산책에서 만난 물망초. 이슬을 머금은 하늘색 꽃잎이 아침 햇살에 반짝였다.',
        '<p>새벽 산책에서 만난 물망초. 이슬을 머금은 하늘색 꽃잎이 아침 햇살에 반짝였다.</p>
<p>물망초는 "나를 잊지 마세요(Forget-me-not)"라는 영어 이름처럼, 사랑과 추억을 상징하는 꽃입니다.</p>
<p>이른 아침 이슬을 머금은 모습이 더욱 아름다웠습니다.</p>',
        '2024-08-18',
        '강원도 평창군',
        'published',
        NOW()
    );

    -- 6. 바람에 흔들리는 하얀 매발톱꽃
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        wildflower_id,
        '바람에 흔들리는 하얀 매발톱꽃',
        'wildflower-maebaltop-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '고산지대에서 만난 매발톱꽃. 바람에 흔들리는 모습이 마치 춤을 추는 듯했다.',
        '<p>고산지대에서 만난 매발톱꽃. 바람에 흔들리는 모습이 마치 춤을 추는 듯했다.</p>
<p>매발톱꽃은 높은 산에서만 볼 수 있는 귀한 야생화로, 독특한 모양의 꽃이 특징입니다.</p>
<p>바람에 흔들리며 춤추는 듯한 모습이 정말 우아했습니다.</p>',
        '2024-08-05',
        '강원도 속초시 설악산',
        'published',
        NOW()
    );

    RAISE NOTICE '✓ 야생화 일지 6개 삽입 완료';
END $$;

-- ============================================
-- 3. 나무진단 예제 데이터 삽입
-- ============================================

DO $$
DECLARE
    tree_diagnose_id INTEGER;
    author_id UUID;
BEGIN
    -- 카테고리 ID 조회
    SELECT id INTO tree_diagnose_id FROM sn_categories WHERE slug = 'tree-diagnose';
    -- 작성자 ID
    SELECT id INTO author_id FROM temp_author;

    RAISE NOTICE '나무진단 데이터 삽입 시작...';

    -- 1. 오래된 느티나무의 새 생명
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at, is_featured
    ) VALUES (
        author_id,
        tree_diagnose_id,
        '오래된 느티나무의 새 생명, 가지 톱질 후 빠른 회복의 비결',
        'tree-neutinamu-recovery-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '마을 입구에 서 있는 수령 80년의 느티나무. 오래 살아온 이 나무는 몇 년 전부터 쇠퇴의 징조를 보이기 시작했다.',
        '<p>마을 입구에 서 있는 수령 80년의 느티나무. 오래 살아온 이 나무는 몇 년 전부터 쇠퇴의 징조를 보이기 시작했다.</p>
<h2>진단 내용</h2>
<p>수관 전체의 약 30%가 고사한 상태였으며, 잎의 크기도 현저히 작아진 상태였습니다. 정밀 진단 결과, 토양 다짐과 영양 불균형이 주요 원인으로 확인되었습니다.</p>
<h2>처치 방법</h2>
<ul>
<li>고사지 제거 및 적정 전정</li>
<li>토양 통기 처리</li>
<li>영양제 주입</li>
<li>멀칭을 통한 토양 보호</li>
</ul>
<h2>결과</h2>
<p>처치 후 6개월이 지난 지금, 나무는 새로운 가지를 뻗으며 건강을 회복하고 있습니다.</p>',
        '2024-10-15',
        '서울시 강남구',
        'published',
        NOW(),
        true
    );

    -- 2. 소나무 재선충병
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        tree_diagnose_id,
        '소나무 재선충병 조기 발견과 긴급 처치 사례',
        'tree-pine-jaseonchung-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '정기 순찰 중 발견한 소나무의 이상 징후. 잎이 갈변하고 수지 분비가 감소하는 전형적인 재선충병 증상이었다.',
        '<p>정기 순찰 중 발견한 소나무의 이상 징후. 잎이 갈변하고 수지 분비가 감소하는 전형적인 재선충병 증상이었다.</p>
<h2>재선충병이란?</h2>
<p>소나무재선충병은 소나무류를 빠르게 고사시키는 위험한 병으로, 조기 발견과 신속한 대응이 매우 중요합니다.</p>
<h2>긴급 조치</h2>
<ul>
<li>감염목 즉시 벌채 및 소각</li>
<li>주변 소나무 예방 약제 처리</li>
<li>매개충(솔수염하늘소) 방제</li>
<li>감시 강화</li>
</ul>',
        '2024-10-08',
        '경기도 가평군',
        'published',
        NOW()
    );

    -- 3. 벚나무 가지 고사
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        tree_diagnose_id,
        '벚나무 가지 고사 원인 진단 및 영양 처방',
        'tree-cherry-branch-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '공원의 오래된 왕벚나무에서 발견된 가지 고사 증상. 토양 검사 결과 영양 결핍이 주요 원인으로 밝혀졌다.',
        '<p>공원의 오래된 왕벚나무에서 발견된 가지 고사 증상. 토양 검사 결과 영양 결핍이 주요 원인으로 밝혀졌다.</p>
<h2>진단 과정</h2>
<p>토양 샘플 채취 및 분석 결과, 질소와 칼륨 부족이 확인되었습니다.</p>
<h2>처방</h2>
<ul>
<li>맞춤형 영양제 주입</li>
<li>토양 개량</li>
<li>적정 관수</li>
</ul>',
        '2024-09-29',
        '부산시 해운대구',
        'published',
        NOW()
    );

    -- 4. 은행나무 뿌리 부패
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        tree_diagnose_id,
        '은행나무 뿌리 부패 치료 및 토양 개선 작업',
        'tree-ginkgo-root-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '도심 가로수로 심어진 은행나무의 뿌리 부패 증상. 과도한 포장으로 인한 통기성 부족이 원인이었다.',
        '<p>도심 가로수로 심어진 은행나무의 뿌리 부패 증상. 과도한 포장으로 인한 통기성 부족이 원인이었다.</p>
<h2>문제 원인</h2>
<p>보도블록과 아스팔트로 인해 토양의 통기성이 극도로 낮아진 상태였습니다.</p>
<h2>해결 방법</h2>
<ul>
<li>식재대 확장</li>
<li>투수성 포장재로 교체</li>
<li>부패 뿌리 제거</li>
<li>신선한 토양으로 교체</li>
</ul>',
        '2024-09-20',
        '대전시 유성구',
        'published',
        NOW()
    );

    -- 5. 단풍나무 탄저병
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        tree_diagnose_id,
        '단풍나무 탄저병 진단과 친환경 방제',
        'tree-maple-disease-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '아파트 단지 내 단풍나무에서 발견된 탄저병. 환경친화적인 방법으로 치료를 진행했다.',
        '<p>아파트 단지 내 단풍나무에서 발견된 탄저병. 환경친화적인 방법으로 치료를 진행했다.</p>
<h2>탄저병 증상</h2>
<p>잎에 갈색 반점이 생기고 점차 확대되는 증상이 나타났습니다.</p>
<h2>친환경 방제</h2>
<ul>
<li>감염된 낙엽 제거</li>
<li>친환경 살균제 사용</li>
<li>나무 활력 증진</li>
</ul>',
        '2024-09-12',
        '인천시 연수구',
        'published',
        NOW()
    );

    -- 6. 회화나무 동공 처리
    INSERT INTO sn_posts (
        author_id, category_id, title, slug, excerpt, content,
        published_date, location, status, published_at
    ) VALUES (
        author_id,
        tree_diagnose_id,
        '회화나무 동공 처리 및 구조 안전성 확보',
        'tree-scholar-cavity-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        '오래된 회화나무의 줄기에 발견된 큰 동공. 구조적 안전성을 확보하기 위한 전문 처치가 필요했다.',
        '<p>오래된 회화나무의 줄기에 발견된 큰 동공. 구조적 안전성을 확보하기 위한 전문 처치가 필요했다.</p>
<h2>동공 처리</h2>
<p>부패된 부분을 제거하고, 방부 처리 후 충전재를 사용하여 동공을 메웠습니다.</p>
<h2>구조 보강</h2>
<ul>
<li>케이블링 설치</li>
<li>브레이싱 시공</li>
<li>정기 모니터링 계획 수립</li>
</ul>',
        '2024-09-05',
        '광주시 북구',
        'published',
        NOW()
    );

    RAISE NOTICE '✓ 나무진단 6개 삽입 완료';
END $$;

-- ============================================
-- 4. 결과 확인
-- ============================================

-- 삽입된 게시글 수 확인
SELECT
    c.name as 카테고리,
    COUNT(p.id) as 게시글수
FROM sn_categories c
LEFT JOIN sn_posts p ON c.id = p.category_id
WHERE c.type = 'menu'
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

-- 최근 삽입된 게시글 목록
SELECT
    c.name as 카테고리,
    p.title as 제목,
    p.published_date as 날짜,
    p.location as 위치,
    p.status as 상태
FROM sn_posts p
JOIN sn_categories c ON p.category_id = c.id
ORDER BY p.created_at DESC
LIMIT 12;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ 예제 데이터 삽입 완료!';
    RAISE NOTICE '- 야생화 일지: 6개';
    RAISE NOTICE '- 나무진단: 6개';
    RAISE NOTICE '총 12개의 게시글이 생성되었습니다.';
    RAISE NOTICE '=============================================';
END $$;

-- 임시 테이블 정리
DROP TABLE IF EXISTS temp_author;
