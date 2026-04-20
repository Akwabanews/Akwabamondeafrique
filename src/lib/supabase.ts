import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import supabaseConfig from '../../supabase-config.json';
import { 
  Article, 
  Event, 
  SiteSettings, 
  Comment, 
  Subscriber, 
  MediaAsset, 
  Poll, 
  AppNotification, 
  SupportMessage,
  UserProfile,
  Classified,
  LiveBlog,
  LiveUpdate,
  WebTV
} from '../types';

export const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseAnonKey
);

const isPlaceholder = !supabaseConfig.supabaseUrl || supabaseConfig.supabaseUrl.includes('example.com');

// --- Supabase Database Services ---

export const SupabaseService = {
  // Articles
  async getArticles(): Promise<Article[]> {
    if (isPlaceholder) {
      const saved = localStorage.getItem('akwaba_articles');
      return saved ? JSON.parse(saved) : [];
    }
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Supabase Error (getArticles):', error);
      return [];
    }
    return data as Article[];
  },

  async saveArticle(article: Article): Promise<void> {
    if (isPlaceholder) {
      const articles = JSON.parse(localStorage.getItem('akwaba_articles') || '[]');
      const index = articles.findIndex((a: any) => a.id === article.id);
      if (index >= 0) articles[index] = article;
      else articles.unshift(article);
      localStorage.setItem('akwaba_articles', JSON.stringify(articles));
      return;
    }
    const { error } = await supabase
      .from('articles')
      .upsert(article);
    
    if (error) throw error;
  },

  async deleteArticle(id: string): Promise<void> {
    if (isPlaceholder) {
      const articles = JSON.parse(localStorage.getItem('akwaba_articles') || '[]');
      localStorage.setItem('akwaba_articles', JSON.stringify(articles.filter((a: any) => a.id !== id)));
      return;
    }
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Events
  async getEvents(): Promise<Event[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });
    if (error) return [];
    return data as Event[];
  },

  async saveEvent(event: Event): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase
      .from('events')
      .upsert(event);
    if (error) throw error;
  },

  async deleteEvent(id: string): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Settings
  async getSettings(): Promise<SiteSettings | null> {
    if (isPlaceholder) return null;
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'global')
      .single();
    if (error) return null;
    return data as SiteSettings;
  },

  async saveSettings(settings: SiteSettings): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase
      .from('settings')
      .upsert({ ...settings, id: 'global' });
    if (error) throw error;
  },

  // Comments
  async getAllComments(): Promise<Comment[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('date', { ascending: false });
    if (error) return [];
    return data as Comment[];
  },

  async saveComment(comment: Comment): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase
      .from('comments')
      .upsert(comment);
    if (error) throw error;
  },

  async deleteComment(id: string): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // User Blocks & Reporting
  async blockUser(userId: string): Promise<void> {
    if (isPlaceholder) return;
    await supabase
      .from('blocked_users')
      .upsert({ user_id: userId, blocked_at: new Date().toISOString() });
  },

  async isUserBlocked(userId: string): Promise<boolean> {
    if (isPlaceholder) return false;
    const { data } = await supabase
      .from('blocked_users')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    return !!data;
  },

  async reportComment(commentId: string, userId: string): Promise<void> {
    if (isPlaceholder) return;
    const { data: comment } = await supabase
      .from('comments')
      .select('reportedBy')
      .eq('id', commentId)
      .single();
    
    if (comment) {
      const current = comment.reportedBy || [];
      if (!current.includes(userId)) {
        await supabase
          .from('comments')
          .update({ 
            isReported: true, 
            reportedBy: [...current, userId] 
          })
          .eq('id', commentId);
      }
    }
  },

  async likeComment(commentId: string, userId: string, isLiked: boolean): Promise<void> {
    if (isPlaceholder) return;
    const { data: comment } = await supabase
      .from('comments')
      .select('likedBy')
      .eq('id', commentId)
      .single();
    
    if (comment) {
      let likedBy = comment.likedBy || [];
      if (isLiked && !likedBy.includes(userId)) {
        likedBy.push(userId);
      } else if (!isLiked) {
        likedBy = likedBy.filter((id: string) => id !== userId);
      }
      await supabase
        .from('comments')
        .update({ 
          likes: likedBy.length,
          likedBy: likedBy 
        })
        .eq('id', commentId);
    }
  },

  // Article Actions
  async likeArticle(articleId: string, userId: string, isLiked: boolean): Promise<void> {
    if (isPlaceholder) return;
    const { data: article } = await supabase.from('articles').select('likes').eq('id', articleId).single();
    if (article) {
      await supabase.from('articles').update({ likes: (article.likes || 0) + (isLiked ? 1 : -1) }).eq('id', articleId);
    }

    const { data: profile } = await supabase.from('profiles').select('likedArticles').eq('uid', userId).single();
    if (profile) {
      let liked = profile.likedArticles || [];
      if (isLiked && !liked.includes(articleId)) liked.push(articleId);
      else if (!isLiked) liked = liked.filter((id: string) => id !== articleId);
      await supabase.from('profiles').update({ likedArticles: liked }).eq('uid', userId);
    }
  },

  async bookmarkArticle(articleId: string, userId: string, isBookmarked: boolean): Promise<void> {
    if (isPlaceholder) return;
    const { data: profile } = await supabase.from('profiles').select('bookmarkedArticles').eq('uid', userId).single();
    if (profile) {
      let bookmarked = profile.bookmarkedArticles || [];
      if (isBookmarked && !bookmarked.includes(articleId)) bookmarked.push(articleId);
      else if (!isBookmarked) bookmarked = bookmarked.filter((id: string) => id !== articleId);
      await supabase.from('profiles').update({ bookmarkedArticles: bookmarked }).eq('uid', userId);
    }
  },

  async followAuthor(authorName: string, userId: string, isFollowing: boolean): Promise<void> {
    if (isPlaceholder) return;
    const { data: profile } = await supabase.from('profiles').select('followedAuthors').eq('uid', userId).single();
    if (profile) {
      let followed = profile.followedAuthors || [];
      if (isFollowing && !followed.includes(authorName)) followed.push(authorName);
      else if (!isFollowing) followed = followed.filter((name: string) => name !== authorName);
      await supabase.from('profiles').update({ followedAuthors: followed }).eq('uid', userId);
    }
  },

  async followCategory(category: string, userId: string, isFollowing: boolean): Promise<void> {
    if (isPlaceholder) return;
    const { data: profile } = await supabase.from('profiles').select('followedCategories').eq('uid', userId).single();
    if (profile) {
      let followed = profile.followedCategories || [];
      if (isFollowing && !followed.includes(category)) followed.push(category);
      else if (!isFollowing) followed = followed.filter((cat: string) => cat !== category);
      await supabase.from('profiles').update({ followedCategories: followed }).eq('uid', userId);
    }
  },

  // Profile management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (isPlaceholder) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', userId)
      .single();
    if (error) return null;
    return data as UserProfile;
  },

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('uid', userId);
    if (error) throw error;
  },

  // Polls
  async getPolls(): Promise<Poll[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .order('startDate', { ascending: false });
    if (error) return [];
    return data as Poll[];
  },

  async getActivePoll(): Promise<Poll | null> {
    if (isPlaceholder) return null;
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('active', true)
      .single();
    if (error) return null;
    return data as Poll;
  },

  async savePoll(poll: Poll): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase
      .from('polls')
      .upsert(poll);
    if (error) throw error;
  },

  async submitVote(pollId: string, optionId: string, userId: string): Promise<void> {
    if (isPlaceholder) return;
    const { data: poll } = await supabase.from('polls').select('options').eq('id', pollId).single();
    if (poll) {
      const options = poll.options.map((opt: any) => 
        opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
      );
      await supabase.from('polls').update({ options }).eq('id', pollId);

      const { data: profile } = await supabase.from('profiles').select('votedPolls').eq('uid', userId).single();
      if (profile) {
        const voted = profile.votedPolls || [];
        if (!voted.includes(pollId)) {
          await supabase.from('profiles').update({ votedPolls: [...voted, pollId] }).eq('uid', userId);
        }
      }
    }
  },

  async deletePoll(pollId: string): Promise<void> {
    if (isPlaceholder) return;
    await supabase.from('polls').delete().eq('id', pollId);
  },

  // Newsletter
  async subscribe(email: string): Promise<void> {
    if (isPlaceholder) return;
    
    // 1. Insert into database
    // Using .insert instead of .upsert to avoid needing SELECT/UPDATE permissions (simpler RLS)
    const { error: dbError } = await supabase
      .from('subscribers')
      .insert({ email });
    
    // 23505 is the code for unique constraint violation (already subscribed)
    if (dbError && dbError.code !== '23505') {
      console.error("Database subscription error:", dbError);
      throw new Error(`Erreur Base de données: ${dbError.message}`);
    }

    // 2. Call Edge Function to send Welcome Email
    try {
      const { error: invokeError } = await supabase.functions.invoke('send-newsletter-brevo', {
        body: { 
          email, 
          type: 'welcome',
          data: {
            siteUrl: window.location.origin,
            unsubscribeUrl: `${window.location.origin}/unsubscribe?email=${encodeURIComponent(email)}`
          }
        }
      });

      if (invokeError) throw invokeError;
    } catch (e: any) {
      console.warn("Welcome email failed but subscription might be OK:", e);
      // Don't throw for email failure if DB insert worked
    }
    
    // 3. Admin Notification
    try {
      await this.sendNotification({
        id: `sub-${Date.now()}`,
        userId: 'global',
        title: 'Nouvel abonné',
        message: `${email} vient de s'abonner à la newsletter.`,
        date: new Date().toISOString(),
        read: false,
        type: 'info'
      });
    } catch (e) {
      console.warn("Admin notification failed:", e);
    }
  },

  async searchArticles(query: string): Promise<Article[]> {
    if (isPlaceholder) {
      const articles = await this.getArticles();
      const q = query.toLowerCase();
      return articles.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.content.toLowerCase().includes(q)
      );
    }

    // Uses the search_articles SQL function (pg_trgm + unaccent)
    const { data, error } = await supabase
      .rpc('search_articles', { search_query: query });
    
    if (error) {
      console.error('Supabase Error (searchArticles):', error);
      // Fallback to basic search if RPC fails
      const { data: basicData } = await supabase
        .from('articles')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('date', { ascending: false });
      return (basicData as Article[]) || [];
    }
    return data as Article[];
  },

  async unsubscribe(email: string): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('email', email);
    if (error) throw error;
  },

  async getSubscribers(): Promise<Subscriber[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('date', { ascending: false });
    if (error) return [];
    return data as Subscriber[];
  },

  async deleteSubscriber(id: string): Promise<void> {
    if (isPlaceholder) return;
    await supabase.from('subscribers').delete().eq('id', id);
  },

  // Media tracking
  async trackMedia(url: string, type: 'image' | 'video'): Promise<void> {
    if (isPlaceholder) return;
    const id = btoa(url).substring(0, 20).replace(/[/+=]/g, '');
    await supabase
      .from('media')
      .upsert({ id, url, type, date: new Date().toISOString() });
  },

  async getMediaLibrary(): Promise<MediaAsset[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('date', { ascending: false });
    if (error) return [];
    return data as MediaAsset[];
  },

  async deleteMediaAsset(id: string): Promise<void> {
    if (isPlaceholder) return;
    await supabase.from('media').delete().eq('id', id);
  },

  // Classifieds
  async getClassifieds(): Promise<Classified[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase
      .from('classifieds')
      .select('*')
      .order('date', { ascending: false });
    if (error) return [];
    return data as Classified[];
  },

  async saveClassified(classified: Classified): Promise<void> {
    if (isPlaceholder) return;
    await supabase.from('classifieds').upsert(classified);
  },

  async deleteClassified(id: string): Promise<void> {
    if (isPlaceholder) return;
    await supabase.from('classifieds').delete().eq('id', id);
  },

  // Notifications
  subscribeToNotifications(userId: string, callback: (notifs: AppNotification[]) => void) {
    if (isPlaceholder) return () => {};
    this.getNotifications(userId).then(callback);
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        this.getNotifications(userId).then(callback);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  async getNotifications(userId: string): Promise<AppNotification[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`userId.eq.${userId},userId.eq.global`)
      .order('date', { ascending: false });
    if (error) return [];
    return data as AppNotification[];
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isPlaceholder) return;
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  },

  async sendNotification(notif: AppNotification): Promise<void> {
    if (isPlaceholder) return;
    await supabase.from('notifications').upsert(notif);
  },

  // Chat/Live
  async sendChatMessage(message: any): Promise<void> {
    if (isPlaceholder) return;
    await supabase.from('chats').insert(message);
  },

  subscribeToChat(articleId: string, callback: (messages: any[]) => void) {
    if (isPlaceholder) return () => {};
    supabase.from('chats').select('*').eq('articleId', articleId).order('date', { ascending: true })
      .then(({ data }) => callback(data || []));
    const channel = supabase
      .channel(`chat:${articleId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats', filter: `articleId=eq.${articleId}` }, () => {
        supabase.from('chats').select('*').eq('articleId', articleId).order('date', { ascending: true })
          .then(({ data }) => callback(data || []));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  async getLiveBlogs(): Promise<LiveBlog[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase.from('live_blogs').select('*').order('createdAt', { ascending: false });
    if (error) return [];
    return data as LiveBlog[];
  },

  async saveLiveBlog(blog: LiveBlog): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase.from('live_blogs').upsert(blog);
    if (error) throw error;
  },

  async deleteLiveBlog(id: string): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase.from('live_blogs').delete().eq('id', id);
    if (error) throw error;
  },

  // Web TV
  async getWebTV(): Promise<WebTV[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase.from('web_tv').select('*').order('date', { ascending: false });
    if (error) return [];
    return data as WebTV[];
  },

  async saveWebTV(entry: WebTV): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase.from('web_tv').upsert(entry);
    if (error) throw error;
  },

  async deleteWebTV(id: string): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase.from('web_tv').delete().eq('id', id);
    if (error) throw error;
  },

  async addLiveUpdate(blogId: string, update: LiveUpdate): Promise<void> {
    if (isPlaceholder) return;
    const { data: blog } = await supabase.from('live_blogs').select('updates').eq('id', blogId).single();
    if (blog) {
      const updates = [...(blog.updates || []), update];
      await supabase.from('live_blogs').update({ updates }).eq('id', blogId);
    }
  },

  async incrementArticleViews(articleId: string): Promise<void> {
    if (isPlaceholder) return;
    const { data: article } = await supabase.from('articles').select('views').eq('id', articleId).single();
    if (article) {
      await supabase.from('articles').update({ views: (article.views || 0) + 1 }).eq('id', articleId);
    }
  },

  // Points
  async awardPoints(userId: string, points: number, badge?: string): Promise<void> {
    if (isPlaceholder) return;
    const { data: profile } = await supabase.from('profiles').select('points, badges').eq('uid', userId).single();
    if (profile) {
      const updates: any = { points: (profile.points || 0) + points };
      if (badge) {
        const currentBadges = profile.badges || [];
        if (!currentBadges.includes(badge)) {
          updates.badges = [...currentBadges, badge];
        }
      }
      await supabase.from('profiles').update(updates).eq('uid', userId);
    }
  },

  // Support Chat
  async sendSupportMessage(message: SupportMessage): Promise<void> {
    if (isPlaceholder) return;
    const { id, ...msg } = message;
    await supabase.from('support_messages').insert({ id, ...msg });
  },

  subscribeToSupportMessages(userId: string, callback: (messages: SupportMessage[]) => void) {
    if (isPlaceholder) return () => {};
    supabase.from('support_messages').select('*').eq('userId', userId).order('date', { ascending: true })
      .then(({ data }) => callback(data as SupportMessage[] || []));
    const channel = supabase.channel(`support:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `userId=eq.${userId}` }, () => {
        supabase.from('support_messages').select('*').eq('userId', userId).order('date', { ascending: true })
          .then(({ data }) => callback(data as SupportMessage[] || []));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  subscribeToAllSupportMessages(callback: (userId: string, messages: SupportMessage[]) => void) {
    if (isPlaceholder) return () => {};
    const channel = supabase.channel('support:all')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload) => {
        const userId = payload.new.userId;
        supabase.from('support_messages').select('*').eq('userId', userId).order('date', { ascending: true })
          .then(({ data }) => callback(userId, data as SupportMessage[] || []));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  // Stats
  async getAdminStats(): Promise<any> {
    if (isPlaceholder) return null;
    const { count: totalArticles } = await supabase.from('articles').select('*', { count: 'exact', head: true });
    const { count: totalSubscribers } = await supabase.from('subscribers').select('*', { count: 'exact', head: true });
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: articles } = await supabase.from('articles').select('views, category');
    const totalViews = articles?.reduce((s, a) => s + (a.views || 0), 0) || 0;
    const categoryStats: Record<string, number> = {};
    articles?.forEach(a => { categoryStats[a.category] = (categoryStats[a.category] || 0) + 1; });
    return { totalArticles, totalSubscribers, totalViews, totalUsers, categoryStats };
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return [];
    return data as UserProfile[];
  },

  async checkPremiumStatus(userId: string): Promise<boolean> {
    if (isPlaceholder) return false;
    const profile = await this.getUserProfile(userId);
    if (!profile) return false;
    
    // If it's explicitly marked as premium
    if (profile.isPremium) {
      // If there's an expiration date, check it
      if (profile.premiumUntil) {
        const now = new Date();
        const expirationDate = new Date(profile.premiumUntil);
        
        if (now > expirationDate) {
          // Auto-disable if expired
          await this.updateUserProfile(userId, { isPremium: false });
          return false;
        }
        return true;
      }
      
      // If marked premium but no expiration date, we assume it's lifetime or should be checked by admin
      // But for safety, news sites usually have durations. 
      // If we want total security, we could return false if premiumUntil is missing.
      // For now, return true but log warning.
      return true;
    }
    return false;
  },

  async upgradeToPremium(userId: string, method?: string, months: number = 1): Promise<void> {
    if (isPlaceholder) return;
    const now = new Date();
    const until = new Date(new Date().setMonth(now.getMonth() + months)).toISOString();
    await this.updateUserProfile(userId, { 
      isPremium: true, 
      premiumSince: new Date().toISOString(),
      premiumUntil: until, 
      paymentMethod: method 
    });
  },

  async setPremiumUntil(userId: string, untilDate: string | null): Promise<void> {
    if (isPlaceholder) return;
    await this.updateUserProfile(userId, { 
      isPremium: !!untilDate, 
      premiumUntil: untilDate || undefined 
    });
  },

  async getPremiumSubscribers(): Promise<UserProfile[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('isPremium', true);
    if (error) return [];
    return data as UserProfile[];
  },

  async recordTransaction(userId: string, email: string, amount: number, method: string, type: 'subscription' | 'donation', status: 'pending' | 'success' | 'failed' = 'success'): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase.from('transactions').insert({
      userId,
      email,
      amount,
      method,
      type,
      status,
      date: new Date().toISOString()
    });
    if (error) console.error("Error recording transaction:", error);
  },

  async getTransactions(): Promise<any[]> {
    if (isPlaceholder) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
    return data;
  },

  async updateTransactionStatus(id: string, status: 'success' | 'failed'): Promise<void> {
    if (isPlaceholder) return;
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id);
    if (error) console.error("Error updating transaction status:", error);
  },

  async importMockData(articles: Article[], events: Event[]): Promise<void> {
    if (isPlaceholder) return;
    
    if (articles.length > 0) {
      const { error: artError } = await supabase.from('articles').upsert(articles);
      if (artError) throw artError;
    }
    
    if (events.length > 0) {
      const { error: evtError } = await supabase.from('events').upsert(events);
      if (evtError) throw evtError;
    }
  }
};

