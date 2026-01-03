import express from 'express';
import {
  getLeetCodeProfile,
  getLeetCodeFullProfile,
  getLeetCodeBadges,
  getLeetCodeSolved,
  getLeetCodeContest,
  getLeetCodeContestHistory,
  getLeetCodeSubmissions,
  getLeetCodeACSubmissions,
  getLeetCodeCalendar,
  getLeetCodeSkills,
  getLeetCodeLanguages,
  getLeetCodeProgress,
  getLeetCodeAnalytics
} from '../controllers/leetcodeController.js';

const router = express.Router();

router.get('/:username', getLeetCodeProfile);
router.get('/:username/profile', getLeetCodeFullProfile);
router.get('/:username/badges', getLeetCodeBadges);
router.get('/:username/solved', getLeetCodeSolved);
router.get('/:username/contest', getLeetCodeContest);
router.get('/:username/contest/history', getLeetCodeContestHistory);
router.get('/:username/submission', getLeetCodeSubmissions);
router.get('/:username/acSubmission', getLeetCodeACSubmissions);
router.get('/:username/calendar', getLeetCodeCalendar);
router.get('/:username/skill', getLeetCodeSkills);
router.get('/:username/language', getLeetCodeLanguages);
router.get('/:username/progress', getLeetCodeProgress);
router.get('/:username/analytics', getLeetCodeAnalytics);

export default router;

