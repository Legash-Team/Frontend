import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/Button';
import { 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon, 
  Calendar, 
  AlignLeft, 
  Upload,
  CheckCircle2,
  Clock
} from 'lucide-react';

const EventPostingPage = () => {
  const [formData, setFormData] = useState({
    description: '',
    applyLink: '',
    expiryDate: '',
    mediaType: 'image' as 'image' | 'video'
  });

  // Logic to determine if event is Open or Closed based on current time
  const isExpired = formData.expiryDate ? new Date(formData.expiryDate) < new Date() : false;

  return (
    <AdminLayout title="Post New Event">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT: The Form (2 Columns span) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-line-soft rounded-[32px] p-8 md:p-10 shadow-sm">
            <form className="space-y-8">
              
              {/* Media Upload Area */}
              <div className="space-y-4">
                <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-widest">
                  Event Media (Image or Video)
                </label>
                <div className="border-2 border-dashed border-line-soft rounded-2xl p-12 flex flex-col items-center justify-center bg-paper/30 hover:bg-paper/50 hover:border-crimson/30 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-ink-soft group-hover:text-crimson transition-colors mb-4">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-bold text-ink mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-ink-soft">PNG, JPG or MP4 (max. 10MB)</p>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setFormData({...formData, mediaType: 'image'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${formData.mediaType === 'image' ? 'bg-ink text-white border-ink' : 'bg-white text-ink-soft border-line-soft'}`}>
                    <ImageIcon size={16} /> Image Mode
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, mediaType: 'video'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${formData.mediaType === 'video' ? 'bg-ink text-white border-ink' : 'bg-white text-ink-soft border-line-soft'}`}>
                    <Video size={16} /> Video Mode
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-widest flex items-center gap-2">
                  <AlignLeft size={14} /> Event Description
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the blood donation drive or medical event..."
                  className="w-full h-32 p-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson transition-all text-sm leading-relaxed resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Application Link */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-widest flex items-center gap-2">
                    <LinkIcon size={14} /> Applying Link (Optional)
                  </label>
                  <input 
                    type="url"
                    value={formData.applyLink}
                    onChange={(e) => setFormData({...formData, applyLink: e.target.value})}
                    placeholder="https://..."
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Time/Date Limit
                  </label>
                  <input 
                    type="datetime-local"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary" className="w-full h-14 rounded-xl font-bold shadow-lg">
                  Broadcast Event to Donors
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Live Preview & Status Area */}
        <div className="space-y-6">
          <div className="bg-white border border-line-soft rounded-[32px] p-8 shadow-sm">
            <h3 className="text-sm font-serif font-bold text-ink mb-6">Live Status Preview</h3>
            
            {/* Dynamic Status Badge */}
            <div className={`p-6 rounded-2xl border flex items-center gap-4 transition-all ${
              !formData.expiryDate 
                ? 'bg-gray-50 border-line-soft' 
                : isExpired 
                  ? 'bg-crimson/5 border-crimson/20 text-crimson' 
                  : 'bg-verified/5 border-verified/20 text-verified'
            }`}>
              {isExpired ? <Clock size={24} /> : <CheckCircle2 size={24} />}
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60">Visibility</p>
                <p className="text-lg font-bold uppercase tracking-tighter">
                  {!formData.expiryDate ? 'Awaiting Date' : isExpired ? 'Closed / Hidden' : 'Open / Live'}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-line-soft">
              <p className="text-xs text-ink-soft leading-relaxed italic">
                * Once broadcasted, this event will appear in the "What's Happening" section of the Legash Mobile app for all nearby donors.
              </p>
            </div>
          </div>

          {/* Guidelines Card */}
          <div className="bg-ink text-paper rounded-[32px] p-8 shadow-xl">
             <h4 className="text-xs font-mono font-bold text-crimson uppercase tracking-[0.2em] mb-4">Guidelines</h4>
             <ul className="space-y-4">
               <li className="text-xs text-paper/60 leading-relaxed">• High-quality landscape images work best.</li>
               <li className="text-xs text-paper/60 leading-relaxed">• Ensure the application link is a secure HTTPS URL.</li>
               <li className="text-xs text-paper/60 leading-relaxed">• Check date limits carefully; expired events are auto-archived.</li>
             </ul>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default EventPostingPage;