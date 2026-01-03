import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/api'
import '../styles/Upload.css'

const Upload = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    problem_name: '',
    difficulty: 'Medium',
    topic: '',
    time_taken: 0
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const result = await apiRequest('/submissions', {
      method: 'POST',
      body: JSON.stringify(formData)
    })

    setLoading(false)

    if (result.success) {
      setSuccess('Submission created successfully!')
      setFormData({
        problem_name: '',
        difficulty: 'Medium',
        topic: '',
        time_taken: 0
      })
      setTimeout(() => navigate('/submissions'), 1500)
    } else {
      setError(result.error)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setError('')
    setSuccess('')

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target.result
        let submissions = []

        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text)
          submissions = Array.isArray(data) ? data : [data]
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter(line => line.trim())
          const headers = lines[0].split(',').map(h => h.trim())
          submissions = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim())
            const obj = {}
            headers.forEach((header, index) => {
              obj[header] = values[index]
            })
            return {
              problem_name: obj.problem_name || obj['Problem Name'],
              difficulty: obj.difficulty || obj.Difficulty,
              topic: obj.topic || obj.Topic,
              time_taken: parseInt(obj.time_taken || obj['Time Taken'] || 0)
            }
          })
        }

        const result = await apiRequest('/submissions/bulk', {
          method: 'POST',
          body: JSON.stringify({ submissions })
        })

        setLoading(false)

        if (result.success) {
          setSuccess(`${result.data.data.length} submission(s) uploaded successfully!`)
          setTimeout(() => navigate('/submissions'), 2000)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setLoading(false)
        setError('Invalid file format. Please check your JSON/CSV file.')
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="upload-page">
      <h1>Upload Submission</h1>

      <div className="upload-tabs">
        <div className="upload-section">
          <h2>Single Submission</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="problem_name">Problem Name</label>
              <input
                type="text"
                id="problem_name"
                value={formData.problem_name}
                onChange={(e) => setFormData({ ...formData, problem_name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                required
                disabled={loading}
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
                disabled={loading}
                placeholder="e.g., Arrays, Dynamic Programming"
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
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Submit'}
            </button>
          </form>
        </div>

        <div className="upload-section">
          <h2>Bulk Upload (JSON/CSV)</h2>
          <div className="file-upload-area">
            <input
              type="file"
              id="file-upload"
              accept=".json,.csv"
              onChange={handleFileUpload}
              disabled={loading}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="file-upload-label">
              {loading ? 'Uploading...' : 'Choose File (JSON/CSV)'}
            </label>
            <p className="file-upload-hint">
              Expected format: JSON array or CSV with columns: problem_name, difficulty, topic, time_taken
            </p>
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </div>
    </div>
  )
}

export default Upload

