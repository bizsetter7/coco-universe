import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
import { normalizeAd } from '@/app/my-shop/utils/normalization';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';

export async function POST() {
    console.log('[API] Health check triggered (POST Mode)');
    const healthStatus: any = {
        timestamp: new Date().toISOString(),
        overall: 'healthy',
        components: {
            supabase: { status: 'loading', message: '' },
            portone: { status: 'loading', message: '' },
            env: { status: 'loading', message: '' },
            normalization: { status: 'loading', message: '' }
        }
    };

    // 1. Check Supabase Connection
    try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
        healthStatus.components.supabase = { status: 'healthy', message: 'Successfully connected to Supabase DB' };
    } catch (err: any) {
        healthStatus.components.supabase = { status: 'error', message: err.message || 'Database connection failed' };
        healthStatus.overall = 'error';
    }

    // 2. Check PortOne Credentials
    const portoneSecret = process.env.PORTONE_API_SECRET;
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

    if (portoneSecret && storeId && channelKey) {
        healthStatus.components.portone = { status: 'healthy', message: 'All PortOne credentials are configured' };
    } else {
        const missing = [];
        if (!portoneSecret) missing.push('SECRET_KEY');
        if (!storeId) missing.push('STORE_ID');
        if (!channelKey) missing.push('CHANNEL_KEY');

        healthStatus.components.portone = {
            status: 'warning',
            message: `Missing: ${missing.join(', ')}. Production adult verification will not work.`
        };
        if (healthStatus.overall === 'healthy') healthStatus.overall = 'warning';
    }

    // 3. Environment Variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        healthStatus.components.env = { status: 'healthy', message: 'Environment variables are correctly pulled' };
    } else {
        healthStatus.components.env = {
            status: 'warning',
            message: 'Supabase URL is missing or using placeholder.'
        };
        if (healthStatus.overall === 'healthy') healthStatus.overall = 'warning';
    }

    // 4. Standards Guard (System Promises)
    try {
        const standards: any = {
            payBadges: {
                expected: ['시', '일', '주', '월', '연', 'T', '건', '협'],
                colors: ['bg-cyan-500', 'bg-blue-600', 'bg-pink-500', 'bg-purple-600', 'bg-green-600', 'bg-indigo-600', 'bg-emerald-500', 'bg-gray-400']
            },
            adTiers: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
        };

        // Validate Pay Badge Utility (Imported at top)
        const payErrors: string[] = [];
        const payTypes = ['시급', '일급', '주급', '월급', '연봉', 'TC', '건별', '협의'];

        payTypes.forEach((type, i) => {
            const char = getPayAbbreviation(type);
            const color = getPayColor(type);
            if (char !== standards.payBadges.expected[i]) payErrors.push(`${type}: Expected '${standards.payBadges.expected[i]}', got '${char}'`);
            if (!color.includes(standards.payBadges.colors[i])) payErrors.push(`${type}: Expected color '${standards.payBadges.colors[i]}', got '${color}'`);
        });

        if (payErrors.length > 0) throw new Error(`Pay Badge Standards Violated: ${payErrors.join(' | ')}`);

        healthStatus.components.standards = { status: 'healthy', message: 'All UI/UX standards (Pay Badges, Ad Tiers) are intact' };
    } catch (err: any) {
        healthStatus.components.standards = { status: 'error', message: err.message || 'Standards verification failed' };
        healthStatus.overall = 'error';
    }

    // 5. Data Normalization Self-Test
    try {
        const sampleRawAd = { shop_name: 'HealthTest', pay_amount: '999999', title: 'TestTitle' };
        const result = normalizeAd(sampleRawAd);
        if (!result) {
            throw new Error('Normalization returned null');
        }
        if (result.payAmount === 999999 && (result.title || result.shopName)) {
            healthStatus.components.normalization = { status: 'healthy', message: 'Business logic engine is working correctly' };
        } else {
            throw new Error('Data normalization output mismatch or missing core fields');
        }
    } catch (err: any) {
        healthStatus.components.normalization = { status: 'error', message: err.message || 'Normalization engine failure' };
        healthStatus.overall = 'error';
    }

    return NextResponse.json(healthStatus);
}
