"use client";

import { useEffect, useState } from 'react';
import { MessageSquare, Send, Loader2, List, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, EpisodeDetail } from '@/lib/api';
import { history } from '@/lib/history';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase-client';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EpisodePlayer({ episode, slug }: { episode: EpisodeDetail, slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  const [selectedServer, setSelectedServer] = useState('');
  // Use a safer default for name, handling SSR/hydration mismatch
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Load name from localStorage only on client mount
  useEffect(() => {
    setCommentName(localStorage.getItem('ph_anon_name') || '');
  }, []);

  // Fetch Video Votes
  const { data: videoVotes } = useQuery({
    queryKey: ['video-votes', slug],
    queryFn: async () => {
        const { data } = await supabase.from('video_votes').select('*').eq('slug', slug).single();
        return data || { likes: 0, dislikes: 0 };
    },
    enabled: !!slug
  });

  const handleVideoVote = async (type: 'likes' | 'dislikes') => {
    const currentCount = videoVotes ? videoVotes[type] : 0;
    const { error } = await supabase.from('video_votes').upsert({ 
        slug, 
        [type]: currentCount + 1 
    });
    if (!error) {
        queryClient.invalidateQueries({ queryKey: ['video-votes', slug] });
        toast.success(`Berhasil ${type === 'likes' ? 'Like' : 'Dislike'}`);
    }
  };

  // Fetch Comments logic...
  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ['comments', slug],
    queryFn: async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('episode_slug', slug)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },
    enabled: !!slug
  });

  const postComment = useMutation({
    mutationFn: async ({ content, name, parentId }: { content: string, name: string, parentId?: string }) => {
        const finalName = name || 'Kultivator Anonim';
        localStorage.setItem('ph_anon_name', finalName);
        const { error } = await supabase.from('comments').insert({
            name: finalName,
            episode_slug: slug,
            content,
            parent_id: parentId || null
        });
        if (error) throw error;
    },
    onSuccess: () => {
        setCommentContent('');
        setReplyTo(null);
        queryClient.invalidateQueries({ queryKey: ['comments', slug] });
        toast.success("Komentar terkirim!");
    },
    onError: () => toast.error("Gagal kirim komentar")
  });

  const handleCommentLike = async (id: string, currentLikes: number) => {
    await supabase.from('comments').update({ likes: currentLikes + 1 }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['comments', slug] });
  };

  const rootComments = comments?.filter((c: any) => !c.parent_id).reverse() || [];
  const getReplies = (parentId: string) => comments?.filter((c: any) => c.parent_id === parentId) || [];

  // STATE BARU BUAT RESCUE DATA
  const [localEpisode, setLocalEpisode] = useState<EpisodeDetail | null>(episode);
  const [isRescuing, setIsRescuing] = useState(false);

  // Init Player & History & RESCUE MISSION
  useEffect(() => {
    // 1. Cek Data (Rescue kalau kosong)
    const checkAndRescue = async () => {
        if (!localEpisode || !localEpisode.streaming || localEpisode.streaming.servers.length === 0) {
            setIsRescuing(true);
            try {
                // Pake API Route Auratail (Internal) buat rescue biar aman dari CORS
                const res = await fetch('/api/provider/auratail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'episode', url: `https://auratail.vip/${slug}/` })
                });
                const json = await res.json();

                if (json.status === 'success' && json.data) {
                    console.log('✅ Rescue Success!');
                    const cleanData = json.data;
                    setLocalEpisode(cleanData);
                    
                    // Simpan ke DB
                    fetch('/api/save', {
                        method: 'POST',
                        body: JSON.stringify({ path: `episode/${slug}`, data: cleanData })
                    });
                }
            } catch (e) {
                console.error('💀 Rescue Failed:', e);
            } finally {
                setIsRescuing(false);
            }
        }
    };

    checkAndRescue();
  }, [slug]);

  // 2. Pilih Server (Auto Select First)
  useEffect(() => {
    if (localEpisode && localEpisode.streaming?.servers?.length > 0) {
      // Default pilih server pertama (biasanya HD)
      if (!selectedServer) setSelectedServer(localEpisode.streaming.servers[0].url);

      // Save History
      if (localEpisode.donghua_details && slug) {
        // Cari poster yang bener (bukan base64 lazyload)
        const realPoster = localEpisode.donghua_details.poster || "";
        
        history.add({
          slug: localEpisode.donghua_details.slug,
          title: localEpisode.donghua_details.title,
          episode: localEpisode.episode,
          episodeSlug: slug,
          poster: realPoster,
        });
      }
    }
  }, [localEpisode, slug]);

  const episodeData = localEpisode || episode;

  if (isRescuing) {
      return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="animate-pulse text-sm text-gray-400">Sedang mengambil video dari server...</p>
      </div>
  }

  if (!episodeData || !episodeData.streaming || episodeData.streaming.servers.length === 0) {
      return <div className="min-h-screen bg-black flex items-center justify-center text-white">
          <p>Video tidak ditemukan. Coba refresh atau lapor admin.</p>
      </div>
  }

  const prevEpisode = episodeData.navigation?.previous_episode || episodeData.prev_episode;
  const nextEpisode = episodeData.navigation?.next_episode || episodeData.next_episode;
  const donghuaSlug = episodeData.donghua_details?.slug || slug?.replace(/-episode-\d+.*/, '');

  return (
    <div className="min-h-screen pb-24 bg-background text-foreground font-sans">
      
      {/* PLAYER UTAMA */}
      <div className="sticky top-0 z-50 w-full bg-black shadow-2xl border-b border-white/10">
        <div className="w-full aspect-video mx-auto max-w-[100vw] relative group">
          {selectedServer ? (
            <iframe 
                src={selectedServer} 
                className="w-full h-full" 
                allowFullScreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Pilih Server...</div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Title and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">{episodeData.episode}</h1>
            <div className="flex items-center gap-2">
                <div className="flex bg-neutral-900 rounded-full p-1 border border-white/10">
                    <button 
                        onClick={() => handleVideoVote('likes')}
                        className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/10 rounded-full transition-colors text-xs font-bold"
                    >
                        <ThumbsUp className="w-4 h-4 text-primary" /> {videoVotes?.likes || 0}
                    </button>
                    <div className="w-px h-4 bg-white/10 self-center"></div>
                    <button 
                        onClick={() => handleVideoVote('dislikes')}
                        className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/10 rounded-full transition-colors text-xs font-bold"
                    >
                        <ThumbsDown className="w-4 h-4 text-red-500" /> {videoVotes?.dislikes || 0}
                    </button>
                </div>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full border-white/20"
                    onClick={() => {
                        const shareData = {
                            title: `Nonton ${episode.episode}`,
                            text: `Seru banget nih eps ini! Nonton di PingHua.`,
                            url: window.location.href,
                        };
                        if (navigator.share) navigator.share(shareData);
                        else {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Link disalin!");
                        }
                    }}
                >
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-10 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* SERVER SELECTOR */}
            <Select value={selectedServer} onValueChange={setSelectedServer}>
              <SelectTrigger className="w-[180px] rounded-full border-white/20 bg-neutral-900 text-xs">
                <SelectValue placeholder="Pilih Server" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20">
                {episodeData.streaming.servers.map((s, i) => (
                    <SelectItem key={i} value={s.url} className="text-xs">
                        {s.name || `Server ${i+1}`}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Nav Buttons */}
            <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-full border-white/20 px-6" onClick={() => prevEpisode && router.push(`/episode/${prevEpisode.slug}`)} disabled={!prevEpisode}>Prev</Button>
                <Button size="sm" variant="outline" className="rounded-full border-white/20 px-6" onClick={() => nextEpisode && router.push(`/episode/${nextEpisode.slug}`)} disabled={!nextEpisode}>Next</Button>
            </div>
          </div>

          <Link href={`/detail/${donghuaSlug}`}>
            <Button variant="outline" className="text-xs font-bold uppercase tracking-widest text-primary border-primary/30 hover:bg-primary/10 rounded-full px-6 transition-all">Detail Series</Button>
          </Link>
        </div>

        <Tabs defaultValue="comments" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-white/10 p-0 h-12 rounded-none gap-8 mb-8">
                <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-gray-400 font-bold uppercase text-xs tracking-widest pb-3 transition-all">
                    <MessageSquare className="w-4 h-4 mr-2" /> Diskusi
                </TabsTrigger>
                <TabsTrigger value="episodes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-gray-400 font-bold uppercase text-xs tracking-widest pb-3 transition-all">
                    <List className="w-4 h-4 mr-2" /> Episode
                </TabsTrigger>
            </TabsList>

            <TabsContent value="comments">
                {/* FORM KOMEN ANONIM */}
                <div className="space-y-4 mb-12 bg-neutral-900/50 p-6 rounded-3xl border border-white/10 shadow-xl">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input 
                            placeholder="Nama Lu (Opsional)" 
                            value={commentName}
                            onChange={(e) => setCommentName(e.target.value)}
                            className="sm:w-[200px] bg-black/40 border-white/10 rounded-full text-xs h-11 px-5"
                        />
                        <div className="flex-1 relative group">
                            <Input 
                                placeholder="Tulis teorimu di sini..." 
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                className="bg-black/40 border-white/10 rounded-full h-11 pl-5 pr-14 transition-all focus:border-primary/50"
                            />
                            <button 
                                onClick={() => postComment.mutate({ content: commentContent, name: commentName })}
                                disabled={!commentContent || postComment.isPending}
                                className="absolute right-2 top-1.5 h-8 w-8 rounded-full bg-transparent hover:bg-white/5 flex items-center justify-center text-primary transition-transform active:scale-90 disabled:opacity-50"
                            >
                                {postComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* LIST KOMEN */}
                <div className="space-y-10">
                    {loadingComments ? (
                        <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                    ) : (
                        rootComments.map((comment: any) => (
                            <div key={comment.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-500 border-b border-white/5 pb-8 last:border-0">
                                <div className="flex gap-4">
                                    <Avatar className="h-10 w-10 border border-white/10 bg-neutral-800 shadow-sm">
                                        <AvatarFallback className="text-[10px] font-bold">{comment.name?.charAt(0) || 'K'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-sm text-white tracking-tight">{comment.name}</span>
                                            <span className="text-[10px] text-gray-600 ml-auto font-medium">
                                                {new Date(comment.created_at).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed font-light">{comment.content}</p>
                                        
                                        <div className="flex gap-6 mt-4">
                                            <button onClick={() => handleCommentLike(comment.id, comment.likes || 0)} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-primary transition-colors font-bold uppercase tracking-widest">
                                                <ThumbsUp className="w-3 h-3" /> {comment.likes || 0}
                                            </button>
                                            <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-[10px] text-gray-500 hover:text-primary transition-colors font-bold uppercase tracking-widest">
                                                Balas
                                            </button>
                                        </div>

                                        {replyTo === comment.id && (
                                            <div className="mt-4 flex gap-2 animate-in fade-in zoom-in duration-200">
                                                <Input 
                                                    id={`reply-${comment.id}`}
                                                    placeholder="Balas komentar..." 
                                                    className="bg-neutral-900 border-white/10 rounded-full h-10 text-xs flex-1 pl-5"
                                                    autoFocus
                                                />
                                                <Button size="icon" className="h-10 w-10 rounded-full bg-primary" onClick={() => {
                                                    const el = document.getElementById(`reply-${comment.id}`) as HTMLInputElement;
                                                    if(el?.value) postComment.mutate({ content: el.value, name: commentName, parentId: comment.id });
                                                }}><Send className="w-4 h-4" /></Button>
                                            </div>
                                        )}

                                        {getReplies(comment.id).map((reply: any) => (
                                            <div key={reply.id} className="mt-6 pl-4 border-l-2 border-primary/20 flex gap-3 animate-in slide-in-from-left-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-xs text-gray-400">{reply.name}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed font-light">{reply.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </TabsContent>

            <TabsContent value="episodes">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {episodeData.episodes_list?.map((ep, i) => (
                        <Link key={i} href={`/episode/${ep.slug}`}>
                            <Button variant={ep.slug === slug ? 'default' : 'outline'} className="w-full h-10 border-white/20 text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
                                {episodeData.episodes_list!.length - i}
                            </Button>
                        </Link>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
