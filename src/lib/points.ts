import { supabase } from './supabase';

export type PointReason = 'JOIN' | 'RESUME_UPLOAD' | 'COMMUNITY_POST' | 'COMMUNITY_COMMENT' | 'COUPON_EXCHANGE' | 'RESUME_JUMP';

const POINT_AMOUNTS: Record<PointReason, number> = {
    JOIN: 1000,
    RESUME_UPLOAD: 5000,
    COMMUNITY_POST: 200,
    COMMUNITY_COMMENT: 50,
    COUPON_EXCHANGE: -5000, // Example: exchange for 5k coupon
    RESUME_JUMP: -500, // Cost 500 Credits to jump resume to top
};

/**
 * Award or deduct points from a user
 */
export async function updatePoints(userId: string, reason: PointReason, customAmount?: number) {
    const amount = customAmount ?? POINT_AMOUNTS[reason];

    try {
        // 1. Update Profile (Total Credit)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('credit_balance')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        const newTotal = (profile?.credit_balance || 0) + amount;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credit_balance: newTotal, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (updateError) throw updateError;

        // 2. Log the transaction (Using credit_logs table for unification)
        const { error: logError } = await supabase
            .from('credit_logs')
            .insert({
                user_id: userId,
                amount,
                action: 'admin_grant', // Temporary mapping, can be expanded in schema later
                note: `[COCO] ${reason}`,
            });

        if (logError) throw logError;

        return { success: true, newTotal };
    } catch (err) {
        console.error('Credit update failed:', err);
        return { success: false, error: err };
    }
}

/**
 * Get current credit for a user
 */
export async function getUserPoints(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', userId)
        .single();

    if (error) return 0;
    return data?.credit_balance || 0;
}
