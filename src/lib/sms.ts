import coolsms from 'coolsms-node-sdk';

const msgModule = coolsms.default;

// Initialize with env vars or empty strings to prevent crash on load
// We will check for validity before sending
const apiKey = process.env.SOLAPI_API_KEY || '';
const apiSecret = process.env.SOLAPI_API_SECRET || '';
const senderNumber = process.env.SOLAPI_SENDER_NUMBER || '';

let messageService: any = null;

if (apiKey && apiSecret) {
    try {
        messageService = new msgModule(apiKey, apiSecret);
    } catch (e) {
        console.error('Failed to initialize CoolSMS:', e);
    }
}

export const sendSMS = async (to: string | string[], text: string) => {
    // 1. Validation
    if (!apiKey || !apiSecret || !senderNumber) {
        console.warn('[SMS] MOCK SEND (Missing Keys):', { to, text });
        return { success: true, type: 'mock', count: Array.isArray(to) ? to.length : 1 };
    }

    if (!messageService) {
        console.error('[SMS] Service not initialized');
        return { success: false, error: 'Service initialization failed' };
    }

    // 2. Formatting
    const recipients = Array.isArray(to) ? to : [to];
    // CoolSMS expects 'to', 'from', 'text'
    // For bulk, we might need a loop or specific bulk API if sdk supports it.
    // The simple SDK usually handles array in 'to' or we send one by one for safety in this basic wrapper.
    // Let's check typical usage. Actually coolsms-node-sdk (coolsms.js) usually takes an object.

    // Modern usage for 'coolsms-node-sdk' often involves:
    // messageService.sendOne or sendMany (if using newer solapi-libs)
    // BUT 'coolsms-node-sdk' is the legacy one or the one wrapping Solapi? 
    // Let's assume standard 'sendOne' / 'sendMany' if it's the official Solapi lib, 
    // or the legacy `send` method.
    // To be safe and generic with the install `coolsms-node-sdk`:

    try {
        // Prepare params
        // Check if recipients > 1
        if (recipients.length === 1) {
            const result = await messageService.sendOne({
                to: recipients[0],
                from: senderNumber,
                text,
                autoType: true // Detect SMS/LMS
            });
            return { success: true, result };
        } else {
            // Bulk
            // The SDK might handle grouping, but let's try 100 limit batching if needed.
            // For now, let's assume the component handles reasonable batch sizes or we map.
            // Actually, let's use a simple map for now to be safe against SDK variations until confirmed.
            const results = await Promise.all(recipients.map(r =>
                messageService.sendOne({
                    to: r,
                    from: senderNumber,
                    text,
                    autoType: true
                }).catch((e: any) => ({ error: e }))
            ));

            const successCount = results.filter((r: any) => !r.error).length;
            const failCount = results.length - successCount;

            return { success: true, successCount, failCount, results };
        }
    } catch (error: any) {
        console.error('[SMS] Send Error:', error);
        return { success: false, error: error.message };
    }
};
