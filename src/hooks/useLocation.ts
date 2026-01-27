'use client';

import { useState, useEffect } from 'react';

export interface UserLocation {
    region: string;
    city: string;
    isDetected: boolean;
}

export function useLocation() {
    const [location, setLocation] = useState<UserLocation>({
        region: '서울', // 기본값
        city: '강남구',
        isDetected: false
    });

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                // 타임아웃 처리를 위한 AbortController
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                if (data && data.region) {
                    const regionMap: Record<string, { kr: string, city: string }> = {
                        'Seoul': { kr: '서울', city: '강남구' },
                        'Gyeonggi-do': { kr: '경기', city: '수원시' },
                        'Busan': { kr: '부산', city: '해운대구' },
                        'Daegu': { kr: '대구', city: '수성구' },
                        'Incheon': { kr: '인천', city: '연수구' },
                        'Gwangju': { kr: '광주', city: '서구' },
                        'Daejeon': { kr: '대전', city: '유성구' },
                        'Ulsan': { kr: '울산', city: '남구' },
                    };

                    const matched = regionMap[data.region] || { kr: '서울', city: '강남구' };

                    setLocation({
                        region: matched.kr,
                        city: matched.city,
                        isDetected: true
                    });
                }
            } catch (error) {
                // 에러 발생 시 무음 처리하여 UI 방해 금지
                console.warn('Location detection failed, using defaults.');
            }
        };

        fetchLocation();
    }, []);

    return location;
}
