import { useEffect, useRef } from 'react';

export default function CanvasBarChart({ data, height = 200, isStacked = true, showLegend = true }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data || !data.labels || !data.datasets) return;
        const ctx = canvas.getContext('2d');
        
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const ht = rect.height;
        
        ctx.clearRect(0, 0, width, ht);

        // Find max value
        let maxVal = 0;
        if (isStacked) {
            for (let i = 0; i < data.labels.length; i++) {
                let sum = 0;
                data.datasets.forEach(ds => sum += (ds.data[i] || 0));
                if (sum > maxVal) maxVal = sum;
            }
        } else {
            data.datasets.forEach(ds => {
                const mx = Math.max(...ds.data);
                if (mx > maxVal) maxVal = mx;
            });
        }
        
        // Ensure minimum scale so it doesn't break if all data is 0
        if (maxVal === 0) maxVal = 10; 
        
        // Add 10% padding to top
        maxVal = maxVal * 1.1;

        // Draw horizontal grid lines
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const numLines = 4;
        for(let i=0; i<=numLines; i++) {
            const y = 20 + (i * (ht - 50) / numLines);
            ctx.moveTo(20, y);
            ctx.lineTo(width - 20, y);
        }
        ctx.stroke();

        const barWidth = (width - 40) / data.labels.length;
        ctx.font = '500 11px Inter, sans-serif';
        ctx.textAlign = 'center';

        for (let i = 0; i < data.labels.length; i++) {
            const x = 20 + i * barWidth + (barWidth * 0.1);
            let currentY = ht - 30;
            let totalStackHeight = 0;

            data.datasets.forEach(ds => {
                const val = ds.data[i] || 0;
                if (val > 0) {
                    const h = (val / maxVal) * (ht - 50);
                    currentY -= h;
                    ctx.fillStyle = ds.color || '#2563eb';
                    ctx.fillRect(x, currentY, barWidth * 0.8, h);
                    totalStackHeight += h;
                }
            });

            // If empty, draw subtle gray base
            if (totalStackHeight === 0) {
                ctx.fillStyle = '#e5e7eb';
                ctx.fillRect(x, ht - 30 - 10, barWidth * 0.8, 10);
            }
            
            // X-axis label
            ctx.fillStyle = '#6b7280';
            ctx.fillText(data.labels[i], x + (barWidth * 0.4), ht - 10);
        }

    }, [data, height, isStacked]);

    return (
        <div style={{ width: '100%' }}>
            {showLegend && data?.datasets && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 500 }}>
                    {data.datasets.map(ds => (
                        <div key={ds.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: ds.color || '#2563eb' }}></div>
                            <span style={{ color: 'var(--text-secondary)' }}>{ds.label}</span>
                        </div>
                    ))}
                </div>
            )}
            <div style={{ width: '100%', height: `${height}px` }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
            </div>
        </div>
    );
}
