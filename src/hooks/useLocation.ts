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
        async function fetchLocation() {
            try {
                // ipapi.co (무료 티어 사용 - 하루 1,000건 제한)
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                if (data && data.region) {
                    // API 응답의 region(예: Seoul)을 우리 사이트의 한국어 명칭과 매칭하는 로직 필요
                    // 여기서는 데모를 위해 간단한 매칭 테이블 사용
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
                    console.log(`[Location Detected] ${matched.kr} ${matched.city}`);
                }
            } catch (error) {
                console.error('Failed to detect location:', error);
            }
        }

        fetchLocation();
    }, []);

    return location;
}