// --- Auth Utilities ---

export const signInWithOtp = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    }
  });
  if (error) throw error;
  return data;
};

export const signInWithPassword = async (email: string, pass: string) => {
  if (!pass) return signInWithOtp(email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  return normalizeUser(data.user);
};

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  const result = await supabase.auth.signUp({
    email, 
    password: pass, 
    options: { 
      data: { display_name: name },
      emailRedirectTo: window.location.origin,
    }
  });
  
  if (result.error) throw result.error;

  // Even if Supabase logs them in immediately (auto-confirm), 
  // try to force a verification email if that's what the user wants.
  // Note: This may fail if the user is already confirmed depending on Supabase settings.
  try {
    await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
  } catch (e) {
    console.warn("Resend confirmation failed (might be already confirmed or disabled):", e);
  }

  return result.data;
};

export const signOut = async () => { await supabase.auth.signOut(); };
export const resetPassword = async (email: string) => { 
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  }); 
};
export const setupRecaptcha = (id: string) => null;
export const sendPhoneOtp = async (phone: string) => null;

export const auth: any = {
  get currentUser() { 
    // In Supabase, we use supabase.auth.getSession() or onAuthStateChange
    return null; 
  },
  async signOut() { await supabase.auth.signOut(); }
};

const normalizeUser = (user: SupabaseUser | null) => {
  if (!user) return null;
  return {
    ...user,
    uid: user.id,
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0],
    photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://ui-avatars.com/api/?name=${user.email?.split('@')[0]}`
  };
};

export const onAuthStateChanged = (authOrCallback: any, callback?: (user: any) => void) => {
  const actualCallback = typeof authOrCallback === 'function' ? authOrCallback : callback;
  if (!actualCallback) return () => {};
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    actualCallback(normalizeUser(session?.user ?? null));
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    actualCallback(normalizeUser(session?.user ?? null));
  });
  
  return () => subscription.unsubscribe();
};
