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
        const prodTotals = [];
        const entTotals = [];
        
        for (let i = 6; i >= 0; i--) {
            const dateStr = getDateString(i);
            const d = new Date(dateStr);
            const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            last7Days.push(dayNames[d.getDay()]);
            
            let dayProdTotal = 0;
            let dayEntTotal = 0;
            
            if (appState.records[dateStr]) {
                for (const actId in appState.records[dateStr]) {
                    const act = appState.activities.find(a => a.id === actId);
                    if (act) {
                        if (act.type === 'productive') {
                            dayProdTotal += appState.records[dateStr][actId].time;
                        } else {
                            dayEntTotal += appState.records[dateStr][actId].time;
                        }
                    }
                }
            }
            prodTotals.push(dayProdTotal / 3600);
            entTotals.push(dayEntTotal / 3600);
        }

        const maxHours = Math.max(...prodTotals.map((p, i) => p + entTotals[i]), 4); 

        // Draw horizontal grid lines
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const numLines = 4;
        const chartLeft = 40;
        const chartRight = width - 20;
        const chartTop = 20;
        const chartBottom = height - 30;
        const chartHeight = chartBottom - chartTop;

        ctx.font = '500 10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        for(let i=0; i<=numLines; i++) {
            const y = chartTop + (i * chartHeight / numLines);
            ctx.beginPath();
            ctx.moveTo(chartLeft, y);
            ctx.lineTo(chartRight, y);
            ctx.stroke();
            
            const val = maxHours - (i * maxHours / numLines);
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`${Math.round(val)}h`, chartLeft - 8, y);
        }

        const barWidth = (chartRight - chartLeft) / 7;
        ctx.font = '500 11px Inter, sans-serif';
        ctx.textAlign = 'center';

        for (let i = 0; i < 7; i++) {
            const prodH = (prodTotals[i] / maxHours) * chartHeight;
            const entH = (entTotals[i] / maxHours) * chartHeight;
            const x = chartLeft + i * barWidth + (barWidth * 0.1);
            let y = chartBottom;
            
            if (prodTotals[i] > 0 || entTotals[i] > 0) {
                if (prodTotals[i] > 0) {
                    y -= prodH;
                    ctx.fillStyle = '#2563eb'; 
                    ctx.fillRect(x, y, barWidth * 0.8, prodH);
                }
                
                if (entTotals[i] > 0) {
                    y -= entH;
                    ctx.fillStyle = '#8b5cf6'; 
                    ctx.fillRect(x, y, barWidth * 0.8, entH);
                }
            } else {
                ctx.fillStyle = '#e5e7eb'; 
                ctx.fillRect(x, chartBottom - 20, barWidth * 0.8, 20);
            }
            
            ctx.fillStyle = '#111827';
            ctx.fillText(last7Days[i], x + (barWidth * 0.4), height - 10);
        }

    }, [appState.records, appState.activities]);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }}></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Productive</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }}></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Entertainment</span>
                </div>
            </div>
            <div style={{ width: '100%', height: '200px' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
            </div>
        </div>
    );
}
