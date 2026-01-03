import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles/Submissions.css'

const Submissions = () => {
  const [submissions, setSubmissions] = useState([])
  const [allSubmissions, setAllSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [searchQuery, setSearchQuery] = useState('')
  const [availableTopics, setAvailableTopics] = useState([])
  const { getAuthHeaders } = useAuth()

  useEffect(() => {
    fetchSubmissions()
    fetchAllSubmissions()
  }, [page, difficultyFilter, topicFilter, sortBy, sortOrder])

  const fetchSubmissions = async () => {
    setLoading(true)
    setError('')
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder
      })
      if (difficultyFilter) {
        queryParams.append('difficulty', difficultyFilter)
      }
      if (topicFilter) {
        queryParams.append('topic', topicFilter)
      }

      const result = await apiRequest(`/submissions?${queryParams.toString()}`)
      
      if (result.success) {
        setSubmissions(result.data.data)
        setPagination(result.data.pagination)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch submissions')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSubmissions = async () => {
    try {
      const result = await apiRequest('/submissions/all')
      if (result.success) {
        setAllSubmissions(result.data.data)
        // Extract unique topics
        const topics = [...new Set(result.data.data.map(s => s.topic))].sort()
        setAvailableTopics(topics)
      }
    } catch (err) {
      // Ignore
    }
  }

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery) return submissions
    
    const query = searchQuery.toLowerCase()
    return submissions.filter(sub => 
      sub.problem_name.toLowerCase().includes(query)
    )
  }, [submissions, searchQuery])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return
    }

    const result = await apiRequest(`/submissions/${id}`, {
      method: 'DELETE'
    })

    if (result.success) {
      fetchSubmissions()
      fetchAllSubmissions()
    } else {
      setError(result.error)
    }
  }

  const handleExport = async (format) => {
    try {
      const result = await apiRequest('/submissions/all')
      if (!result.success) {
        setError('Failed to export submissions')
        return
      }

      const data = result.data.data

      if (format === 'json') {
        const jsonStr = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `submissions-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        const headers = ['Problem Name', 'Difficulty', 'Topic', 'Time Taken', 'Date']
        const rows = data.map(sub => [
          sub.problem_name,
          sub.difficulty,
          sub.topic,
          sub.time_taken,
          new Date(sub.created_at).toLocaleDateString()
        ])
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      setError('Failed to export submissions')
    }
  }

  const stats = useMemo(() => {
    const total = allSubmissions.length
    const byDifficulty = {
      Easy: allSubmissions.filter(s => s.difficulty === 'Easy').length,
      Medium: allSubmissions.filter(s => s.difficulty === 'Medium').length,
      Hard: allSubmissions.filter(s => s.difficulty === 'Hard').length
    }
    const avgTime = total > 0 
      ? Math.round(allSubmissions.reduce((sum, s) => sum + s.time_taken, 0) / total)
      : 0
    const uniqueTopics = availableTopics.length

    return { total, byDifficulty, avgTime, uniqueTopics }
  }, [allSubmissions, availableTopics])

  if (loading && submissions.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="submissions-page">
      <div className="submissions-header">
        <h1>My Submissions</h1>
        <div className="header-actions">
          <button 
            onClick={() => handleExport('csv')} 
            className="btn btn-secondary"
            disabled={allSubmissions.length === 0}
          >
            Export CSV
          </button>
          <button 
            onClick={() => handleExport('json')} 
            className="btn btn-secondary"
            disabled={allSubmissions.length === 0}
          >
            Export JSON
          </button>
          <Link to="/upload" className="btn btn-primary">Add Submission</Link>
        </div>
      </div>

      {/* Statistics Summary */}
      {stats.total > 0 && (
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Total Problems</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Easy</span>
            <span className="stat-value">{stats.byDifficulty.Easy}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Medium</span>
            <span className="stat-value">{stats.byDifficulty.Medium}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Hard</span>
            <span className="stat-value">{stats.byDifficulty.Hard}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Time</span>
            <span className="stat-value">{stats.avgTime} min</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Topics</span>
            <span className="stat-value">{stats.uniqueTopics}</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by problem name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>
            Filter by Difficulty:
            <select 
              value={difficultyFilter} 
              onChange={(e) => {
                setDifficultyFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>

          <label>
            Filter by Topic:
            <select 
              value={topicFilter} 
              onChange={(e) => {
                setTopicFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All Topics</option>
              {availableTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </label>

          <label>
            Sort By:
            <select 
              value={sortBy} 
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
            >
              <option value="created_at">Date</option>
              <option value="problem_name">Problem Name</option>
              <option value="difficulty">Difficulty</option>
              <option value="topic">Topic</option>
              <option value="time_taken">Time Taken</option>
            </select>
          </label>

          <label>
            Order:
            <select 
              value={sortOrder} 
              onChange={(e) => {
                setSortOrder(e.target.value)
                setPage(1)
              }}
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {(filteredSubmissions.length === 0 && !loading) ? (
        <div className="empty-state">
          <p>
            {searchQuery 
              ? `No submissions found matching "${searchQuery}"`
              : 'No submissions found'}
            . <Link to="/upload">Upload your first submission</Link>
          </p>
        </div>
      ) : (
        <>
          <div className="submissions-grid">
            {filteredSubmissions.map(submission => (
              <div key={submission.id} className="submission-card">
                <div className="submission-header">
                  <h3>{submission.problem_name}</h3>
                  <span className={`difficulty-badge ${submission.difficulty.toLowerCase()}`}>
                    {submission.difficulty}
                  </span>
                </div>
                <div className="submission-details">
                  <p><strong>Topic:</strong> {submission.topic}</p>
                  <p><strong>Time Taken:</strong> {submission.time_taken} minutes</p>
                  <p><strong>Date:</strong> {new Date(submission.created_at).toLocaleDateString()}</p>
                </div>
                <div className="submission-actions">
                  <Link to={`/submissions/${submission.id}`} className="btn btn-small">Edit</Link>
                  <button 
                    onClick={() => handleDelete(submission.id)}
                    className="btn btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-small"
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn btn-small"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Submissions
