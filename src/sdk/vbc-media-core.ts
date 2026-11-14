import type { MediaAsset, CatalogManifest, SearchStats, MediaType } from './types';

const STORAGE_RECENTS_KEY = 'vbc_media_recents_v1';
const MAX_RECENTS = 24;

// Workplace synonym and intent expansion rules
const WORKPLACE_SYNONYM_RULES = [
  {
    regex: /thumbs|check|ok|100|salute/i,
    tags: ["lgtm", "approve", "approved", "yes", "agree", "ship it", "done", "ack", "good", "correct"],
    category: "Approval"
  },
  {
    regex: /clap|party|trophy|star|sparkles|crown/i,
    tags: ["congrats", "congratulations", "bravo", "kudos", "celebrate", "win", "awesome", "great job", "woohoo", "milestone"],
    category: "Celebration"
  },
  {
    regex: /rocket|fire|zap|muscle|light_bulb|bulb/i,
    tags: ["launch", "deploy", "deployed", "ship", "lit", "fast", "hot", "hype", "strong", "idea", "smart"],
    category: "Launch & Hype"
  },
  {
    regex: /smile|laugh|joy|rofl|grin|wink/i,
    tags: ["lol", "haha", "funny", "happy", "lmao", "rofl", "nice", "heehaw"],
    category: "Reactions"
  },
  {
    regex: /pray|heart|wave|hug|handshake/i,
    tags: ["thanks", "thank you", "ty", "appreciate", "please", "welcome", "hello", "hi", "hey", "teamwork"],
    category: "Gratitude"
  },
  {
    regex: /think|eyes|mind|coffee|sleep|clock|alarm/i,
    tags: ["hmm", "looking", "review", "reviewing", "pr", "checking", "wait", "whoa", "wow", "caffeine", "morning", "brb", "busy"],
    category: "Work & Coffee"
  }
];

function normalizeTags(rawTags: string[]): string[] {
  const result = new Set<string>();
  for (const raw of rawTags) {
    if (!raw) continue;
    const clean = raw.replace(/:/g, '').trim().toLowerCase();
    if (!clean) continue;
    result.add(clean);
    if (clean.includes('_') || clean.includes('-')) {
      const spaceForm = clean.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
      result.add(spaceForm);
      for (const word of spaceForm.split(' ')) {
        if (word) result.add(word);
      }
    }
  }
  return Array.from(result);
}

function enrichEmojiMetadata(title: string, baseTags: string[], initialCats: string[]): { tags: string[]; categories: string[]; searchText: string } {
  const normTags = normalizeTags(baseTags);
  const tagsSet = new Set(normTags);
  const catsSet = new Set(initialCats);
  catsSet.add('Workplace');

  const contextText = [title, ...normTags].join(' ');

  for (const rule of WORKPLACE_SYNONYM_RULES) {
    if (rule.regex.test(contextText)) {
      for (const t of rule.tags) {
        tagsSet.add(t);
      }
      catsSet.add(rule.category);
    }
  }

  const tags = Array.from(tagsSet);
  const categories = Array.from(catsSet);
  const searchText = [title, ...tags, ...categories, 'emoji'].join(' ').toLowerCase();

  return { tags, categories, searchText };
}

function createEmoji(
  id: string,
  title: string,
  char: string,
  rawTags: string[],
  rawCats: string[]
): MediaAsset {
  const { tags, categories, searchText } = enrichEmojiMetadata(title, rawTags, rawCats);
  return {
    id: `emoji_${id}`,
    title,
    type: 'emoji',
    tags,
    categories,
    searchText,
    thumbUrl: char,
    fullUrl: char,
    byteSize: 4,
    width: 64,
    height: 64,
    mimeType: 'text/emoji',
    mmsCompliant: true,
    license: 'Unicode-DFS',
    sha256: `unicode_${id}`
  };
}

