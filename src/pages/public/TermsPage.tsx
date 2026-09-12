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
  Scale,
  FileCheck2,
  AlertOctagon,
  ExternalLink,
  Shield,
  HelpCircle,
  Mail,
  CheckCircle2
} from 'lucide-react';

export function TermsPage() {
  const sections = [
    {
      id: 'term-1',
      title: '1. Acceptance of Terms & Role as an Informational Aggregator',
      content: 'By accessing or using WFH AI Jobs Aggregator, you acknowledge and agree that this service operates strictly as an informational discovery directory and search index. We aggregate publicly listed remote contractor and freelance positions from third-party AI training platforms. If you do not agree to these terms, you must discontinue use of this website.',
    },
    {
      id: 'term-2',
      title: '2. Disclaimer of Employer / Staffing Relationship',
      content: 'WFH AI Jobs Aggregator is NOT an employer, staffing agency, talent agent, recruiter, or employment broker. Under no circumstances does accessing this directory create an employment, contractor, agency, joint venture, or fiduciary relationship between you and WFH AI Jobs Aggregator. All employment or contractor relationships are formed exclusively between you and the third-party hiring platform.',
    },
    {
      id: 'term-3',
      title: '3. Third-Party Websites & Application Execution',
      content: 'Our service indexes opportunities and provides links to external websites (e.g., Outlier.ai, Appen, Telus International, OneForma, DataAnnotation.tech, Alignerr). We do not control, endorse, monitor, or assume responsibility for the content, privacy policies, practices, onboarding exams, task requirements, or payment operations of any third-party websites. You access third-party sites at your own discretion and risk.',
    },
    {
      id: 'term-4',
      title: '4. Dynamic Listings & No Warranty of Availability',
      content: 'All listings are provided on an "as-is" and "as-available" basis. While we strive to maintain accurate indexing, job requirements, hourly compensation, location rules, and intake statuses change rapidly in the AI training industry. We make no warranties regarding listing accuracy, completeness, timeliness, task queue availability, or hiring success.',
    },
    {
      id: 'term-5',
      title: '5. Acceptable Use Policy',
      content: 'You agree to use this directory solely for lawful personal job discovery. You agree not to: (a) engage in unauthorized automated scraping, denial of service, or infrastructure impairment; (b) attempt to reverse engineer backend security controls; (c) misrepresent your identity or submit fraudulent reports through our contact or inquiry forms.',
    },
    {
      id: 'term-6',
      title: '6. Limitation of Liability',
      content: 'To the fullest extent permitted by applicable law, WFH AI Jobs Aggregator and its operators shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to: (a) your use of or inability to use this directory; (b) any interactions, contracts, non-payments, or disputes between you and third-party hiring entities; (c) errors, omissions, or delays in indexed job postings.',
    },
    {
      id: 'term-7',
      title: '7. Modifications to the Service & Terms',
      content: 'We reserve the right to modify, suspend, or discontinue any aspect of the aggregator at any time without prior notice. We may update these Terms of Service periodically. Your continued use of the platform constitutes acceptance of any revised terms.',
    },
  ];

  return (
    <div className="space-y-10 pb-8">
      {/* Header Banner */}
      <section className="rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="category" size="sm">
            Legal Agreement
          </Badge>
          <Badge variant="neutral" size="sm">
            Last Modified: September 2026
          </Badge>
        </div>

        <Heading level={1} className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
          Terms of Service
        </Heading>

        <Text variant="lead" className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Please read these terms carefully before using WFH AI Jobs Aggregator. They define our operational scope as an independent directory and establish important legal limitations.
        </Text>
      </section>

      {/* Structured Sections */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Terms &amp; Conditions
          </span>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} padded className="border-slate-800 bg-slate-950/60 space-y-2">
              <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
                {section.title}
              </Heading>
              <Text variant="muted" className="text-xs sm:text-sm leading-relaxed text-slate-300">
                {section.content}
              </Text>
            </Card>
          ))}
        </div>
      </section>

      {/* Navigation Footer */}
      <section className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
            Questions Regarding Our Terms?
          </Heading>
          <Text variant="muted" className="text-xs">
            Review our complete Platform Disclaimer or contact our administrative team.
          </Text>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <Link to="/disclaimer">
            <Button variant="secondary" size="xs">
              Disclaimer
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

