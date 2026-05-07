import { useEffect, useRef } from 'react';
import { getDateString } from '../utils';

export default function ProductivityChart({ appState }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Handle High DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        
        ctx.clearRect(0, 0, width, height);

        const last7Days = [];
        const totals = [];
        
        for (let i = 6; i >= 0; i--) {
            const dateStr = getDateString(i);
            const d = new Date(dateStr);
            const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            last7Days.push(dayNames[d.getDay()]);
            
            let dayProdTotal = 0;
            if (appState.records[dateStr]) {
                for (const actId in appState.records[dateStr]) {
                    const act = appState.activities.find(a => a.id === actId);
                    if (act && act.type === 'productive') {
                        dayProdTotal += appState.records[dateStr][actId].time;
                    }
                }
            }
            totals.push(dayProdTotal / 3600); 
        }

        const maxHours = Math.max(...totals, 4); 

        // Draw horizontal grid lines
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const numLines = 4;
        for(let i=0; i<=numLines; i++) {
            const y = 20 + (i * (height - 50) / numLines);
            ctx.moveTo(20, y);
            ctx.lineTo(width - 20, y);
        }
        ctx.stroke();

        const barWidth = (width - 40) / 7;
        ctx.font = '500 11px Inter, sans-serif';
        ctx.textAlign = 'center';

        for (let i = 0; i < 7; i++) {
            const h = (totals[i] / maxHours) * (height - 50);
            const x = 20 + i * barWidth + (barWidth * 0.1);
            const y = height - 30 - h;
            
            // Draw bar
            if (totals[i] > 0) {
                ctx.fillStyle = '#2563eb'; // Deep Blue
                ctx.fillRect(x, y, barWidth * 0.8, h);
            } else {
                ctx.fillStyle = '#e5e7eb'; // Gray for empty/future looking
                ctx.fillRect(x, height - 30 - 20, barWidth * 0.8, 20);
            }
            
            // X-axis label
            ctx.fillStyle = '#111827';
            ctx.fillText(last7Days[i], x + (barWidth * 0.4), height - 10);
        }

    }, [appState.records, appState.activities]);

    return (
        <div style={{ width: '100%', height: '200px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
        </div>
    );
}
