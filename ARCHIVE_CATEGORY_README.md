# Archive 카테고리 재구성 가이드

## 새로운 카테고리 구조

```
Archive (아카이브)
 ├─ Daily (일상/생각)
 ├─ Tech (AI, 개발, 도구, 튜토리얼)
 ├─ Insights (칼럼/인사이트/경험)
 ├─ Tree & Field (나무의사 현장/정리)
 └─ Business (창업/전략/운영)
```

## 실행 방법

### 1. 데이터베이스 업데이트
Supabase 대시보드 → SQL Editor에서 다음 파일을 **순서대로** 실행:

1. `update_logs_category_name.sql` - 카테고리 이름 변경
2. `add_attribute_key_column.sql` - attribute_key 컬럼 추가
3. `update_archive_categories.sql` - 서브카테고리 재구성

### 2. 실행 순서
```sql
-- 1단계: 카테고리 이름 변경
-- (update_logs_category_name.sql 전체 실행)

-- 2단계: attribute_key 컬럼 추가
-- (add_attribute_key_column.sql 전체 실행)

-- 3단계: 서브카테고리 재구성
-- (update_archive_categories.sql 전체 실행)
```

## 변경 내용

### 추가되는 것:
- `sn_categories` 테이블에 `attribute_key` 컬럼 추가 (TEXT 타입)

### 삭제되는 것:
- 기존 logs 카테고리의 모든 서브카테고리
- 해당 서브카테고리와 게시글 간의 매핑 (sn_post_categories)

### 생성되는 것:
| Name | Slug | 설명 |
|------|------|------|
| Daily | daily | 일상/생각 |
| Tech | tech | AI, 개발, 도구, 튜토리얼 |
| Insights | insights | 칼럼/인사이트/경험 |
| Tree & Field | tree-field | 나무의사 현장/정리 |
| Business | business | 창업/전략/운영 |

## 주의사항

⚠️ **중요**: 이 작업은 기존 데이터를 삭제합니다!

1. **기존 게시글의 서브카테고리 매핑이 모두 삭제됩니다**
   - 기존에 작성된 Archive 글들의 서브카테고리 태그가 사라집니다
   - 본문 내용이나 게시글 자체는 삭제되지 않습니다

2. **백업 권장**
   ```sql
   -- 백업 (실행 전)
   SELECT * FROM sn_categories 
   WHERE parent_id = (SELECT id FROM sn_categories WHERE slug = 'logs' AND type = 'menu');
   
   SELECT * FROM sn_post_categories 
   WHERE category_id IN (
     SELECT id FROM sn_categories 
     WHERE parent_id = (SELECT id FROM sn_categories WHERE slug = 'logs' AND type = 'menu')
   );
   ```

## 확인 방법

### SQL로 확인:
```sql
SELECT 
  c.id,
  c.name,
  c.slug,
  c.type,
  c.attribute_key,
  c.display_order,
  parent.name as parent_name
FROM sn_categories c
LEFT JOIN sn_categories parent ON c.parent_id = parent.id
WHERE c.parent_id = (SELECT id FROM sn_categories WHERE slug = 'logs' AND type = 'menu')
ORDER BY c.display_order;
```

### UI에서 확인:
1. 글쓰기 페이지 (`/write`)에서 "아카이브" 카테고리 선택
2. "서브카테고리" 섹션에서 5개 옵션 확인:
   - Daily
   - Tech
   - Insights
   - Tree & Field
   - Business

## 코드 변경 없음

- URL 구조: 변경 없음 (`/logs`, `/logs/[id]`)
- 내부 로직: 변경 없음 (slug는 여전히 'logs')
- 프론트엔드: 코드 수정 불필요
- 서브카테고리는 DB에서 동적으로 로드됨

## 롤백 방법 (필요시)

기존 구조로 되돌리고 싶다면:
```sql
-- 새 서브카테고리 삭제
DELETE FROM sn_categories 
WHERE parent_id = (SELECT id FROM sn_categories WHERE slug = 'logs' AND type = 'menu');

-- 기존 백업 데이터를 사용해서 복원
-- (백업해둔 INSERT 문 실행)
```

## 참고

- 서브카테고리는 다중 선택 가능
- 한 게시글에 여러 서브카테고리 태그를 붙일 수 있음
- 예: "Tech + Daily" 조합 가능
