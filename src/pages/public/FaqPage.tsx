import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  FormField
} from '../../components/ui';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  DollarSign,
  Briefcase,
  Monitor,
  Globe2,
  Mail,
  ArrowRight
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'GENERAL' | 'APPLICATIONS' | 'COMPENSATION' | 'TECHNICAL' | 'LEGAL';
  question: string;
  answer: string;
  callout?: string;
}

export function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-2': true,
    'faq-3': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      category: 'GENERAL',
      question: 'What is WFH AI Jobs Aggregator?',
      answer: 'WFH AI Jobs Aggregator is an independent discovery directory and search index. We aggregate legitimate, work-from-home contractor listings in artificial intelligence training, reinforcement learning (RLHF), data annotation, and model evaluation across verified third-party platforms. We are NOT a recruitment agency, staffing agency, or direct employer.',
      callout: 'Important: We do not hire, screen, or employ candidates directly. We index opportunities to help you discover them in one place.'
    },
    {
      id: 'faq-2',
      category: 'APPLICATIONS',
      question: 'Where do I submit my application and complete onboarding?',
      answer: 'All applications are submitted directly on the respective employer or platform provider’s official website (e.g., Outlier.ai, Appen, Telus International, OneForma, DataAnnotation.tech, Alignerr). When you find a listing on our aggregator, follow the provided source link to complete their native onboarding, identity verification, and subject-matter qualification tests.',
    },
    {
      id: 'faq-3',
      category: 'LEGAL',
      question: 'Does this platform guarantee employment, contract awards, or task volume?',
      answer: 'No. WFH AI Jobs Aggregator makes zero representations or guarantees regarding job placement, hiring acceptance, test results, task allocation, or project continuity. In the remote AI contractor industry, project task queues expand or contract dynamically based on upstream AI laboratory model development schedules.',
      callout: 'Contract work is typically flexible and non-guaranteed. Always evaluate project agreements directly on the hiring vendor platform.'
    },
    {
      id: 'faq-4',
      category: 'COMPENSATION',
      question: 'How, when, and by whom are contractors paid?',
      answer: 'You are paid directly by the platform provider you contract with (such as Appen, Outlier, Telus, or DataAnnotation), NOT by WFH AI Jobs Aggregator. Each platform sets its own payout schedules (e.g., weekly, bi-weekly, or monthly) and payment methods (e.g., Direct Deposit, PayPal, Payoneer, AirTM). Pay rates listed in our directory reflect the rates advertised by the original source at the time of indexing.',
    },
    {
      id: 'faq-5',
      category: 'GENERAL',
      question: 'Why did a listing change, close, or disappear?',
      answer: 'AI data projects frequently have contractor quotas (e.g., 500 annotators for a specific 2-week batch). Once a platform reaches its quota or pauses intake for a language pair or domain specialization, they may close or unpublish the listing. While our aggregation pipeline checks listings regularly, upstream availability can change without advance notice.',
    },
    {
      id: 'faq-6',
      category: 'TECHNICAL',
      question: 'What equipment and hardware are required for remote AI jobs?',
      answer: 'Most AI annotation and RLHF evaluation projects require a modern desktop or laptop computer (macOS, Windows, or Linux), a reliable high-speed broadband internet connection, and an up-to-date web browser (Google Chrome or Mozilla Firefox). Specialized roles such as audio transcription or voice recording may require dedicated headsets/microphones, while coding evaluation roles require familiar IDEs and programming environments.',
    },
    {
      id: 'faq-7',
      category: 'LEGAL',
      question: 'Are all listed positions 100% Work From Home (WFH)?',
      answer: 'Yes. Our directory exclusively indexes remote and telecommuting contracts. However, certain roles may have geographic or legal residency requirements (e.g., "US-based candidates for tax compliance" or "Native Japanese speaker residing in Japan"). These location criteria are set by the hiring entity.',
    },
    {
      id: 'faq-8',
      category: 'APPLICATIONS',
      question: 'What are the 13 supported AI and data categories on this site?',
      answer: 'Our taxonomy covers: Image Annotation, Image Categorization, Data Labeling, Text Annotation, AI Response Evaluation (RLHF), Search Evaluation, Content Evaluation, Data Verification, Transcription, Content Moderation, Language Evaluation / Localization, AI Training (Prompt Engineering), and Other Specialized AI Tasks.',
    },
    {
      id: 'faq-9',
      category: 'GENERAL',
      question: 'How do you prevent fake jobs, scam surveys, and fee-charging sites?',
      answer: 'We enforce strict curation rules: we index verified platforms that pay contractors rather than asking for payment. We reject multi-level marketing (MLM), paid survey spam, and unverified third-party recruiters that require upfront fees.',
    },
    {
      id: 'faq-10',
      category: 'APPLICATIONS',
      question: 'How can I report an expired link, inaccurate pay rate, or broken source?',
      answer: 'If you encounter a listing that has expired, links to a 404 page, or has outdated compensation details, please notify us through our Contact & Inquiries page with the URL and details so our team can update the directory promptly.',
    },
  ];

  const categories = [
    { id: 'ALL', label: 'All Questions' },
    { id: 'GENERAL', label: 'General & Platform' },
    { id: 'APPLICATIONS', label: 'Applications & Sources' },
    { id: 'COMPENSATION', label: 'Pay & Compensation' },
    { id: 'TECHNICAL', label: 'Technical & Equipment' },
    { id: 'LEGAL', label: 'Disclaimers & Terms' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'ALL' || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10 pb-8">
      {/* Header Banner */}
      <section className="rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="category" size="sm">
            Contractor Knowledge Base
          </Badge>
          <Badge variant="neutral" size="sm">
            Updated for 2026
          </Badge>
        </div>

        <Heading level={1} className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
          Frequently Asked Questions
        </Heading>

        <Text variant="lead" className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Clear, transparent guidance on how the WFH AI Jobs Aggregator works, how to navigate external contractor applications, pay structures, and platform policies.
        </Text>

        {/* Search & Filter Bar */}
        <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search topics (e.g., pay rates, Outlier, applications, hardware, guarantees)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.slice(0, 3).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills (Secondary row) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Mandatory Statutory Notice */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs text-slate-300 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">
            Discovery Service Notice:
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            WFH AI Jobs Aggregator is an independent directory. We are not an employer, agency, or recruiter. We do not charge job seekers fees, and we do not process external applications or issue contractor compensation.
          </p>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Showing {filteredFaqs.length} of {faqs.length} Questions
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const allOpen: Record<string, boolean> = {};
                faqs.forEach((f) => { allOpen[f.id] = true; });
                setOpenItems(allOpen);
              }}
              className="text-[11px] text-emerald-400 hover:text-emerald-300"
            >
              Expand All
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => setOpenItems({})}
              className="text-[11px] text-slate-400 hover:text-slate-300"
            >
              Collapse All
            </button>
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 p-6 space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No questions match your filter</p>
            <p className="text-xs text-slate-500">Try searching for keywords like &quot;Outlier&quot;, &quot;pay&quot;, or &quot;hardware&quot;.</p>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="mt-2"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-colors hover:border-slate-700/80"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-none group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                        ?
                      </div>
                      <span className="font-semibold text-slate-100 text-xs sm:text-sm group-hover:text-emerald-300 transition-colors leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div className="text-slate-400 group-hover:text-slate-200 shrink-0 mt-1">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-900 space-y-3">
                      <Text variant="muted" className="text-xs sm:text-sm leading-relaxed text-slate-300">
                        {faq.answer}
                      </Text>

                      {faq.callout && (
                        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{faq.callout}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Still Have Questions CTA */}
      <section className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
            Have a question not addressed here?
          </Heading>
          <Text variant="muted" className="text-xs">
            Reach out to our support team for platform inquiries, source additions, or bug reporting.
          </Text>
        </div>

        <Link to="/contact" className="shrink-0">
          <Button variant="primary" size="sm" leftIcon={<Mail className="w-4 h-4" />}>
            Contact &amp; Inquiries
          </Button>
        </Link>
      </section>
    </div>
  );
}

