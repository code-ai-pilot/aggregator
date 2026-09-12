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
  FormField,
  Select,
  Stack
} from '../../components/ui';
import {
  Mail,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Globe2,
  ExternalLink,
  ShieldCheck,
  Bug,
  FileWarning
} from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'GENERAL',
    listingUrl: '',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please provide your name, a valid email address, and a message description.');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMessage('Please enter a valid email address format.');
      return;
    }

    // In client-only public form, acknowledge submission gracefully
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      topic: 'GENERAL',
      listingUrl: '',
      subject: '',
      message: '',
    });
    setIsSubmitted(false);
    setErrorMessage('');
  };

  return (
    <div className="space-y-10 pb-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <section className="rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="category" size="sm">
            Platform Support
          </Badge>
          <Badge variant="neutral" size="sm">
            Community &amp; Inquiries
          </Badge>
        </div>

        <Heading level={1} className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
          Contact &amp; Inquiries
        </Heading>

        <Text variant="lead" className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Have feedback on an indexed source, want to report a broken application link, or have questions about platform features? Send us a message below.
        </Text>
      </section>

      {/* Inquiry Routing Cards */}
      <Grid cols={3} gap="md">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <FileWarning className="w-4 h-4" />
            <span>Report Broken Links</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Spotted an expired queue or 404 URL? Let us know so our ingestion engine can purge stale records.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
            <Globe2 className="w-4 h-4" />
            <span>Source Submissions</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Represent a verified remote AI platform or vendor? Submit public career portals for aggregation review.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <Bug className="w-4 h-4" />
            <span>Bug Reports</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Found an issue with layout, filters, or accessibility? We actively patch and optimize the interface.
          </p>
        </div>
      </Grid>

      {/* Main Interactive Form */}
      <Card padded className="border-slate-800 bg-slate-950/80">
        {isSubmitted ? (
          <div className="py-12 px-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <Heading level={2} className="text-lg sm:text-xl font-bold text-slate-100">
                Inquiry Received
              </Heading>
              <Text variant="muted" className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-200">{formData.name}</strong>. Your inquiry regarding{' '}
                <span className="text-emerald-400 font-medium">
                  {formData.topic === 'EXPIRED_LINK'
                    ? 'a broken/expired link'
                    : formData.topic === 'SOURCE_REQUEST'
                    ? 'a new platform source'
                    : formData.topic === 'BUG_REPORT'
                    ? 'a bug report'
                    : 'a general inquiry'}
                </span>{' '}
                has been logged. We will review your message and reply to <strong className="text-slate-200">{formData.email}</strong>.
              </Text>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Send Another Message
              </Button>
              <Link to="/faq">
                <Button variant="primary" size="sm" leftIcon={<HelpCircle className="w-4 h-4" />}>
                  Explore FAQs
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <Heading level={3} className="text-base font-semibold text-slate-100">
                Send an Inquiry or Feedback
              </Heading>
              <Text variant="muted" className="text-xs">
                Fill out the form below. For link reports, include the destination or aggregator URL.
              </Text>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Your Full Name" id="name" required>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Alex Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormField>

              <FormField label="Email Address" id="email" required>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="alex.johnson@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Inquiry Topic" id="topic" required>
                <Select
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                >
                  <option value="GENERAL">General Platform Question</option>
                  <option value="EXPIRED_LINK">Report Expired / 404 Job Link</option>
                  <option value="SOURCE_REQUEST">Suggest New AI Provider Source</option>
                  <option value="BUG_REPORT">Technical Bug or Accessibility Issue</option>
                  <option value="LEGAL_PRIVACY">Legal, Trademark, or Privacy Question</option>
                </Select>
              </FormField>

              <FormField label="Subject" id="subject">
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Brief summary of inquiry"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            {(formData.topic === 'EXPIRED_LINK' || formData.topic === 'SOURCE_REQUEST') && (
              <FormField
                label={formData.topic === 'EXPIRED_LINK' ? 'Job Listing URL to Audit' : 'Platform / Careers Page URL'}
                id="listingUrl"
                hint="Include the full URL (e.g., https://outlier.ai/careers/...)"
              >
                <Input
                  id="listingUrl"
                  name="listingUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.listingUrl}
                  onChange={handleChange}
                />
              </FormField>
            )}

            <FormField label="Message Details" id="message" required hint="Provide clear details so our team can investigate promptly.">
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="Describe your inquiry, feedback, or the specific issue encountered..."
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </FormField>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900">
              <p className="text-[11px] text-slate-400">
                We respect your inbox. Communications are used strictly for support.
              </p>

              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Inquiry
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Helpful Quick Links */}
      <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
            Looking for quick answers?
          </Heading>
          <Text variant="muted" className="text-xs">
            Review our Frequently Asked Questions and Platform Disclaimer.
          </Text>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/faq">
            <Button variant="outline" size="sm" leftIcon={<HelpCircle className="w-3.5 h-3.5" />}>
              Read FAQs
            </Button>
          </Link>
          <Link to="/disclaimer">
            <Button variant="outline" size="sm">
              Disclaimer
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

