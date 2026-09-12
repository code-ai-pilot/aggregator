import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Grid,
  Heading,
  Text,
  Badge,
  Button
} from '../../components/ui';
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  ExternalLink,
  Scale,
  FileText,
  DollarSign,
  HelpCircle,
  Mail,
  CheckCircle2
} from 'lucide-react';

export function DisclaimerPage() {
  const disclaimers = [
    {
      id: 'disc-1',
      title: '1. Discovery & Aggregation Service Notice',
      content: 'WFH AI Jobs Aggregator is an independent informational discovery service and public index. We aggregate, categorize, and link to publicly available remote AI, RLHF, and data annotation contractor listings. We are NOT an employer, staffing agency, recruitment firm, or employment broker.',
      highlight: 'Using this directory does not establish any employment, contractor, agency, or partnership relationship between you and WFH AI Jobs Aggregator.'
    },
    {
      id: 'disc-2',
      title: '2. External Applications & Third-Party Onboarding',
      content: 'All job applications, onboarding processes, identity verifications, subject-matter assessments, and task contracts are conducted exclusively on the respective third-party vendor platforms (e.g., Outlier.ai, Appen, Telus International, OneForma, DataAnnotation.tech, Alignerr, Mindrift, Welocalize). WFH AI Jobs Aggregator never collects job applications, resumes, government IDs, or payment account details from candidates.',
      highlight: 'You must review and agree to each hiring platform’s independent terms, privacy policies, and contractor master agreements.'
    },
    {
      id: 'disc-3',
      title: '3. No Guarantee of Employment, Placement, or Task Flow',
      content: 'WFH AI Jobs Aggregator makes zero representations, warranties, or guarantees regarding your acceptance into any platform, completion of qualification exams, allocation of work tasks, or level of financial compensation. Remote AI contractor opportunities operate on dynamic project cycles where task volumes fluctuate based on client laboratory training schedules.',
      highlight: 'Task availability can decrease, pause, or end abruptly based on upstream client requirements.'
    },
    {
      id: 'disc-4',
      title: '4. Dynamic Listing Availability & Expiration',
      content: 'While our automated aggregation systems endeavor to reflect active listings, third-party companies frequently modify project parameters, change hourly compensation rates, revise geographic eligibility requirements, or close intake quotas without prior notice. WFH AI Jobs Aggregator assumes no liability for expired listings, outdated pay rates, or closed application queues.',
      highlight: 'Always verify terms directly on the source platform prior to applying.'
    },
    {
      id: 'disc-5',
      title: '5. Independent Contractor Status & Tax Obligations',
      content: 'The majority of positions indexed in this directory are independent contractor (1099 / freelance / piece-rate) agreements, not direct employee (W-2) roles. Independent contractors are solely responsible for understanding their local labor laws, filing self-employment taxes, reporting income, and complying with jurisdictional regulations.',
      highlight: 'Consult a certified tax or legal professional regarding your local contractor tax obligations.'
    },
    {
      id: 'disc-6',
      title: '6. Trademark & Nominative Fair Use Attribution',
      content: 'All product names, logos, brands, trademarks, and registered trademarks displayed or referenced on this platform are the property of their respective owners. Company, product, and service names used on this website are for nominative identification and source attribution purposes only, and do not imply endorsement or affiliation.',
      highlight: 'Use of these names, logos, and brands does not imply endorsement or partnership.'
    },
  ];

  return (
    <div className="space-y-10 pb-8">
      {/* Header Banner */}
      <section className="rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="warning" size="sm">
            Legal &amp; Operational Notice
          </Badge>
          <Badge variant="neutral" size="sm">
            Mandatory Reading
          </Badge>
        </div>

        <Heading level={1} className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
          Platform Disclaimer &amp; Notices
        </Heading>

        <Text variant="lead" className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Please review these essential disclosures regarding our role as an independent discovery directory, third-party application boundaries, compensation independence, and non-guarantee of employment.
        </Text>
      </section>

      {/* Critical Highlight Alert Banner */}
      <div className="p-5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3.5 shadow-lg">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <h4 className="font-semibold text-amber-200">
            Summary of Key Platform Disclaimers
          </h4>
          <p className="text-amber-300/90 leading-relaxed text-xs">
            1. We are an <strong>aggregation index</strong>, not an employer or hiring agency.<br />
            2. All applications and contracts are executed directly with third-party vendors on their external websites.<br />
            3. We make <strong>no guarantees</strong> of employment, task availability, or earnings.<br />
            4. Job listings may change or expire at any time without notice.
          </p>
        </div>
      </div>

      {/* Structured Disclaimer Sections */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Detailed Policy Provisions
          </span>
        </div>

        <div className="space-y-4">
          {disclaimers.map((item) => (
            <Card key={item.id} padded className="border-slate-800 bg-slate-950/60 space-y-3">
              <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
                {item.title}
              </Heading>
              <Text variant="muted" className="text-xs sm:text-sm leading-relaxed text-slate-300">
                {item.content}
              </Text>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/90 text-xs text-emerald-300/90 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item.highlight}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Related Legal Links & Contact */}
      <section className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
            Related Platform Governance Documents
          </Heading>
          <Text variant="muted" className="text-xs">
            Read our full Terms of Service, Privacy Policy, and Software Licenses.
          </Text>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <Link to="/terms">
            <Button variant="secondary" size="xs">
              Terms of Service
            </Button>
          </Link>
          <Link to="/privacy">
            <Button variant="secondary" size="xs">
              Privacy Policy
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="primary" size="xs" leftIcon={<Mail className="w-3.5 h-3.5" />}>
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

