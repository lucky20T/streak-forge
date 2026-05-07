import { useEffect, useRef } from 'react';
import { getDateString } from '../utils';

export default function ExerciseWeeklyChart({ appState }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);

        const last7Days = [];
        const totals = [];
        
        for (let i = 6; i >= 0; i--) {
            const dateStr = getDateString(i);
            const d = new Date(dateStr);
            last7Days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            
            let dayRepsTotal = 0;
            if (appState.exerciseRecords[dateStr]) {
                appState.exerciseRecords[dateStr].forEach(log => {
                    dayRepsTotal += (log.sets * log.reps);
                });
            }
            totals.push(dayRepsTotal); 
        }

        const maxReps = Math.max(...totals, 50); 
        
        ctx.strokeStyle = '#333333';
        ctx.beginPath();
        ctx.moveTo(40, 10);
        ctx.lineTo(40, height - 30);
        ctx.lineTo(width - 10, height - 30);
        ctx.stroke();

        const barWidth = (width - 70) / 7;
        ctx.fillStyle = '#22c55e';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';

        for (let i = 0; i < 7; i++) {
            const h = (totals[i] / maxReps) * (height - 50);
            const x = 50 + i * barWidth + (barWidth * 0.1);
            const y = height - 30 - h;
            
            ctx.fillRect(x, y, barWidth * 0.8, h);
            
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText(last7Days[i], x + (barWidth * 0.4), height - 10);
            
            if (totals[i] > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.fillText(totals[i], x + (barWidth * 0.4), y - 5);
            }
            ctx.fillStyle = '#22c55e';
        }

        ctx.fillStyle = '#aaaaaa';
        ctx.textAlign = 'right';
        ctx.fillText('0', 30, height - 25);
        ctx.fillText(Math.floor(maxReps/2), 30, height - 25 - (height-50)/2);
        ctx.fillText(maxReps, 30, 20);
    }, [appState.exerciseRecords]);

    return (
        <div className="chart-container">
            <canvas ref={canvasRef} width="600" height="250"></canvas>
        </div>
    );
}
