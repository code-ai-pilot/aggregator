import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  Stack,
  Container
} from '../../components/ui';
import {
  Briefcase,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  Sparkles,
  HelpCircle,
  FileText,
  DollarSign,
  Globe2,
  Cpu,
  Eye,
  MessageSquare,
  FileCheck,
  Headphones,
  CheckCheck,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { JOB_CATEGORIES } from '../../types';

export function HomePage() {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Highlighted reputable source platforms for attribution
  const sourcePlatforms = [
    { name: 'Outlier.ai', domain: 'outlier.ai', specialty: 'RLHF & Domain Expert Reasoning' },
    { name: 'DataAnnotation.tech', domain: 'dataannotation.tech', specialty: 'AI Coding & Chatbot Evaluation' },
    { name: 'Appen', domain: 'appen.com', specialty: 'Multilingual NLP & Search Evaluation' },
    { name: 'Telus International', domain: 'telusinternational.com', specialty: 'AI Data Solutions & Relevance' },
    { name: 'OneForma by Centific', domain: 'oneforma.com', specialty: 'Translation, Audio & Microtasks' },
    { name: 'Alignerr', domain: 'alignerr.com', specialty: 'Expert Annotation for Frontier Models' },
    { name: 'Mindrift', domain: 'mindrift.ai', specialty: 'Creative Writing & AI Fact-Checking' },
    { name: 'Welocalize', domain: 'welocalize.com', specialty: 'Search Quality & Localization' },
  ];

  const filteredCategories = activeCategoryFilter === 'ALL'
    ? JOB_CATEGORIES
    : JOB_CATEGORIES.filter((c) => c.id === activeCategoryFilter);

  return (
    <div className="space-y-12 pb-8">
      {/* 1. Hero Section */}
      <section className="relative rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" size="sm" dot>
              Independent Remote Jobs Index
            </Badge>
            <Badge variant="neutral" size="sm">
              13 Verified AI Disciplines
            </Badge>
            <Badge variant="category" size="sm">
              100% Work From Home
            </Badge>
          </div>

          <div className="space-y-3">
            <Heading level={1} className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100">
              Discover Verified Remote <span className="text-emerald-400">AI &amp; Data</span> Contracts
            </Heading>
            <Text variant="lead" className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              An independent discovery directory tracking authentic work-from-home contracts across reinforcement learning (RLHF), AI model response evaluation, prompt annotation, and multimodal data labeling.
            </Text>
          </div>

          {/* Core Statutory Disclosures Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Platform Role &amp; Transparency Disclosures</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Discovery Only:</strong> We aggregate opportunities and are not the direct hiring employer.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>External Applications:</strong> All applications and screenings occur on third-party source websites.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Dynamic Availability:</strong> Listings may pause intake, change pay rates, or expire without notice.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>No Placement Guarantees:</strong> We make no representations or guarantees regarding hiring decisions.</span>
              </li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/about">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Learn How It Works
              </Button>
            </Link>
            <Link to="/faq">
              <Button variant="secondary" size="md" leftIcon={<HelpCircle className="w-4 h-4" />}>
                Read Contractor FAQ
              </Button>
            </Link>
            <Link to="/disclaimer">
              <Button variant="ghost" size="md" leftIcon={<FileText className="w-4 h-4" />}>
                Platform Disclaimer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. How The Aggregator Works */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Discovery Workflow</span>
            </div>
            <Heading level={2} className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
              How the Aggregator Operates
            </Heading>
          </div>
          <Text variant="muted" className="text-xs max-w-sm">
            Understanding the transition from our discovery directory to external vendor hiring platforms.
          </Text>
        </div>

        <Grid cols={3} gap="lg">
          <Card padded className="border-slate-800 bg-slate-950/60 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs mb-3">
              01
            </div>
            <Heading level={3} className="text-sm font-semibold text-slate-100">
              1. Curated Ingestion &amp; Verification
            </Heading>
            <Text variant="muted" className="text-xs mt-2 leading-relaxed">
              We monitor verified hiring platforms and direct enterprise contract listings. Spam, survey scams, and commission-only schemes are automatically filtered out.
            </Text>
          </Card>

          <Card padded className="border-slate-800 bg-slate-950/60 relative">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs mb-3">
              02
            </div>
            <Heading level={3} className="text-sm font-semibold text-slate-100">
              2. Standardized Classification
            </Heading>
            <Text variant="muted" className="text-xs mt-2 leading-relaxed">
              Every indexed position is categorized across 13 standardized AI disciplines, with transparent pay ranges, hourly rates, and qualification requirements clearly documented.
            </Text>
          </Card>

          <Card padded className="border-slate-800 bg-slate-950/60 relative">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-xs mb-3">
              03
            </div>
            <Heading level={3} className="text-sm font-semibold text-slate-100">
              3. Direct External Application
            </Heading>
            <Text variant="muted" className="text-xs mt-2 leading-relaxed">
              When you select a listing, you are provided with direct source links to apply directly on the hiring company&apos;s official portal where onboarding exams and verifications take place.
            </Text>
          </Card>
        </Grid>
      </section>

      {/* 3. Supported AI Disciplines / Categories */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Standardized Taxonomy</span>
            </div>
            <Heading level={2} className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
              13 Supported AI &amp; Data Job Categories
            </Heading>
          </div>
          <Text variant="muted" className="text-xs max-w-md">
            The remote AI economy spans diverse skillsets from linguistic evaluation to coding prompt engineering.
          </Text>
        </div>

        {/* Category grid */}
        <Grid cols={3} gap="md">
          {JOB_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-colors space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <Badge variant="category" size="xs">
                  {cat.id}
                </Badge>
                <span className="text-[10px] text-slate-500 font-mono">#{String(idx + 1).padStart(2, '0')}</span>
              </div>
              <Heading level={4} className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                {cat.label}
              </Heading>
              <Text variant="muted" className="text-xs leading-relaxed">
                {cat.description}
              </Text>
            </div>
          ))}
        </Grid>
      </section>

      {/* 4. Reputable Source Platforms & Attribution */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Globe2 className="w-4 h-4" />
              <span>Attribution &amp; Upstream Providers</span>
            </div>
            <Heading level={2} className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
              Monitored AI Platforms &amp; Vendor Sources
            </Heading>
          </div>
          <Link to="/license" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <span>View Trademark &amp; Attribution Disclosures</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <Grid cols={4} gap="md">
          {sourcePlatforms.map((platform) => (
            <div
              key={platform.name}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">{platform.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{platform.domain}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {platform.specialty}
              </p>
            </div>
          ))}
        </Grid>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Trademark Notice:</strong> All product names, logos, and brands referenced are property of their respective owners. All company, product, and service names used on this website are for nominative identification and source attribution purposes only.
        </div>
      </section>

      {/* 5. Direct Callout & Quick Link Summary */}
      <section className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <Heading level={3} className="text-base sm:text-lg font-bold text-slate-100">
            Have Questions About Remote AI Contracting?
          </Heading>
          <Text variant="muted" className="text-xs max-w-xl">
            Explore our comprehensive FAQ directory covering pay structures, equipment requirements, qualification exams, and application tips.
          </Text>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <Link to="/faq">
            <Button variant="primary" size="sm" leftIcon={<HelpCircle className="w-4 h-4" />}>
              Explore FAQs
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="sm" leftIcon={<MessageSquare className="w-4 h-4" />}>
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

