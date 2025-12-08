import Link from "next/link";
import { ArrowRight, Activity, Shield, Database, Network } from "lucide-react";
import { cn } from "@/utils/cn";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden bg-slate-900 pb-20 pt-32 lg:pb-32 lg:pt-48 min-h-[100vh] flex items-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-gradient-radial from-brand-500/20 via-slate-900/0 to-slate-900/0" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 inline-flex animate-fade-in items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-300 backdrop-blur-sm">
              <span className="mr-2 flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
              v1.0.0 Now Available
            </div>
            
            <h1 className="mb-8 animate-slide-up text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Standardized Healthcare <br />
              <span className="bg-gradient-to-r from-brand-300 to-sky-400 bg-clip-text text-transparent">
                Interoperability
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl animate-slide-up text-lg text-slate-400 sm:text-xl">
              WAH4PC is an API gateway orchestrator that enables secure, standardized data exchange between healthcare systems using FHIR R4.
            </p>
            
            <div className="flex animate-slide-up flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/docs/quickstart"
                className="group inline-flex h-12 items-center justify-center rounded-full bg-brand-600 px-8 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-[0_0_20px_-5px_rgba(20,184,166,0.5)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/docs/api-reference"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-8 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                API Reference
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={Activity}
            title="Async Orchestration"
            description="Non-blocking request handling with callback support for long-running healthcare processes."
          />
          <FeatureCard
            icon={Shield}
            title="Standardized"
            description="Built on FHIR R4 standards ensuring compatibility across diverse healthcare systems."
          />
          <FeatureCard
            icon={Network}
            title="Provider Agnostic"
            description="Connect hospitals, clinics, labs, and pharmacies through a unified interface."
          />
          <FeatureCard
            icon={Database}
            title="Data Integrity"
            description="Strict schema validation and structured storage for patient records."
          />
        </div>
      </div>

      {/* Code Preview Section */}
      <div className="w-full bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="flex-1">
              <h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl">
                Integration made simple
              </h2>
              <p className="mb-8 text-lg text-slate-600">
                Connect your system with just a few API calls. Our standardized format handles the complexity of medical data exchange.
              </p>
              <ul className="space-y-4">
                <CheckItem text="Simple HTTP/JSON API" />
                <CheckItem text="Automated callbacks" />
                <CheckItem text="Comprehensive FHIR support" />
                <CheckItem text="Instant validation" />
              </ul>
            </div>
            <div className="w-full max-w-xl lg:flex-1">
              <div className="rounded-xl bg-slate-900 p-4 shadow-2xl ring-1 ring-slate-200">
                <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-4">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="ml-4 text-xs text-slate-500">request-patient.sh</div>
                </div>
                <pre className="overflow-x-auto text-sm leading-relaxed text-slate-300">
                  <code>
                    <span className="text-purple-400">curl</span> -X POST http://localhost:3043/v1/fhir/patient/request \<br/>
                    &nbsp;&nbsp;-H <span className="text-green-400">"Content-Type: application/json"</span> \<br/>
                    &nbsp;&nbsp;-d <span className="text-yellow-300">'{`{`}</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">"requestorProviderId"</span>: <span className="text-green-400">"HOSPITAL_001"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">"targetProviderId"</span>: <span className="text-green-400">"CLINIC_001"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">"patientReference"</span>: <span className="text-yellow-300">{`{`}</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">"identifiers"</span>: [<span className="text-yellow-300">{`{`}</span> <span className="text-blue-400">"system"</span>: <span className="text-green-400">"NATIONAL_ID"</span>, <span className="text-blue-400">"value"</span>: <span className="text-green-400">"123"</span> <span className="text-yellow-300">{`}`}</span>]<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-300">{`}`}</span><br/>
                    &nbsp;&nbsp;<span className="text-yellow-300">{`}'`}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-12 text-center text-slate-500">
        <div className="container mx-auto px-4">
          <p>&copy; 2025 WAH4PC. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/5">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500">{description}</p>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-slate-700">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <ArrowRight className="h-3 w-3" />
      </div>
      {text}
    </li>
  );
}
