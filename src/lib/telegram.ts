// Telegram 관리자 알림 유틸 (알람봇 — 공고 등록/결제 알림)
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

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
    if (!BOT_TOKEN) return false;

    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

// CS봇 (고객 문의 전용 — @cocoalba_cs_bot)
const CS_BOT_TOKEN = process.env.TELEGRAM_CS_BOT_TOKEN;

export async function sendCsBotMessage(chatId: string, text: string): Promise<boolean> {
    if (!CS_BOT_TOKEN) return false;

    try {
        const res = await fetch(`https://api.telegram.org/bot${CS_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
        });
        return res.ok;
    } catch {
        return false;
    }
}
