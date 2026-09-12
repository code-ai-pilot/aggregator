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
  FileCode,
  Shield,
  Layers,
  ExternalLink,
  Code2,
  Cpu,
  Mail,
  CheckCircle2
} from 'lucide-react';

export function LicensePage() {
  const openSourcePackages = [
    {
      name: 'React & React DOM',
      license: 'MIT License',
      copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
      purpose: 'User interface library for reactive component trees.'
    },
    {
      name: 'Tailwind CSS',
      license: 'MIT License',
      copyright: 'Copyright (c) Tailwind Labs, Inc.',
      purpose: 'Utility-first styling framework and layout system.'
    },
    {
      name: 'Lucide React',
      license: 'ISC License',
      copyright: 'Copyright (c) Lucide Contributors',
      purpose: 'Consistent, accessible iconography set.'
    },
    {
      name: 'React Router',
      license: 'MIT License',
      copyright: 'Copyright (c) Remix Software Inc.',
      purpose: 'Declarative routing and navigation lifecycle.'
    },
    {
      name: 'Express',
      license: 'MIT License',
      copyright: 'Copyright (c) StrongLoop, Inc., and other expressjs.com contributors.',
      purpose: 'Lightweight, robust HTTP application server.'
    },
    {
      name: 'Firebase Client & Admin SDKs',
      license: 'Apache-2.0 License',
      copyright: 'Copyright (c) Google LLC',
      purpose: 'Authentication tokens and structured cloud document storage.'
    },
  ];

  return (
    <div className="space-y-10 pb-8">
      {/* Header Banner */}
      <section className="rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="category" size="sm">
            Legal &amp; Compliance
          </Badge>
          <Badge variant="neutral" size="sm">
            Open Source Notices
          </Badge>
        </div>

        <Heading level={1} className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
          Software Licenses &amp; Attributions
        </Heading>

        <Text variant="lead" className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          WFH AI Jobs Aggregator is powered by foundational open source software packages and modern web standards. This page provides licensing disclosures and third-party notices.
        </Text>
      </section>

      {/* MIT License for Application Software */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Application Source License
          </span>
        </div>

        <Card padded className="border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
              MIT License (Core Application Web Client)
            </Heading>
            <Badge variant="success" size="xs">
              Permissive OSI
            </Badge>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
            <p className="text-slate-400">Copyright (c) 2026 WFH AI Jobs Aggregator Team</p>
            <br />
            <p>
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
            </p>
            <br />
            <p>
              The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
            </p>
            <br />
            <p className="text-slate-400">
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </div>
        </Card>
      </section>

      {/* Third Party Open Source Libraries */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Third-Party Open Source Components
          </span>
        </div>

        <Grid cols={2} gap="md">
          {openSourcePackages.map((pkg, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100 text-xs sm:text-sm">
                    {pkg.name}
                  </span>
                  <Badge variant="neutral" size="xs">
                    {pkg.license}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  {pkg.copyright}
                </p>
              </div>
              <p className="text-xs text-slate-300 pt-1 border-t border-slate-900">
                {pkg.purpose}
              </p>
            </div>
          ))}
        </Grid>
      </section>

      {/* Trademark Attribution */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Nominative Trademark Disclosures
          </span>
        </div>

        <Card padded className="border-slate-800 bg-slate-950/60 space-y-2">
          <Text variant="muted" className="text-xs sm:text-sm leading-relaxed text-slate-300">
            Outlier.ai, Appen, Telus International, OneForma, DataAnnotation.tech, Alignerr, Welocalize, Mindrift, and any other brand names or logos referenced in this directory are registered trademarks or service marks of their respective parent entities. Mention of these trademarks is strictly for nominative identification and accurate source attribution of public contractor positions, and does not imply endorsement, affiliation, or sponsorship.
          </Text>
        </Card>
      </section>

      {/* Navigation Footer */}
      <section className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <Heading level={3} className="text-sm sm:text-base font-semibold text-slate-100">
            Need additional licensing details?
          </Heading>
          <Text variant="muted" className="text-xs">
            Review our Terms of Service or contact our team.
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

