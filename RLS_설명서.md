# RLS(Row Level Security) 정책 설명서

## 🤔 RLS가 뭔가요?

RLS는 데이터베이스 테이블의 **행(row) 단위로 접근 권한을 제어**하는 기능입니다.

예를 들어:
- "발행된 게시글만 보여줘"
- "내가 쓴 글만 수정할 수 있어"
- "로그인한 사람만 댓글 달 수 있어"

이런 규칙들을 데이터베이스 레벨에서 강제할 수 있습니다.

## 📌 현재 프로젝트 정책 요약

### 1. 사용자 테이블 (sn_users)
| 누가 | 무엇을 | 조건 |
|------|--------|------|
| 모든 사람 | 읽기 ✅ | 제한 없음 (작성자 정보 표시용) |
| 로그인 사용자 | 자기 프로필 수정 ✅ | 본인 것만 |
| 로그인 사용자 | 계정 삭제 ✅ | 본인 것만 |

### 2. 카테고리 테이블 (sn_categories)
| 누가 | 무엇을 | 조건 |
|------|--------|------|
| 모든 사람 | 읽기 ✅ | 제한 없음 |
| super_admin | 생성/수정/삭제 ✅ | Dashboard에서만 |

### 3. 게시글 테이블 (sn_posts)
| 누가 | 무엇을 | 조건 |
|------|--------|------|
| 모든 사람 | 발행된 글 읽기 ✅ | status = 'published' |
| 작성자 | 자기 글 읽기 ✅ | 임시저장 포함 |
| writer/super_admin | 글 작성 ✅ | role 확인 |
| 작성자 | 자기 글 수정 ✅ | 본인 것만 |
| 작성자 | 자기 글 삭제 ✅ | 본인 것만 |

### 4. 댓글 테이블 (sn_comments)
| 누가 | 무엇을 | 조건 |
|------|--------|------|
| 모든 사람 | 읽기 ✅ | 제한 없음 |
| 로그인 사용자 | 작성 ✅ | - |
| 작성자 | 자기 댓글 수정 ✅ | 본인 것만 |
| 작성자 | 자기 댓글 삭제 ✅ | 본인 것만 |

### 5. 좋아요 테이블 (sn_likes)
| 누가 | 무엇을 | 조건 |
|------|--------|------|
| 모든 사람 | 읽기 ✅ | 제한 없음 |
| 로그인 사용자 | 추가 ✅ | - |
| 로그인 사용자 | 삭제 ✅ | 본인 것만 |

## 🚀 사용 방법

### 개발 중 (지금)
```sql
-- 현재 상태: 모든 RLS 비활성화
-- 이유: 개발 편의성
-- 문제 없음!
```

### 프로덕션 배포 전
```sql
-- setup_production_rls.sql 파일 실행
-- Supabase SQL Editor에서 한 번만 실행하면 됩니다!
```

## ⚠️ 주의사항

### RLS를 활성화하면 발생할 수 있는 문제

1. **무한 재귀 에러**
   - 정책 안에서 같은 테이블을 참조할 때 발생
   - 해결: 현재 SQL은 이 문제를 피하도록 설계됨

2. **타임아웃**
   - 복잡한 정책은 느려질 수 있음
   - 해결: 최대한 간단한 정책만 사용

3. **예상치 못한 권한 거부**
   - 정책을 잘못 설정하면 본인 글도 못 봄
   - 해결: 정책을 하나씩 추가하면서 테스트

## 🔧 트러블슈팅

### "내 글이 안 보여요!"
```sql
-- 작성자 확인
SELECT author_id FROM sn_posts WHERE id = [게시글ID];

-- 현재 사용자 ID 확인
SELECT auth.uid();

-- 일치하는지 확인!
```

### "게시글을 생성할 수 없어요!"
```sql
-- role 확인
SELECT role FROM sn_users WHERE id = auth.uid();

-- writer 또는 super_admin이어야 함
```

### "RLS 때문에 개발이 안돼요!"
```sql
-- RLS 비활성화 (개발용)
ALTER TABLE sn_posts DISABLE ROW LEVEL SECURITY;

-- 나중에 다시 활성화
ALTER TABLE sn_posts ENABLE ROW LEVEL SECURITY;
```

## 💡 팁

1. **개발 중에는 RLS를 끄세요**
   - 개발이 훨씬 편합니다
   - 배포 전에만 켜면 됩니다

2. **정책은 단순할수록 좋습니다**
   - 복잡한 로직은 애플리케이션 코드에서 처리
   - RLS는 기본적인 보안만

3. **테스트는 Supabase Dashboard에서**
   - SQL Editor에서 직접 쿼리 실행
   - RLS 적용 여부 확인 가능

## 📚 참고 자료

- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**요약: 개발 중에는 RLS 끄고, 배포 전에 `setup_production_rls.sql` 한 번만 실행하면 끝!**
