const ANILIST_API_URL = process.env.ANILIST_API_URL || 'https://graphql.anilist.co';

export type AniListAnime = {
  id:number; idMal?:number|null; title:{romaji?:string|null; english?:string|null; native?:string|null};
  coverImage?:{large?:string|null; extraLarge?:string|null}; bannerImage?:string|null;
  description?:string|null; genres:string[]; season?:string|null; seasonYear?:number|null;
  status?:string|null; episodes?:number|null; relations?:{edges:{relationType:string; node:{id:number; idMal?:number|null; title:{romaji?:string|null; english?:string|null}}}[]} 
};

const QUERY = `query($id:Int,$search:String){ Media(id:$id,type:ANIME){ id idMal title{romaji english native} coverImage{large extraLarge} bannerImage description(asHtml:false) genres season seasonYear status episodes relations{edges{relationType node{id idMal title{romaji english}}}} } MediaSearch: Page(perPage:20){ media(search:$search,type:ANIME){ id idMal title{romaji english native} coverImage{large extraLarge} bannerImage description(asHtml:false) genres season seasonYear status episodes } } }`;

export async function anilistFetch(vars: {id?:number; search?:string}) {
  const res = await fetch(ANILIST_API_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:QUERY,variables:vars}),cache:'no-store'});
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json=await res.json();
  if (json.errors?.length) throw new Error(json.errors[0]?.message || 'AniList request failed');
  return json.data;
}

export async function getAniListAnime(id:number) {
  const data=await anilistFetch({id});
  return data?.Media ?? null;
}

export async function searchAniList(search:string) {
  const data=await anilistFetch({search});
  return data?.MediaSearch ?? [];
}


const MAL_IDS_QUERY = `query($ids:[Int],$page:Int,$perPage:Int){ Page(page:$page,perPage:$perPage){ media(idMal_in:$ids,type:ANIME){ id idMal title{romaji english native} coverImage{large extraLarge} bannerImage description(asHtml:false) genres season seasonYear status episodes } } }`;

export async function getAniListAnimeByMalIds(ids:number[]) {
  const clean = [...new Set(ids.filter(Number.isInteger))].slice(0, 50);
  if (!clean.length) return [];
  const res = await fetch(ANILIST_API_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:MAL_IDS_QUERY,variables:{ids:clean,page:1,perPage:50}}),cache:'no-store'});
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json=await res.json();
  if (json.errors?.length) throw new Error(json.errors[0]?.message || 'AniList request failed');
  return json.data?.Page?.media ?? [];
}