// 85+ Curated Enterprise Workplace Unicode Emojis
export const BUILTIN_WORKPLACE_EMOJIS: MediaAsset[] = [
  // Approval & Gestures
  createEmoji('1f44d', 'Thumbs Up', '👍', ['thumbs', 'up', 'approve', 'agree', 'lgtm', 'ok', 'yes', 'good'], ['Approval']),
  createEmoji('1f44e', 'Thumbs Down', '👎', ['thumbs', 'down', 'disapprove', 'no', 'disagree', 'reject'], ['Approval']),
  createEmoji('1f44f', 'Clapping Hands', '👏', ['clap', 'applause', 'bravo', 'kudos', 'congrats', 'cheer'], ['Celebration']),
  createEmoji('1f64f', 'Folded Hands', '🙏', ['pray', 'thank', 'thanks', 'grateful', 'please', 'respect'], ['Gratitude']),
  createEmoji('1f91d', 'Handshake', '🤝', ['handshake', 'deal', 'agreement', 'partner', 'welcome'], ['Gratitude', 'Approval']),
  createEmoji('1f44c', 'OK Hand', '👌', ['ok', 'perfect', 'fine', 'sure', 'approved'], ['Approval']),
  createEmoji('2705', 'Check Mark', '✅', ['check', 'done', 'approved', 'pass', 'complete', 'verified', 'lgtm'], ['Approval']),
  createEmoji('2714', 'Heavy Check Mark', '✔', ['check', 'done', 'yes', 'verified', 'ok'], ['Approval']),
  createEmoji('274c', 'Cross Mark', '❌', ['cross', 'x', 'cancel', 'reject', 'no', 'fail'], ['Approval']),
  createEmoji('1fae1', 'Saluting Face', '🫡', ['salute', 'respect', 'roger', 'understood', 'aye', 'on it'], ['Approval']),
  createEmoji('1f4aa', 'Flexed Biceps', '💪', ['muscle', 'strong', 'power', 'teamwork', 'hustle', 'energy'], ['Launch & Hype']),
  createEmoji('1f91e', 'Crossed Fingers', '🤞', ['luck', 'hope', 'fingers_crossed', 'wish', 'testing'], ['Reactions']),
  createEmoji('1f44b', 'Waving Hand', '👋', ['wave', 'hello', 'hi', 'welcome', 'bye', 'greetings'], ['Gratitude']),
  createEmoji('270b', 'Raised Hand', '✋', ['hand', 'question', 'raise', 'wait', 'volunteer'], ['Work & Coffee']),
  createEmoji('270c', 'Victory Hand', '✌️', ['peace', 'victory', 'two', 'cool'], ['Celebration']),
  createEmoji('1f918', 'Sign of the Horns', '🤘', ['rock', 'metal', 'cool', 'awesome', 'energy'], ['Launch & Hype']),
  createEmoji('1f90f', 'Pinching Hand', '🤏', ['small', 'little', 'tiny', 'almost', 'close'], ['Reactions']),

  // Celebration & Success
  createEmoji('1f389', 'Party Popper', '🎉', ['party', 'popper', 'celebrate', 'congrats', 'tada', 'cheers', 'release'], ['Celebration']),
  createEmoji('1f680', 'Rocket', '🚀', ['rocket', 'launch', 'deploy', 'ship', 'speed', 'release', 'fast', 'production'], ['Launch & Hype', 'Celebration']),
  createEmoji('1f525', 'Fire', '🔥', ['fire', 'lit', 'awesome', 'hot', 'epic', 'trending', 'crushing_it'], ['Launch & Hype', 'Celebration']),
  createEmoji('1f3c6', 'Trophy', '🏆', ['trophy', 'win', 'champion', 'first', 'award', 'victory', 'best'], ['Celebration']),
  createEmoji('1f947', 'First Place Medal', '🥇', ['medal', 'gold', 'winner', 'number_one', 'first'], ['Celebration']),
  createEmoji('1f948', 'Second Place Medal', '🥈', ['medal', 'silver', 'second', 'runner_up'], ['Celebration']),
  createEmoji('1f949', 'Third Place Medal', '🥉', ['medal', 'bronze', 'third'], ['Celebration']),
  createEmoji('2b50', 'Star', '⭐', ['star', 'favorite', 'great_job', 'highlight', 'super'], ['Celebration']),
  createEmoji('1f31f', 'Glowing Star', '🌟', ['star', 'shine', 'milestone', 'achievement', 'superstar'], ['Celebration']),
  createEmoji('2728', 'Sparkles', '✨', ['sparkles', 'magic', 'clean', 'fresh', 'new', 'shine'], ['Celebration']),
  createEmoji('1f4af', '100 Points', '💯', ['100', 'hundred', 'perfect', 'score', 'accurate', 'agree'], ['Approval', 'Celebration']),
  createEmoji('1f37e', 'Bottle with Popping Cork', '🍾', ['champagne', 'drink', 'celebration', 'cheers', 'milestone'], ['Celebration']),
  createEmoji('1f37b', 'Clinking Beer Mugs', '🍻', ['beer', 'cheers', 'toast', 'celebrate', 'drinks', 'friday'], ['Celebration']),
  createEmoji('1f942', 'Clinking Glasses', '🥂', ['toast', 'celebrate', 'cheers', 'milestone'], ['Celebration']),
  createEmoji('1f451', 'Crown', '👑', ['crown', 'king', 'queen', 'leader', 'champion', 'best'], ['Celebration']),

  // Workplace Focus, Tech & Productivity
  createEmoji('2615', 'Hot Beverage', '☕', ['coffee', 'tea', 'break', 'morning', 'fuel', 'caffeine'], ['Work & Coffee']),
  createEmoji('1f4a1', 'Light Bulb', '💡', ['light_bulb', 'idea', 'insight', 'smart', 'eureka', 'solution'], ['Launch & Hype']),
  createEmoji('1f4bb', 'Laptop', '💻', ['laptop', 'computer', 'coding', 'developer', 'work', 'code'], ['Work & Coffee']),
  createEmoji('1f5a5', 'Desktop Computer', '🖥️', ['desktop', 'monitor', 'screen', 'workstation'], ['Work & Coffee']),
  createEmoji('1f4c8', 'Chart Increasing', '📈', ['chart', 'graph', 'growth', 'metrics', 'up', 'kpi', 'revenue'], ['Work & Coffee']),
  createEmoji('1f4cb', 'Clipboard', '📋', ['clipboard', 'tasks', 'todo', 'plan', 'audit', 'notes'], ['Work & Coffee']),
  createEmoji('1f4d1', 'Bookmark Tabs', '📑', ['docs', 'tabs', 'specs', 'documentation', 'records'], ['Work & Coffee']),
  createEmoji('1f4c4', 'File Page', '📄', ['doc', 'file', 'document', 'page', 'rfc', 'adr'], ['Work & Coffee']),
  createEmoji('1f512', 'Locked', '🔒', ['lock', 'security', 'secure', 'privacy', 'auth', 'safeguard'], ['Work & Coffee']),
  createEmoji('1f6e1', 'Shield', '🛡️', ['shield', 'security', 'protection', 'safe', 'defense', 'mam'], ['Work & Coffee']),
  createEmoji('26a1', 'High Voltage', '⚡', ['lightning', 'fast', 'quick', 'electric', 'urgent', 'speed'], ['Launch & Hype']),
  createEmoji('1f3af', 'Direct Hit', '🎯', ['target', 'goal', 'bullseye', 'focus', 'objective', 'okr'], ['Work & Coffee']),
  createEmoji('23f1', 'Stopwatch', '⏱️', ['stopwatch', 'timer', 'latency', 'speed', 'sla', 'subsecond'], ['Work & Coffee']),
  createEmoji('1f440', 'Eyes', '👀', ['eyes', 'looking', 'review', 'pr', 'watching', 'attention', 'investigating'], ['Work & Coffee', 'Approval']),
  createEmoji('1f50d', 'Magnifying Glass', '🔍', ['search', 'inspect', 'find', 'audit', 'investigate', 'lookup'], ['Work & Coffee']),
  createEmoji('1f9e0', 'Brain', '🧠', ['brain', 'smart', 'think', 'intelligence', 'logic'], ['Work & Coffee']),
  createEmoji('2699', 'Gear', '⚙️', ['gear', 'settings', 'config', 'engine', 'system'], ['Work & Coffee']),
  createEmoji('1f511', 'Key', '🔑', ['key', 'access', 'auth', 'solution', 'critical'], ['Work & Coffee']),
  createEmoji('1f4e6', 'Package', '📦', ['package', 'npm', 'build', 'release', 'deliverable'], ['Launch & Hype']),
  createEmoji('1f6a7', 'Construction', '🚧', ['wip', 'progress', 'building', 'under_construction'], ['Work & Coffee']),
  createEmoji('1f6a8', 'Police Siren', '🚨', ['alert', 'incident', 'urgent', 'oncall', 'pager'], ['Work & Coffee']),

  // Reactions & Expressions
  createEmoji('1f600', 'Grinning Face', '😀', ['smile', 'happy', 'grin', 'positive', 'glad'], ['Reactions']),
  createEmoji('1f602', 'Tears of Joy', '😂', ['laugh', 'lol', 'haha', 'funny', 'joy', 'humor'], ['Reactions']),
  createEmoji('1f923', 'Rolling on the Floor Laughing', '🤣', ['rofl', 'laugh', 'lmao', 'hilarious'], ['Reactions']),
  createEmoji('1f60e', 'Sunglasses Face', '😎', ['cool', 'smooth', 'boss', 'chill', 'easy'], ['Reactions']),
  createEmoji('1f914', 'Thinking Face', '🤔', ['think', 'ponder', 'hmm', 'curious', 'wondering', 'evaluating'], ['Work & Coffee', 'Reactions']),
  createEmoji('1f92f', 'Exploding Head', '🤯', ['mindblown', 'wow', 'shock', 'amazing', 'insane', 'blown_away'], ['Reactions']),
  createEmoji('1f609', 'Winking Face', '😉', ['wink', 'humor', 'friendly', 'joke'], ['Reactions']),
  createEmoji('1f917', 'Hugging Face', '🤗', ['hug', 'warm', 'care', 'support', 'team'], ['Gratitude', 'Reactions']),
  createEmoji('1f607', 'Smiling Face with Halo', '😇', ['angel', 'innocent', 'good', 'kind'], ['Reactions']),
  createEmoji('1f62e_200d_1f4a8', 'Face Exhaling', '😮‍💨', ['sigh', 'relief', 'whew', 'tired', 'phew'], ['Reactions']),
  createEmoji('1f973', 'Partying Face', '🥳', ['party', 'celebrate', 'horn', 'birthday', 'cheer'], ['Celebration', 'Reactions']),
  createEmoji('1f605', 'Grinning Face with Sweat', '😅', ['sweat', 'relief', 'close_call', 'whew'], ['Reactions']),
  createEmoji('1f970', 'Smiling Face with Hearts', '🥰', ['love', 'warmth', 'appreciate', 'happy'], ['Gratitude', 'Reactions']),
  createEmoji('1f9d0', 'Face with Monocle', '🧐', ['inspect', 'curious', 'scrutiny', 'audit', 'review'], ['Work & Coffee']),
  createEmoji('1f913', 'Nerd Face', '🤓', ['nerd', 'geek', 'smart', 'code', 'technical'], ['Work & Coffee']),
  createEmoji('1f916', 'Robot', '🤖', ['bot', 'ai', 'automation', 'agent', 'machine'], ['Launch & Hype']),
  createEmoji('1f642', 'Slightly Smiling Face', '🙂', ['smile', 'calm', 'fine', 'ok'], ['Reactions']),

  // Hearts & Appreciation
  createEmoji('2764', 'Red Heart', '❤️', ['heart', 'love', 'thanks', 'appreciation', 'kudos'], ['Gratitude']),
  createEmoji('1f9e1', 'Orange Heart', '🧡', ['heart', 'orange', 'warm', 'friendly'], ['Gratitude']),
  createEmoji('1f499', 'Blue Heart', '💙', ['heart', 'blue', 'loyalty', 'support', 'vonage'], ['Gratitude']),
  createEmoji('1f49a', 'Green Heart', '💚', ['heart', 'green', 'growth', 'nature'], ['Gratitude']),
  createEmoji('1f49c', 'Purple Heart', '💜', ['heart', 'purple', 'honor', 'duty'], ['Gratitude']),
  createEmoji('1f496', 'Sparkling Heart', '💖', ['heart', 'sparkle', 'love', 'kudos'], ['Gratitude']),
  createEmoji('1f497', 'Growing Heart', '💗', ['heart', 'growing', 'appreciation'], ['Gratitude']),

  // Communication & Coordination
  createEmoji('1f4ac', 'Speech Balloon', '💬', ['chat', 'message', 'comment', 'thread', 'talk'], ['Work & Coffee']),
  createEmoji('1f4e3', 'Megaphone', '📣', ['announcement', 'broadcast', 'shout', 'notice', 'news'], ['Work & Coffee']),
  createEmoji('1f4e2', 'Loudspeaker', '📢', ['speaker', 'audio', 'alert', 'call', 'voip'], ['Work & Coffee']),
  createEmoji('260e', 'Telephone', '☎️', ['phone', 'call', 'vonage', 'vbc', 'voice', 'telephony'], ['Work & Coffee']),
  createEmoji('1f4f1', 'Mobile Phone', '📱', ['mobile', 'smartphone', 'android', 'ios', 'sms', 'mms'], ['Work & Coffee']),
  createEmoji('1f4e8', 'Incoming Envelope', '📨', ['mail', 'email', 'inbox', 'message'], ['Work & Coffee']),
  createEmoji('1f4c5', 'Calendar', '📅', ['calendar', 'date', 'schedule', 'meeting', 'standup'], ['Work & Coffee']),
  createEmoji('1f514', 'Bell', '🔔', ['bell', 'notify', 'notification', 'reminder'], ['Work & Coffee']),
  createEmoji('1f4bc', 'Briefcase', '💼', ['work', 'business', 'enterprise', 'portfolio'], ['Work & Coffee']),
  createEmoji('1f4cc', 'Pushpin', '📌', ['pin', 'important', 'anchor', 'key_point'], ['Work & Coffee'])
];

