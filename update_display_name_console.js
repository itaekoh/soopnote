// ============================================
// 브라우저 콘솔에서 Display Name 변경
// ============================================
// 사용 방법:
// 1. 로그인한 상태로 본인 사이트(localhost:3000) 접속
// 2. F12 → Console 탭
// 3. 아래 코드 복사해서 붙여넣기
// 4. '원하는이름' 부분만 수정 후 Enter

// Supabase auth 메타데이터 업데이트
const { data, error } = await supabase.auth.updateUser({
  data: {
    display_name: '원하는이름'
  }
});

if (error) {
  console.error('❌ 업데이트 실패:', error);
} else {
  console.log('✅ Auth 메타데이터 업데이트 성공:', data);

  // sn_users 테이블도 함께 업데이트
  const user = data.user;
  const { data: profileData, error: profileError } = await supabase
    .from('sn_users')
    .update({ display_name: '원하는이름' })
    .eq('id', user.id)
    .select()
    .single();

  if (profileError) {
    console.error('❌ 프로필 업데이트 실패:', profileError);
  } else {
    console.log('✅ 프로필 업데이트 성공:', profileData);
    alert('Display name이 변경되었습니다! 페이지를 새로고침하세요.');
  }
}
