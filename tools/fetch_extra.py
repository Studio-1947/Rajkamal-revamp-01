import json,re,html,sys,urllib.request,io,os,concurrent.futures as cf
from PIL import Image
S=sys.argv[1]
A=json.load(open(f'{S}/cols.json'))
have=set(json.loads(open(f'{S}/have.json').read()))
prods={}
for k in A:
    for p in A[k]: prods.setdefault(p['slug'],p)
new=[s for s in prods if s not in have]
def get(u,binary=False):
    for _ in range(3):
        try:
            d=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read()
            return d if binary else d.decode('utf-8')
        except Exception as e: err=e
    return None
def clean(t):
    t=re.sub(r'(?i)</p\s*>\s*','<br><br>',t);t=re.sub(r'(?i)<br\s*/?>','<br>',t)
    t=re.sub(r'<(?!br>)[^>]*>','',t);t=html.unescape(t).replace('\xa0',' ')
    t=re.sub(r'(\s*<br>\s*){3,}','<br><br>',t);t=re.sub(r'^(\s*<br>)+|(<br>\s*)+$','',t.strip())
    return t.strip()
def one(slug):
    out={'desc':'','lang':''}
    raw=get('https://www.rajkamalprakashan.com/products/'+slug)
    if raw:
        s=''.join(json.loads(m.group(1)) for m in re.finditer(r'self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)',raw))
        m=re.search(r'"language":"([^"]*)"',s); out['lang']=m.group(1) if m else ''
        m=re.search(r'"description":"\$(\w+)"',s)
        if m:
            b=s.encode('utf-8');key=m.group(1);i=b.find(('\n'+key+':T').encode());i=i+1 if i>=0 else b.find((key+':T').encode())
            if i>=0:
                j=b.find(b',',i);n=int(b[i+len(key)+2:j],16);out['desc']=clean(b[j+1:j+1+n].decode('utf-8','replace'))
        else:
            m=re.search(r'"description":"((?:[^"\\]|\\.)*)"',s)
            if m: out['desc']=clean(json.loads('"'+m.group(1)+'"'))
    # cover
    dst=f'books/covers/{slug}.jpg'
    if not os.path.exists(dst):
        u=prods[slug].get('coverImageUrl')
        d=get(u,True) if u else None
        if d:
            try:
                im=Image.open(io.BytesIO(d)).convert('RGB')
                if im.width>390: im=im.resize((390,round(im.height*390/im.width)),Image.LANCZOS)
                im.save(dst,quality=82,optimize=True); out['cover']=True
            except Exception as e: out['cover']=False
        else: out['cover']=False
    return slug,out
res={}
with cf.ThreadPoolExecutor(8) as ex:
    for slug,o in ex.map(one,new): res[slug]=o
json.dump(res,open(f'{S}/extra-detail.json','w'),ensure_ascii=False)
print('new',len(new),'with desc',sum(1 for v in res.values() if v['desc']),'covers failed',[k for k,v in res.items() if v.get('cover') is False],'langs',set(v['lang'] for v in res.values()))
