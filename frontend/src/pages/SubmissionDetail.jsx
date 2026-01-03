import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles/SubmissionDetail.css'

const SubmissionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    problem_name: '',
    difficulty: 'Medium',
    topic: '',
    time_taken: 0
  })

  useEffect(() => {
    fetchSubmission()
  }, [id])

  const fetchSubmission = async () => {
    setLoading(true)
    const result = await apiRequest(`/submissions/${id}`)
    
    if (result.success) {
      setSubmission(result.data.data)
      setFormData({
        problem_name: result.data.data.problem_name,
        difficulty: result.data.data.difficulty,
        topic: result.data.data.topic,
        time_taken: result.data.data.time_taken
      })
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const result = await apiRequest(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    })

    setSaving(false)

    if (result.success) {
      navigate('/submissions')
    } else {
      setError(result.error)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error && !submission) {
    return (
      <div className="submission-detail-page">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/submissions')} className="btn btn-primary">
          Back to Submissions
        </button>
      </div>
    )
  }

  return (
    <div className="submission-detail-page">
      <h1>Edit Submission</h1>
      <form onSubmit={handleSubmit} className="submission-form">
        <div className="form-group">
          <label htmlFor="problem_name">Problem Name</label>
          <input
            type="text"
            id="problem_name"
            value={formData.problem_name}
            onChange={(e) => setFormData({ ...formData, problem_name: e.target.value })}
            required
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            required
            disabled={saving}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="topic">Topic</label>
          <input
            type="text"
            id="topic"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            required
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="time_taken">Time Taken (minutes)</label>
          <input
            type="number"
            id="time_taken"
            value={formData.time_taken}
            onChange={(e) => setFormData({ ...formData, time_taken: parseInt(e.target.value) || 0 })}
            min="0"
            required
            disabled={saving}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/submissions')}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default SubmissionDetail

