import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  Stack
} from '../../components/ui';
import {
  Target,
  Zap,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Eye,
  Cpu,
  Globe2,
  FileCheck,
  Scale,
  HelpCircle,
  Mail
} from 'lucide-react';
import { JOB_CATEGORIES } from '../../types';

export function AboutPage() {
  return (
    <div className="space-y-12 pb-8">
      {/* 1. Header & Mission Intro */}
      <section className="rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10 lg:p-12 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="category" size="sm">
            About Our Mission
          </Badge>
          <Badge variant="success" size="sm" dot>
            Independent Aggregator
          </Badge>
        </div>

        <div className="space-y-3 max-w-3xl">
          <Heading level={1} className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Demystifying the Remote <span className="text-emerald-400">AI Contractor</span> Economy
          </Heading>
          <Text variant="lead" className="text-slate-300 text-sm sm:text-base leading-relaxed">
            WFH AI Jobs Aggregator was created to bring clarity, transparency, and authenticity to the rapidly expanding world of remote artificial intelligence training, evaluation, and data annotation contracts.
          </Text>
        </div>

        {/* Boundary & Operational Stance Callout */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Our Independent Identity &amp; Platform Boundaries</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            WFH AI Jobs Aggregator is an informational search and discovery index. We are <strong>NOT an employer</strong>, staffing agency, talent broker, or recruiter. We do not collect resumes, administer screening tests, make hiring determinations, or disburse contractor pay. All applications, identity verifications, and client contracts take place directly on third-party source websites.
          </p>
        </div>
      </section>

      {/* 2. The Problem We Solve */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Why We Exist
          </span>
          <Heading level={2} className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            Cutting Through Deceptive Job Boards &amp; Survey Scams
          </Heading>
        </div>

        <Grid cols={3} gap="lg">
          <Card padded className="border-slate-800 bg-slate-950/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
              <Target className="w-4 h-4" />
            </div>
            <Heading level={3} className="text-sm font-semibold text-slate-100">
              The Fake &amp; Spam Listing Crisis
            </Heading>
            <Text variant="muted" className="text-xs leading-relaxed">
              Traditional job boards are flooded with phishing scams, low-pay survey mills, and ghost postings that misrepresent remote flexibility.
            </Text>
          </Card>

          <Card padded className="border-slate-800 bg-slate-950/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <Heading level={3} className="text-sm font-semibold text-slate-100">
              Fragmented Platform Ecosystem
            </Heading>
            <Text variant="muted" className="text-xs leading-relaxed">
              Legitimate AI opportunities are scattered across dozens of disparate vendor portals, making it difficult for qualified contributors to track open queues.
            </Text>
          </Card>

          <Card padded className="border-slate-800 bg-slate-950/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
            </div>
            <Heading level={3} className="text-sm font-semibold text-slate-100">
              Our Curated Solution
            </Heading>
            <Text variant="muted" className="text-xs leading-relaxed">
              We aggregate and standardize verified positions across 13 distinct AI categories with transparent pay scales, location criteria, and direct apply links.
            </Text>
          </Card>
        </Grid>
      </section>

      {/* 3. The Remote AI Work Ecosystem Explained */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Industry Context
          </span>
          <Heading level={2} className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            How Human Contractors Shape Frontier AI Models
          </Heading>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <Text variant="body" className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Modern Large Language Models (LLMs) and Multimodal AI systems require millions of high-quality, human-evaluated data points to learn accuracy, safety, and reasoning. This work is performed by independent contractors across the globe:
          </Text>

          <Grid cols={2} gap="md" className="pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-emerald-400">Reinforcement Learning (RLHF)</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluating model completions side-by-side, scoring factual correctness, identifying hallucinations, and ranking responses for safety and coherence.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-indigo-400">Supervised Fine-Tuning (SFT)</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Domain experts in coding, mathematics, medicine, literature, and law authoring reference solutions and instructional prompt-response pairs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-violet-400">Multimodal Data Annotation</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Annotating images, bounding boxes, polygon segmentation, audio transcription timestamps, and video event tagging for computer vision models.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-cyan-400">Search &amp; Content Evaluation</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Auditing search engine result quality, rating user intent matching, and verifying advertiser compliance against strict safety guidelines.
              </p>
            </div>
          </Grid>
        </div>
      </section>

      {/* 4. Editorial & Source Attribution Standards */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Editorial Integrity
          </span>
          <Heading level={2} className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            Source Attribution &amp; Listing Standards
          </Heading>
        </div>

        <Grid cols={3} gap="md">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct Link Attribution</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never mask, cloak, or obfuscate destination URLs. Every job listing points directly to the official platform or career page of the hiring organization.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Transparent Pay Disclosure</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We highlight hourly rates, piece-rate compensation, and payment currency when disclosed by the source platform, without inflating figures.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-emerald-400" />
              <span>Dynamic Lifecycle Awareness</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We continuously educate job seekers that AI contractor task queues fluctuate rapidly and listings may close as soon as vendor quotas are satisfied.
            </p>
          </div>
        </Grid>
      </section>

      {/* 5. Navigation & Next Steps */}
      <section className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
            Ready to learn more about policies and questions?
          </Heading>
          <Text variant="muted" className="text-xs">
            Review our Frequently Asked Questions or read our legal and platform disclaimers.
          </Text>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <Link to="/faq">
            <Button variant="primary" size="sm" leftIcon={<HelpCircle className="w-4 h-4" />}>
              Read FAQs
            </Button>
          </Link>
          <Link to="/disclaimer">
            <Button variant="outline" size="sm">
              Read Disclaimer
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" size="sm" leftIcon={<Mail className="w-4 h-4" />}>
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