export class VbcMediaCore {
  private baseUrl: string;
  private catalogAssets: MediaAsset[] = [];
  public allAssets: MediaAsset[] = [];
  public isLoaded: boolean = false;
  private initPromise: Promise<MediaAsset[]> | null = null;

  constructor(baseUrl: string = '/cdn/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Guaranteed initialization: fetches catalog.json once, merges with 80+ workplace emojis,
   * stores master array in allAssets, and resolves synchronously afterwards.
   */
  public async init(): Promise<MediaAsset[]> {
    if (this.isLoaded) {
      return this.allAssets;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        let manifest: CatalogManifest | null = null;
        if (typeof window === 'undefined' && typeof (globalThis as any).process !== 'undefined') {
          try {
            const fsModule = 'node:fs/promises';
            const pathModule = 'node:path';
            const fs = await import(/* @vite-ignore */ fsModule);
            const path = await import(/* @vite-ignore */ pathModule);
            const proc = (globalThis as any).process;
            const localFile = path.resolve(proc.cwd(), 'public', this.baseUrl.replace(/^\//, ''), 'catalog.json');
            const data = await fs.readFile(localFile, 'utf-8');
            manifest = JSON.parse(data);
          } catch {
            // fallback
          }
        }
        if (!manifest) {
          const url = `${this.baseUrl}/catalog.json`;
          const res = await fetch(url);
          if (res.ok) {
            manifest = await res.json();
          } else {
            console.warn(`[VbcMediaCore] Failed to fetch catalog at ${url}, status: ${res.status}`);
          }
        }
        if (manifest) {
          this.catalogAssets = manifest.items || [];
        }
      } catch (err) {
        console.warn('[VbcMediaCore] Network error loading catalog:', err);
      } finally {
        this.allAssets = [...this.catalogAssets, ...BUILTIN_WORKPLACE_EMOJIS];
        this.isLoaded = true;
      }
      return this.allAssets;
    })();

    return this.initPromise;
  }

  // Alias for backward compatibility
  public async initialize(): Promise<void> {
    await this.init();
  }

  public getLoadedItems(): MediaAsset[] {
    return this.allAssets;
  }

  /**
   * Fast typo tolerance helper: checks if s1 and s2 are at most 1 single-character edit apart
   * (1 insertion, 1 deletion, or 1 substitution).
   */
  public isOneEditAway(s1: string, s2: string): boolean {
    const len1 = s1.length;
    const len2 = s2.length;
    if (Math.abs(len1 - len2) > 1) return false;
    if (s1 === s2) return false;

    let i = 0;
    let j = 0;
    let edits = 0;

    while (i < len1 && j < len2) {
      if (s1[i] !== s2[j]) {
        edits++;
        if (edits > 1) return false;

        if (len1 > len2) {
          i++;
        } else if (len2 > len1) {
          j++;
        } else {
          i++;
          j++;
        }
      } else {
        i++;
        j++;
      }
    }

    if (i < len1 || j < len2) edits++;
    return edits === 1;
  }

  /**
   * GIPHY-Grade Multi-Token Scoring Algorithm
   * Supports both options object and positional arguments for backwards compatibility.
   */
  public search(
    optionsOrQuery:
      | {
          query: string;
          type: 'gif' | 'sticker' | 'emoji' | 'recents' | 'all';
          category?: string;
        }
      | string,
    legacyType?: MediaType | 'all' | 'recents',
    legacyCategory?: string
  ): { items: MediaAsset[]; stats: SearchStats } {
    let rawQuery = '';
    let targetTypeParam: 'gif' | 'sticker' | 'emoji' | 'recents' | 'all' = 'all';
    let rawCategory: string | undefined = undefined;

    if (typeof optionsOrQuery === 'object' && optionsOrQuery !== null) {
      rawQuery = optionsOrQuery.query || '';
      targetTypeParam = optionsOrQuery.type || 'all';
      rawCategory = optionsOrQuery.category;
    } else {
      rawQuery = optionsOrQuery || '';
      targetTypeParam = (legacyType as any) || 'all';
      rawCategory = legacyCategory;
    }

    const t0 = performance.now();
    const queryClean = (rawQuery || '').trim().toLowerCase();
    const tokens = queryClean.split(/\s+/).filter(Boolean);

    let pool: MediaAsset[] = [];
    if (targetTypeParam === 'recents' && tokens.length === 0) {
      pool = this.getRecents();
    } else if (targetTypeParam === 'all') {
      pool = this.allAssets;
    } else {
      const targetType = targetTypeParam === 'recents' ? 'gif' : targetTypeParam;
      pool = this.allAssets.filter(a => a.type === targetType);
    }

    // CRITICAL: Only filter by category when the user is NOT actively typing a search query
    if (tokens.length === 0 && rawCategory && rawCategory.toLowerCase() !== 'all') {
      const lowerCat = rawCategory.toLowerCase();
      pool = pool.filter(a => a.categories.some(c => c.toLowerCase() === lowerCat));
    }

    let results: MediaAsset[] = [];
    if (tokens.length === 0) {
      results = pool;
    } else {
      const scored: Array<{ asset: MediaAsset; score: number }> = [];
      for (const asset of pool) {
        let totalScore = 0;
        let matchedAllTokens = true;

        for (const token of tokens) {
          let tokenScore = 0;
          if (asset.title.toLowerCase() === token || asset.tags.some(t => t.toLowerCase() === token)) {
            tokenScore = 120; // Exact match
          } else if (asset.tags.some(t => t.toLowerCase().startsWith(token)) || asset.title.toLowerCase().startsWith(token)) {
            tokenScore = 85;  // Prefix match
          } else if (asset.searchText.includes(token)) {
            tokenScore = 50;  // Substring match
          } else if (token.length >= 4 && asset.tags.some(t => this.isOneEditAway(token, t.toLowerCase()))) {
            tokenScore = 30;  // 1-char typo tolerance
          }

          if (tokenScore === 0) {
            matchedAllTokens = false;
            break;
          }
          totalScore += tokenScore;
        }

        if (matchedAllTokens) {
          scored.push({ asset, score: totalScore });
        }
      }
      results = scored.sort((a, b) => b.score - a.score).map(s => s.asset);
    }

    const latencyMs = Number(Math.max(0.01, performance.now() - t0).toFixed(3));
    return {
      items: results,
      stats: {
        query: queryClean,
        latencyMs,
        resultCount: results.length,
        totalScanned: pool.length,
        externalNetworkCalls: 0
      }
    };
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
    const cats = new Set<string>(['All', 'Reactions', 'Celebration', 'Approval', 'Launch & Hype', 'Gratitude', 'Work & Coffee', 'Workplace']);
    for (const item of this.allAssets) {
      for (const cat of item.categories) {
        cats.add(cat);
      }
    }
    return Array.from(cats);
  }
}
