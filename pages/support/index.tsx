import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  SupportIcon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  ChevronDownIcon,
  FileIcon,
  AlertTriangleIcon
} from "@/components/dashboard-icons";

// Mock FAQs
const faqs = [
  { question: "How do I add a new medicine?", answer: "To add a new medicine, navigate to the Inventory section and click on the 'Add Medicine' button. Fill out the required details such as name, category, supplier, stock, and expiry date, then save." },
  { question: "Can I register multiple staff accounts?", answer: "Yes, users with Admin privileges can register new staff accounts from the 'Register User' quick action or the settings menu. Make sure to assign appropriate roles." },
  { question: "How are low stock alerts generated?", answer: "Low stock alerts are automatically triggered when a medicine's current stock falls below its defined minimum threshold. These will appear on your dashboard and inventory views." },
  { question: "How do I update supplier information?", answer: "Go to the Suppliers tab, select the supplier you wish to update, and click on the 'Edit' icon. You can modify their contact details, address, and supplied categories." },
  { question: "Is my data secure?", answer: "Absolutely. Medixora uses state-of-the-art encryption and strictly follows healthcare data compliance protocols to ensure your data is always safe." },
  { question: "How do I contact technical support?", answer: "You can use the contact form on this page, email us directly, or call our 24/7 support hotline." }
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Mock API call
    setTimeout(() => {
      setFormStatus("success");
      setTimeout(() => setFormStatus("idle"), 3000);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Help & Support - Medixora</title>
      </Head>

      <div className="mx-auto max-w-[1280px] space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Hero Header Section */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-16 text-white shadow-xl lg:px-16">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
              <SupportIcon className="h-4 w-4" />
              Support Center
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">How can we help you today?</h1>
            <p className="mt-4 text-lg text-blue-100 lg:text-xl">Search our comprehensive knowledge base or get in touch directly with our support team.</p>

            <div className="mt-8 relative max-w-xl group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search for articles, tutorials, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-lg outline-none ring-4 ring-transparent transition-all focus:ring-blue-300/50"
              />
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-400/30 blur-3xl mix-blend-overlay" />
          <div className="absolute -bottom-32 right-32 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl mix-blend-overlay" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Main Content Area */}
          <div className="space-y-8">

            {/* Quick Links */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { title: "User Guides", desc: "Step-by-step tutorials", icon: FileIcon, color: "blue", href: "/support/user-guides" },
                { title: "Technical Issues", desc: "Report a bug or glitch", icon: SupportIcon, color: "emerald", href: "/support/technical-issues" },
                { title: "Feature Requests", desc: "Suggest new features", icon: AlertTriangleIcon, color: "purple", href: "/support/feature-requests" }
              ].map((item, idx) => (
                <Link
                  href={item.href}
                  key={idx}
                  className={`group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-${item.color}-200 hover:shadow-lg`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-${item.color}-50 text-${item.color}-600 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* FAQs */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] lg:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Frequently Asked Questions</h2>
              <p className="mt-1 text-sm text-slate-500">Find quick answers to common questions about Medixora.</p>

              <div className="mt-8 space-y-4">
                {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className={`overflow-hidden rounded-2xl border transition-colors ${isOpen ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                      >
                        <span className="font-medium text-slate-900">{faq.question}</span>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${isOpen ? 'rotate-180 bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                          <ChevronDownIcon className="h-4 w-4" />
                        </div>
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-6 pb-5 text-[15px] leading-relaxed text-slate-600">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
                    <SearchIcon className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-slate-500">No FAQs found matching &quot;{searchQuery}&quot;</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">

            {/* Contact Form */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] lg:p-8">
              <h3 className="text-xl font-semibold text-slate-900">Send us a message</h3>
              <p className="mt-2 text-sm text-slate-500">Need more help? Our team will get back to you within 24 hours.</p>

              <form className="mt-6 space-y-5" onSubmit={handleContactSubmit}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-700 outline-none transition hover:bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing Issue</option>
                    <option>Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-700 outline-none transition hover:bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Please describe your issue in detail..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={formStatus === "submitting" || formStatus === "success"}
                  className={`w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] ${formStatus === "success" ? "bg-emerald-500" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                    }`}
                >
                  {formStatus === "submitting" ? "Sending..." : formStatus === "success" ? "Message Sent!" : "Send Message"}
                </button>
              </form>
            </div>

            {/* Direct Contact Options */}
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase">Direct Contact</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="group flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <MailIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Email Support</div>
                    <a href="mailto:support@medixora.com" className="mt-0.5 block text-[15px] text-slate-600 hover:text-blue-600 hover:underline">support@medixora.com</a>
                  </div>
                </div>

                <div className="group flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Call Us (24/7)</div>
                    <a href="tel:1800MEDSUPP" className="mt-0.5 block text-[15px] text-slate-600 hover:text-emerald-600 hover:underline">077-123 4567</a>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
