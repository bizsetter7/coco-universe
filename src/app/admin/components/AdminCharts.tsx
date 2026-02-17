'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AdminChartsProps {
    userStats?: any[];
    adStats?: any[];
}

export default function AdminCharts({ userStats: _userStats, adStats: _adStats }: AdminChartsProps) {
    // 1. User Growth Data (Last 7 Days)
    const userLabels = ['6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '어제', '오늘'];
    const userData = {
        labels: userLabels,
        datasets: [
            {
                fill: true,
                label: '신규 가입자',
                data: [12, 19, 15, 22, 30, 25, 38], // Mock or Derived from userStats
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
            },
        ],
    };

    // 2. Revenue Data (Last 6 Months)
    const revenueLabels = ['9월', '10월', '11월', '12월', '1월', '2월'];
    const revenueData = {
        labels: revenueLabels,
        datasets: [
            {
                label: '월간 예상 매출 (만원)',
                data: [4200, 5100, 4800, 6200, 7500, 8900], // Mock or Derived from adStats
                backgroundColor: 'rgba(236, 72, 153, 0.8)',
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleFont: { size: 12, weight: 'bold' as const },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: '#f1f5f9',
                },
                ticks: {
                    font: { size: 10, weight: 'bold' as const },
                    color: '#94a3b8',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { size: 10, weight: 'bold' as const },
                    color: '#94a3b8',
                },
            },
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tighter">가입자 성장 추이 📈</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">User Growth Trends</p>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+12.5%</span>
                </div>
                <div className="h-[250px] w-full">
                    <Line data={userData} options={options} />
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tighter">월간 매출 현황 💰</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Monthly Revenue Stats</p>
                    </div>
                    <span className="text-[10px] font-black text-pink-600 bg-pink-50 px-2 py-1 rounded-full">+18.2%</span>
                </div>
                <div className="h-[250px] w-full">
                    <Bar data={revenueData} options={options} />
                </div>
            </div>
        </div>
    );
}
