import {NextResponse} from 'next/server';
import {getAniListAnime} from '../../../../lib/anilist';
export const dynamic='force-dynamic';
export async function GET(_:Request,ctx:{params:Promise<{id:string}>}){const {id}=await ctx.params; if(!/^\d+$/.test(id)) return NextResponse.json({error:'Invalid AniList ID'},{status:400}); try{return NextResponse.json({data:await getAniListAnime(Number(id))},{headers:{'Cache-Control':'s-maxage=900, stale-while-revalidate=3600'}})}catch{return NextResponse.json({error:'AniList is temporarily unavailable'},{status:503})}}
