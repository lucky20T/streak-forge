import { useState } from 'react';
import { generateId, getCurrentTime, getTodayString } from '../utils';

export default function LogMealModal({ appState, updateState, onClose }) {
    const [mealName, setMealName] = useState('');
    const [category, setCategory] = useState('Healthy Homemade');

    const categories = [
        "Healthy Homemade", "Healthy Outside Food", "High Protein", "Balanced Meal",
        "Snack", "Beverage", "Junk Food", "Sugary", "Fried Food", "Fast Food", "Cheat Meal", "Other"
    ];

    const handleSave = () => {
        if (!mealName.trim()) return;

        const today = getTodayString();
        const currentNutrition = appState.nutritionRecords[today] || { meals: [], water: [] };
        
        const newMeal = {
            id: generateId(),
            meal: mealName.trim(),
            category: category,
            timestamp: getCurrentTime()
        };

        updateState({
            nutritionRecords: {
                ...appState.nutritionRecords,
                [today]: {
                    ...currentNutrition,
                    meals: [...currentNutrition.meals, newMeal]
                }
            }
        });

        onClose();
    };

    return (
        <div className="overlay overlay-active" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={onClose}>✖</button>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🍴</span> Log a Meal</h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Meal Description</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Chicken Rice" 
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        autoFocus
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Category</label>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn outline" onClick={onClose}>Cancel</button>
                    <button className="btn primary" onClick={handleSave}>Log Meal</button>
                </div>
            </div>
        </div>
    );
}
