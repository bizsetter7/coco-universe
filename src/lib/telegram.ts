// Telegram 관리자 알림 유틸
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function sendTelegramAlert(message: string): Promise<boolean> {
    if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;

    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

// 봇이 특정 사용자 식별자(chatId)에게 직접 답변을 보낼 때 사용
export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
    if (!BOT_TOKEN) return false;

    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'HTML',
            }),
        });
        return res.ok;
    } catch {
        return false;
    }
}
