/*
  RECOMMANDATIONS DE SÉCURITÉ SUPABASE RLS - AKWABA INFO
  
  Copiez et exécutez ces scripts dans l'éditeur SQL de votre tableau de bord Supabase 
  pour sécuriser vos données selon l'audit effectué.
*/

-- 1. ACTIVER RLS SUR TOUTES LES TABLES
ALTER TABLE IF EXISTS articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS media ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;

-- 2. POLITIQUES POUR LES ARTICLES (Lecture publique, Modification par l'admin uniquement)
CREATE POLICY "Lecture publique des articles publiés" ON articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admin a tous les accès sur les articles" ON articles
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- 3. POLITIQUES POUR LES PROFILS (Lecture/Modification par le propriétaire, Admin peut tout voir)
CREATE POLICY "Utilisateurs peuvent voir leur propre profil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Utilisateurs peuvent modifier leur propre profil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin peut voir tous les profils" ON profiles
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- 4. POLITIQUES POUR LES TRANSACTIONS (Lecture par l'utilisateur et l'admin, Insertion par l'utilisateur)
CREATE POLICY "Utilisateurs voient leurs propres transactions" ON transactions
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Admin voit toutes les transactions" ON transactions
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

CREATE POLICY "Système/Utilisateur peut insérer une transaction" ON transactions
  FOR INSERT WITH CHECK (true);

-- 5. POLITIQUES POUR LES COMMENTAIRES (Lecture publique, Insertion par les connectés)
CREATE POLICY "Lecture publique des commentaires" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Insertion de commentaires par les utilisateurs connectés" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = "userId" OR true);

-- 6. POLITIQUES POUR LES ABONNÉS NEWSLETTER
CREATE POLICY "Public can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view and delete subscribers" ON subscribers
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- 7. POLITIQUES POUR LES ÉVÉNEMENTS
CREATE POLICY "Lecture publique des événements" ON events
  FOR SELECT USING (true);

CREATE POLICY "Admin a tous les accès sur les événements" ON events
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- 8. POLITIQUES POUR LES LIVE BLOGS
CREATE POLICY "Lecture publique des live blogs" ON live_blogs
  FOR SELECT USING (true);

CREATE POLICY "Admin a tous les accès sur les live blogs" ON live_blogs
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- 9. POLITIQUES POUR LES WEB TV
CREATE POLICY "Lecture publique web_tv" ON web_tv
  FOR SELECT USING (true);

CREATE POLICY "Admin a tous les accès sur web_tv" ON web_tv
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- 10. POLITIQUES POUR LES SONDAGES
CREATE POLICY "Lecture publique des sondages" ON polls
  FOR SELECT USING (true);

CREATE POLICY "Admin a tous les accès sur les sondages" ON polls
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- 11. POLITIQUES POUR LES MÉDIAS
CREATE POLICY "Lecture publique des médias" ON media
  FOR SELECT USING (true);

CREATE POLICY "Admin a tous les accès sur les médias" ON media
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- 12. SÉCURISER LES PARAMÈTRES DU SITE (Lecture publique, Modification ADMIN uniquement)
CREATE POLICY "Lecture publique des settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Seul l'admin peut modifier les settings" ON settings
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- NOTE : Remplacez 'akwabanewsinfo@gmail.com' par l'email de l'administrateur réel.
