import { supabase } from '@/lib/supabase';

// Types
export interface MarketingTarget {
    id: string;
    name: string;
    phone_number: string;
    first_name?: string; // Derived or stored
    shop_name?: string;
    industry?: string;
    region_city?: string;
    region_gu?: string;
    status: 'new' | 'contacted' | 'converted' | 'bounced' | 'opt_out';
    created_at: string;
}

export interface Campaign {
    id: string;
    title: string;
    message_content: string;
    channel: 'sms' | 'lms' | 'kakao' | 'telegram';
    status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
    recipient_count: number;
    created_at: string;
}

/**
 * Fetch marketing targets with optional filters
 */
export const getMarketingTargets = async (filters?: {
    region_city?: string;
    industry?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    let query = supabase
        .from('marketing_targets')
        .select('*', { count: 'exact' });

    if (filters?.region_city) {
        query = query.eq('region_city', filters.region_city);
    }
    if (filters?.industry) {
        query = query.eq('industry', filters.industry);
    }
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }
    if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,shop_name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as MarketingTarget[], count };
};

/**
 * Create a new marketing target (e.g. from manual entry or crawl)
 */
export const createMarketingTarget = async (target: Partial<MarketingTarget>) => {
    // Basic validation
    if (!target.phone_number) throw new Error('Phone number is required');

    const { data, error } = await supabase
        .from('marketing_targets')
        .insert([target])
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Mock Sending Function (To be replaced with Solapi/CoolSMS)
 */
export const sendCampaignMessage = async (campaignData: Partial<Campaign>, targets: MarketingTarget[]) => {
    console.log(`[Marketing] Sending ${campaignData.channel} to ${targets.length} recipients...`);

    // 1. Create Campaign Record
    const { data: campaign, error: campaignError } = await supabase
        .from('marketing_campaigns')
        .insert([{
            title: campaignData.title,
            message_content: campaignData.message_content,
            channel: campaignData.channel,
            recipient_count: targets.length,
            status: 'sending',
            target_filter: {}, // In real app, store the filter used
        }])
        .select()
        .single();

    if (campaignError) throw campaignError;

    // 2. Simulate Sending (Async in real world)
    // Here we just log and update status immediately for demo

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Update Campaign Status
    await supabase
        .from('marketing_campaigns')
        .update({
            status: 'completed',
            success_count: targets.length,
            sent_at: new Date().toISOString()
        })
        .eq('id', campaign.id);

    return { success: true, campaignId: campaign.id };
};
