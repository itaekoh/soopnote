-- ============================================
-- 회원가입 트리거 설정 (새로운 회원가입만 대응)
-- ============================================

-- 1. 트리거 함수 생성
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

-- 2. 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '트리거가 설정되었습니다!';
    RAISE NOTICE '이제 회원가입 시 입력한 이름이 자동으로 저장됩니다.';
    RAISE NOTICE '=============================================';
END $$;
