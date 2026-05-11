import React, { useState, useMemo, useEffect } from 'react';
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
    Trash2,
    Pencil,
    CheckCircle2,
    Circle,
    Activity as ActivityIcon,
    Rocket,
    Calendar,
    Flag,
    Mountain
} from 'lucide-react';
import { getSkillLevelInfo, formatHoursMins, generateId } from '../utils';
import TopHeader from './TopHeader';

export default function ProfileView({ appState, updateState, user, syncStatus, lastSynced, onSignIn, onLogout, onSyncNow }) {
    const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'goals'
    
    // Modal states
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    
    // Editing states
    const [editingSkill, setEditingSkill] = useState(null);
    const [editingGoal, setEditingGoal] = useState(null);

    // Form states
    const [skillName, setSkillName] = useState('');
    const [selectedActivities, setSelectedActivities] = useState([]);

    const [goalTitle, setGoalTitle] = useState('');
    const [goalDesc, setGoalDesc] = useState('');
    const [goalType, setGoalType] = useState('short-term');
    const [goalTarget, setGoalTarget] = useState(0);
    const [goalSkillId, setGoalSkillId] = useState('');
    const [goalActivityId, setGoalActivityId] = useState('');

    const { skills = [], goals = [], activities = [], records = {} } = appState;

    // Helper to sync form with editing object
    useEffect(() => {
        if (editingSkill) {
            setSkillName(editingSkill.name);
            setSelectedActivities(editingSkill.activities || []);
        } else {
            setSkillName('');
            setSelectedActivities([]);
        }
    }, [editingSkill]);

    useEffect(() => {
        if (editingGoal) {
            setGoalTitle(editingGoal.title);
            setGoalDesc(editingGoal.description);
            setGoalType(editingGoal.type);
            setGoalTarget(editingGoal.targetHours);
            setGoalSkillId(editingGoal.skillId || '');
            setGoalActivityId(editingGoal.activityId || '');
        } else {
            setGoalTitle('');
            setGoalDesc('');
            setGoalType('short-term');
            setGoalTarget(0);
            setGoalSkillId('');
            setGoalActivityId('');
        }
    }, [editingGoal]);

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
                (skill.activities || []).forEach(actId => {
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
            
            if (goal.skillId) {
                const skill = skillsWithData.find(s => s.id === goal.skillId);
                if (skill) currentSeconds = skill.totalSeconds;
            } else if (goal.activityId) {
                Object.values(records).forEach(dayRecords => {
                    if (dayRecords[goal.activityId]) {
                        currentSeconds += dayRecords[goal.activityId].time || 0;
                    }
                });
            }

            const currentHours = currentSeconds / 3600;
            const progress = goal.targetHours > 0 ? Math.min(100, (currentHours / goal.targetHours) * 100) : 100;
            const isAutoCompleted = goal.targetHours > 0 && currentHours >= goal.targetHours;

            return {
                ...goal,
                currentHours,
                progress,
                completed: goal.completed || isAutoCompleted
            };
        });
    }, [goals, skillsWithData, records]);

    const handleSaveSkill = () => {
        if (!skillName.trim()) return;
        
        let updatedSkills;
        if (editingSkill) {
            updatedSkills = skills.map(s => s.id === editingSkill.id ? { ...s, name: skillName.trim(), activities: selectedActivities } : s);
        } else {
            const newSkill = {
                id: generateId('skill_'),
                name: skillName.trim(),
                activities: selectedActivities,
                createdAt: new Date().toISOString()
            };
            updatedSkills = [...skills, newSkill];
        }
        
        updateState({ skills: updatedSkills });
        setIsSkillModalOpen(false);
        setEditingSkill(null);
    };

    const handleDeleteSkill = (id) => {
        if (window.confirm('Delete this skill? This will not affect your activity history.')) {
            updateState({ skills: skills.filter(s => s.id !== id) });
        }
    };

    const handleSaveGoal = () => {
        if (!goalTitle.trim()) return;
        
        let updatedGoals;
        if (editingGoal) {
            updatedGoals = goals.map(g => g.id === editingGoal.id ? { 
                ...g, 
                title: goalTitle.trim(), 
                description: goalDesc.trim(), 
                type: goalType, 
                targetHours: parseFloat(goalTarget) || 0,
                skillId: goalSkillId || null,
                activityId: goalActivityId || null
            } : g);
        } else {
            const newGoal = {
                id: generateId('goal_'),
                title: goalTitle.trim(),
                description: goalDesc.trim(),
                type: goalType,
                targetHours: parseFloat(goalTarget) || 0,
                skillId: goalSkillId || null,
                activityId: goalActivityId || null,
                completed: false,
                createdAt: new Date().toISOString()
            };
            updatedGoals = [...goals, newGoal];
        }
        
        updateState({ goals: updatedGoals });
        setIsGoalModalOpen(false);
        setEditingGoal(null);
    };

    const handleDeleteGoal = (id) => {
        if (window.confirm('Delete this goal?')) {
            updateState({ goals: goals.filter(g => g.id !== id) });
        }
    };

    const handleToggleGoal = (id) => {
        const updated = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
        updateState({ goals: updated });
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
                    <div className="card-actions">
                        <button className="icon-btn" onClick={() => { setEditingSkill(skill); setIsSkillModalOpen(true); }}>
                            <Pencil size={14} />
                        </button>
                        <button className="icon-btn delete-btn" onClick={() => handleDeleteSkill(skill.id)}>
                            <Trash2 size={14} />
                        </button>
                    </div>
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
                    {(skill.activities || []).map(actId => {
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
        const isCompleted = goal.completed;
        const Icon = isLongTerm ? Mountain : Rocket;
        
        return (
            <div className={`profile-card goal-card-enhanced ${goal.type} ${isCompleted ? 'completed' : ''}`}>
                <div className="goal-card-bg-icon">
                    <Icon size={120} />
                </div>
                
                <div className="goal-header">
                    <div className="goal-type-info">
                        <div className={`goal-type-tag-enhanced ${goal.type}`}>
                            <Icon size={12} style={{ marginRight: '4px' }} />
                            {goal.type === 'long-term' ? 'Long Term' : 'Short Term'}
                        </div>
                        {isCompleted && <span className="completed-badge-enhanced"><CheckCircle2 size={12} /> Success</span>}
                    </div>
                    <div className="card-actions">
                        <button className="icon-btn-ghost" onClick={() => handleToggleGoal(goal.id)} title={isCompleted ? "Re-open goal" : "Complete goal"}>
                            {isCompleted ? <CheckCircle2 size={16} color="var(--success)" /> : <Circle size={16} />}
                        </button>
                        <button className="icon-btn-ghost" onClick={() => { setEditingGoal(goal); setIsGoalModalOpen(true); }}>
                            <Pencil size={16} />
                        </button>
                        <button className="icon-btn-ghost delete-btn" onClick={() => handleDeleteGoal(goal.id)}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <h3 className="goal-title">{goal.title}</h3>
                <p className="goal-desc">{goal.description}</p>

                {goal.targetHours > 0 && (
                    <div className="goal-progress-section">
                        <div className="progress-info">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {Math.floor(goal.currentHours)}h / {goal.targetHours}h
                            </span>
                            <span>{Math.round(goal.progress)}%</span>
                        </div>
                        <div className="progress-bar-container-enhanced">
                            <div 
                                className="progress-bar-fill-enhanced" 
                                style={{ 
                                    width: `${goal.progress}%`,
                                    background: isCompleted ? 'var(--success)' : (isLongTerm ? 'linear-gradient(90deg, #8b5cf6, #d946ef)' : 'linear-gradient(90deg, #3b82f6, #06b6d4)')
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="goal-links-row">
                    {goal.skillId && (
                        <div className="goal-link-tag">
                            <Zap size={10} />
                            <span>{skills.find(s => s.id === goal.skillId)?.name}</span>
                        </div>
                    )}
                    {goal.activityId && (
                        <div className="goal-link-tag">
                            <ActivityIcon size={10} />
                            <span>{activities.find(a => a.id === goal.activityId)?.name}</span>
                        </div>
                    )}
                </div>
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
                        <span className="stat-val">{goals.length}</span>
                        <span className="stat-label">Goals</span>
                    </div>
                    <div className="hero-stat">
                        <span className="stat-val">{Math.round(skillsWithData.reduce((acc, s) => acc + s.totalHours, 0))}h</span>
                        <span className="stat-label">Total Focused</span>
                    </div>
                </div>
            </div>

            <div className="profile-nav-enhanced">
                <button 
                    className={`profile-nav-item-enhanced ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveTab('skills')}
                >
                    <LayoutGrid size={18} />
                    <span>Skills & Mastery</span>
                </button>
                <button 
                    className={`profile-nav-item-enhanced ${activeTab === 'goals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('goals')}
                >
                    <Target size={18} />
                    <span>Milestones & Goals</span>
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'skills' && (
                    <div className="skills-section">
                        <div className="section-header-enhanced">
                            <div>
                                <h2>Skills Progression</h2>
                                <p>Gain XP and level up your core capabilities.</p>
                            </div>
                            <button className="btn primary-enhanced" onClick={() => { setEditingSkill(null); setIsSkillModalOpen(true); }}>
                                <Plus size={18} /> Add Skill
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
                        <div className="section-header-enhanced">
                            <div>
                                <h2>Growth Milestones</h2>
                                <p>Set clear targets for short-term wins and life-long dreams.</p>
                            </div>
                            <button className="btn primary-enhanced" onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}>
                                <Plus size={18} /> Create Goal
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

            {/* Skill Modal */}
            {isSkillModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content profile-modal">
                        <div className="modal-header">
                            <div className="modal-title-with-icon">
                                <div className="modal-icon-bg"><Zap size={20} color="var(--accent)" /></div>
                                <h3>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h3>
                            </div>
                            <button className="close-btn" onClick={() => setIsSkillModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Skill Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Unreal Engine, Japanese, Piano" 
                                    value={skillName}
                                    onChange={(e) => setSkillName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Link to Activities</label>
                                <p className="help-text">Associate tracking categories with this skill.</p>
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
                            <button className="btn outline" onClick={() => setIsSkillModalOpen(false)}>Cancel</button>
                            <button className="btn primary" onClick={handleSaveSkill}>{editingSkill ? 'Save Changes' : 'Create Skill'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Goal Modal */}
            {isGoalModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content profile-modal goal-modal-wide">
                        <div className="modal-header">
                            <div className="modal-title-with-icon">
                                <div className="modal-icon-bg"><Target size={20} color="#8b5cf6" /></div>
                                <h3>{editingGoal ? 'Edit Milestone' : 'Set New Milestone'}</h3>
                            </div>
                            <button className="close-btn" onClick={() => setIsGoalModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            
                            <div className="type-selector-segment">
                                <button 
                                    className={`segment-btn ${goalType === 'short-term' ? 'active' : ''}`}
                                    onClick={() => setGoalType('short-term')}
                                >
                                    <Rocket size={16} /> Short Term
                                </button>
                                <button 
                                    className={`segment-btn ${goalType === 'long-term' ? 'active' : ''}`}
                                    onClick={() => setGoalType('long-term')}
                                >
                                    <Mountain size={16} /> Long Term
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Goal Title</label>
                                <input 
                                    type="text" 
                                    placeholder={goalType === 'long-term' ? "e.g. Become Senior Unreal Developer" : "e.g. Finish Module 1"} 
                                    value={goalTitle}
                                    onChange={(e) => setGoalTitle(e.target.value)}
                                    className="large-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Objective Description</label>
                                <textarea 
                                    placeholder="Define what success looks like for this milestone..." 
                                    value={goalDesc}
                                    onChange={(e) => setGoalDesc(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            
                            <div className="form-row-enhanced">
                                <div className="form-group flex-1">
                                    <label>Target Invested Time (Hours)</label>
                                    <div className="input-with-icon">
                                        <Clock size={16} className="input-icon" />
                                        <input 
                                            type="number" 
                                            value={goalTarget}
                                            onChange={(e) => setGoalTarget(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="help-text">Set 0 for binary goals (manual complete).</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Connect Progress To</label>
                                <div className="link-options-grid">
                                    <div className="link-option">
                                        <span className="link-label">Mastery Skill</span>
                                        <select value={goalSkillId} onChange={(e) => { setGoalSkillId(e.target.value); setGoalActivityId(''); }}>
                                            <option value="">No Skill Linked</option>
                                            {skills.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="link-option">
                                        <span className="link-label">Specific Activity</span>
                                        <select value={goalActivityId} onChange={(e) => { setGoalActivityId(e.target.value); setGoalSkillId(''); }}>
                                            <option value="">No Activity Linked</option>
                                            {activities.filter(a => !a.archived).map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn outline" onClick={() => setIsGoalModalOpen(false)}>Discard</button>
                            <button className="btn primary-enhanced" onClick={handleSaveGoal}>{editingGoal ? 'Update Milestone' : 'Ignite Goal'}</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .profile-container { max-width: 1200px; margin: 0 auto; }

                .profile-hero {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    border-radius: 24px; padding: 3rem; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }

                .hero-text h1 {
                    font-size: 2.8rem; font-weight: 800; margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }

                .profile-nav-enhanced {
                    display: flex; gap: 1rem; margin-bottom: 2.5rem; background: #f8fafc; padding: 0.6rem; border-radius: 20px; width: fit-content;
                    border: 1px solid #e2e8f0;
                }

                .profile-nav-item-enhanced {
                    display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 1.8rem; border-radius: 14px; border: none; background: transparent;
                    color: #64748b; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .profile-nav-item-enhanced.active {
                    background: white; color: var(--accent); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transform: translateY(-1px);
                }

                .section-header-enhanced {
                    display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;
                }

                .section-header-enhanced h2 { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; }
                .section-header-enhanced p { color: #64748b; font-size: 1rem; }

                .btn.primary-enhanced {
                    background: #1e293b; color: white; font-weight: 700; padding: 0.8rem 1.5rem; border-radius: 12px;
                    transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .btn.primary-enhanced:hover { background: #0f172a; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.15); }

                .profile-card {
                    background: white; border-radius: 24px; padding: 1.8rem; border: 1px solid #e2e8f0; transition: all 0.3s;
                    display: flex; flex-direction: column; position: relative; overflow: hidden;
                }

                .skill-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }

                /* Enhanced Goal Card */
                .goal-card-enhanced {
                    background: white; border-radius: 24px; padding: 2rem; border: 1px solid #e2e8f0; transition: all 0.3s;
                    display: flex; flex-direction: column; position: relative; overflow: hidden; min-height: 280px;
                }

                .goal-card-bg-icon {
                    position: absolute; bottom: -20px; right: -20px; opacity: 0.03; transform: rotate(-15deg); color: #000;
                    pointer-events: none; transition: all 0.5s;
                }
                .goal-card-enhanced:hover .goal-card-bg-icon { transform: rotate(0deg) scale(1.1); opacity: 0.06; }

                .goal-card-enhanced.short-term { border-top: 5px solid #3b82f6; }
                .goal-card-enhanced.long-term { border-top: 5px solid #8b5cf6; }
                .goal-card-enhanced.completed { border-top-color: var(--success); background: #f0fdf4; }

                .goal-type-tag-enhanced {
                    display: flex; align-items: center; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
                    padding: 0.3rem 0.8rem; border-radius: 10px; letter-spacing: 0.5px;
                }
                .goal-type-tag-enhanced.short-term { background: #eff6ff; color: #3b82f6; }
                .goal-type-tag-enhanced.long-term { background: #f5f3ff; color: #8b5cf6; }

                .completed-badge-enhanced {
                    font-size: 0.75rem; font-weight: 800; color: var(--success); display: flex; align-items: center; gap: 4px;
                    background: #dcfce7; padding: 0.3rem 0.8rem; border-radius: 10px;
                }

                .goal-title { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 1rem 0 0.5rem 0; line-height: 1.2; }
                .goal-desc { font-size: 0.95rem; color: #64748b; line-height: 1.6; margin-bottom: 2rem; }

                .progress-bar-container-enhanced { height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden; margin-top: 0.5rem; }
                .progress-bar-fill-enhanced { height: 100%; border-radius: 10px; transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); }

                .goal-link-tag {
                    display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #64748b; font-weight: 700;
                    background: #f8fafc; padding: 0.3rem 0.7rem; border-radius: 8px; border: 1px solid #e2e8f0;
                }

                .icon-btn-ghost {
                    background: transparent; border: none; padding: 0.5rem; border-radius: 8px; color: #94a3b8; cursor: pointer; transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center;
                }
                .icon-btn-ghost:hover { background: #f1f5f9; color: #1e293b; }

                /* Modal UX */
                .modal-content.profile-modal { border-radius: 32px; border: none; }
                .modal-title-with-icon { display: flex; align-items: center; gap: 1rem; }
                .modal-icon-bg { width: 42px; height: 42px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; }

                .type-selector-segment {
                    display: flex; background: #f1f5f9; padding: 0.4rem; border-radius: 16px; margin-bottom: 0.5rem;
                }
                .segment-btn {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8rem; border-radius: 12px;
                    border: none; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; transition: all 0.2s;
                }
                .segment-btn.active { background: white; color: #1e293b; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

                .large-input { font-size: 1.2rem !important; font-weight: 700 !important; border-width: 2px !important; }
                .large-input:focus { border-color: var(--accent) !important; }

                .input-with-icon { position: relative; }
                .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .input-with-icon input { padding-left: 2.5rem !important; width: 100%; }

                .link-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .link-option { display: flex; flex-direction: column; gap: 0.4rem; }
                .link-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }

                @media (max-width: 600px) {
                    .link-options-grid { grid-template-columns: 1fr; }
                    .form-row-enhanced { flex-direction: column; }
                }
            `}</style>
        </div>
    );
}
