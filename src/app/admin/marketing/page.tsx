'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMarketingTargets, createMarketingTarget, sendCampaignMessage, MarketingTarget } from '@/services/marketingService';
import { Send, Users, Filter, Plus, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MarketingPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        region_city: '',
        industry: '',
        status: '',
        search: ''
    });

    // --- Queries ---
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['marketing-targets', page, filters],
        queryFn: () => getMarketingTargets({ page, limit: 20, ...filters }),
    });

    // --- Mutations ---
    const sendMutation = useMutation({
        mutationFn: async (campaign: any) => {
            if (!data?.data || data.data.length === 0) throw new Error('No targets selected');
            return sendCampaignMessage(campaign, data.data);
        },
        onSuccess: () => {
            toast.success('Campaign sent successfully!');
            setShowSendModal(false);
            queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] }); // If we had a campaign list
        },
        onError: (err: any) => {
            toast.error(`Failed to send: ${err.message}`);
        }
    });

    // --- UI State ---
    const [showSendModal, setShowSendModal] = useState(false);
    const [campaignForm, setCampaignForm] = useState({
        title: '',
        message: '',
        channel: 'sms'
    });

    // --- Handlers ---
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to page 1 on filter
    };

    const handleSendSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm(`Are you sure you want to send this ${campaignForm.channel} to ${data?.count || 0} recipients?`)) return;

        sendMutation.mutate({
            title: campaignForm.title,
            message_content: campaignForm.message,
            channel: campaignForm.channel
        });
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-red-500" />
                        마케팅 자동화 관리
                    </h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                        크롤링된 잠재 고객 데이터를 관리하고 메시지를 발송합니다.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => refetch()}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => setShowSendModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors shadow-lg shadow-gray-900/20"
                    >
                        <Send size={16} />
                        캠페인 발송
                    </button>
                </div>
            </div>

            {/* Stats Cards (Mock) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">Total Targets</p>
                    <p className="text-2xl font-black text-gray-900">{data?.count || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">Converted</p>
                    <p className="text-2xl font-black text-green-600">0</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">SMS Sent</p>
                    <p className="text-2xl font-black text-blue-600">0</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">Bounced</p>
                    <p className="text-2xl font-black text-red-500">0</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold mr-2">
                    <Filter size={16} /> Filters:
                </div>
                <select
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none"
                    value={filters.region_city}
                    onChange={(e) => handleFilterChange('region_city', e.target.value)}
                >
                    <option value="">All Cities</option>
                    <option value="Seoul">Seoul</option>
                    <option value="Busan">Busan</option>
                    <option value="Incheon">Incheon</option>
                </select>
                <select
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none"
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                >
                    <option value="">All Industries</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Retail">Retail</option>
                </select>
                <select
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                </select>
                <div className="ml-auto relative">
                    <input
                        type="text"
                        placeholder="Search name, phone..."
                        className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none w-48"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <Users size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 text-xs font-black text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="p-4 border-b border-gray-100">Status</th>
                            <th className="p-4 border-b border-gray-100">Name / Phone</th>
                            <th className="p-4 border-b border-gray-100">Business Info</th>
                            <th className="p-4 border-b border-gray-100">Location</th>
                            <th className="p-4 border-b border-gray-100">Source</th>
                            <th className="p-4 border-b border-gray-100">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading targets...</td></tr>
                        ) : data?.data.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">No targets found. Try adjusting filters or import data.</td></tr>
                        ) : (
                            data?.data.map((target: MarketingTarget) => (
                                <tr key={target.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${target.status === 'new' ? 'bg-blue-50 text-blue-600' :
                                                target.status === 'contacted' ? 'bg-yellow-50 text-yellow-600' :
                                                    target.status === 'converted' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {target.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{target.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400 font-mono tracking-tight">{target.phone_number}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold">{target.shop_name || '-'}</div>
                                        <div className="text-xs text-gray-400">{target.industry || '-'}</div>
                                    </td>
                                    <td className="p-4 text-xs">
                                        {target.region_city} {target.region_gu}
                                    </td>
                                    <td className="p-4 text-xs text-gray-400">
                                        {target.source_site}
                                    </td>
                                    <td className="p-4 text-xs text-gray-400">
                                        {new Date(target.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Send Modal */}
            {showSendModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-gray-900">Start Campaign</h3>
                            <p className="text-sm text-gray-500">
                                Sending to <span className="text-red-600 font-bold">{data?.count || 0}</span> selected targets.
                            </p>
                        </div>

                        <form onSubmit={handleSendSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Campaign Title</label>
                                <input
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:border-red-500 outline-none"
                                    placeholder="e.g. November Promotion"
                                    value={campaignForm.title}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Channel</label>
                                <div className="flex gap-2">
                                    {['sms', 'lms', 'kakao', 'telegram'].map(ch => (
                                        <label key={ch} className={`flex-1 px-3 py-2 border rounded-lg text-center text-xs font-black cursor-pointer transition-all ${campaignForm.channel === ch ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                            }`}>
                                            <input
                                                type="radio" className="hidden"
                                                name="channel"
                                                value={ch}
                                                checked={campaignForm.channel === ch}
                                                onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value as any })}
                                            />
                                            {ch.toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Message Content</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-red-500 outline-none resize-none"
                                    placeholder="Write your message here..."
                                    value={campaignForm.message}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                                />
                                <div className="text-right text-[10px] text-gray-400 font-bold mt-1">
                                    {campaignForm.message.length} chars
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSendModal(false)}
                                    className="py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendMutation.isLoading}
                                    className="py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sendMutation.isLoading ? 'Sending...' : 'Send Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
