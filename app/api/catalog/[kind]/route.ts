import {NextResponse} from 'next/server';
const JIKAN=process.env.JIKAN_API_URL||'https://api.jikan.moe/v4';
const allowed=new Set(['popular','recent','trending','upcoming','spotlight','filter','suggestions']);
export const dynamic='force-dynamic';
export async function GET(req:Request,ctx:{params:Promise<{kind:string}>}){
 const {kind}=await ctx.params; if(!allowed.has(kind)) return NextResponse.json({error:'Unknown catalog endpoint'},{status:404});
 const u=new URL(req.url), page=u.searchParams.get('page')||'1', q=u.searchParams.get('q')||'';
 let path='/top/anime'; if(kind==='recent'||kind==='trending') path='/anime'; if(kind==='upcoming') path='/anime?status=Upcoming'; if(kind==='search') path=`/anime?q=${encodeURIComponent(q)}&page=${page}`; else if(kind==='popular'||kind==='spotlight') path=`/top/anime?page=${page}`; else if(kind==='suggestions') path=`/anime?q=${encodeURIComponent(q)}&page=${page}`; else if(kind==='filter') path=`/anime?${u.searchParams.toString()}`;
 try{const r=await fetch(`${JIKAN}${path}`,{next:{revalidate:600},signal:AbortSignal.timeout(10000)}); const j=await r.json(); return NextResponse.json(j,{status:r.ok?200:r.status,headers:{'Cache-Control':'s-maxage=600, stale-while-revalidate=3600'}})}catch{return NextResponse.json({data:[],error:'Catalog unavailable'},{status:503})}
}
