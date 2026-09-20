import {NextResponse} from 'next/server';
import {searchAniList} from '../../../lib/anilist';
export const dynamic='force-dynamic';
export async function GET(req:Request){const q=new URL(req.url).searchParams.get('q')?.trim(); if(!q)return NextResponse.json({data:[]}); try{return NextResponse.json({data:await searchAniList(q)},{headers:{'Cache-Control':'s-maxage=300, stale-while-revalidate=1800'}})}catch{return NextResponse.json({error:'Search temporarily unavailable',data:[]},{status:503})}}
