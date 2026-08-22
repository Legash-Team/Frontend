import React, { useState, useRef } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { 
  Upload, 
  ImageIcon, 
  Link as LinkIcon, 
  Calendar, 
  X,
  Smartphone,
  Info
} from 'lucide-react';
import Button from '@/components/ui/Button';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { uploadMedia, createEvent } from './api/admin-api';

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
      <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
        
        {/* LEFT: THE FORM */}
        <div className="space-y-8 min-w-0">
          <div className="bg-white border border-line-soft rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 lg:p-12 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
              
              {/* 1. MEDIA UPLOAD */}
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
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
                    className="group border-2 border-dashed border-line-soft rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center bg-paper/30 hover:bg-paper/50 hover:border-crimson/30 transition-all cursor-pointer text-center"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept={formData.mediaType === 'image' ? "image/*" : "video/*"} />
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-ink-soft group-hover:text-crimson transition-colors mb-3 sm:mb-4">
                      <Upload size={22} />
                    </div>
                    <p className="text-sm font-bold text-ink">Click to upload media</p>
                    <p className="text-xs text-ink-soft mt-1">High resolution {formData.mediaType} recommended</p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-ink">
                    {formData.mediaType === 'image' ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <video src={previewUrl} className="w-full h-full object-cover" controls />
                    )}
                    <button 
                      type="button"
                      onClick={removeFile}
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-crimson text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* 2. RICH TEXT DETAILED DESCRIPTION */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">
                    Detailed Description <span className="text-crimson">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-ink-soft/50 uppercase">Rich Text & Newlines</span>
                </div>
                <RichTextEditor 
                  value={formData.description}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  placeholder="Describe the campaign, locations, eligible blood types, and donation guidelines..."
                  minHeight="180px"
                />
              </div>

              {/* 3. SETTINGS GRID */}
              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest flex items-center gap-2">
                    <LinkIcon size={14} /> Action Link <span className="text-ink-soft/40">(Optional)</span>
                  </label>
                  <input 
                    type="url" value={formData.applyLink}
                    onChange={(e) => setFormData({...formData, applyLink: e.target.value})}
                    placeholder="https://registration.org"
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Expiry Date <span className="text-crimson">*</span>
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
                disabled={!formData.description || !formData.expiryDate}
                isLoading={isPosting}
                className="w-full h-14 rounded-2xl font-bold text-base sm:text-lg shadow-xl"
              >
                Launch Broadcast
              </Button>
            </form>
          </div>
        </div>

        {/* RIGHT: LIVE MOBILE PREVIEW */}
        <div className="lg:sticky lg:top-8 space-y-6 w-full flex flex-col items-center lg:items-stretch">
           <div className="flex items-center gap-3 text-ink opacity-40 mb-2 px-2 self-start">
              <Smartphone size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Mobile Live Preview</span>
           </div>

           {/* SMARTPHONE FRAME */}
           <div className="relative w-full max-w-[320px] sm:max-w-[340px] h-[580px] sm:h-[640px] bg-ink rounded-[44px] sm:rounded-[50px] border-[6px] sm:border-[8px] border-gray-900 shadow-2xl mx-auto overflow-hidden">
              <div className="absolute top-0 w-full h-6 bg-black flex justify-center items-end pb-1 z-20">
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
                      formData.mediaType === 'image' ? (
                        <img src={previewUrl} className="w-full aspect-video object-cover" alt="Event preview" />
                      ) : (
                        <video src={previewUrl} className="w-full aspect-video object-cover" controls />
                      )
                    ) : (
                      <div className="w-full aspect-video bg-gray-200 flex items-center justify-center text-gray-400">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    
                    <div className="p-4 space-y-3">
                       <div className="h-1.5 w-1/3 bg-crimson/30 rounded-full" />
                       
                       {formData.description ? (
                         <div 
                           className="text-[11px] text-ink-soft leading-relaxed break-words rich-content"
                           dangerouslySetInnerHTML={{ __html: formData.description }}
                         />
                       ) : (
                         <p className="text-[11px] text-ink-soft/40 italic leading-relaxed break-words">
                           The formatted event description will appear here with headings, lists, and line breaks as you type...
                         </p>
                       )}
                       
                       {formData.applyLink && (
                         <div className="w-full h-9 bg-crimson rounded-lg flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest mt-3 shadow-xs">
                           Register Now
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-4 sm:p-5 bg-paper rounded-2xl border border-line-soft flex gap-3 max-w-[340px] mx-auto lg:max-w-none">
              <Info size={18} className="text-crimson shrink-0 mt-0.5" />
              <p className="text-[10px] text-ink-soft leading-relaxed italic">
                This preview approximates how donors across Ethiopia will view the formatted event on their Legash Mobile application.
              </p>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default EventPostingPage;