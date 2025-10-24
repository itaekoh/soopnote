import { NextResponse } from 'next/server';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { success: false, message: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('[subscribe] new subscription request:', email);
    // TODO: Integrate with the newsletter subscription backend or service.

    return NextResponse.json(
      {
        success: true,
        message: '뉴스레터 구독이 신청되었습니다. 곧 메일함을 확인해주세요.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[subscribe] failed to process request', error);
    return NextResponse.json(
      { success: false, message: '구독 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
