'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { tracksService } from '@/services/tracks.service';
import { api } from '@/config/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Music, Edit, Trash2, Upload, X, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface EditModalProps {
  track: any;
  onClose: () => void;
  onSave: () => void;
}

function EditTrackModal({ track, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState({
    title: track.title || '',
    composer: track.composer || '',
    performer: track.performer || '',
    conductor: track.conductor || '',
    orchestra: track.orchestra || '',
    opus: track.opus || '',
    movement: track.movement || '',
    key: track.key || '',
    year: track.year?.toString() || '',
    description: track.description || '',
    coverArt: track.coverArt || '',
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/storage/upload/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(prev => ({ ...prev, coverArt: response.data.url }));
      toast.success('Cover uploaded!');
    } catch {
      toast.error('Failed to upload cover');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/tracks/${track.id}`, {
        ...form,
        year: form.year ? parseInt(form.year) : undefined,
        coverArt: form.coverArt || undefined,
      });
      toast.success('Track updated!');
      onSave();
      onClose();
    } catch {
      toast.error('Failed to update track');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 sticky top-0 bg-neutral-900">
          <h2 className="text-xl font-display font-semibold text-secondary-200">Edit Track</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-neutral-500 hover:text-secondary-200 hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Cover Art */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-neutral-800 overflow-hidden flex-shrink-0">
              {form.coverArt ? (
                <Image src={form.coverArt} alt={form.title} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-neutral-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm text-neutral-400 mb-2">Cover Image URL</label>
              <input
                type="text"
                value={form.coverArt}
                onChange={e => setForm(prev => ({ ...prev, coverArt: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500 text-sm mb-2"
              />
              <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-400">
                <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleCoverUpload} />
                {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload new cover
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Composer *</label>
              <input type="text" value={form.composer} onChange={e => setForm(prev => ({ ...prev, composer: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Performer</label>
              <input type="text" value={form.performer} onChange={e => setForm(prev => ({ ...prev, performer: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Conductor</label>
              <input type="text" value={form.conductor} onChange={e => setForm(prev => ({ ...prev, conductor: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Opus</label>
              <input type="text" value={form.opus} onChange={e => setForm(prev => ({ ...prev, opus: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Key</label>
              <input type="text" value={form.key} onChange={e => setForm(prev => ({ ...prev, key: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Year</label>
              <input type="number" value={form.year} onChange={e => setForm(prev => ({ ...prev, year: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 focus:outline-none focus:border-primary-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, hydrated, router]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-tracks'],
    queryFn: () => tracksService.getTracks(1, 100),
    enabled: hydrated && isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (trackId: string) => tracksService.deleteTrack(trackId),
    onSuccess: () => {
      refetch();
      toast.success('Track deleted!');
    },
    onError: () => toast.error('Failed to delete track'),
  });

  const handleDelete = (trackId: string, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(trackId);
    }
  };

  if (!hydrated || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  const tracks = data?.data ?? [];

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-secondary-200 mb-2">
                Admin Panel
              </h1>
              <p className="text-neutral-500">{tracks.length} tracks in the platform</p>
            </div>
            <Link href="/upload">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Track
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-neutral-800 text-xs font-medium text-neutral-500 uppercase">
                <div className="col-span-5">Track</div>
                <div className="col-span-3">Composer</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {tracks.map((track) => (
                <div key={track.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-neutral-800/30 transition-colors border-b border-neutral-800 last:border-b-0 items-center">
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded bg-neutral-800 flex-shrink-0 overflow-hidden">
                      {track.coverArt ? (
                        <Image src={track.coverArt} alt={track.title} width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-4 h-4 text-neutral-600" />
                        </div>
                      )}
                    </div>
                    <span className="text-secondary-200 font-medium line-clamp-1">{track.title}</span>
                  </div>
                  <div className="col-span-3 text-neutral-400 text-sm line-clamp-1">{track.composer}</div>
                  <div className="col-span-2 text-neutral-500 text-sm">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingTrack(track)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-primary-500 hover:bg-neutral-800 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(track.id, track.title)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onSave={() => refetch()}
        />
      )}
    </div>
  );
}