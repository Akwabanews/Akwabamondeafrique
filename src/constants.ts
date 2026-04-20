import { Article, Event, Author } from './types';
import matter from 'gray-matter';
import { Buffer } from 'buffer';

// Polyfill Buffer for gray-matter in the browser environment
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Import all markdown files from the articles directory recursively
const articleFiles = (import.meta as any).glob('./articles/**/*.md', { query: '?raw', eager: true });
const eventFiles = (import.meta as any).glob('./evenements/**/*.md', { query: '?raw', eager: true });

export const MOCK_ARTICLES: Article[] = Object.entries(articleFiles).map(([path, content], index) => {
  try {
    const { data, content: body } = matter((content as any).default || content);
    const slug = path.split('/').pop()?.replace('.md', '') || `article-${index}`;
    
    return {
      id: String(index + 1),
      slug,
      title: data.title || 'Sans titre',
      date: data.date || new Date().toISOString(),
      category: data.category || 'Afrique',
      image: data.image || undefined,
      video: data.video || undefined,
      author: data.author || 'Rédaction',
      authorRole: data.authorRole || 'Journaliste',
      excerpt: data.excerpt || '',
      content: body || '',
      readingTime: data.readingTime || '2 min',
      views: data.views || 0,
      likes: data.likes || 0,
      commentsCount: data.commentsCount || 0,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()) : []),
      status: data.status || 'published',
      scheduledAt: data.scheduledAt || null,
      audioUrl: data.audioUrl || '',
      gallery: data.gallery || [],
      source: data.source || '',
      imageCredit: data.imageCredit || '',
    } as Article;
  } catch (error) {
    console.error(`Error parsing article at ${path}:`, error);
    return null;
  }
}).filter((a): a is Article => a !== null).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const MOCK_AUTHORS: Author[] = [
  {
    id: '1',
    name: 'Koffi Benjamin',
    role: 'Rédacteur en Chef',
    bio: 'Passionné par les dynamiques socio-politiques en Afrique de l\'Ouest, Koffi couvre l\'actualité régionale depuis plus de 15 ans. Basé à Abidjan, il s\'attache à décrypter les enjeux complexes de la sous-région avec une approche analytique et rigoureuse.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&auto=format&fit=crop',
    socials: {
      twitter: 'https://twitter.com/koffiben',
      linkedin: 'https://linkedin.com/in/koffibenjamin',
      mail: 'koffi@akwabainfo.com'
    },
    specialties: ['Politique', 'Économie', 'Afrique']
  },
  {
    id: '2',
    name: 'Marie-Noëlle Traoré',
    role: 'Grand Reporter',
    bio: 'Journaliste d\'investigation spécialisée dans les questions environnementales et technologiques. Marie-Noëlle parcourt le continent pour mettre en lumière les innovations locales et les défis du changement climatique.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=300&auto=format&fit=crop',
    socials: {
      twitter: 'https://twitter.com/mn_traore',
      instagram: 'https://instagram.com/mn_traore_pics',
      mail: 'marie.noelle@akwabainfo.com'
    },
    specialties: ['Tech', 'Science', 'Écologie']
  },
  {
    id: '3',
    name: 'Jean-Luc Kouadio',
    role: 'Chroniqueur Sportif',
    bio: 'Ancien athlète devenu voix incontournable du sport ivoirien. Jean-Luc analyse les performances, les transferts et l\'économie du sport avec une passion communicative et un regard expert sur le football africain.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&h=300&auto=format&fit=crop',
    socials: {
      twitter: 'https://twitter.com/jlk_sport',
      facebook: 'https://facebook.com/jlk.kouadio',
      mail: 'jean-luc@akwabainfo.com'
    },
    specialties: ['Sport', 'Culture', 'Santé']
  },
  {
    id: '4',
    name: 'Awa Diabaté',
    role: 'Analyste Économique',
    bio: 'Spécialiste des marchés émergents et de l\'intégration régionale. Awa apporte une lecture claire des enjeux de la ZLECAf et des transformations structurelles des économies africaines.',
    image: 'https://images.unsplash.com/photo-1567532939604-b6c5b0ad2e01?q=80&w=300&h=300&auto=format&fit=crop',
    socials: {
      linkedin: 'https://linkedin.com/in/awa-diabate',
      twitter: 'https://twitter.com/awa_economie',
      mail: 'awa@akwabainfo.com'
    },
    specialties: ['Économie', 'Politique', 'Monde']
  }
];

export const MOCK_EVENTS: Event[] = Object.entries(eventFiles).map(([path, content], index) => {
  try {
    const { data, content: body } = matter((content as any).default || content);
    const slug = path.split('/').pop()?.replace('.md', '') || `event-${index}`;
    
    return {
      id: String(index + 1),
      slug,
      title: data.title || 'Sans titre',
      date: data.date || new Date().toISOString(),
      location: data.location || 'Lieu à préciser',
      category: data.category || 'Événement',
      image: data.image || undefined,
      video: data.video || undefined,
      excerpt: data.excerpt || '',
      content: body || '',
      status: data.status || 'published',
      scheduledAt: data.scheduledAt || null,
      gallery: data.gallery || [],
      imageCredit: data.imageCredit || '',
    } as Event;
  } catch (error) {
    console.error(`Error parsing event at ${path}:`, error);
    return null;
  }
}).filter((e): e is Event => e !== null).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
