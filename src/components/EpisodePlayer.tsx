"use client";

import { useEffect, useState } from 'react';
import { MessageSquare, Send, Loader2, List, ThumbsUp, ThumbsDown, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, EpisodeDetail } from '@/lib/api';
import { history } from '@/lib/history';
import { cn } from '@/lib/utils';
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
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    setCommentName(localStorage.getItem('ph_anon_name') || '');
  }, []);

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
        const finalName = name || 'User Anonim';
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

  const [localEpisode, setLocalEpisode] = useState<EpisodeDetail | null>(episode);
  const [isRescuing, setIsRescuing] = useState(false);

  useEffect(() => {
    const checkAndRescue = async () => {
        if (!localEpisode || !localEpisode.streaming || localEpisode.streaming.servers.length === 0) {
            setIsRescuing(true);
            try {
                const res = await fetch('/api/provider/animexin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'episode', url: `https://animexin.dev/${slug}/` })
                });
                const json = await res.json();
                if (json.status === 'success' && json.data) {
                    setLocalEpisode(json.data);
                }
            } catch (e) {} finally { setIsRescuing(false); }
        }
    };
    checkAndRescue();
  }, [slug]);

  useEffect(() => {
    if (localEpisode && localEpisode.streaming?.servers?.length > 0) {
      if (!selectedServer) setSelectedServer(localEpisode.streaming.servers[0].url);
      if (localEpisode.donghua_details && slug) {
        history.add({
          slug: localEpisode.donghua_details.slug,
          title: localEpisode.donghua_details.title,
          episode: localEpisode.episode,
          episodeSlug: slug,
          poster: localEpisode.donghua_details.poster || "",
        });
      }
    }
  }, [localEpisode, slug]);

  const episodeData = localEpisode || episode;

  if (!episodeData || !episodeData.streaming || episodeData.streaming.servers.length === 0) {
      return <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground font-semibold">Video tidak tersedia</p>
      </div>
  }

  const prevEpisode = episodeData.navigation?.previous_episode || episodeData.prev_episode;
  const nextEpisode = episodeData.navigation?.next_episode || episodeData.next_episode;
  const donghuaSlug = episodeData.donghua_details?.slug || slug?.replace(/-episode-\d+.*/, '');

  return (
    <div className="min-h-screen pb-32 bg-background selection:bg-primary/30">
      
      {/* Player Section - Minimalist Black */}
      <div className="w-full bg-black shadow-lg overflow-hidden md:mt-0">
        <div className="container mx-auto max-w-6xl aspect-video relative">
          {selectedServer ? (
            <iframe src={selectedServer} className="w-full h-full" allowFullScreen />
          ) : (
            <div className="flex items-center justify-center h-full text-white/10 font-bold text-xs tracking-widest">LOADING...</div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Title and Stats */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
            <div className="space-y-2">
                <Link href={`/detail/${donghuaSlug}`} className="text-[11px] font-bold text-primary uppercase tracking-widest hover:underline">
                    {episodeData.donghua_details?.title || 'Kembali ke Series'}
                </Link>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">{episodeData.episode}</h1>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex bg-white rounded-full p-1 border border-black/5 shadow-soft" role="group" aria-label="Video voting">
                    <button 
                        onClick={() => handleVideoVote('likes')}
                        aria-label={`Like this video. Current likes: ${videoVotes?.likes || 0}`}
                        className="flex items-center gap-2 px-5 py-2.5 hover:bg-orange-50 rounded-full transition-all text-xs font-bold"
                    >
                        <ThumbsUp className="w-4 h-4 text-primary" aria-hidden="true" /> {videoVotes?.likes || 0}
                    </button>
                    <div className="w-px h-4 bg-gray-100 self-center" aria-hidden="true"></div>
                    <button 
                        onClick={() => handleVideoVote('dislikes')}
                        aria-label={`Dislike this video. Current dislikes: ${videoVotes?.dislikes || 0}`}
                        className="flex items-center gap-2 px-5 py-2.5 hover:bg-red-50 rounded-full transition-all text-xs font-bold"
                    >
                        <ThumbsDown className="w-4 h-4 text-red-500" aria-hidden="true" /> {videoVotes?.dislikes || 0}
                    </button>
                </div>
                <Button variant="outline" size="icon" className="w-11 h-11 rounded-full border-black/5 bg-white shadow-soft" aria-label="Share this episode" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link disalin!");
                }}>
                    <Share2 className="w-4 h-4" aria-hidden="true" />
                </Button>
            </div>
        </div>
        
        {/* Controls Bar */}
        <div className="flex flex-wrap gap-4 mb-12 items-center justify-between bg-white p-4 rounded-3xl border border-black/5 shadow-soft">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
                <span id="server-select-label" className="sr-only">Select streaming server</span>
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger className="w-[180px] h-11 rounded-full border-none bg-secondary font-bold text-xs tracking-tight" aria-labelledby="server-select-label">
                    <SelectValue placeholder="Pilih Server" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-black/5 shadow-2xl">
                    {episodeData.streaming.servers.map((s, i) => (
                        <SelectItem key={i} value={s.url} className="text-xs font-semibold">
                            Server: {s.name || `Unit ${i+1}`}
                        </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    className="h-11 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white px-6 font-bold text-xs" 
                    onClick={() => prevEpisode && router.push(`/episode/${prevEpisode.slug}`)} 
                    disabled={!prevEpisode}
                    aria-label="Go to previous episode"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Prev
                </Button>
                <Button 
                    variant="outline" 
                    className="h-11 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white px-6 font-bold text-xs" 
                    onClick={() => nextEpisode && router.push(`/episode/${nextEpisode.slug}`)} 
                    disabled={!nextEpisode}
                    aria-label="Go to next episode"
                >
                    Next <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Button>
            </div>
          </div>

          <Link href={`/detail/${donghuaSlug}`} aria-label="View series details">
            <Button className="h-11 rounded-full bg-black text-white hover:bg-primary hover:text-black px-8 font-bold text-xs">Detail Series</Button>
          </Link>
        </div>

        {/* Interaction Tabs */}
        <Tabs defaultValue="episodes" className="w-full">
            <TabsList className="w-full justify-start bg-secondary/50 p-1 rounded-2xl h-14 mb-10 border border-black/5">
                <TabsTrigger value="episodes" className="flex-1 md:flex-none md:px-10 h-full rounded-xl font-bold text-xs tracking-tight data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <List className="w-4 h-4 mr-2" /> Daftar Episode
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1 md:flex-none md:px-10 h-full rounded-xl font-bold text-xs tracking-tight data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    <MessageSquare className="w-4 h-4 mr-2" /> Diskusi
                </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="animate-fade-in">
                <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-black/5 shadow-soft mb-10">
                    <div className="flex flex-col sm:flex-row gap-4 mb-12">
                        <Input 
                            placeholder="Nama Kamu" 
                            value={commentName}
                            onChange={(e) => setCommentName(e.target.value)}
                            className="sm:w-[220px] bg-secondary border-none rounded-2xl h-14 px-6 font-bold text-xs"
                        />
                        <div className="flex-1 relative">
                            <Input 
                                placeholder="Bagikan pendapatmu..." 
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                className="bg-secondary border-none rounded-2xl h-14 pl-6 pr-16 font-bold text-xs"
                            />
                            <button 
                                onClick={() => postComment.mutate({ content: commentContent, name: commentName })}
                                disabled={!commentContent || postComment.isPending}
                                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                {postComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {loadingComments ? (
                            <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                        ) : rootComments.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-muted-foreground font-medium text-sm italic">Belum ada diskusi di episode ini.</p>
                            </div>
                        ) : (
                            rootComments.map((comment: any) => (
                                <div key={comment.id} className="pb-8 border-b border-gray-50 last:border-0">
                                    <div className="flex gap-5">
                                        <Avatar className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
                                            <AvatarFallback className="text-primary font-bold">{comment.name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-sm text-foreground">{comment.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[15px] text-foreground/80 font-medium leading-relaxed">{comment.content}</p>
                                            <div className="flex gap-6 mt-4">
                                                <button onClick={() => handleCommentLike(comment.id, comment.likes || 0)} className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors">
                                                    <ThumbsUp className="w-3.5 h-3.5" /> {comment.likes || 0}
                                                </button>
                                                <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors">Balas</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="episodes" className="animate-fade-in">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
                    {episodeData.episodes_list?.map((ep, i) => (
                        <Link key={i} href={`/episode/${ep.slug}`}>
                            <Button 
                                variant="outline" 
                                className={cn(
                                    "w-full h-12 rounded-xl font-bold text-xs transition-all border-black/5 shadow-soft",
                                    ep.slug === slug ? "bg-primary border-primary text-black" : "bg-white hover:border-primary hover:text-primary"
                                )}
                            >
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