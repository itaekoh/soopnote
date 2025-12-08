# RLS 안전 배포 가이드

## 🎯 목표
개발 중에는 RLS를 끄고, 프로덕션 배포 시 안전하게 RLS를 활성화하기

## 📋 3단계 배포 전략

### 1단계: 로컬에서 RLS 테스트 (배포 1주일 전)

#### A. 별도 Supabase 프로젝트 생성
```
현재 프로젝트: soopnote (개발용, RLS OFF)
새 프로젝트: soopnote-staging (테스트용, RLS ON)
```

#### B. 데이터 복사
1. 현재 DB에서 데이터 Export
2. 새 프로젝트에서 Import
3. RLS 정책 적용 (`setup_production_rls.sql` 실행)

#### C. .env.local 전환 테스트
```bash
# .env.local.staging 파일 생성
NEXT_PUBLIC_SUPABASE_URL=https://[staging-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[staging-anon-key]
```

#### D. 전체 기능 테스트
- [ ] 메인 페이지 로딩
- [ ] 로그인/회원가입
- [ ] 게시글 목록 (야생화, 나무진단, 칼럼)
- [ ] 게시글 상세 보기
- [ ] 게시글 작성 (writer 권한)
- [ ] 게시글 수정/삭제
- [ ] 댓글 작성/수정/삭제
- [ ] 좋아요 기능
- [ ] 관리자 페이지 접근
- [ ] 권한별 접근 제어 확인

---

### 2단계: 문제 발견 시 수정 (배포 3-5일 전)

#### 발견된 문제 예시와 해결법

**문제 1: "관리자 페이지에서 게시글 목록이 안 보여요"**
```sql
-- 원인: getAllPostsForAdmin()이 sn_posts_full 뷰 사용
-- 해결: 뷰에도 RLS 정책 추가

CREATE POLICY "authenticated_can_read_posts_full"
    ON sn_posts_full FOR SELECT
    TO authenticated
    USING (
        status = 'published' OR
        author_id = auth.uid()
    );
```

**문제 2: "내가 쓴 임시저장 글이 안 보여요"**
```sql
-- 원인: 정책에서 임시저장 누락
-- 해결: 이미 포함되어 있음 (확인)

-- 기존 정책 확인
SELECT * FROM pg_policies
WHERE tablename = 'sn_posts'
AND policyname = 'authors_can_read_own_posts';
```

**문제 3: "super_admin인데 다른 사람 글을 못 봐요"**
```sql
-- 해결: super_admin 정책 추가

CREATE POLICY "super_admins_can_read_all_posts"
    ON sn_posts FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM sn_users
            WHERE id = auth.uid()
            AND role = 'super_admin'
        )
    );
```

---

### 3단계: 프로덕션 배포 (D-Day)

#### A. 점검 체크리스트
- [ ] 스테이징에서 모든 기능 정상 확인
- [ ] RLS 정책 최종 SQL 파일 준비
- [ ] 롤백 계획 수립 (RLS 끄는 SQL 준비)
- [ ] 배포 시간대 결정 (사용자 적은 시간)

#### B. 배포 순서
```sql
-- 1. 백업 (중요!)
-- Supabase Dashboard > Database > Backups

-- 2. RLS 정책 적용
-- setup_production_rls.sql 실행

-- 3. 즉시 테스트
-- 주요 기능 5분 안에 빠르게 확인

-- 4. 문제 발견 시 즉시 롤백
ALTER TABLE sn_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sn_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sn_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE sn_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE sn_likes DISABLE ROW LEVEL SECURITY;
```

#### C. 배포 후 모니터링 (24시간)
- 오류 로그 확인
- 사용자 피드백 수집
- 성능 모니터링 (쿼리 속도)

---

## 🛟 긴급 롤백 계획

### 즉시 RLS 비활성화 (문제 발생 시)

```sql
-- ============================================
-- 긴급 롤백: RLS 즉시 비활성화
-- ============================================

ALTER TABLE sn_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sn_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sn_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE sn_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE sn_likes DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'sn_%';
```

**롤백 후 해야 할 일:**
1. 문제 원인 파악
2. 로컬/스테이징에서 수정
3. 재테스트 후 재배포

---

## 📊 RLS 성능 모니터링

### 느린 쿼리 찾기
```sql
-- Supabase Dashboard > Database > Query Performance
-- 또는

SELECT
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
WHERE query LIKE '%sn_posts%'
ORDER BY mean_time DESC
LIMIT 10;
```

### 정책 최적화
- 인덱스 추가 (author_id, status 등)
- 복잡한 정책은 뷰로 대체
- 필요시 정책 단순화

---

## ✅ 최종 체크리스트

### 배포 전
- [ ] 스테이징 환경에서 1주일 이상 테스트 완료
- [ ] 모든 사용자 시나리오 검증
- [ ] 성능 테스트 완료
- [ ] 롤백 계획 수립
- [ ] 팀원들에게 배포 일정 공지

### 배포 중
- [ ] 백업 완료 확인
- [ ] RLS 정책 적용
- [ ] 주요 기능 즉시 테스트
- [ ] 문제 없으면 전체 기능 테스트

### 배포 후
- [ ] 24시간 모니터링
- [ ] 사용자 피드백 수집
- [ ] 성능 확인
- [ ] 이슈 발생 시 즉시 대응

---

## 🎓 교훈

1. **개발 중에도 가끔 RLS 켜보기**
   - 매주 금요일 RLS 켜서 테스트
   - 문제 조기 발견

2. **스테이징 환경은 필수**
   - 프로덕션과 동일한 환경에서 미리 테스트
   - 예상치 못한 문제 사전 차단

3. **점진적 배포**
   - 한 번에 모든 테이블 RLS 켜지 말고
   - 중요도 낮은 테이블부터 순차 적용

4. **롤백은 항상 준비**
   - 문제 발생 시 즉시 되돌릴 수 있어야 함
   - 사용자 영향 최소화

---

**결론: 개발 중에는 RLS 끄되, 배포 전에 반드시 스테이징에서 충분히 테스트!**
