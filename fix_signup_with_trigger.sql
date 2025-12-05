-- ============================================
-- 회원가입 수정: Database Trigger 사용
-- ============================================

-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON sn_users;
DROP POLICY IF EXISTS "Users can update own profile" ON sn_users;
DROP POLICY IF EXISTS "Super admins can view all users" ON sn_users;
DROP POLICY IF EXISTS "Allow insert own profile" ON sn_users;
DROP POLICY IF EXISTS "Super admins can update user roles" ON sn_users;
DROP POLICY IF EXISTS "select_own_profile" ON sn_users;
DROP POLICY IF EXISTS "insert_own_profile" ON sn_users;
DROP POLICY IF EXISTS "update_own_profile" ON sn_users;
DROP POLICY IF EXISTS "delete_own_profile" ON sn_users;

-- ============================================
-- 1. 트리거 함수: auth.users 생성 시 자동으로 sn_users 프로필 생성
-- ============================================
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

-- 트리거 생성 (auth.users에 INSERT 시 자동 실행)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. RLS 정책 (간소화)
-- ============================================

-- SELECT: 사용자가 자신의 프로필을 볼 수 있음
CREATE POLICY "select_own_profile"
    ON sn_users FOR SELECT
    USING (auth.uid() = id);

-- UPDATE: 사용자가 자신의 프로필을 업데이트할 수 있음
CREATE POLICY "update_own_profile"
    ON sn_users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- DELETE: 사용자가 자신의 프로필을 삭제할 수 있음 (선택사항)
CREATE POLICY "delete_own_profile"
    ON sn_users FOR DELETE
    USING (auth.uid() = id);

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '트리거 기반 사용자 프로필 생성이 설정되었습니다.';
    RAISE NOTICE 'INSERT 정책은 제거되었습니다 (트리거가 자동 처리).';
    RAISE NOTICE 'RLS 정책이 간소화되었습니다.';
END $$;
