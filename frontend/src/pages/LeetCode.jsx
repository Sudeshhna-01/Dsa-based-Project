import { useState } from 'react';
import { apiRequest } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/LeetCode.css';

const LeetCode = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a LeetCode username');
      return;
    }

    setLoading(true);
    setError('');
    setAnalytics(null);

    try {
      const result = await apiRequest(`/leetcode/${username}/analytics`);
      
      if (result.success) {
        const analyticsData = result.data?.data || result.data || result;
        setAnalytics(analyticsData);
      } else {
        setError(result.error || 'Failed to fetch LeetCode data');
      }
    } catch (err) {
      console.error('Error fetching LeetCode data:', err);
      setError('Failed to fetch LeetCode data. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString();
    }
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'var(--easy-color)',
      Medium: 'var(--medium-color)',
      Hard: 'var(--hard-color)',
      EASY: 'var(--easy-color)',
      MEDIUM: 'var(--medium-color)',
      HARD: 'var(--hard-color)'
    };
    return colors[difficulty] || 'var(--text-secondary)';
  };

  const hasData = analytics && (
    (analytics.profile && Object.keys(analytics.profile).length > 0) ||
    (analytics.solved && Object.keys(analytics.solved).length > 0) ||
    (analytics.badges && analytics.badges.badges && Array.isArray(analytics.badges.badges) && analytics.badges.badges.length > 0) ||
    (analytics.contest && Object.keys(analytics.contest).length > 0) ||
    (analytics.acSubmissions && analytics.acSubmissions.submission && Array.isArray(analytics.acSubmissions.submission) && analytics.acSubmissions.submission.length > 0) ||
    (analytics.skills && (analytics.skills.fundamental || analytics.skills.intermediate || analytics.skills.advanced)) ||
    (analytics.languages && analytics.languages.languageProblemCount && Array.isArray(analytics.languages.languageProblemCount) && analytics.languages.languageProblemCount.length > 0) ||
    (analytics.progress && Object.keys(analytics.progress).length > 0)
  );

  return (
    <div className="leetcode-page">
      <div className="leetcode-header">
        <h1>LeetCode Analytics</h1>
        <p className="subtitle">Analyze your LeetCode profile and track your progress</p>
      </div>

      <form onSubmit={handleSubmit} className="leetcode-search-form">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Enter LeetCode username (e.g., neetcode)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="leetcode-input"
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Fetching LeetCode data...
          </p>
        </div>
      )}

      {!loading && analytics && !hasData && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>No data available for this username. Please check the username and try again.</p>
        </div>
      )}

      {!loading && hasData && (
        <div className="leetcode-analytics">
          {analytics.profile && Object.keys(analytics.profile).length > 0 && (
            <section className="profile-section">
              <div className="profile-card">
                <div className="profile-header">
                  <h2>{String(analytics.profile.name || analytics.profile.username || username)}</h2>
                  <span className="username-badge">@{username}</span>
                </div>
                <div className="profile-stats">
                  <div className="stat-box">
                    <div className="stat-value">{String(analytics.profile.ranking || 'N/A')}</div>
                    <div className="stat-label">Ranking</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{String(analytics.profile.reputation || 'N/A')}</div>
                    <div className="stat-label">Reputation</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{String(analytics.profile.school || analytics.profile.company || 'N/A')}</div>
                    <div className="stat-label">{analytics.profile.school ? 'School' : 'Company'}</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {analytics.solved && Object.keys(analytics.solved).length > 0 && (
            <section className="solved-section">
              <h2>Problems Solved</h2>
              <div className="solved-grid">
                <div className="solved-card">
                  <div className="solved-number">{analytics.solved.solvedProblem || 0}</div>
                  <div className="solved-label">Total Solved</div>
                </div>
                <div className="solved-card easy">
                  <div className="solved-number">{analytics.solved.easySolved || 0}</div>
                  <div className="solved-label">Easy</div>
                </div>
                <div className="solved-card medium">
                  <div className="solved-number">{analytics.solved.mediumSolved || 0}</div>
                  <div className="solved-label">Medium</div>
                </div>
                <div className="solved-card hard">
                  <div className="solved-number">{analytics.solved.hardSolved || 0}</div>
                  <div className="solved-label">Hard</div>
                </div>
              </div>
            </section>
          )}

          {analytics.badges && analytics.badges.badges && Array.isArray(analytics.badges.badges) && analytics.badges.badges.length > 0 && (
            <section className="badges-section">
              <h2>Badges ({analytics.badges.badgesCount || 0})</h2>
              <div className="badges-grid">
                {analytics.badges.badges.map((badge, index) => {
                  if (!badge || typeof badge !== 'object') return null;
                  return (
                    <div key={index} className="badge-card">
                      <div className="badge-icon">🏆</div>
                      <div className="badge-name">{String(badge.displayName || badge.name || 'Badge')}</div>
                      <div className="badge-date">{badge.creationDate ? new Date(badge.creationDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {analytics.contest && Object.keys(analytics.contest).length > 0 && (
            <section className="contest-section">
              <h2>Contest Performance</h2>
              <div className="contest-stats">
                <div className="contest-stat">
                  <div className="contest-value">{String(analytics.contest.contestAttend || 0)}</div>
                  <div className="contest-label">Contests Attended</div>
                </div>
                <div className="contest-stat">
                  <div className="contest-value">{analytics.contest.contestRating ? Math.round(analytics.contest.contestRating) : 'N/A'}</div>
                  <div className="contest-label">Rating</div>
                </div>
                <div className="contest-stat">
                  <div className="contest-value">{String(analytics.contest.contestGlobalRanking || 'N/A')}</div>
                  <div className="contest-label">Global Ranking</div>
                </div>
                <div className="contest-stat">
                  <div className="contest-value">{analytics.contest.contestTopPercentage ? `${analytics.contest.contestTopPercentage}%` : 'N/A'}</div>
                  <div className="contest-label">Top Percentage</div>
                </div>
              </div>
              {analytics.contest.contestParticipation && Array.isArray(analytics.contest.contestParticipation) && analytics.contest.contestParticipation.length > 0 && (
                <div className="contest-history">
                  <h3>Recent Contests</h3>
                  <div className="contest-list">
                    {analytics.contest.contestParticipation.slice(0, 5).map((participation, index) => (
                      <div key={index} className="contest-item">
                        <div className="contest-item-header">
                          <span className="contest-title">{participation.contest?.title || 'Contest'}</span>
                          <span className="contest-rating">{Math.round(participation.rating || 0)}</span>
                        </div>
                        <div className="contest-item-details">
                          <span>Rank: {String(participation.ranking || 'N/A')}</span>
                          <span>Solved: {participation.problemsSolved || 0}/{participation.totalProblems || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {analytics.acSubmissions && analytics.acSubmissions.submission && Array.isArray(analytics.acSubmissions.submission) && analytics.acSubmissions.submission.length > 0 && (
            <section className="submissions-section">
              <h2>Recent Accepted Submissions ({analytics.acSubmissions.count || analytics.acSubmissions.submission.length})</h2>
              <div className="submissions-list">
                {analytics.acSubmissions.submission.slice(0, 10).map((submission, index) => {
                  if (!submission || typeof submission !== 'object') return null;
                  
                  const title = submission.title || submission.titleSlug || 'N/A';
                  const lang = submission.lang || submission.language || 'N/A';
                  const timestamp = submission.timestamp;
                  
                  return (
                    <div key={index} className="submission-item">
                      <div className="submission-info">
                        <div className="submission-title">{String(title)}</div>
                        <div className="submission-meta">
                          <span className="submission-lang">{String(lang)}</span>
                          <span className="submission-date">{formatDate(timestamp)}</span>
                        </div>
                      </div>
                      <div className="submission-status">
                        <span className="status-accepted">{submission.statusDisplay || 'Accepted'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {analytics.skills && (analytics.skills.fundamental || analytics.skills.intermediate || analytics.skills.advanced) && (
            <section className="skills-section">
              <h2>Skill Stats</h2>
              {analytics.skills.fundamental && Array.isArray(analytics.skills.fundamental) && analytics.skills.fundamental.length > 0 && (
                <div className="skill-category">
                  <h3>Fundamental</h3>
                  <div className="skills-list">
                    {analytics.skills.fundamental.map((skill, index) => {
                      if (!skill || typeof skill !== 'object') return null;
                      const problemsSolved = skill.problemsSolved || 0;
                      const totalSolved = analytics.solved?.solvedProblem || 1;
                      return (
                        <div key={index} className="skill-item">
                          <div className="skill-header">
                            <span className="skill-name">{String(skill.tagName || 'N/A')}</span>
                            <span className="skill-count">{problemsSolved} solved</span>
                          </div>
                          <div className="skill-bar">
                            <div 
                              className="skill-progress"
                              style={{ 
                                width: `${Math.min(100, (problemsSolved / totalSolved) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {analytics.skills.intermediate && Array.isArray(analytics.skills.intermediate) && analytics.skills.intermediate.length > 0 && (
                <div className="skill-category">
                  <h3>Intermediate</h3>
                  <div className="skills-list">
                    {analytics.skills.intermediate.map((skill, index) => {
                      if (!skill || typeof skill !== 'object') return null;
                      const problemsSolved = skill.problemsSolved || 0;
                      const totalSolved = analytics.solved?.solvedProblem || 1;
                      return (
                        <div key={index} className="skill-item">
                          <div className="skill-header">
                            <span className="skill-name">{String(skill.tagName || 'N/A')}</span>
                            <span className="skill-count">{problemsSolved} solved</span>
                          </div>
                          <div className="skill-bar">
                            <div 
                              className="skill-progress"
                              style={{ 
                                width: `${Math.min(100, (problemsSolved / totalSolved) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {analytics.skills.advanced && Array.isArray(analytics.skills.advanced) && analytics.skills.advanced.length > 0 && (
                <div className="skill-category">
                  <h3>Advanced</h3>
                  <div className="skills-list">
                    {analytics.skills.advanced.map((skill, index) => {
                      if (!skill || typeof skill !== 'object') return null;
                      const problemsSolved = skill.problemsSolved || 0;
                      const totalSolved = analytics.solved?.solvedProblem || 1;
                      return (
                        <div key={index} className="skill-item">
                          <div className="skill-header">
                            <span className="skill-name">{String(skill.tagName || 'N/A')}</span>
                            <span className="skill-count">{problemsSolved} solved</span>
                          </div>
                          <div className="skill-bar">
                            <div 
                              className="skill-progress"
                              style={{ 
                                width: `${Math.min(100, (problemsSolved / totalSolved) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {analytics.languages && analytics.languages.languageProblemCount && Array.isArray(analytics.languages.languageProblemCount) && analytics.languages.languageProblemCount.length > 0 && (
            <section className="languages-section">
              <h2>Language Stats</h2>
              <div className="languages-grid">
                {analytics.languages.languageProblemCount.map((lang, index) => {
                  if (!lang || typeof lang !== 'object') return null;
                  const problemsSolved = lang.problemsSolved || 0;
                  const languageName = lang.languageName || 'N/A';
                  return (
                    <div key={index} className="language-card">
                      <div className="language-name">{String(languageName)}</div>
                      <div className="language-count">{problemsSolved} problems</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {analytics.progress && analytics.progress.numAcceptedQuestions && (
            <section className="progress-section">
              <h2>Progress Overview</h2>
              {analytics.progress.numAcceptedQuestions.numAcceptedQuestions && Array.isArray(analytics.progress.numAcceptedQuestions.numAcceptedQuestions) && (
                <div className="progress-category">
                  <h3>Accepted Questions</h3>
                  <div className="progress-grid">
                    {analytics.progress.numAcceptedQuestions.numAcceptedQuestions.map((item, index) => (
                      <div key={index} className="progress-item">
                        <div className="progress-label">{item.difficulty || 'N/A'}</div>
                        <div className="progress-value">{item.count || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analytics.progress.numAcceptedQuestions.userSessionBeatsPercentage && Array.isArray(analytics.progress.numAcceptedQuestions.userSessionBeatsPercentage) && (
                <div className="progress-category">
                  <h3>Session Beats Percentage</h3>
                  <div className="progress-grid">
                    {analytics.progress.numAcceptedQuestions.userSessionBeatsPercentage.map((item, index) => (
                      <div key={index} className="progress-item">
                        <div className="progress-label">{item.difficulty || 'N/A'}</div>
                        <div className="progress-value">{item.percentage ? `${item.percentage.toFixed(1)}%` : 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default LeetCode;
