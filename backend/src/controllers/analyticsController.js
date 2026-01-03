import { Submission } from '../models/submission.js';
import { User } from '../models/user.js';

/**
 * Calculate difficulty breakdown from submissions
 * @param {Array} submissions - Array of submission objects
 * @returns {Object} Object with difficulty counts
 */
function difficultyBreakdown(submissions) {
  const result = {};
  for (const sub of submissions) {
    const diff = sub.difficulty || '';
    result[diff] = (result[diff] || 0) + 1;
  }
  return result;
}

/**
 * Detect weak topics based on frequency analysis
 * @param {Array} submissions - Array of submission objects
 * @returns {Array} Array of weak topic names
 */
function topicWeaknessDetection(submissions) {
  if (!submissions || submissions.length === 0) {
    return [];
  }

  const topicCount = {};
  for (const sub of submissions) {
    const topic = sub.topic || '';
    topicCount[topic] = (topicCount[topic] || 0) + 1;
  }

  if (Object.keys(topicCount).length === 0) {
    return [];
  }

  const total = submissions.length;
  const numTopics = Object.keys(topicCount).length;
  const average = numTopics > 0 ? total / numTopics : 0;

  const weak = [];
  for (const [topic, count] of Object.entries(topicCount)) {
    if (count < average) {
      weak.push(topic);
    }
  }

  return weak;
}

/**
 * Generate recommendations using greedy algorithm
 * @param {Array} submissions - Array of submission objects
 * @param {Array} weakTopics - Array of weak topic names
 * @returns {Array} Array of recommended topic names (top 5)
 */
function greedyRecommendations(submissions, weakTopics) {
  if (!weakTopics || weakTopics.length === 0) {
    return [];
  }

  const topicCount = {};
  const topicDifficulty = {};

  for (const sub of submissions) {
    const topic = sub.topic || '';
    const difficulty = sub.difficulty || 'Medium';
    topicCount[topic] = (topicCount[topic] || 0) + 1;
    if (!topicDifficulty[topic]) {
      topicDifficulty[topic] = difficulty;
    }
  }

  const uniqueTopics = new Set(submissions.map(s => s.topic || ''));
  const average = uniqueTopics.size > 0 ? submissions.length / uniqueTopics.size : 1;

  const recs = [];
  for (const topic of weakTopics) {
    const count = topicCount[topic] || 0;
    const priority = average - count;
    const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
    const diffPriority = diffOrder[topicDifficulty[topic] || 'Medium'] || 2;

    recs.push({
      topic: topic,
      priority: priority,
      difficultyPriority: diffPriority,
      count: count
    });
  }

  // Sort by priority (descending), then by difficulty priority (ascending)
  recs.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return a.difficultyPriority - b.difficultyPriority;
  });

  return recs.slice(0, 5).map(r => r.topic);
}

/**
 * Analyze submissions and return analytics
 * @param {Array} submissions - Array of submission objects
 * @returns {Object} Analytics object with difficultyBreakdown, weakTopics, and recommendations
 */
function analyzeSubmissions(submissions) {
  try {
    if (!Array.isArray(submissions)) {
      return { error: 'Invalid input: submissions must be an array' };
    }

    const difficulty = difficultyBreakdown(submissions);
    const weakTopics = topicWeaknessDetection(submissions);
    const recommendations = greedyRecommendations(submissions, weakTopics);

    return {
      difficultyBreakdown: difficulty,
      weakTopics: weakTopics,
      recommendations: recommendations
    };
  } catch (error) {
    return { error: `Analysis error: ${error.message}` };
  }
}

export const getAnalytics = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findByEmail(username);
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: {}
      });
    }

    if (user.id !== req.userId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Access denied',
        details: {}
      });
    }

    const submissions = await Submission.findAllByUserId(user.id);

    if (submissions.length === 0) {
      return res.json({
        code: 'SUCCESS',
        message: 'No submissions found',
        data: {
          difficultyBreakdown: {},
          weakTopics: [],
          recommendations: []
        }
      });
    }

    // Use pure JavaScript analytics (converted from Python)
    const analytics = analyzeSubmissions(submissions);
    
    if (analytics.error) {
      return res.status(500).json({
        code: 'ANALYTICS_ERROR',
        message: analytics.error,
        details: {}
      });
    }
    
    res.json({
      code: 'SUCCESS',
      message: 'Analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};


