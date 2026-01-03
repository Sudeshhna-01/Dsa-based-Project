import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles/Analytics.css'

const Analytics = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')

    const result = await apiRequest(`/analytics/${user.email}`)

    setLoading(false)

    if (result.success) {
      setAnalytics(result.data.data)
    } else {
      setError(result.error)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="analytics-page">
        <p>No analytics data available. Upload some submissions first.</p>
      </div>
    )
  }

  const difficultyTotal = Object.values(analytics.difficultyBreakdown || {}).reduce((a, b) => a + b, 0)

  return (
    <div className="analytics-page">
      <h1>Analytics & Recommendations</h1>

      <section className="analytics-section">
        <h2>Difficulty Breakdown</h2>
        <div className="difficulty-breakdown">
          {Object.entries(analytics.difficultyBreakdown || {}).map(([difficulty, count]) => {
            const percentage = difficultyTotal > 0 ? ((count / difficultyTotal) * 100).toFixed(1) : 0
            return (
              <div key={difficulty} className="difficulty-item">
                <div className="difficulty-header">
                  <span className={`difficulty-badge ${difficulty.toLowerCase()}`}>
                    {difficulty}
                  </span>
                  <span className="difficulty-count">{count} problems</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${difficulty.toLowerCase()}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="difficulty-percentage">{percentage}%</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="analytics-section">
        <h2>Weak Topics</h2>
        {analytics.weakTopics && analytics.weakTopics.length > 0 ? (
          <div className="topics-list">
            {analytics.weakTopics.map((topic, index) => (
              <div key={index} className="topic-item weak">
                {topic}
              </div>
            ))}
          </div>
        ) : (
          <p>No weak topics identified. Keep up the good work!</p>
        )}
      </section>

      <section className="analytics-section">
        <h2>Recommended Practice Topics</h2>
        {analytics.recommendations && analytics.recommendations.length > 0 ? (
          <div className="recommendations-list">
            {analytics.recommendations.map((topic, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-rank">#{index + 1}</span>
                <span className="recommendation-topic">{topic}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No recommendations available at this time.</p>
        )}
      </section>
    </div>
  )
}

export default Analytics

