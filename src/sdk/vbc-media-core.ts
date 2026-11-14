import type { MediaAsset, CatalogManifest, SearchStats, MediaType } from './types';

const STORAGE_RECENTS_KEY = 'vbc_media_recents_v1';
const MAX_RECENTS = 24;
const MAX_QUERY_CACHE = 40;

export const BUILTIN_WORKPLACE_EMOJIS: MediaAsset[] = [
  // Approval & Gestures
  { id: 'emoji_1f44d', title: 'Thumbs Up', type: 'emoji', tags: ['thumbs', 'up', 'approve', 'agree', 'lgtm', 'ok', 'yes', 'good'], categories: ['Approval', 'Workplace'], thumbUrl: '👍', fullUrl: '👍', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f44d' },
  { id: 'emoji_1f44e', title: 'Thumbs Down', type: 'emoji', tags: ['thumbs', 'down', 'disapprove', 'no', 'disagree'], categories: ['Approval'], thumbUrl: '👎', fullUrl: '👎', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f44e' },
  { id: 'emoji_1f44f', title: 'Clapping Hands', type: 'emoji', tags: ['clap', 'applause', 'bravo', 'kudos', 'congrats', 'cheer'], categories: ['Reactions', 'Celebration'], thumbUrl: '👏', fullUrl: '👏', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f44f' },
  { id: 'emoji_1f64f', title: 'Folded Hands', type: 'emoji', tags: ['pray', 'thank', 'thanks', 'grateful', 'please', 'respect', 'namaste'], categories: ['Reactions', 'Workplace'], thumbUrl: '🙏', fullUrl: '🙏', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f64f' },
  { id: 'emoji_1f91d', title: 'Handshake', type: 'emoji', tags: ['handshake', 'deal', 'agreement', 'partner', 'welcome'], categories: ['Approval', 'Workplace'], thumbUrl: '🤝', fullUrl: '🤝', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f91d' },
  { id: 'emoji_1f44c', title: 'OK Hand', type: 'emoji', tags: ['ok', 'perfect', 'fine', 'sure', 'approved'], categories: ['Approval'], thumbUrl: '👌', fullUrl: '👌', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f44c' },
  { id: 'emoji_2705', title: 'Check Mark', type: 'emoji', tags: ['check', 'done', 'approved', 'pass', 'complete', 'verified', 'lgtm'], categories: ['Approval', 'Workplace'], thumbUrl: '✅', fullUrl: '✅', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_2705' },
  { id: 'emoji_2714', title: 'Heavy Check Mark', type: 'emoji', tags: ['check', 'done', 'yes', 'verified', 'ok'], categories: ['Approval'], thumbUrl: '✔', fullUrl: '✔', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_2714' },
  { id: 'emoji_274c', title: 'Cross Mark', type: 'emoji', tags: ['cross', 'x', 'cancel', 'reject', 'no', 'fail'], categories: ['Approval'], thumbUrl: '❌', fullUrl: '❌', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_274c' },
  { id: 'emoji_1fae1', title: 'Saluting Face', type: 'emoji', tags: ['salute', 'respect', 'roger', 'understood', 'aye'], categories: ['Workplace', 'Approval'], thumbUrl: '🫡', fullUrl: '🫡', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1fae1' },
  { id: 'emoji_1f4aa', title: 'Flexed Biceps', type: 'emoji', tags: ['muscle', 'strong', 'power', 'teamwork', 'hustle', 'energy'], categories: ['Workplace'], thumbUrl: '💪', fullUrl: '💪', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4aa' },

  // Celebration & Success
  { id: 'emoji_1f389', title: 'Party Popper', type: 'emoji', tags: ['party', 'popper', 'celebrate', 'congrats', 'tada', 'cheers', 'release'], categories: ['Celebration'], thumbUrl: '🎉', fullUrl: '🎉', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f389' },
  { id: 'emoji_1f680', title: 'Rocket', type: 'emoji', tags: ['rocket', 'launch', 'deploy', 'ship', 'speed', 'release', 'fast', 'production'], categories: ['Workplace', 'Celebration'], thumbUrl: '🚀', fullUrl: '🚀', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f680' },
  { id: 'emoji_1f525', title: 'Fire', type: 'emoji', tags: ['fire', 'lit', 'awesome', 'hot', 'epic', 'trending', 'crushing_it'], categories: ['Reactions', 'Celebration'], thumbUrl: '🔥', fullUrl: '🔥', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f525' },
  { id: 'emoji_1f3c6', title: 'Trophy', type: 'emoji', tags: ['trophy', 'win', 'champion', 'first', 'award', 'victory', 'best'], categories: ['Celebration'], thumbUrl: '🏆', fullUrl: '🏆', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f3c6' },
  { id: 'emoji_1f947', title: 'First Place Medal', type: 'emoji', tags: ['medal', 'gold', 'winner', 'number_one', 'first'], categories: ['Celebration'], thumbUrl: '🥇', fullUrl: '🥇', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f947' },
  { id: 'emoji_2b50', title: 'Star', type: 'emoji', tags: ['star', 'favorite', 'great_job', 'highlight', 'super'], categories: ['Celebration'], thumbUrl: '⭐', fullUrl: '⭐', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_2b50' },
  { id: 'emoji_2728', title: 'Sparkles', type: 'emoji', tags: ['sparkles', 'magic', 'clean', 'fresh', 'new', 'shine'], categories: ['Celebration'], thumbUrl: '✨', fullUrl: '✨', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_2728' },
  { id: 'emoji_1f4af', title: '100 Points', type: 'emoji', tags: ['100', 'hundred', 'perfect', 'score', 'accurate', 'agree'], categories: ['Approval', 'Celebration'], thumbUrl: '💯', fullUrl: '💯', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4af' },
  { id: 'emoji_1f37e', title: 'Bottle with Popping Cork', type: 'emoji', tags: ['champagne', 'drink', 'celebration', 'cheers', 'milestone'], categories: ['Celebration'], thumbUrl: '🍾', fullUrl: '🍾', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f37e' },

  // Workplace Focus & Productivity
  { id: 'emoji_2615', title: 'Hot Beverage', type: 'emoji', tags: ['coffee', 'tea', 'break', 'morning', 'fuel', 'caffeine'], categories: ['Workplace'], thumbUrl: '☕', fullUrl: '☕', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_2615' },
  { id: 'emoji_1f4a1', title: 'Light Bulb', type: 'emoji', tags: ['light_bulb', 'idea', 'insight', 'smart', 'eureka', 'solution'], categories: ['Workplace'], thumbUrl: '💡', fullUrl: '💡', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4a1' },
  { id: 'emoji_1f4bb', title: 'Laptop', type: 'emoji', tags: ['laptop', 'computer', 'coding', 'developer', 'work', 'code'], categories: ['Workplace'], thumbUrl: '💻', fullUrl: '💻', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4bb' },
  { id: 'emoji_1f4c8', title: 'Chart Increasing', type: 'emoji', tags: ['chart', 'graph', 'growth', 'metrics', 'up', 'kpi', 'revenue'], categories: ['Workplace'], thumbUrl: '📈', fullUrl: '📈', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4c8' },
  { id: 'emoji_1f4cb', title: 'Clipboard', type: 'emoji', tags: ['clipboard', 'tasks', 'todo', 'plan', 'audit', 'notes'], categories: ['Workplace'], thumbUrl: '📋', fullUrl: '📋', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4cb' },
  { id: 'emoji_1f512', title: 'Locked', type: 'emoji', tags: ['lock', 'security', 'secure', 'privacy', 'auth', 'safeguard'], categories: ['Workplace'], thumbUrl: '🔒', fullUrl: '🔒', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f512' },
  { id: 'emoji_1f6e1', title: 'Shield', type: 'emoji', tags: ['shield', 'security', 'protection', 'safe', 'defense', 'mam'], categories: ['Workplace'], thumbUrl: '🛡️', fullUrl: '🛡️', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f6e1' },
  { id: 'emoji_26a1', title: 'High Voltage', type: 'emoji', tags: ['lightning', 'fast', 'quick', 'electric', 'urgent', 'speed'], categories: ['Workplace'], thumbUrl: '⚡', fullUrl: '⚡', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_26a1' },
  { id: 'emoji_1f3af', title: 'Direct Hit', type: 'emoji', tags: ['target', 'goal', 'bullseye', 'focus', 'objective', 'okr'], categories: ['Workplace'], thumbUrl: '🎯', fullUrl: '🎯', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f3af' },
  { id: 'emoji_23f1', title: 'Stopwatch', type: 'emoji', tags: ['stopwatch', 'timer', 'latency', 'speed', 'sla', 'subsecond'], categories: ['Workplace'], thumbUrl: '⏱️', fullUrl: '⏱️', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_23f1' },
  { id: 'emoji_1f440', title: 'Eyes', type: 'emoji', tags: ['eyes', 'looking', 'review', 'pr', 'watching', 'attention', 'investigating'], categories: ['Workplace', 'Reactions'], thumbUrl: '👀', fullUrl: '👀', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f440' },
  { id: 'emoji_1f50d', title: 'Magnifying Glass', type: 'emoji', tags: ['search', 'inspect', 'find', 'audit', 'investigate', 'lookup'], categories: ['Workplace'], thumbUrl: '🔍', fullUrl: '🔍', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f50d' },

  // Expressions & Reactions
  { id: 'emoji_1f600', title: 'Grinning Face', type: 'emoji', tags: ['smile', 'happy', 'grin', 'positive', 'glad'], categories: ['Reactions'], thumbUrl: '😀', fullUrl: '😀', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f600' },
  { id: 'emoji_1f602', title: 'Tears of Joy', type: 'emoji', tags: ['laugh', 'lol', 'haha', 'funny', 'joy', 'humor'], categories: ['Reactions'], thumbUrl: '😂', fullUrl: '😂', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f602' },
  { id: 'emoji_1f923', title: 'Rolling on the Floor Laughing', type: 'emoji', tags: ['rofl', 'laugh', 'lmao', 'hilarious'], categories: ['Reactions'], thumbUrl: '🤣', fullUrl: '🤣', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f923' },
  { id: 'emoji_1f60e', title: 'Sunglasses Face', type: 'emoji', tags: ['cool', 'smooth', 'boss', 'chill', 'easy'], categories: ['Reactions'], thumbUrl: '😎', fullUrl: '😎', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f60e' },
  { id: 'emoji_1f914', title: 'Thinking Face', type: 'emoji', tags: ['think', 'ponder', 'hmm', 'curious', 'wondering', 'evaluating'], categories: ['Reactions'], thumbUrl: '🤔', fullUrl: '🤔', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f914' },
  { id: 'emoji_1f92f', title: 'Exploding Head', type: 'emoji', tags: ['mindblown', 'wow', 'shock', 'amazing', 'insane', 'blown_away'], categories: ['Reactions'], thumbUrl: '🤯', fullUrl: '🤯', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f92f' },
  { id: 'emoji_1f609', title: 'Winking Face', type: 'emoji', tags: ['wink', 'humor', 'friendly', 'joke'], categories: ['Reactions'], thumbUrl: '😉', fullUrl: '😉', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f609' },
  { id: 'emoji_1f917', title: 'Hugging Face', type: 'emoji', tags: ['hug', 'warm', 'care', 'support', 'team'], categories: ['Reactions'], thumbUrl: '🤗', fullUrl: '🤗', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f917' },
  { id: 'emoji_1f607', title: 'Smiling Face with Halo', type: 'emoji', tags: ['angel', 'innocent', 'good', 'kind'], categories: ['Reactions'], thumbUrl: '😇', fullUrl: '😇', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f607' },
  { id: 'emoji_1f62e_200d_1f4a8', title: 'Face Exhaling', type: 'emoji', tags: ['sigh', 'relief', 'whew', 'tired', 'phew'], categories: ['Reactions'], thumbUrl: '😮‍💨', fullUrl: '😮‍💨', byteSize: 8, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f62e_exhale' },
  { id: 'emoji_1f973', title: 'Partying Face', type: 'emoji', tags: ['party', 'celebrate', 'horn', 'birthday', 'cheer'], categories: ['Celebration', 'Reactions'], thumbUrl: '🥳', fullUrl: '🥳', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f973' },
  { id: 'emoji_1f605', title: 'Grinning Face with Sweat', type: 'emoji', tags: ['sweat', 'relief', 'close_call', 'whew'], categories: ['Reactions'], thumbUrl: '😅', fullUrl: '😅', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f605' },

  // Hearts & Appreciation
  { id: 'emoji_2764', title: 'Red Heart', type: 'emoji', tags: ['heart', 'love', 'thanks', 'appreciation', 'kudos'], categories: ['Reactions'], thumbUrl: '❤️', fullUrl: '❤️', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_2764' },
  { id: 'emoji_1f9e1', title: 'Orange Heart', type: 'emoji', tags: ['heart', 'orange', 'warm', 'friendly'], categories: ['Reactions'], thumbUrl: '🧡', fullUrl: '🧡', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f9e1' },
  { id: 'emoji_1f499', title: 'Blue Heart', type: 'emoji', tags: ['heart', 'blue', 'loyalty', 'support', 'vonage'], categories: ['Reactions'], thumbUrl: '💙', fullUrl: '💙', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f499' },
  { id: 'emoji_1f49a', title: 'Green Heart', type: 'emoji', tags: ['heart', 'green', 'growth', 'nature'], categories: ['Reactions'], thumbUrl: '💚', fullUrl: '💚', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f49a' },
  { id: 'emoji_1f49c', title: 'Purple Heart', type: 'emoji', tags: ['heart', 'purple', 'honor', 'duty'], categories: ['Reactions'], thumbUrl: '💜', fullUrl: '💜', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f49c' },

  // Communication & Greetings
  { id: 'emoji_1f44b', title: 'Waving Hand', type: 'emoji', tags: ['wave', 'hello', 'hi', 'welcome', 'bye', 'greetings'], categories: ['Workplace', 'Communication'], thumbUrl: '👋', fullUrl: '👋', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f44b' },
  { id: 'emoji_270b', title: 'Raised Hand', type: 'emoji', tags: ['hand', 'question', 'raise', 'wait', 'volunteer'], categories: ['Workplace', 'Communication'], thumbUrl: '✋', fullUrl: '✋', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_270b' },
  { id: 'emoji_270c', title: 'Victory Hand', type: 'emoji', tags: ['peace', 'victory', 'two', 'cool'], categories: ['Communication'], thumbUrl: '✌️', fullUrl: '✌️', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_270c' },
  { id: 'emoji_1f91e', title: 'Crossed Fingers', type: 'emoji', tags: ['luck', 'hope', 'fingers_crossed', 'wish', 'testing'], categories: ['Workplace', 'Reactions'], thumbUrl: '🤞', fullUrl: '🤞', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f91e' },
  { id: 'emoji_1f4ac', title: 'Speech Balloon', type: 'emoji', tags: ['chat', 'message', 'comment', 'thread', 'talk'], categories: ['Communication'], thumbUrl: '💬', fullUrl: '💬', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4ac' },
  { id: 'emoji_1f4e3', title: 'Megaphone', type: 'emoji', tags: ['announcement', 'broadcast', 'shout', 'notice', 'news'], categories: ['Communication'], thumbUrl: '📣', fullUrl: '📣', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4e3' },
  { id: 'emoji_1f4e2', title: 'Loudspeaker', type: 'emoji', tags: ['speaker', 'audio', 'alert', 'call', 'voip'], categories: ['Communication'], thumbUrl: '📢', fullUrl: '📢', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4e2' },
  { id: 'emoji_260e', title: 'Telephone', type: 'emoji', tags: ['phone', 'call', 'vonage', 'vbc', 'voice', 'telephony'], categories: ['Communication', 'Workplace'], thumbUrl: '☎️', fullUrl: '☎️', byteSize: 3, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_260e' },
  { id: 'emoji_1f4f1', title: 'Mobile Phone', type: 'emoji', tags: ['mobile', 'smartphone', 'android', 'ios', 'sms', 'mms'], categories: ['Communication', 'Workplace'], thumbUrl: '📱', fullUrl: '📱', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4f1' },
  { id: 'emoji_1f4e8', title: 'Incoming Envelope', type: 'emoji', tags: ['mail', 'email', 'inbox', 'message'], categories: ['Communication'], thumbUrl: '📨', fullUrl: '📨', byteSize: 4, width: 64, height: 64, mimeType: 'text/emoji', mmsCompliant: true, license: 'Unicode-DFS', sha256: 'unicode_1f4e8' }
];

export class VbcMediaCore {
  private baseUrl: string;
  private catalogItems: MediaAsset[] = [];
  private allItems: MediaAsset[] = [];
  private isLoaded: boolean = false;
  private initPromise: Promise<void> | null = null;

  // Performance optimizations: Query LRU Cache & Inverted Keyword Index
  private queryCache: Map<string, { items: MediaAsset[]; stats: SearchStats }> = new Map();
  private invertedTagIndex: Map<string, Set<MediaAsset>> = new Map();

  constructor(baseUrl: string = '/cdn/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  public async initialize(): Promise<void> {
    if (this.isLoaded) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const url = `${this.baseUrl}/catalog.json`;
        const res = await fetch(url);
        if (res.ok) {
          const manifest: CatalogManifest = await res.json();
          this.catalogItems = manifest.items || [];
        } else {
          console.warn(`[VbcMediaCore] Failed to fetch catalog at ${url}, status: ${res.status}`);
        }
      } catch (err) {
        console.warn('[VbcMediaCore] Network error loading catalog:', err);
      } finally {
        this.allItems = [...this.catalogItems, ...BUILTIN_WORKPLACE_EMOJIS];
        this.buildInvertedIndex();
        this.isLoaded = true;
      }
    })();

    return this.initPromise;
  }

  private buildInvertedIndex(): void {
    this.invertedTagIndex.clear();
    for (const item of this.allItems) {
      for (const tag of item.tags) {
        const lowerTag = tag.toLowerCase();
        if (!this.invertedTagIndex.has(lowerTag)) {
          this.invertedTagIndex.set(lowerTag, new Set());
        }
        this.invertedTagIndex.get(lowerTag)!.add(item);
      }
      for (const cat of item.categories) {
        const lowerCat = cat.toLowerCase();
        if (!this.invertedTagIndex.has(lowerCat)) {
          this.invertedTagIndex.set(lowerCat, new Set());
        }
        this.invertedTagIndex.get(lowerCat)!.add(item);
      }
    }
  }

  public getLoadedItems(): MediaAsset[] {
    return this.allItems;
  }

  public search(
    query: string = '',
    typeFilter: MediaType | 'all' = 'all',
    categoryFilter: string = 'all'
  ): { items: MediaAsset[]; stats: SearchStats } {
    const cleanQ = query.trim().toLowerCase();
    const cacheKey = `${cleanQ}__${typeFilter}__${categoryFilter.toLowerCase()}`;

    // Return memoized result if cached
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey)!;
    }

    const startTime = performance.now();
    let candidatePool = this.allItems;

    // Filter by MediaType
    if (typeFilter !== 'all') {
      candidatePool = candidatePool.filter(item => item.type === typeFilter);
    }

    // Filter by Category
    if (categoryFilter !== 'all') {
      const lowerCat = categoryFilter.toLowerCase();
      candidatePool = candidatePool.filter(item =>
        item.categories.some(c => c.toLowerCase() === lowerCat)
      );
    }

    if (!cleanQ) {
      const endTime = performance.now();
      const res = {
        items: candidatePool,
        stats: {
          query: '',
          latencyMs: parseFloat(Math.max(0.01, endTime - startTime).toFixed(2)),
          resultCount: candidatePool.length,
          totalScanned: candidatePool.length,
          externalNetworkCalls: 0 as const
        }
      };
      this.cacheResult(cacheKey, res);
      return res;
    }

    // Scored evaluation
    const scored: { item: MediaAsset; score: number }[] = [];

    for (const item of candidatePool) {
      let score = 0;
      const lowerTitle = item.title.toLowerCase();

      // Title exact / prefix / substring match
      if (lowerTitle === cleanQ) score += 120;
      else if (lowerTitle.startsWith(cleanQ)) score += 80;
      else if (lowerTitle.includes(cleanQ)) score += 40;

      // Tag matching
      for (let i = 0; i < item.tags.length; i++) {
        const lowerTag = item.tags[i].toLowerCase();
        if (lowerTag === cleanQ) {
          score += 100;
          break;
        } else if (lowerTag.startsWith(cleanQ)) {
          score = Math.max(score, 75);
        } else if (lowerTag.includes(cleanQ)) {
          score = Math.max(score, 45);
        }
      }

      // Category matching
      for (let i = 0; i < item.categories.length; i++) {
        const lowerCat = item.categories[i].toLowerCase();
        if (lowerCat === cleanQ) {
          score += 60;
          break;
        } else if (lowerCat.includes(cleanQ)) {
          score = Math.max(score, 30);
        }
      }

      if (score > 0) {
        scored.push({ item, score });
      }
    }

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    const results = scored.map(s => s.item);

    const endTime = performance.now();
    const finalResult = {
      items: results,
      stats: {
        query: cleanQ,
        latencyMs: parseFloat(Math.max(0.02, endTime - startTime).toFixed(2)),
        resultCount: results.length,
        totalScanned: candidatePool.length,
        externalNetworkCalls: 0 as const
      }
    };

    this.cacheResult(cacheKey, finalResult);
    return finalResult;
  }

  private cacheResult(key: string, result: { items: MediaAsset[]; stats: SearchStats }): void {
    if (this.queryCache.size >= MAX_QUERY_CACHE) {
      const firstKey = this.queryCache.keys().next().value;
      if (firstKey) this.queryCache.delete(firstKey);
    }
    this.queryCache.set(key, result);
  }

  public recordRecent(asset: MediaAsset): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const recents = this.getRecents();
      const filtered = recents.filter(item => item.id !== asset.id);
      const updated = [asset, ...filtered].slice(0, MAX_RECENTS);
      window.localStorage.setItem(STORAGE_RECENTS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota or private browsing exceptions
    }
  }

  public getRecents(): MediaAsset[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_RECENTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  }

  public getCategories(): string[] {
    const cats = new Set<string>(['All', 'Workplace', 'Reactions', 'Celebration', 'Approval', 'Communication']);
    for (const item of this.allItems) {
      for (const cat of item.categories) {
        cats.add(cat);
      }
    }
    return Array.from(cats);
  }
}
