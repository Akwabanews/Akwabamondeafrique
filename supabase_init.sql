-- INITIALISATION DE LA BASE DE DONNÉES SUPABASE - AKWABA INFO
-- Copiez et exécutez ce script dans l'éditeur SQL de votre tableau de bord Supabase (https://app.supabase.com)

-- 1. CRÉATION DES TABLES

-- Table des Articles
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT now(),
    category TEXT DEFAULT 'Afrique',
    image TEXT,
    video TEXT,
    audioUrl TEXT,
    gallery TEXT[],
    author TEXT DEFAULT 'Équipe Akwaba Info',
    authorRole TEXT DEFAULT 'Journaliste',
    excerpt TEXT,
    content TEXT NOT NULL,
    readingTime TEXT DEFAULT '4 min',
    imageCredit TEXT,
    source TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    reactions JSONB DEFAULT '{}'::jsonb,
    commentsCount INTEGER DEFAULT 0,
    tags TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    isPremium BOOLEAN DEFAULT false,
    premiumPreviewSelection TEXT DEFAULT 'auto',
    manualPreview TEXT,
    scheduledAt TIMESTAMPTZ,
    seoTitle TEXT,
    seoDescription TEXT,
    socialImage TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Événements
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL, -- Format string YYYY-MM-DD
    location TEXT NOT NULL,
    category TEXT DEFAULT 'Événement Culturel',
    image TEXT,
    imageCredit TEXT,
    gallery TEXT[],
    video TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    scheduledAt TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Profils Utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
    uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    displayName TEXT,
    email TEXT,
    photoURL TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
    likedArticles TEXT[],
    bookmarkedArticles TEXT[],
    followedAuthors TEXT[],
    followedCategories TEXT[],
    votedPolls TEXT[],
    badges TEXT[],
    points INTEGER DEFAULT 0,
    isPremium BOOLEAN DEFAULT false,
    premiumSince TIMESTAMPTZ,
    premiumUntil TIMESTAMPTZ,
    paymentMethod TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Commentaires
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES auth.users(id),
    userPhoto TEXT,
    username TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT now(),
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    likedBy UUID[],
    articleId UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    isReported BOOLEAN DEFAULT false,
    reportedBy UUID[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Paramètres (un seul abonné)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    aboutText TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    facebookUrl TEXT,
    twitterUrl TEXT,
    instagramUrl TEXT,
    tiktokUrl TEXT,
    linkedinUrl TEXT,
    youtubeUrl TEXT,
    urgentBannerText TEXT,
    urgentBannerActive BOOLEAN DEFAULT false,
    urgentBannerLink TEXT,
    flashNews TEXT,
    categories TEXT[],
    maintenanceMode BOOLEAN DEFAULT false,
    donationAmounts INTEGER[],
    donationPaymentMethods TEXT[],
    premiumPrice INTEGER DEFAULT 5000,
    isDonationActive BOOLEAN DEFAULT true,
    isPremiumActive BOOLEAN DEFAULT true,
    activePaymentMethods JSONB,
    paymentLinks JSONB,
    premiumDurationMonths INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Sondages
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    startDate TIMESTAMPTZ DEFAULT now(),
    endDate TIMESTAMPTZ,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table de la Bibliothèque Média
CREATE TABLE IF NOT EXISTS public.media (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    type TEXT CHECK (type IN ('image', 'video')),
    date TIMESTAMPTZ DEFAULT now(),
    fileName TEXT
);

-- Table des Abonnés Newsletter
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    date TIMESTAMPTZ DEFAULT now()
);

-- Table des Petites Annonces
CREATE TABLE IF NOT EXISTS public.classifieds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT,
    category TEXT CHECK (category IN ('emploi', 'immobilier', 'véhicules', 'services', 'divers')),
    location TEXT NOT NULL,
    contact TEXT NOT NULL,
    imageUrl TEXT,
    userId UUID REFERENCES auth.users(id),
    username TEXT,
    date TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired'))
);

-- Table des Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES auth.users(id),
    topic TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    date TIMESTAMPTZ DEFAULT now(),
    read BOOLEAN DEFAULT false,
    type TEXT CHECK (type IN ('article', 'event', 'urgent', 'system'))
);

-- 2. ACTIVATION DE LA SÉCURITÉ (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classifieds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. POLITIQUES DE SÉCURITÉ (ADMIN EMAIL: akwabanewsinfo@gmail.com)

-- Articles (Lecture publique, Admin peut tout faire)
CREATE POLICY "Articles: lecture publique" ON public.articles FOR SELECT USING (status = 'published');
CREATE POLICY "Articles: admin full access" ON public.articles FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- Profils (Lecture/Modif par soi-même)
CREATE POLICY "Profiles: lecture/modif par soi" ON public.profiles FOR ALL USING (auth.uid() = uid);
CREATE POLICY "Profiles: admin full access" ON public.profiles FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- Settings (Lecture publique, Admin peut tout faire)
CREATE POLICY "Settings: lecture publique" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Settings: admin full access" ON public.settings FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- Commentaires (Lecture publique, Insertion par les connectés)
CREATE POLICY "Comments: lecture publique" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Comments: insertion connectés" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = userId);

-- Sondages (Lecture publique)
CREATE POLICY "Polls: lecture publique" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Polls: admin full access" ON public.polls FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- 4. INSERTION DES PARAMÈTRES PAR DÉFAUT
INSERT INTO public.settings (id, aboutText, email, phone, address, categories, activePaymentMethods)
VALUES ('global', 'Akwaba Info est votre source de référence pour l''actualité en Afrique et dans le monde.', 'contact@akwabainfo.com', '+225 00 00 00 00', 'Abidjan, Côte d''Ivoire', ARRAY['À la une', 'Urgent', 'Politique', 'Économie', 'Science', 'Santé', 'Culture', 'Histoire', 'Sport', 'Afrique', 'Monde', 'Tech'], '{"paypal": true, "stripe": false, "orangeMoney": true, "wave": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
