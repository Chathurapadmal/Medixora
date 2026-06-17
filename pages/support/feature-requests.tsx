import Head from "next/head";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/dashboard-icons";
import { useState } from "react";

const initialRequests = [
  { id: 1, title: "Dark Mode Support", desc: "Add a toggle for a system-wide dark theme to reduce eye strain during night shifts.", votes: 145, voted: false },
  { id: 2, title: "Mobile App for Doctors", desc: "A dedicated native mobile application for doctors to check appointments on the go.", votes: 89, voted: false },
  { id: 3, title: "Automated Email Reminders", desc: "Send automated emails to patients 24 hours before their scheduled appointment.", votes: 67, voted: false },
  { id: 4, title: "Barcode Scanner Integration", desc: "Allow adding inventory directly by scanning barcodes with a webcam.", votes: 42, voted: false },
];

export default function FeatureRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = (id: number) => {
    setRequests(requests.map(req => {
      if (req.id === id) {
        return { 
          ...req, 
          votes: req.voted ? req.votes - 1 : req.votes + 1,
          voted: !req.voted
        };
      }
      return req;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setRequests([{
        id: Date.now(),
        title: newTitle,
        desc: newDesc,
        votes: 1,
        voted: true
      }, ...requests]);
      setNewTitle("");
      setNewDesc("");
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <>
      <Head>
        <title>Feature Requests - Medixora Support</title>
      </Head>

      <div className="mx-auto max-w-[1280px] space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/support" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Feature Requests</h1>
            <p className="text-sm text-slate-500">Help shape the future of Medixora by suggesting and voting on ideas.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          
          {/* Trending Requests */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Trending Ideas</h2>
            
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  
                  {/* Upvote Button */}
                  <button 
                    onClick={() => handleVote(req.id)}
                    className={`flex h-[60px] w-[52px] shrink-0 flex-col items-center justify-center rounded-xl border transition-colors ${
                      req.voted 
                        ? 'border-purple-200 bg-purple-50 text-purple-700' 
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <svg className="mb-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-sm font-bold leading-none">{req.votes}</span>
                  </button>

                  <div>
                    <h3 className="font-semibold text-slate-900">{req.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit New Request */}
          <div className="space-y-6">
            <div className="sticky top-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <h3 className="text-lg font-semibold text-slate-900">Suggest a Feature</h3>
              <p className="mt-2 text-sm text-slate-500">Don&apos;t see your idea? Submit it below and let others vote on it.</p>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Feature Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Short, descriptive title"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                  <textarea 
                    rows={4}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Explain how this feature would help you..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-purple-500/20 active:scale-[0.98] ${
                    isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-md'
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Suggestion"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
