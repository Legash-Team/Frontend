import React, { useState, useRef } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  ImageIcon, 
  Video, 
  Link as LinkIcon, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  X,
  Smartphone,
  Info
} from 'lucide-react';
import Button from '@/components/ui/Button';

const EventPostingPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    description: '',
    applyLink: '',
    expiryDate: '',
    mediaType: 'image' as 'image' | 'video'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // --- LOGIC: DATE STATUS ---
  const isExpired = formData.expiryDate ? new Date(formData.expiryDate) < new Date() : false;

  // --- HANDLERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a temporary URL so the UI can show the image/video
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.expiryDate) {
      alert("Please fill in description and closing date.");
      return;
    }

    setIsPosting(true);
    try {
      const { uploadMedia, createEvent } = await import('./api/admin-api');
      let mediaUrl = '';
      let mediaType = formData.mediaType;

      if (selectedFile) {
        const uploadRes = await uploadMedia(selectedFile);
        if (uploadRes.success && uploadRes.url) {
          mediaUrl = uploadRes.url;
          mediaType = uploadRes.resourceType as 'image' | 'video';
        }
      }

      const closesAt = new Date(formData.expiryDate).toISOString();

      const res = await createEvent({
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaUrl ? mediaType : undefined,
        description: formData.description.trim(),
        applyLink: formData.applyLink.trim() || undefined,
        closesAt,
      });

      if (res.success) {
        alert(res.message || "Event broadcasted to the mobile network!");
        // Reset form
        setFormData({
          description: '',
          applyLink: '',
          expiryDate: '',
          mediaType: 'image'
        });
        removeFile();
      }
    } catch (err: any) {
      alert(err || "Failed to broadcast event.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AdminLayout title="Event Broadcast">
      <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
        
        {/* LEFT: THE FORM */}
        <div className="space-y-8">
          <div className="bg-white border border-line-soft rounded-[32px] p-8 md:p-12 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* 1. MEDIA UPLOAD */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">Visual Content</label>
                   <div className="flex bg-paper p-1 rounded-lg border border-line-soft">
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, mediaType: 'image'})}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${formData.mediaType === 'image' ? 'bg-white text-crimson shadow-sm' : 'text-ink-soft'}`}
                      >
                        IMAGE
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, mediaType: 'video'})}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${formData.mediaType === 'video' ? 'bg-white text-crimson shadow-sm' : 'text-ink-soft'}`}
                      >
                        VIDEO
                      </button>
                   </div>
                </div>

                {!previewUrl ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-line-soft rounded-2xl p-16 flex flex-col items-center justify-center bg-paper/30 hover:bg-paper/50 hover:border-crimson/30 transition-all cursor-pointer"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept={formData.mediaType === 'image' ? "image/*" : "video/*"} />
                    <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-ink-soft group-hover:text-crimson transition-colors mb-4">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-ink">Click to upload media</p>
                    <p className="text-xs text-ink-soft mt-1">High resolution {formData.mediaType} recommended</p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-ink">
                    {formData.mediaType === 'image' ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <video src={previewUrl} className="w-full h-full object-cover" />
                    )}
                    <button 
                      onClick={removeFile}
                      className="absolute top-4 right-4 w-10 h-10 bg-crimson text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* 2. DESCRIPTION */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">Detailed Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="Tell the donors what's happening..."
                  className="w-full h-32 p-5 bg-paper border border-line-soft rounded-2xl outline-none focus:border-crimson transition-all text-sm resize-none"
                />
              </div>

              {/* 3. SETTINGS GRID */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest flex items-center gap-2">
                    <LinkIcon size={14} /> Action Link
                  </label>
                  <input 
                    type="url" value={formData.applyLink}
                    onChange={(e) => setFormData({...formData, applyLink: e.target.value})}
                    placeholder="https://..."
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Expiry Date
                  </label>
                  <input 
                    type="datetime-local" value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    required
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                disabled={!selectedFile || !formData.description || !formData.expiryDate}
                isLoading={isPosting}
                className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl"
              >
                Launch Broadcast
              </Button>
            </form>
          </div>
        </div>

        {/* RIGHT: LIVE MOBILE PREVIEW */}
        <div className="sticky top-8 space-y-6">
           <div className="flex items-center gap-3 text-ink opacity-40 mb-4 px-2">
              <Smartphone size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Mobile Preview</span>
           </div>

           {/* SMARTPHONE FRAME */}
           <div className="relative w-[320px] h-[640px] bg-ink rounded-[50px] border-[8px] border-gray-900 shadow-2xl mx-auto overflow-hidden">
              <div className="absolute top-0 w-full h-6 bg-black flex justify-center items-end pb-1">
                 <div className="w-16 h-4 bg-gray-900 rounded-full" /> {/* Notch */}
              </div>

              <div className="w-full h-full bg-paper pt-8 overflow-hidden flex flex-col">
                 <div className="px-4 py-3 flex justify-between items-center border-b border-line-soft bg-white">
                    <span className="text-[10px] font-black tracking-tighter">LEGASH NETWORK</span>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${isExpired ? 'bg-crimson/10 text-crimson' : 'bg-verified/10 text-verified'}`}>
                       {formData.expiryDate ? (isExpired ? 'Closed' : 'Live') : 'Draft'}
                    </div>
                 </div>

                 {/* Simulated Content */}
                 <div className="flex-1 overflow-y-auto no-scrollbar">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full aspect-video object-cover" />
                    ) : (
                      <div className="w-full aspect-video bg-gray-200 flex items-center justify-center text-gray-400">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    
                    <div className="p-4 space-y-4">
                       <div className="h-2 w-1/2 bg-crimson/20 rounded" />
                       <p className="text-[11px] text-ink-soft leading-relaxed break-words">
                          {formData.description || "The event description will appear here as soon as you start typing on the left..."}
                       </p>
                       
                       {formData.applyLink && (
                         <div className="w-full h-10 bg-crimson rounded-lg flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest">
                           Register Now
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-5 bg-paper rounded-2xl border border-line-soft flex gap-3">
              <Info size={20} className="text-crimson shrink-0" />
              <p className="text-[10px] text-ink-soft leading-relaxed italic">
                This preview approximates how donors in Addis Ababa will view the event on their Legash Mobile application.
              </p>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default EventPostingPage;