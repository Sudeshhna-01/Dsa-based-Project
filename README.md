# Competitive Programming Analytics Platform

A web platform that analyzes competitive programming submissions to identify weak DSA topics and recommends focused practice.

## Features

- User authentication with JWT
- Submission CRUD operations
- Bulk upload via JSON/CSV
- Analytics dashboard with topic weakness detection
- Difficulty breakdown visualization
- Personalized practice recommendations
- Sorting, filtering, and search
- Export submissions (CSV/JSON)
- Light/Dark mode
- Responsive design

## Tech Stack

**Frontend:** React, Vite, React Router, Plain CSS  
**Backend:** Node.js, Express, MySQL, JWT  
**Analytics:** Python (rule-based algorithms)

## Setup

### Prerequisites
- Node.js 18+
- Python 3.8+
- MySQL 8.0+

### Database
```bash
mysql -u root -p < backend/database/schema.sql
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

**Backend (.env):**
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cp_analytics
JWT_SECRET=your_secret_key
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000
```

## API Endpoints

- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `GET /submissions` - List submissions (supports pagination, filtering, sorting)
- `POST /submissions` - Create submission
- `GET /submissions/:id` - Get submission
- `PUT /submissions/:id` - Update submission
- `DELETE /submissions/:id` - Delete submission
- `POST /submissions/bulk` - Bulk upload
- `GET /submissions/all` - Get all submissions (for export)
- `GET /analytics/:username` - Get analytics
- `GET /health` - Health check

## Algorithms

1. **Difficulty Breakdown** - HashMap counting (O(n))
2. **Topic Weakness Detection** - Frequency analysis with average threshold
3. **Recommendations** - Greedy algorithm prioritizing weakest topics

## License

MIT
