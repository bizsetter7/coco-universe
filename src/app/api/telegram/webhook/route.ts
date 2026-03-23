import { NextResponse } from 'next/server';
import { sendTelegramAlert, sendTelegramMessage } from '@/lib/telegram';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 텔레그램에서 보낸 메시지 형식인지 확인
        if (body.message && body.message.text) {
            const chatId = body.message.chat.id;
            const text = body.message.text;
            const username = body.message.from?.username || body.message.from?.first_name || '고객';

            // 1. 고객에게 자동 답장 발송
            const replyText = `안녕하세요, <b>${username}</b>님!\n코코알바 고객센터입니다. 문의하신 내용이 접수되었으며, 관리자가 확인 후 답변 드리겠습니다.\n\n[문의 내용]\n<i>${text}</i>`;
            await sendTelegramMessage(String(chatId), replyText);

            // 2. 관리자 단톡방(또는 관리자 계정)으로 문의 내용 포워딩
            const adminMsg = `🚨 <b>[새로운 고객 문의]</b>\n👤 발신자: ${username} (ID: ${chatId})\n💬 내용:\n${text}`;
            await sendTelegramAlert(adminMsg);
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error('Telegram webhook error:', err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
