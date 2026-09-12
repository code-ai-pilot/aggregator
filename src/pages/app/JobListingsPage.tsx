import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Card,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  SearchInput,
  Select,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/ui';
import {
  Briefcase,
  Filter,
  RotateCcw,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Languages,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  Globe,
  Award,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import {
  getJobs,
  getCategories,
  getSources,
  formatJobFreshness,
  formatCompensation,
  JobFilters,
  CategoryItem,
  PublicSource,
} from '../../lib/jobClient';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { Job, JOB_CATEGORIES, EXPERIENCE_LEVELS, WORK_TYPES } from '../../types';
import {
  recordSearchEvent,
  recordFilterUseEvent,
  recordApplicationClickEvent,
} from '../../lib/eventService';

export function JobListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { isJobSaved, toggleSave } = useSavedJobs();

  // State initialization from URL query parameters
  const [queryInput, setQueryInput] = useState<string>(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>(searchParams.get('country') || 'ALL');
  const [selectedExperience, setSelectedExperience] = useState<string>(searchParams.get('experience') || 'ALL');
  const [selectedJobType, setSelectedJobType] = useState<string>(searchParams.get('jobType') || 'ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(searchParams.get('language') || 'ALL');
  const [minPay, setMinPay] = useState<string>(searchParams.get('minPay') || '');
  const [sortOption, setSortOption] = useState<'newest' | 'highest_pay' | 'lowest_pay' | 'title_az' | 'relevance'>(
    (searchParams.get('sort') as any) || 'newest'
  );
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10) || 1);
  const [pageSize, setPageSize] = useState<number>(parseInt(searchParams.get('limit') || '20', 10) || 20);

  // UI state
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(JOB_CATEGORIES);
  const [sourcesList, setSourcesList] = useState<PublicSource[]>([]);

  // Async data state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state to URL params cleanly
  const syncParamsToUrl = useCallback(
    (newParams: Partial<JobFilters>) => {
      const params = new URLSearchParams();

      const q = newParams.q !== undefined ? newParams.q : queryInput;
      const category = newParams.category !== undefined ? newParams.category : selectedCategory;
      const country = newParams.country !== undefined ? newParams.country : selectedCountry;
      const experience = newParams.experience !== undefined ? newParams.experience : selectedExperience;
      const jobType = newParams.jobType !== undefined ? newParams.jobType : selectedJobType;
      const language = newParams.language !== undefined ? newParams.language : selectedLanguage;
      const pay = newParams.minPay !== undefined ? newParams.minPay : minPay ? Number(minPay) : undefined;
      const sort = newParams.sort !== undefined ? newParams.sort : sortOption;
      const page = newParams.page !== undefined ? newParams.page : currentPage;
      const limit = newParams.limit !== undefined ? newParams.limit : pageSize;

      if (q && q.trim()) params.set('q', q.trim());
      if (category && category !== 'ALL') params.set('category', category);
      if (country && country !== 'ALL') params.set('country', country);
      if (experience && experience !== 'ALL') params.set('experience', experience);
      if (jobType && jobType !== 'ALL') params.set('jobType', jobType);
      if (language && language !== 'ALL') params.set('language', language);
      if (pay && pay > 0) params.set('minPay', String(pay));
      if (sort && sort !== 'newest') params.set('sort', sort);
      if (page && page > 1) params.set('page', String(page));
      if (limit && limit !== 20) params.set('limit', String(limit));

      setSearchParams(params, { replace: true });
    },
    [
      queryInput,
      selectedCategory,
      selectedCountry,
      selectedExperience,
      selectedJobType,
      selectedLanguage,
      minPay,
      sortOption,
      currentPage,
      pageSize,
      setSearchParams,
    ]
  );

  // Fetch categories & sources metadata on mount
  useEffect(() => {
    let isMounted = true;

    async function loadMeta() {
      try {
        const [catData, srcData] = await Promise.allSettled([getCategories(), getSources()]);
        if (isMounted) {
          if (catData.status === 'fulfilled' && catData.value.categories?.length > 0) {
            setCategoriesList(catData.value.categories);
          }
          if (srcData.status === 'fulfilled' && srcData.value.sources) {
            setSourcesList(srcData.value.sources);
          }
        }
      } catch (err) {
        console.warn('Metadata load error:', err);
      }
    }

    loadMeta();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch jobs using current filters
  const fetchJobsData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const filterPayload: JobFilters = {
      q: queryInput.trim() || undefined,
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      country: selectedCountry !== 'ALL' ? selectedCountry : undefined,
      experience: selectedExperience !== 'ALL' ? selectedExperience : undefined,
      jobType: selectedJobType !== 'ALL' ? selectedJobType : undefined,
      language: selectedLanguage !== 'ALL' ? selectedLanguage : undefined,
      minPay: minPay ? Number(minPay) : undefined,
      sort: sortOption,
      page: currentPage,
      limit: pageSize,
    };

    try {
      const response = await getJobs(filterPayload);
      setJobs(response.jobs || []);
      setTotalJobs(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);

      // Record search telemetry if search query provided
      if (queryInput.trim()) {
        recordSearchEvent(queryInput.trim(), response.pagination?.total).catch(() => {});
      }

      // Record filter usage telemetry if any active non-default filters
      recordFilterUseEvent({
        category: selectedCategory,
        country: selectedCountry,
        experience: selectedExperience,
        jobType: selectedJobType,
        language: selectedLanguage,
        minPay: minPay ? Number(minPay) : undefined,
        sort: sortOption,
      }).catch(() => {});
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
      setErrorMessage(err.message || 'Unable to load jobs from the server. Please check your network connection.');
      setJobs([]);
      setTotalJobs(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [
    queryInput,
    selectedCategory,
    selectedCountry,
    selectedExperience,
    selectedJobType,
    selectedLanguage,
    minPay,
    sortOption,
    currentPage,
    pageSize,
  ]);

  // Trigger fetch when parameters update
  useEffect(() => {
    fetchJobsData();
  }, [fetchJobsData]);

  // Handler for category quick-pills
  const handleCategoryPillSelect = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    syncParamsToUrl({ category: catId, page: 1 });
  };

  // Handler for search form submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    syncParamsToUrl({ q: queryInput, page: 1 });
  };

  // Handler for search input clear
  const handleSearchClear = () => {
    setQueryInput('');
    setCurrentPage(1);
    syncParamsToUrl({ q: '', page: 1 });
  };

  // Handler for reset all filters
  const handleResetFilters = () => {
    setQueryInput('');
    setSelectedCategory('ALL');
    setSelectedCountry('ALL');
    setSelectedExperience('ALL');
    setSelectedJobType('ALL');
    setSelectedLanguage('ALL');
    setMinPay('');
    setSortOption('newest');
    setCurrentPage(1);

    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Active filters count
  const activeFiltersCount = [
    queryInput.trim().length > 0,
    selectedCategory !== 'ALL',
    selectedCountry !== 'ALL',
    selectedExperience !== 'ALL',
    selectedJobType !== 'ALL',
    selectedLanguage !== 'ALL',
    Boolean(minPay && Number(minPay) > 0),
    sortOption !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Overview Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="category" size="xs">
              VERIFIED AI JOBS FEED
            </Badge>
            <Badge variant="neutral" size="xs" icon={<Clock className="w-3 h-3 text-emerald-400" />}>
              Live Stream
            </Badge>
          </div>
          <Heading level={1} className="text-2xl font-bold text-slate-100 tracking-tight">
            Remote AI &amp; Data Contract Jobs
          </Heading>
          <Text variant="muted" className="text-xs max-w-2xl">
            Browse verified remote AI evaluation, RLHF prompt engineering, multimodal annotation, and data contracts
            across verified platforms.
          </Text>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
            >
              Reset Filters ({activeFiltersCount})
            </Button>
          )}
          <Button
            variant="secondary"
            size="xs"
            onClick={fetchJobsData}
            disabled={isLoading}
            leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Category Navigation Bar (Horizontal Scroller) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Category Navigation
          </span>
          <span className="text-[11px] text-slate-500">
            {categoriesList.length} AI Specializations
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Filter jobs by AI category"
          className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent focus:outline-none"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'ALL'}
            onClick={() => handleCategoryPillSelect('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            All Roles ({totalJobs})
          </button>

          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleCategoryPillSelect(cat.id)}
                title={cat.description}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm font-semibold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search and Primary Controls Bar */}
      <Card padded className="border-slate-800 bg-slate-950/70 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <SearchInput
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onClear={handleSearchClear}
              placeholder="Search roles by keyword, skill, title, or platform (e.g., 'RLHF', 'Python', 'Outlier')..."
              aria-label="Search jobs"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <div className="w-44 shrink-0">
              <Select
                value={sortOption}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setSortOption(val);
                  syncParamsToUrl({ sort: val, page: 1 });
                }}
                aria-label="Sort jobs by"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="highest_pay">Sort: Highest Pay</option>
                <option value="lowest_pay">Sort: Lowest Pay</option>
                <option value="title_az">Sort: Title (A–Z)</option>
                {queryInput.trim() && <option value="relevance">Sort: Relevance</option>}
              </Select>
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              type="button"
              variant={showFiltersMobile ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden"
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            >
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="hidden md:inline-flex"
            >
              Search
            </Button>
          </div>
        </form>

        {/* 4. Filter Panel (Always visible on Desktop, collapsible on Mobile) */}
        <div className={`pt-3 border-t border-slate-850 space-y-3 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Category Select */}
            <div>
              <label htmlFor="filter-category" className="block text-[11px] font-medium text-slate-400 mb-1">
                Category
              </label>
              <Select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                  syncParamsToUrl({ category: e.target.value, page: 1 });
                }}
              >
                <option value="ALL">All Categories</option>
                {categoriesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="filter-experience" className="block text-[11px] font-medium text-slate-400 mb-1">
                Experience Level
              </label>
              <Select
                id="filter-experience"
                value={selectedExperience}
                onChange={(e) => {
                  setSelectedExperience(e.target.value);
                  setCurrentPage(1);
                  syncParamsToUrl({ experience: e.target.value, page: 1 });
                }}
              >
                <option value="ALL">All Experience Levels</option>
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Job Type / Work Type */}
            <div>
              <label htmlFor="filter-jobtype" className="block text-[11px] font-medium text-slate-400 mb-1">
                Contract Type
              </label>
              <Select
                id="filter-jobtype"
                value={selectedJobType}
                onChange={(e) => {
                  setSelectedJobType(e.target.value);
                  setCurrentPage(1);
                  syncParamsToUrl({ jobType: e.target.value, page: 1 });
                }}
              >
                <option value="ALL">All Contract Types</option>
                {WORK_TYPES.map((wt) => (
                  <option key={wt.id} value={wt.id}>
                    {wt.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Country / Eligibility */}
            <div>
              <label htmlFor="filter-country" className="block text-[11px] font-medium text-slate-400 mb-1">
                Country / Eligibility
              </label>
              <Select
                id="filter-country"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setCurrentPage(1);
                  syncParamsToUrl({ country: e.target.value, page: 1 });
                }}
              >
                <option value="ALL">Worldwide / Any Country</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="India">India</option>
                <option value="Australia">Australia</option>
                <option value="Worldwide">Worldwide (Remote)</option>
              </Select>
            </div>

            {/* Min Pay Threshold */}
            <div>
              <label htmlFor="filter-minpay" className="block text-[11px] font-medium text-slate-400 mb-1">
                Minimum Pay ($/hr)
              </label>
              <Select
                id="filter-minpay"
                value={minPay}
                onChange={(e) => {
                  const val = e.target.value;
                  setMinPay(val);
                  setCurrentPage(1);
                  syncParamsToUrl({ minPay: val ? Number(val) : undefined, page: 1 });
                }}
              >
                <option value="">Any Rate</option>
                <option value="15">$15+/hr</option>
                <option value="20">$20+/hr</option>
                <option value="25">$25+/hr</option>
                <option value="35">$35+/hr</option>
                <option value="50">$50+/hr</option>
                <option value="75">$75+/hr</option>
              </Select>
            </div>
          </div>

          {/* Secondary filter bar: Language + Active Filter tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Language:</span>
              <select
                id="filter-language"
                aria-label="Filter by language"
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setCurrentPage(1);
                  syncParamsToUrl({ language: e.target.value, page: 1 });
                }}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Languages</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese</option>
                <option value="Hindi">Hindi</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>

            {/* Active filter chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {queryInput.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                  Keyword: &ldquo;{queryInput.trim()}&rdquo;
                  <button
                    type="button"
                    onClick={handleSearchClear}
                    aria-label="Clear keyword filter"
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                  Category: {selectedCategory}
                  <button
                    type="button"
                    onClick={() => handleCategoryPillSelect('ALL')}
                    aria-label="Clear category filter"
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedExperience !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                  Exp: {selectedExperience}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExperience('ALL');
                      syncParamsToUrl({ experience: 'ALL', page: 1 });
                    }}
                    aria-label="Clear experience filter"
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minPay && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                  Min: ${minPay}/hr
                  <button
                    type="button"
                    onClick={() => {
                      setMinPay('');
                      syncParamsToUrl({ minPay: undefined, page: 1 });
                    }}
                    aria-label="Clear min pay filter"
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] text-emerald-400 hover:underline ml-1"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Results Counter & Active Feed Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-200">
            {isLoading ? 'Searching contracts...' : `Showing ${jobs.length} of ${totalJobs} verified contracts`}
          </span>
          {selectedCategory !== 'ALL' && (
            <Badge variant="category" size="xs">
              {selectedCategory}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Page size:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newLimit = parseInt(e.target.value, 10);
              setPageSize(newLimit);
              setCurrentPage(1);
              syncParamsToUrl({ limit: newLimit, page: 1 });
            }}
            aria-label="Contracts per page"
            className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* 6. Feed States: Loading, Error, Empty, List */}
      {isLoading ? (
        <LoadingState message="Loading latest verified remote AI contracts..." />
      ) : errorMessage ? (
        <ErrorState
          title="Failed to load jobs"
          message={errorMessage}
          onRetry={fetchJobsData}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-6 h-6 text-slate-400" />}
          title="No contracts found matching your filters"
          description={
            activeFiltersCount > 0
              ? 'Try widening your filters, searching for alternate keywords, or resetting your filter criteria.'
              : 'There are currently no active job postings available on the network.'
          }
          action={
            activeFiltersCount > 0
              ? {
                  label: 'Reset All Filters',
                  onClick: handleResetFilters,
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3.5" role="feed" aria-busy={isLoading} aria-label="Job listings feed">
          {jobs.map((job) => {
            const freshness = formatJobFreshness(job.postedAt, job.createdAt);
            const payString = formatCompensation(
              job.compensationMin,
              job.compensationMax,
              job.compensationCurrency,
              job.compensationType
            );

            return (
              <Card
                key={job.id}
                padded
                className="border-slate-800/90 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Core Job Details */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Badge Meta Row: Category, Source Attribution, Freshness, Verification */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="category" size="xs">
                        {job.category}
                      </Badge>

                      {/* Source Attribution */}
                      <Badge
                        variant="neutral"
                        size="xs"
                        icon={<Building2 className="w-3 h-3 text-slate-400" />}
                        title={`Attributed hiring platform: ${job.sourceName}`}
                      >
                        via {job.sourceName || 'Direct'}
                      </Badge>

                      {/* Freshness Indicator */}
                      {freshness && (
                        <Badge
                          variant={freshness.isFresh ? 'success' : 'neutral'}
                          size="xs"
                          dot={freshness.isFresh}
                          icon={<Clock className="w-3 h-3" />}
                        >
                          {freshness.text}
                        </Badge>
                      )}

                      {/* Verification Status */}
                      {job.verificationStatus === 'VERIFIED' && (
                        <Badge
                          variant="success"
                          size="xs"
                          icon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        >
                          Verified Origin
                        </Badge>
                      )}
                    </div>

                    {/* Job Title & Company */}
                    <div>
                      <Link
                        to={`/app/jobs/${job.id}`}
                        className="text-base font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded"
                      >
                        {job.title}
                      </Link>
                      <div className="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="text-slate-300 font-semibold">{job.companyName}</span>
                        {job.subcategory && (
                          <>
                            <span className="text-slate-600">&bull;</span>
                            <span className="text-slate-400">{job.subcategory}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Normalized Description Snippet */}
                    {(job.normalizedDescription || job.description) && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {job.normalizedDescription || job.description}
                      </p>
                    )}

                    {/* Tags / Requirements Grid */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-400 pt-1">
                      {/* Work/Location Type */}
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>
                          {job.locationType === 'REMOTE'
                            ? '100% Remote'
                            : job.locationType || 'Remote'}
                        </span>
                      </div>

                      {/* Contract Type */}
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{job.jobType || job.workType || 'Contract'}</span>
                      </div>

                      {/* Experience Level */}
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{job.experienceLevel || 'All Levels'}</span>
                      </div>

                      {/* Eligible Countries */}
                      {job.eligibleCountries && job.eligibleCountries.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{job.eligibleCountries.slice(0, 2).join(', ')}</span>
                          {job.eligibleCountries.length > 2 && (
                            <span className="text-[10px] text-slate-500">
                              +{job.eligibleCountries.length - 2} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Languages */}
                      {job.languages && job.languages.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{job.languages.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills Chips */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {job.skills.slice(0, 5).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-[10px] text-slate-500">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Compensation & Action Buttons */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-850">
                    {/* Pay Metric */}
                    <div className="text-left lg:text-right">
                      {payString ? (
                        <div>
                          <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                            {payString}
                          </span>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                            {job.compensationType || 'Hourly Rate'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 font-medium">
                          Pay: Unspecified / Competitive
                        </div>
                      )}
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center gap-2">
                      {/* Bookmark / Save Job */}
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            await toggleSave(job.id);
                          } catch (err) {
                            console.error('Save toggle error:', err);
                          }
                        }}
                        aria-label={isJobSaved(job.id) ? `Unsave ${job.title}` : `Save ${job.title}`}
                        title={isJobSaved(job.id) ? 'Saved to bookmarks (click to remove)' : 'Save job to bookmarks'}
                        className={`p-1.5 rounded border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                          isJobSaved(job.id)
                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-400 hover:bg-rose-950/40 hover:border-rose-500/40 hover:text-rose-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {isJobSaved(job.id) ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <Link to={`/app/jobs/${job.id}`}>
                        <Button
                          variant="secondary"
                          size="xs"
                          rightIcon={<ArrowRight className="w-3 h-3" />}
                        >
                          View Details
                        </Button>
                      </Link>

                      {job.originalUrl && job.originalUrl !== '#' && (
                        <a
                          href={job.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            recordApplicationClickEvent(job.id, job.sourceId, {
                              destinationUrl: job.originalUrl,
                              sourceName: job.sourceName,
                            }).catch(() => {});
                          }}
                          aria-label={`Apply on ${job.sourceName || 'external platform'}`}
                        >
                          <Button
                            variant="primary"
                            size="xs"
                            rightIcon={<ExternalLink className="w-3 h-3" />}
                          >
                            Apply
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 7. Pagination Controls */}
      {totalPages > 1 && (
        <Card padded className="border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalPages}</span> ({totalJobs} total contracts)
          </div>

          <div className="flex items-center gap-1.5" aria-label="Pagination">
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => {
                const nextP = Math.max(1, currentPage - 1);
                setCurrentPage(nextP);
                syncParamsToUrl({ page: nextP });
              }}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>

            {/* Numeric Page Jump Buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              let pageNumber = idx + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNumber = currentPage - 2 + idx;
                if (pageNumber > totalPages) pageNumber = totalPages - (4 - idx);
              }

              const isActive = currentPage === pageNumber;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    setCurrentPage(pageNumber);
                    syncParamsToUrl({ page: pageNumber });
                  }}
                  className={`w-7 h-7 rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <Button
              variant="outline"
              size="xs"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => {
                const nextP = Math.min(totalPages, currentPage + 1);
                setCurrentPage(nextP);
                syncParamsToUrl({ page: nextP });
              }}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
