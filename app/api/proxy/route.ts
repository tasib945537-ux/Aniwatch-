import {NextResponse} from 'next/server';

function allowed(url:string){
  const raw=process.env.AUTHORIZED_MEDIA_HOSTS||'';
  const hosts=raw.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  try { const u=new URL(url); return u.protocol==='https:' && hosts.includes(u.hostname.toLowerCase()); } catch { return false; }
}
export async function GET(req:Request){
  const target=new URL(req.url).searchParams.get('url');
  if(!target || !allowed(target)) return NextResponse.json({error:'URL is not an allowed authorized media host.'},{status:400});
  try{
    const upstream=await fetch(target,{redirect:'manual',headers:{Accept:'application/vnd.apple.mpegurl,application/octet-stream'},signal:AbortSignal.timeout(12000)});
    if(upstream.status>=300 && upstream.status<400) return NextResponse.json({error:'Redirects are not allowed by the media proxy.'},{status:502});
    if(!upstream.ok) return NextResponse.json({error:'Authorized media source unavailable.'},{status:upstream.status});
    const type=upstream.headers.get('content-type')||'application/octet-stream';
    const body=await upstream.arrayBuffer();
    return new NextResponse(body,{status:200,headers:{'Content-Type':type,'Cache-Control':'private, max-age=30','X-Content-Type-Options':'nosniff'}});
  }catch{return NextResponse.json({error:'Proxy request failed.'},{status:504})}
}
