-- ============================================
-- 트리거 상태 확인 및 display_name 문제 해결
-- ============================================

-- 1. 현재 트리거 상태 확인
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. 현재 sn_users 테이블의 display_name 상태 확인
SELECT id, email, display_name, created_at
FROM sn_users
ORDER BY created_at DESC;

-- 3. auth.users의 raw_user_meta_data 확인
SELECT
    id,
    email,
    raw_user_meta_data->>'display_name' as metadata_display_name,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- 문제 해결: 트리거 재생성 및 기존 사용자 수정
-- ============================================

-- 4. 트리거 함수 재생성 (display_name 제대로 처리)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_display_name TEXT;
BEGIN
  -- display_name 추출 (빈 문자열도 NULL로 처리)
  user_display_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), '');

  -- display_name이 없으면 이메일의 @ 앞부분 사용
  IF user_display_name IS NULL THEN
    user_display_name := SPLIT_PART(NEW.email, '@', 1);
  END IF;

  INSERT INTO public.sn_users (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    user_display_name,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 트리거 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. 기존 사용자의 display_name 업데이트
-- (auth.users의 raw_user_meta_data에서 가져오거나, 없으면 이메일 앞부분 사용)
UPDATE sn_users
SET display_name = COALESCE(
    NULLIF(TRIM((SELECT raw_user_meta_data->>'display_name' FROM auth.users WHERE auth.users.id = sn_users.id)), ''),
    SPLIT_PART(email, '@', 1)
)
WHERE display_name IS NULL OR display_name = '' OR display_name = '사용자';

-- 7. 결과 확인
SELECT id, email, display_name, updated_at
FROM sn_users
ORDER BY created_at DESC;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '트리거가 재생성되었습니다.';
    RAISE NOTICE '기존 사용자의 display_name이 업데이트되었습니다.';
    RAISE NOTICE '새로운 회원가입 시 입력한 이름이 자동으로 저장됩니다.';
END $$;
