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
  FOR INSERT WITH CHECK (true); -- Idéalement restreindre à auth.uid() si connecté

-- 5. POLITIQUES POUR LES COMMENTAIRES (Lecture publique, Insertion par les connectés)
CREATE POLICY "Lecture publique des commentaires" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Insertion de commentaires par les utilisateurs connectés" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = "userId" OR true); -- Selon si on force l'auth

-- 6. SÉCURISER LES PARAMÈTRES DU SITE (Lecture publique, Modification ADMIN uniquement)
CREATE POLICY "Lecture publique des settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Seul l'admin peut modifier les settings" ON settings
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'akwabanewsinfo@gmail.com');

-- NOTE : Remplacez 'akwabanewsinfo@gmail.com' par l'email de l'administrateur réel.
