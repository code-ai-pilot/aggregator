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
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  ExternalLink,
  Cookie,
  UserX,
  Server,
  Mail,
  AlertCircle
} from 'lucide-react';

export function PrivacyPage() {
  const sections = [
    {
      id: 'section-1',
      title: '1. Overview & Data Minimization',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      content: 'WFH AI Jobs Aggregator adheres to strict data minimization principles. Because we operate as an open discovery directory and index, browsing the public platform does not require submitting personal identifiable information (PII). We do not collect resumes, Social Security numbers, government IDs, or payment account credentials.',
    },
    {
      id: 'section-2',
      title: '2. External Source Links & Third-Party Platforms',
      icon: <ExternalLink className="w-4 h-4 text-indigo-400" />,
      content: 'Our service contains direct links to third-party employer websites, vendor portals (such as Appen, Outlier.ai, Telus International, OneForma, DataAnnotation.tech, Alignerr), and applicant tracking systems. Once you click a link to an external website, your interactions and any personal data you submit are governed exclusively by that third party’s privacy policy and terms.',
    },
    {
      id: 'section-3',
      title: '3. Information Collected via Support & Contact Channels',
      icon: <Mail className="w-4 h-4 text-violet-400" />,
      content: 'If you voluntarily submit a message through our Contact & Inquiries form, we collect the contact details you provide (such as your name, email address, subject, and message) solely to respond to your question, investigate a reported broken link, or address platform feedback. We do not add your email to marketing lists or sell it to third parties.',
    },
    {
      id: 'section-4',
      title: '4. Zero Data Brokering / No Sale of Personal Data',
      icon: <UserX className="w-4 h-4 text-emerald-400" />,
      content: 'We do not sell, rent, monetize, or trade user or candidate data to data brokers, advertising networks, or third-party recruiters. Our business model is discovery and indexing, not candidate surveillance.',
    },
    {
      id: 'section-5',
      title: '5. Cookies, Local Storage & Session State',
      icon: <Cookie className="w-4 h-4 text-amber-400" />,
      content: 'We use essential client-side local storage and temporary session states strictly to maintain application usability (such as your UI theme preferences, active category filters, or dismissed notice banners). We do not deploy invasive cross-site tracking pixels or biometric profiling.',
    },
    {
      id: 'section-6',
      title: '6. Data Security & Retention',
      icon: <Lock className="w-4 h-4 text-cyan-400" />,
      content: 'We employ industry-standard transport layer security (TLS/HTTPS), hardened cloud infrastructure, and access-restricted environments to protect data in transit and operational systems. Inquiries submitted to our support team are retained only as long as necessary to resolve the inquiry.',
    },
    {
      id: 'section-7',
      title: '7. Your Privacy Rights & Inquiries',
      icon: <Eye className="w-4 h-4 text-rose-400" />,
      content: 'Depending on your jurisdiction (such as GDPR in Europe or CCPA/CPRA in California), you may have the right to request access to or deletion of any communication data you have submitted to us. To exercise your privacy rights or ask questions regarding this policy, please reach out via our Contact page.',
    },
  ];

  return (
    <div className="space-y-10 pb-8">
      {/* Header Banner */}
      <section className="rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="category" size="sm">
            Legal Document
          </Badge>
          <Badge variant="neutral" size="sm">
            Effective Date: September 2026
          </Badge>
        </div>

        <Heading level={1} className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
          Privacy Policy
        </Heading>

        <Text variant="lead" className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          How WFH AI Jobs Aggregator handles data, our strict data minimization principles, and our transparent boundaries regarding third-party job source links.
        </Text>
      </section>

      {/* Structured Sections */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Privacy Policy Provisions
          </span>
        </div>

        <div className="space-y-4">
          {sections.map((sec) => (
            <Card key={sec.id} padded className="border-slate-800 bg-slate-950/60 space-y-2">
              <div className="flex items-center gap-2.5">
                {sec.icon}
                <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
                  {sec.title}
                </Heading>
              </div>
              <Text variant="muted" className="text-xs sm:text-sm leading-relaxed text-slate-300 pl-6">
                {sec.content}
              </Text>
            </Card>
          ))}
        </div>
      </section>

      {/* Navigation Footer */}
      <section className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
            Have questions about our privacy practices?
          </Heading>
          <Text variant="muted" className="text-xs">
            Review our Terms of Service or submit a privacy inquiry directly to our team.
          </Text>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <Link to="/terms">
            <Button variant="secondary" size="xs">
              Terms of Service
            </Button>
          </Link>
          <Link to="/disclaimer">
            <Button variant="secondary" size="xs">
              Disclaimer
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

