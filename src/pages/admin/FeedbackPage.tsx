import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { 
  MessageSquare, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  Search
} from 'lucide-react';

const FeedbackPage = () => {
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed'>('all');

  // Mock data based on your requirement: "Feedback from rejected hospitals"
  const mockFeedbacks = [
    {
      id: '1',
      hospitalName: 'Abay Central Clinic',
      email: 'contact@abayclinic.et',
      originalRejectionReason: 'License document was unreadable.',
      hospitalResponse: 'Apologies for the blur. I have attached a high-resolution scan of our 2026 operational license to this email thread. Please re-review our application.',
      timestamp: '2 hours ago',
      status: 'new'
    },
    {
      id: '2',
      hospitalName: 'Selam General Hospital',
      email: 'info@selamgen.et',
      originalRejectionReason: 'Facility location outside of service radius.',
      hospitalResponse: 'Our facility actually has a satellite branch in Bole which we intended to register. Can we update our coordinates?',
      timestamp: 'Yesterday',
      status: 'reviewed'
    }
  ];

  return (
    <AdminLayout title="Hospital Feedbacks">
      <div className="space-y-8">
        
        {/* TOP BAR: Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40" size={18} />
            <input 
              type="text" 
              placeholder="Search facilities..." 
              className="w-full h-11 pl-12 pr-4 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson text-sm transition-all"
            />
          </div>
          
          <div className="flex p-1 bg-white border border-line-soft rounded-xl">
            {(['all', 'new', 'reviewed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-ink text-white' : 'text-ink-soft hover:bg-paper'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* FEEDBACK LIST */}
        <div className="grid gap-6">
          {mockFeedbacks.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white border rounded-[32px] overflow-hidden transition-all hover:shadow-xl hover:shadow-ink/5 ${
                item.status === 'new' ? 'border-crimson/20' : 'border-line-soft opacity-80'
              }`}
            >
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-serif font-bold text-ink">{item.hospitalName}</h3>
                      {item.status === 'new' && (
                        <span className="px-2 py-0.5 rounded-full bg-crimson text-white text-[9px] font-black uppercase tracking-tighter animate-pulse">
                          New Message
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-soft font-medium">{item.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono font-bold text-ink-soft/40 uppercase tracking-widest">{item.timestamp}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Context: Why we rejected them */}
                  <div className="p-6 rounded-2xl bg-crimson/[0.03] border border-crimson/10">
                    <div className="flex items-center gap-2 mb-3 text-crimson">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Original Rejection Reason</span>
                    </div>
                    <p className="text-sm text-ink-soft leading-relaxed italic">
                      "{item.originalRejectionReason}"
                    </p>
                  </div>

                  {/* Response: What they said back */}
                  <div className="p-6 rounded-2xl bg-paper border border-line-soft">
                    <div className="flex items-center gap-2 mb-3 text-ink">
                      <MessageSquare size={14} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Hospital Appeal</span>
                    </div>
                    <p className="text-sm text-ink leading-relaxed font-medium">
                      {item.hospitalResponse}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-line-soft flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-ink-soft/40 uppercase">
                    <History size={14} />
                    Case ID: FB-{item.id}2026
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-full border border-line-soft text-xs font-bold text-ink-soft hover:bg-paper transition-all flex items-center gap-2">
                      <CheckCircle2 size={14} /> Mark as Reviewed
                    </button>
                    <button className="px-5 py-2.5 rounded-full bg-ink text-white text-xs font-bold hover:bg-crimson transition-all flex items-center gap-2 group">
                      View Application <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeedbackPage;