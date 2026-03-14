'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/config/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Upload, Music, Image, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadState {
  audioFile: File | null;
  audioUrl: string | null;
  coverFile: File | null;
  coverUrl: string | null;
  uploading: boolean;
  uploadingCover: boolean;
}

interface TrackForm {
  title: string;
  composer: string;
  performer: string;
  conductor: string;
  orchestra: string;
  opus: string;
  movement: string;
  key: string;
  year: string;
  description: string;
  duration: string;
  fileSize: string;
  audioFormat: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>({
    audioFile: null,
    audioUrl: null,
    coverFile: null,
    coverUrl: null,
    uploading: false,
    uploadingCover: false,
  });

  const [form, setForm] = useState<TrackForm>({
    title: '',
    composer: '',
    performer: '',
    conductor: '',
    orchestra: '',
    opus: '',
    movement: '',
    key: '',
    year: '',
    description: '',
    duration: '',
    fileSize: '',
    audioFormat: 'mp3',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Get duration and file size from the file
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      setForm(prev => ({
        ...prev,
        duration: Math.round(audio.duration).toString(),
        fileSize: file.size.toString(),
        audioFormat: file.name.split('.').pop() || 'mp3',
      }));
    };

    setUploadState(prev => ({ ...prev, audioFile: file, uploading: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/storage/upload/audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadState(prev => ({
        ...prev,
        audioUrl: response.data.url,
        uploading: false,
      }));
      toast.success('Audio uploaded!');
    } catch (error) {
      setUploadState(prev => ({ ...prev, uploading: false, audioFile: null }));
      toast.error('Failed to upload audio');
    }
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState(prev => ({ ...prev, coverFile: file, uploadingCover: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/storage/upload/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadState(prev => ({
        ...prev,
        coverUrl: response.data.url,
        uploadingCover: false,
      }));
      toast.success('Cover uploaded!');
    } catch (error) {
      setUploadState(prev => ({ ...prev, uploadingCover: false, coverFile: null }));
      toast.error('Failed to upload cover');
    }
  };

  const handleSubmit = async () => {
    if (!uploadState.audioUrl) {
      toast.error('Please upload an audio file first');
      return;
    }
    if (!form.title || !form.composer) {
      toast.error('Title and composer are required');
      return;
    }
    if (!form.duration || !form.fileSize) {
      toast.error('Please wait for audio to load metadata');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/tracks', {
        title: form.title,
        composer: form.composer,
        performer: form.performer || undefined,
        conductor: form.conductor || undefined,
        orchestra: form.orchestra || undefined,
        opus: form.opus || undefined,
        movement: form.movement || undefined,
        key: form.key || undefined,
        year: form.year ? parseInt(form.year) : undefined,
        description: form.description || undefined,
        audioUrl: uploadState.audioUrl,
        coverArt: uploadState.coverUrl || undefined,
        duration: parseInt(form.duration),
        fileSize: parseInt(form.fileSize),
        audioFormat: form.audioFormat,
        isPublic: true,
      });

      toast.success('Track created successfully!');
      router.push('/browse');
    } catch (error) {
      toast.error('Failed to create track');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, hydrated, router]);

  if (!hydrated || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-neutral-500">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-display font-bold text-secondary-200 mb-2 flex items-center gap-3">
            <Upload className="w-8 h-8 text-primary-500" />
            Upload Track
          </h1>
          <p className="text-neutral-500">Add a new classical music track to the platform</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Files */}
          <div className="space-y-6">
            {/* Audio Upload */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-secondary-200 mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary-500" />
                  Audio File
                </h3>
                <input ref={audioInputRef} type="file" accept=".mp3,.flac,.wav,.aac,.ogg" className="hidden" onChange={handleAudioSelect} />
                <div
                  onClick={() => !uploadState.audioFile && audioInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    uploadState.audioFile
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-neutral-700 hover:border-primary-500/50 hover:bg-primary-500/5'
                  }`}
                >
                  {uploadState.uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                      <p className="text-sm text-neutral-400">Uploading...</p>
                    </div>
                  ) : uploadState.audioUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <Check className="w-8 h-8 text-green-500" />
                      <p className="text-sm text-green-400 font-medium">Uploaded!</p>
                      <p className="text-xs text-neutral-500 line-clamp-1">{uploadState.audioFile?.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Music className="w-8 h-8 text-neutral-600" />
                      <p className="text-sm text-neutral-400">Click to upload audio</p>
                      <p className="text-xs text-neutral-600">MP3, FLAC, WAV, AAC, OGG</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cover Upload */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-secondary-200 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary-500" />
                  Cover Art
                  <span className="text-xs text-neutral-500 font-normal">(optional)</span>
                </h3>
                <input ref={coverInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleCoverSelect} />
                <div
                  onClick={() => !uploadState.coverFile && coverInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    uploadState.coverFile
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-neutral-700 hover:border-primary-500/50 hover:bg-primary-500/5'
                  }`}
                >
                  {uploadState.uploadingCover ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                      <p className="text-sm text-neutral-400">Uploading...</p>
                    </div>
                  ) : uploadState.coverUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <Check className="w-8 h-8 text-green-500" />
                      <p className="text-sm text-green-400 font-medium">Uploaded!</p>
                      <p className="text-xs text-neutral-500 line-clamp-1">{uploadState.coverFile?.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Image className="w-8 h-8 text-neutral-600" />
                      <p className="text-sm text-neutral-400">Click to upload cover</p>
                      <p className="text-xs text-neutral-600">JPG, PNG, WebP — max 5MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-secondary-200 mb-2">Track Details</h3>

                {/* Required */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Moonlight Sonata"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Composer *</label>
                    <input
                      type="text"
                      value={form.composer}
                      onChange={e => setForm(prev => ({ ...prev, composer: e.target.value }))}
                      placeholder="e.g. Ludwig van Beethoven"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Optional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Performer</label>
                    <input
                      type="text"
                      value={form.performer}
                      onChange={e => setForm(prev => ({ ...prev, performer: e.target.value }))}
                      placeholder="e.g. Glenn Gould"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Conductor</label>
                    <input
                      type="text"
                      value={form.conductor}
                      onChange={e => setForm(prev => ({ ...prev, conductor: e.target.value }))}
                      placeholder="e.g. Herbert von Karajan"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Orchestra</label>
                    <input
                      type="text"
                      value={form.orchestra}
                      onChange={e => setForm(prev => ({ ...prev, orchestra: e.target.value }))}
                      placeholder="e.g. Berlin Philharmonic"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Year</label>
                    <input
                      type="number"
                      value={form.year}
                      onChange={e => setForm(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="e.g. 1801"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Opus</label>
                    <input
                      type="text"
                      value={form.opus}
                      onChange={e => setForm(prev => ({ ...prev, opus: e.target.value }))}
                      placeholder="e.g. Op. 27 No. 2"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Movement</label>
                    <input
                      type="text"
                      value={form.movement}
                      onChange={e => setForm(prev => ({ ...prev, movement: e.target.value }))}
                      placeholder="e.g. I. Adagio"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Key</label>
                    <input
                      type="text"
                      value={form.key}
                      onChange={e => setForm(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="e.g. C# minor"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the piece..."
                    rows={3}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>

                {/* Auto-filled metadata */}
                {form.duration && (
                  <div className="flex gap-4 text-sm text-neutral-500 bg-neutral-800/50 rounded-lg px-4 py-3">
                    <span>Duration: <span className="text-neutral-300">{Math.floor(parseInt(form.duration)/60)}:{(parseInt(form.duration)%60).toString().padStart(2,'0')}</span></span>
                    <span>Format: <span className="text-neutral-300 uppercase">{form.audioFormat}</span></span>
                    <span>Size: <span className="text-neutral-300">{(parseInt(form.fileSize)/1024/1024).toFixed(2)} MB</span></span>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !uploadState.audioUrl}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Track...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Create Track
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}