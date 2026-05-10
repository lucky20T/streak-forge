import React, { useRef, useEffect } from 'react';

export default function CanvasPieChart({ data, height = 300 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const h = rect.height;

        ctx.clearRect(0, 0, width, h);

        const total = data.reduce((sum, item) => sum + item.value, 0);

        if (total === 0) {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('No data available', width / 2, h / 2);
            return;
        }

        const centerX = width / 2;
        const centerY = h / 2;
        const radius = Math.min(centerX, centerY) - 10;

        let currentAngle = -0.5 * Math.PI;

        data.forEach(item => {
            if (item.value <= 0) return;
            
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // Add a subtle border between slices
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Label text (percentage) if slice is large enough
            if (sliceAngle > 0.2) {
                const labelX = centerX + (radius * 0.65) * Math.cos(currentAngle + sliceAngle / 2);
                const labelY = centerY + (radius * 0.65) * Math.sin(currentAngle + sliceAngle / 2);
                
                const percent = Math.round((item.value / total) * 100) + '%';
                
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(percent, labelX, labelY);
            }

            currentAngle += sliceAngle;
        });

    }, [data, height]);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
                <canvas 
                    ref={canvasRef} 
                    style={{ width: '100%', height: '100%', display: 'block' }}
                />
            </div>
            
            {total > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                    {data.filter(d => d.value > 0).map((item, idx) => {
                        const percent = Math.round((item.value / total) * 100);
                        return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></div>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>({percent}%)</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
