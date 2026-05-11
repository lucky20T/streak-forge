import { useEffect, useRef } from 'react';

export default function CanvasBarChart({ data, height = 200, isStacked = true, showLegend = true, type = 'bar', minPointWidth = 40, unit = 'h' }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !data || !data.labels || !data.datasets) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        // Calculate dynamic width based on data length
        const requiredWidth = Math.max(container.clientWidth, data.labels.length * minPointWidth);
        canvas.style.width = `${requiredWidth}px`;
        canvas.style.height = `${height}px`;
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const ht = rect.height;
        
        ctx.clearRect(0, 0, width, ht);

        // Find max value
        let maxVal = 0;
        if (isStacked && type === 'bar') {
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

        // Draw horizontal grid lines and Y-axis labels
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        const numLines = 4;
        const chartLeft = 40;
        const chartRight = width - 20;
        const chartTop = 20;
        const chartBottom = ht - 30;
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
            
            const val = maxVal - (i * maxVal / numLines);
            ctx.fillStyle = '#94a3b8';
            const formattedVal = val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val);
            const label = unit === 'h' ? `${formattedVal}${unit}` : `${unit}${formattedVal}`;
            ctx.fillText(label, chartLeft - 8, y);
        }

        const pointSpacing = (chartRight - chartLeft) / data.labels.length;
        const maxBarWidth = 60;
        const actualBarWidth = Math.min(pointSpacing * 0.8, maxBarWidth);
        
        ctx.font = '500 11px Inter, sans-serif';
        ctx.textAlign = 'center';

        if (type === 'bar') {
            for (let i = 0; i < data.labels.length; i++) {
                const x = chartLeft + i * pointSpacing + (pointSpacing - actualBarWidth) / 2;
                let currentY = chartBottom;
                let totalStackHeight = 0;

                data.datasets.forEach(ds => {
                    const val = ds.data[i] || 0;
                    if (val > 0) {
                        const h = (val / maxVal) * chartHeight;
                        currentY -= h;
                        ctx.fillStyle = ds.color || '#2563eb';
                        ctx.fillRect(x, currentY, actualBarWidth, h);
                        totalStackHeight += h;
                    }
                });

                if (totalStackHeight === 0) {
                    ctx.fillStyle = '#e5e7eb';
                    ctx.fillRect(x, chartBottom - 10, actualBarWidth, 10);
                }
                
                ctx.fillStyle = '#6b7280';
                ctx.fillText(data.labels[i], x + (actualBarWidth / 2), ht - 10);
            }
        } else if (type === 'line') {
            for (let i = 0; i < data.labels.length; i++) {
                const x = chartLeft + i * pointSpacing + (pointSpacing * 0.5);
                ctx.fillStyle = '#6b7280';
                ctx.fillText(data.labels[i], x, ht - 10);
            }

            data.datasets.forEach(ds => {
                ctx.beginPath();
                ctx.strokeStyle = ds.color || '#2563eb';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                for (let i = 0; i < data.labels.length; i++) {
                    const val = ds.data[i] || 0;
                    const x = chartLeft + i * pointSpacing + (pointSpacing * 0.5);
                    const y = chartBottom - ((val / maxVal) * chartHeight);

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();

                for (let i = 0; i < data.labels.length; i++) {
                    const val = ds.data[i] || 0;
                    const x = chartLeft + i * pointSpacing + (pointSpacing * 0.5);
                    const y = chartBottom - ((val / maxVal) * chartHeight);

                    ctx.beginPath();
                    ctx.fillStyle = '#ffffff';
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = ds.color || '#2563eb';
                    ctx.stroke();
                }
            });
        }

    }, [data, height, isStacked, type, minPointWidth]);

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
            <div ref={containerRef} style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
                <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
            </div>
        </div>
    );
}
