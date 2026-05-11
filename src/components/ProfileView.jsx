import React, { useState, useMemo } from 'react';
import { 
    Zap, 
    Target, 
    TrendingUp, 
    Plus, 
    Award, 
    Clock, 
    ChevronRight, 
    Shield, 
    Star, 
    BarChart,
    Settings,
    LayoutGrid,
    Trash2
} from 'lucide-react';
import { getSkillLevelInfo, formatHoursMins, generateId } from '../utils';
import TopHeader from './TopHeader';

export default function ProfileView({ appState, updateState, user, syncStatus, lastSynced, onSignIn, onLogout, onSyncNow }) {
    const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'goals'
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);

    // Form states for adding skill
    const [newSkillName, setNewSkillName] = useState('');
    const [selectedActivities, setSelectedActivities] = useState([]);

    // Form states for adding goal
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalDesc, setNewGoalDesc] = useState('');
    const [newGoalType, setNewGoalType] = useState('short-term');
    const [newGoalTarget, setNewGoalTarget] = useState(0);
    const [newGoalSkillId, setNewGoalSkillId] = useState('');

    const { skills = [], goals = [], activities = [], records = {} } = appState;

    // Calculate total time and weekly growth for each skill
    const skillsWithData = useMemo(() => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        return skills.map(skill => {
            let totalSeconds = 0;
            let weeklySeconds = 0;

            Object.entries(records).forEach(([date, dayRecords]) => {
                skill.activities.forEach(actId => {
                    if (dayRecords[actId]) {
                        const time = dayRecords[actId].time || 0;
                        totalSeconds += time;
                        if (date >= sevenDaysAgoStr) {
                            weeklySeconds += time;
                        }
                    }
                });
            });

            return {
                ...skill,
                ...getSkillLevelInfo(totalSeconds),
                totalSeconds,
                weeklyHours: weeklySeconds / 3600
            };
        });
    }, [skills, records]);

    const goalsWithData = useMemo(() => {
        return goals.map(goal => {
            let currentSeconds = 0;
            
            // If linked to a skill, use the skill's total time
            if (goal.skillId) {
                const skill = skillsWithData.find(s => s.id === goal.skillId);
                if (skill) currentSeconds = skill.totalSeconds;
            } 
            // If linked directly to an activity, use that activity's total time
            else if (goal.activityId) {
                Object.values(records).forEach(dayRecords => {
                    if (dayRecords[goal.activityId]) {
                        currentSeconds += dayRecords[goal.activityId].time || 0;
                    }
                });
            }

            const currentHours = currentSeconds / 3600;
            const progress = goal.targetHours > 0 ? Math.min(100, (currentHours / goal.targetHours) * 100) : 100;

            return {
                ...goal,
                currentHours,
                progress
            };
        });
    }, [goals, skillsWithData, records]);

    const handleAddSkill = () => {
        if (!newSkillName.trim()) return;
        const newSkill = {
            id: generateId('skill_'),
            name: newSkillName.trim(),
            activities: selectedActivities,
            createdAt: new Date().toISOString()
        };
        updateState({ skills: [...skills, newSkill] });
        setNewSkillName('');
        setSelectedActivities([]);
        setIsAddingSkill(false);
    };

    const handleDeleteSkill = (id) => {
        if (window.confirm('Are you sure you want to delete this skill? History linked to activities will remain, but the skill progression will be lost.')) {
            updateState({ skills: skills.filter(s => s.id !== id) });
        }
    };

    const handleAddGoal = () => {
        if (!newGoalTitle.trim()) return;
        const newGoal = {
            id: generateId('goal_'),
            title: newGoalTitle.trim(),
            description: newGoalDesc.trim(),
            type: newGoalType,
            targetHours: parseFloat(newGoalTarget) || 0,
            skillId: newGoalSkillId || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        updateState({ goals: [...goals, newGoal] });
        setNewGoalTitle('');
        setNewGoalDesc('');
        setNewGoalTarget(0);
        setNewGoalSkillId('');
        setIsAddingGoal(false);
    };

    const handleDeleteGoal = (id) => {
        updateState({ goals: goals.filter(g => g.id !== id) });
    };

    const toggleActivitySelection = (id) => {
        setSelectedActivities(prev => 
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const SkillCard = ({ skill }) => {
        const levelColor = skill.level >= 4 ? '#8b5cf6' : skill.level >= 3 ? '#ef4444' : skill.level >= 2 ? '#3b82f6' : skill.level >= 1 ? '#10b981' : '#6b7280';
        
        return (
            <div className="profile-card skill-card">
                <div className="skill-header">
                    <div className="skill-info">
                        <div className="skill-level-badge" style={{ backgroundColor: levelColor }}>
                            Lvl {skill.level}
                        </div>
                        <h3 className="skill-name">{skill.name}</h3>
                    </div>
                    <button className="icon-btn delete-btn" onClick={() => handleDeleteSkill(skill.id)}>
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="skill-stats">
                    <div className="stat-item">
                        <Clock size={14} />
                        <span>{Math.floor(skill.totalHours)}h Total</span>
                    </div>
                    <div className="stat-item">
                        <Award size={14} />
                        <span>{skill.label}</span>
                    </div>
                    <div className="stat-item">
                        <TrendingUp size={14} />
                        <span>+{skill.weeklyHours.toFixed(1)}h this week</span>
                    </div>
                </div>

                <div className="progress-section">
                    <div className="progress-info">
                        <span>Progress to Level {skill.level + 1}</span>
                        <span>{Math.round(skill.progress)}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div 
                            className="progress-bar-fill" 
                            style={{ 
                                width: `${skill.progress}%`,
                                backgroundColor: levelColor,
                                boxShadow: `0 0 10px ${levelColor}44`
                            }}
                        ></div>
                    </div>
                    {skill.nextLevelHours && (
                        <div className="next-level-hint">
                            {Math.ceil(skill.nextLevelHours - skill.totalHours)}h until Level {skill.level + 1}
                        </div>
                    )}
                </div>

                <div className="linked-activities">
                    {skill.activities.map(actId => {
                        const act = activities.find(a => a.id === actId);
                        return act ? (
                            <span key={actId} className="activity-tag-mini">
                                {act.name}
                            </span>
                        ) : null;
                    })}
                </div>
            </div>
        );
    };

    const GoalCard = ({ goal }) => {
        const isLongTerm = goal.type === 'long-term';
        
        return (
            <div className={`profile-card goal-card ${goal.completed ? 'completed' : ''}`}>
                <div className="goal-header">
                    <div className={`goal-type-tag ${goal.type}`}>
                        {goal.type === 'long-term' ? 'Long Term' : 'Short Term'}
                    </div>
                    <button className="icon-btn delete-btn" onClick={() => handleDeleteGoal(goal.id)}>
                        <Trash2 size={14} />
                    </button>
                </div>

                <h3 className="goal-title">{goal.title}</h3>
                <p className="goal-desc">{goal.description}</p>

                {goal.targetHours > 0 && (
                    <div className="goal-progress-section">
                        <div className="progress-info">
                            <span>{Math.floor(goal.currentHours)}h / {goal.targetHours}h</span>
                            <span>{Math.round(goal.progress)}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar-fill" 
                                style={{ 
                                    width: `${goal.progress}%`,
                                    backgroundColor: isLongTerm ? '#8b5cf6' : 'var(--accent)'
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                {goal.skillId && (
                    <div className="goal-link">
                        <Zap size={12} />
                        <span>Linked to {skills.find(s => s.id === goal.skillId)?.name}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="app-container profile-container">
            <TopHeader 
                title="Profile & Progression" 
                user={user} 
                syncStatus={syncStatus} 
                lastSynced={lastSynced} 
                onSignIn={onSignIn} 
                onLogout={onLogout} 
                onSyncNow={onSyncNow} 
            />

            <div className="profile-hero">
                <div className="hero-content">
                    <div className="avatar-placeholder">
                        <Award size={48} className="hero-icon" />
                    </div>
                    <div className="hero-text">
                        <h1>Personal Progression</h1>
                        <p>Track your long-term growth and skill mastery.</p>
                    </div>
                </div>
                
                <div className="hero-stats">
                    <div className="hero-stat">
                        <span className="stat-val">{skills.length}</span>
                        <span className="stat-label">Skills</span>
                    </div>
                    <div className="hero-stat">
                        <span className="stat-val">{goals.filter(g => g.type === 'long-term').length}</span>
                        <span className="stat-label">Life Goals</span>
                    </div>
                    <div className="hero-stat">
                        <span className="stat-val">{Math.round(skillsWithData.reduce((acc, s) => acc + s.totalHours, 0))}h</span>
                        <span className="stat-label">Total Focused</span>
                    </div>
                </div>
            </div>

            <div className="profile-nav">
                <button 
                    className={`profile-nav-item ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveTab('skills')}
                >
                    <LayoutGrid size={18} />
                    <span>Skills & Tools</span>
                </button>
                <button 
                    className={`profile-nav-item ${activeTab === 'goals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('goals')}
                >
                    <Target size={18} />
                    <span>Growth Goals</span>
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'skills' && (
                    <div className="skills-section">
                        <div className="section-header">
                            <h2>Skills Progression</h2>
                            <button className="btn primary sm" onClick={() => setIsAddingSkill(true)}>
                                <Plus size={16} /> Add Skill
                            </button>
                        </div>

                        <div className="skills-grid">
                            {skillsWithData.length === 0 ? (
                                <div className="empty-state">
                                    <Zap size={48} />
                                    <h3>No skills added yet</h3>
                                    <p>Add a skill and link it to your tracked activities to start leveling up.</p>
                                </div>
                            ) : (
                                skillsWithData.map(skill => <SkillCard key={skill.id} skill={skill} />)
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'goals' && (
                    <div className="goals-section">
                        <div className="section-header">
                            <h2>Life & Growth Goals</h2>
                            <button className="btn primary sm" onClick={() => setIsAddingGoal(true)}>
                                <Plus size={16} /> New Goal
                            </button>
                        </div>

                        <div className="goals-grid">
                            {goalsWithData.length === 0 ? (
                                <div className="empty-state">
                                    <Target size={48} />
                                    <h3>No goals defined</h3>
                                    <p>Set short-term or long-term milestones to stay motivated.</p>
                                </div>
                            ) : (
                                goalsWithData.map(goal => <GoalCard key={goal.id} goal={goal} />)
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isAddingSkill && (
                <div className="modal-overlay">
                    <div className="modal-content profile-modal">
                        <div className="modal-header">
                            <h3>Add New Skill</h3>
                            <button className="close-btn" onClick={() => setIsAddingSkill(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Skill Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Unreal Engine, Japanese, Piano" 
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Link to Activities</label>
                                <p className="help-text">Time tracked in these activities will contribute to this skill's level.</p>
                                <div className="activity-selection-grid">
                                    {activities.filter(a => !a.archived).map(act => (
                                        <div 
                                            key={act.id} 
                                            className={`activity-select-item ${selectedActivities.includes(act.id) ? 'selected' : ''}`}
                                            onClick={() => toggleActivitySelection(act.id)}
                                        >
                                            {act.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn outline" onClick={() => setIsAddingSkill(false)}>Cancel</button>
                            <button className="btn primary" onClick={handleAddSkill}>Create Skill</button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingGoal && (
                <div className="modal-overlay">
                    <div className="modal-content profile-modal">
                        <div className="modal-header">
                            <h3>Set New Goal</h3>
                            <button className="close-btn" onClick={() => setIsAddingGoal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Goal Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Finish Unreal Course" 
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    placeholder="What does success look like?" 
                                    value={newGoalDesc}
                                    onChange={(e) => setNewGoalDesc(e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Goal Type</label>
                                    <select value={newGoalType} onChange={(e) => setNewGoalType(e.target.value)}>
                                        <option value="short-term">Short-term</option>
                                        <option value="long-term">Long-term</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>Target Hours</label>
                                    <input 
                                        type="number" 
                                        value={newGoalTarget}
                                        onChange={(e) => setNewGoalTarget(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Associated Skill (Optional)</label>
                                <select value={newGoalSkillId} onChange={(e) => setNewGoalSkillId(e.target.value)}>
                                    <option value="">None</option>
                                    {skills.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn outline" onClick={() => setIsAddingGoal(false)}>Cancel</button>
                            <button className="btn primary" onClick={handleAddGoal}>Create Goal</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .profile-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .profile-hero {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    border-radius: 24px;
                    padding: 3rem;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .hero-content {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .avatar-placeholder {
                    width: 100px;
                    height: 100px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .hero-icon {
                    color: #fbbf24;
                }

                .hero-text h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-text p {
                    color: #94a3b8;
                    font-size: 1.1rem;
                }

                .hero-stats {
                    display: flex;
                    gap: 3rem;
                }

                .hero-stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .stat-val {
                    font-size: 2rem;
                    font-weight: 800;
                    color: white;
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                }

                .profile-nav {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    background: #f1f5f9;
                    padding: 0.5rem;
                    border-radius: 16px;
                    width: fit-content;
                }

                .profile-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .profile-nav-item.active {
                    background: white;
                    color: var(--accent);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .section-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .skills-grid, .goals-grid {
                    display: grid;
                    grid-templateColumns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 1.5rem;
                }

                .profile-card {
                    background: white;
                    border-radius: 20px;
                    padding: 1.5rem;
                    border: 1px solid #e2e8f0;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .profile-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .skill-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .skill-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .skill-level-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                }

                .skill-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .skill-stats {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .progress-section {
                    margin-bottom: 1.5rem;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #475569;
                }

                .progress-bar-container {
                    height: 8px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 1s ease-out;
                }

                .next-level-hint {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    margin-top: 0.5rem;
                    text-align: right;
                }

                .linked-activities {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f1f5f9;
                }

                .activity-tag-mini {
                    font-size: 0.7rem;
                    padding: 0.2rem 0.6rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    color: #64748b;
                    font-weight: 600;
                }

                .goal-card {
                    border-left: 4px solid var(--accent);
                }

                .goal-card.long-term {
                    border-left-color: #8b5cf6;
                }

                .goal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .goal-type-tag {
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    letter-spacing: 0.5px;
                }

                .goal-type-tag.short-term {
                    background: #eff6ff;
                    color: #3b82f6;
                }

                .goal-type-tag.long-term {
                    background: #f5f3ff;
                    color: #8b5cf6;
                }

                .goal-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: #1e293b;
                }

                .goal-desc {
                    font-size: 0.9rem;
                    color: #64748b;
                    line-height: 1.5;
                    margin-bottom: 1.5rem;
                }

                .goal-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin-top: 1rem;
                }

                .empty-state {
                    grid-column: 1 / -1;
                    padding: 4rem;
                    text-align: center;
                    background: #f8fafc;
                    border-radius: 24px;
                    border: 2px dashed #e2e8f0;
                    color: #94a3b8;
                }

                .empty-state h3 {
                    color: #475569;
                    margin: 1rem 0 0.5rem 0;
                }

                .activity-selection-grid {
                    display: grid;
                    grid-templateColumns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }

                .activity-select-item {
                    padding: 0.5rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .activity-select-item.selected {
                    background: var(--accent);
                    color: white;
                    border-color: var(--accent);
                }

                .delete-btn {
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .profile-card:hover .delete-btn {
                    opacity: 1;
                }

                @media (max-width: 768px) {
                    .profile-hero {
                        flex-direction: column;
                        padding: 2rem;
                        gap: 2rem;
                        text-align: center;
                    }
                    .hero-content {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .hero-stats {
                        gap: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
