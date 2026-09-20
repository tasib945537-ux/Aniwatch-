export type NormalizedSource = {
  name: string; url: string; type: 'hls'|'mp4'|'unknown'; quality?: string; isM3U8: boolean;
};

export function normalizeAuthorizedSources(items: unknown): NormalizedSource[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item:any) => {
    if (!item || typeof item.url !== 'string') return [];
    const url=item.url.trim();
    try { const parsed=new URL(url); if (!['https:','http:'].includes(parsed.protocol)) return []; } catch { return []; }
    const isM3U8 = item.isM3U8 === true || /\.m3u8(?:$|[?#])/i.test(url);
    const type = isM3U8 ? 'hls' : /\.mp4(?:$|[?#])/i.test(url) ? 'mp4' : 'unknown';
    return [{name:String(item.name||'Authorized source'),url,type,quality:item.quality?String(item.quality):undefined,isM3U8}];
  });
}
