import { Router, Request, Response } from 'express';
import {
  queryJobs,
  getJobById,
  getCategories,
  getPublicSources,
  JobQueryFilters,
} from './jobService';

const router = Router();

/**
 * Helper to safely extract and validate query parameters
 */
function parseJobFilters(req: Request): JobQueryFilters {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 200) : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category.trim().slice(0, 100) : undefined;
  const country = typeof req.query.country === 'string' ? req.query.country.trim().slice(0, 100) : undefined;
  const experience = typeof req.query.experience === 'string' ? req.query.experience.trim().slice(0, 50) : undefined;
  const jobType = typeof req.query.jobType === 'string' ? req.query.jobType.trim().slice(0, 50) : undefined;
  const language = typeof req.query.language === 'string' ? req.query.language.trim().slice(0, 50) : undefined;

  let minPay: number | undefined = undefined;
  if (typeof req.query.minPay === 'string' && req.query.minPay.trim() !== '') {
    const parsedPay = parseFloat(req.query.minPay);
    if (!isNaN(parsedPay) && parsedPay >= 0) {
      minPay = Math.min(10000, parsedPay);
    }
  }

  const validSorts: Array<'newest' | 'highest_pay' | 'lowest_pay' | 'title_az' | 'relevance'> = [
    'newest',
    'highest_pay',
    'lowest_pay',
    'title_az',
    'relevance',
  ];

  let sort: JobQueryFilters['sort'] = undefined;
  if (typeof req.query.sort === 'string' && validSorts.includes(req.query.sort as any)) {
    sort = req.query.sort as JobQueryFilters['sort'];
  }

  let page = 1;
  if (typeof req.query.page === 'string') {
    const parsedPage = parseInt(req.query.page, 10);
    if (!isNaN(parsedPage) && parsedPage >= 1) {
      page = parsedPage;
    }
  }

  let limit = 20;
  if (typeof req.query.limit === 'string') {
    const parsedLimit = parseInt(req.query.limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit >= 1) {
      limit = Math.min(100, Math.max(1, parsedLimit));
    }
  }

  return {
    q,
    category,
    country,
    experience,
    jobType,
    language,
    minPay,
    sort,
    page,
    limit,
  };
}

/**
 * GET /api/categories
 * Returns standardized job categories
 */
router.get('/categories', (_req: Request, res: Response) => {
  try {
    const result = getCategories();
    res.json(result);
  } catch (err) {
    console.error('[API /api/categories] Error:', err);
    res.status(500).json({ error: 'Failed to retrieve categories', code: 'CATEGORIES_ERROR' });
  }
});

/**
 * GET /api/sources
 * Returns public platform sources without exposing internal scraper or ingestion configuration
 */
router.get('/sources', async (_req: Request, res: Response) => {
  try {
    const result = await getPublicSources();
    res.json(result);
  } catch (err) {
    console.error('[API /api/sources] Error:', err);
    res.status(500).json({ error: 'Failed to retrieve sources', code: 'SOURCES_ERROR' });
  }
});

/**
 * GET /api/jobs/search
 * Explicit search endpoint supporting keyword filtering and deterministic ranking
 */
router.get('/jobs/search', async (req: Request, res: Response) => {
  try {
    const filters = parseJobFilters(req);
    // If no explicit sort requested for search, default to relevance when q is present
    if (!filters.sort && filters.q) {
      filters.sort = 'relevance';
    }
    const result = await queryJobs(filters);
    res.json(result);
  } catch (err) {
    console.error('[API /api/jobs/search] Error:', err);
    res.status(500).json({ error: 'Failed to execute job search', code: 'SEARCH_ERROR' });
  }
});

/**
 * GET /api/jobs/:id
 * Returns a single published job listing by ID or slug
 */
router.get('/jobs/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim().length === 0 || id.length > 128) {
    res.status(400).json({ error: 'Invalid job identifier', code: 'INVALID_JOB_ID' });
    return;
  }

  try {
    const job = await getJobById(id);
    if (!job) {
      res.status(404).json({ error: 'Job not found or no longer active', code: 'JOB_NOT_FOUND' });
      return;
    }
    res.json({ job });
  } catch (err) {
    console.error(`[API /api/jobs/${id}] Error:`, err);
    res.status(500).json({ error: 'Failed to retrieve job details', code: 'JOB_FETCH_ERROR' });
  }
});

/**
 * GET /api/jobs
 * Primary feed endpoint with pagination, deterministic sorting, and multifaceted filtering
 */
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const filters = parseJobFilters(req);
    const result = await queryJobs(filters);
    res.json(result);
  } catch (err) {
    console.error('[API /api/jobs] Error:', err);
    res.status(500).json({ error: 'Failed to retrieve jobs', code: 'JOBS_ERROR' });
  }
});

export default router;
