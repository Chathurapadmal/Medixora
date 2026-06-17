import Head from "next/head";
import Link from "next/link";
import { ChevronLeftIcon, FileIcon } from "@/components/dashboard-icons";

export default function GettingStartedGuide() {
  return (
    <>
      <Head>
        <title>Getting Started with Medixora - Support</title>
      </Head>

      <div className="mx-auto max-w-[900px] space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <Link href="/support/user-guides" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">Basics</span>
              <span className="text-xs font-medium text-slate-400">5 min read</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Getting Started with Medixora</h1>
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-slate max-w-none rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_2px_10px_rgba(15,23,42,0.04)] lg:p-12">
          
          <p className="text-lg leading-relaxed text-slate-600">
            Welcome to Medixora! This guide will walk you through the essential features and help you set up your clinic or pharmacy management system in just a few minutes.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-slate-900">1. Navigating the Dashboard</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
            When you log in, you will be greeted by the <strong>Dashboard</strong>. Here you can see a high-level overview of your medical inventory, low-stock alerts, and recent activities. The sidebar on the left provides quick access to all major modules including Inventory, Patients, Doctors, and Settings.
          </p>

          <div className="my-8 rounded-xl bg-blue-50 p-6">
            <h4 className="flex items-center gap-2 font-semibold text-blue-800">
              <FileIcon className="h-5 w-5" />
              Pro Tip
            </h4>
            <p className="mt-2 text-sm text-blue-700">
              You can collapse the sidebar on smaller screens or use the quick action buttons on the dashboard to jump straight to adding a new medicine or registering a user.
            </p>
          </div>

          <h2 className="mt-10 text-xl font-semibold text-slate-900">2. Adding Your First Medicine</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
            To start tracking your stock, head over to the <strong>Inventory</strong> section and click <em>&quot;Add Medicine&quot;</em>. Fill out the form with the medicine name, category, and initial stock level. Don&apos;t forget to set a minimum stock threshold—this allows Medixora to notify you when supplies are running low.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-slate-900">3. Managing Staff and Roles</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
            As an admin, you can create accounts for your doctors, nurses, and pharmacists. Go to <strong>Register User</strong>, enter their details, and select their respective roles. Different roles have different access levels to ensure your patient data remains secure.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-slate-900">Next Steps</h2>
          <ul className="mt-4 space-y-2 text-[15px] text-slate-600 list-disc pl-5">
            <li>Review your <Link href="/settings" className="text-blue-600 hover:underline">Settings</Link> to configure your clinic profile.</li>
            <li>Add your primary suppliers in the Suppliers tab.</li>
            <li>Explore the Reports section to understand your data flow.</li>
          </ul>

        </article>
      </div>
    </>
  );
}
