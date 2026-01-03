import fetch from 'node-fetch';

const LEETCODE_API_BASE = 'https://alfa-leetcode-api.onrender.com';

const fetchLeetCodeData = async (endpoint) => {
  try {
    const response = await fetch(`${LEETCODE_API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`LeetCode API error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch LeetCode data:', error);
    throw new Error(`Failed to fetch LeetCode data: ${error.message}`);
  }
};

export const getLeetCodeProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await fetchLeetCodeData(`/${username}`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode profile retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeFullProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await fetchLeetCodeData(`/${username}/profile`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode full profile retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeBadges = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await fetchLeetCodeData(`/${username}/badges`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode badges retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeSolved = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await fetchLeetCodeData(`/${username}/solved`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode solved count retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeContest = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await fetchLeetCodeData(`/${username}/contest`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode contest details retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeContestHistory = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await fetchLeetCodeData(`/${username}/contest/history`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode contest history retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeSubmissions = async (req, res, next) => {
  try {
    const { username } = req.params;
    const limit = req.query.limit || 20;
    const data = await fetchLeetCodeData(`/${username}/submission?limit=${limit}`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode submissions retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeACSubmissions = async (req, res, next) => {
  try {
    const { username } = req.params;
    const limit = req.query.limit || 20;
    const data = await fetchLeetCodeData(`/${username}/acSubmission?limit=${limit}`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode accepted submissions retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeCalendar = async (req, res, next) => {
  try {
    const { username } = req.params;
    const year = req.query.year || new Date().getFullYear();
    const endpoint = year ? `/${username}/calendar?year=${year}` : `/${username}/calendar`;
    const data = await fetchLeetCodeData(endpoint);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode calendar retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeSkills = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await fetchLeetCodeData(`/${username}/skill`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode skills retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeLanguages = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await fetchLeetCodeData(`/${username}/language`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode languages retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeProgress = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await fetchLeetCodeData(`/${username}/progress`);
    res.json({
      code: 'SUCCESS',
      message: 'LeetCode progress retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetCodeAnalytics = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    const results = await Promise.allSettled([
      fetchLeetCodeData(`/${username}`).catch(() => null),
      fetchLeetCodeData(`/${username}/solved`).catch(() => null),
      fetchLeetCodeData(`/${username}/badges`).catch(() => null),
      fetchLeetCodeData(`/${username}/contest`).catch(() => null),
      fetchLeetCodeData(`/${username}/acSubmission?limit=50`).catch(() => null),
      fetchLeetCodeData(`/${username}/skill`).catch(() => null),
      fetchLeetCodeData(`/${username}/language`).catch(() => null),
      fetchLeetCodeData(`/${username}/progress`).catch(() => null)
    ]);

    const analytics = {
      profile: results[0].status === 'fulfilled' ? results[0].value : null,
      solved: results[1].status === 'fulfilled' ? results[1].value : null,
      badges: results[2].status === 'fulfilled' ? results[2].value : null,
      contest: results[3].status === 'fulfilled' ? results[3].value : null,
      acSubmissions: results[4].status === 'fulfilled' ? results[4].value : null,
      skills: results[5].status === 'fulfilled' ? results[5].value : null,
      languages: results[6].status === 'fulfilled' ? results[6].value : null,
      progress: results[7].status === 'fulfilled' ? results[7].value : null
    };

    res.json({
      code: 'SUCCESS',
      message: 'LeetCode analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    console.error('LeetCode analytics error:', error);
    res.status(500).json({
      code: 'ERROR',
      message: error.message || 'Failed to fetch LeetCode analytics',
      data: null
    });
  }
};

