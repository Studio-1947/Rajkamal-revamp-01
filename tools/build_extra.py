import json,re,sys
S=sys.argv[1]
A=json.load(open(f'{S}/cols.json')); X=json.load(open(f'{S}/extra-detail.json')); have=set(json.load(open(f'{S}/have.json')))
ROWS=json.load(open(f'{S}/rows.json'))  # existing catalogue rows by id
NAMES={'author-of-the-week':('Author of the Week',26),'must-read':('Must Read',209),'deal-of-the-day':('Deal of the Day',3),'representative-poem':('Representative Poem',41),'representative-stories':('Representative Stories',57),'children-books':('Children Books',112)}
def num(v):
    try: f=float(v); return int(f) if f==int(f) else round(f,2)
    except: return None
def ordinal(e):
    e=str(e or '').strip()
    if re.fullmatch(r'\d+',e):
        n=int(e); suf='th' if 10<=n%100<=20 else {1:'st',2:'nd',3:'rd'}.get(n%10,'th'); return f'{n}{suf}'
    return e if e and e!='-' else None
def primary(p):
    vs=p['variants']; d=[v for v in vs if v.get('isDefault')] or [v for v in vs if v['id']==p.get('primaryVariantId')] or vs
    return d[0]
cols={};detail={};formats={};cats={};facets={};pubs={}
for slug,(name,total) in NAMES.items():
    rows=[]
    for p in A[slug]:
        pid=p['slug']
        if pid in ROWS: rows.append(ROWS[pid]); continue
        v=primary(p); price=num(v['price']); mrp=num(v.get('compareAtPrice')) or price
        off=round((mrp-price)/mrp*100) if mrp and mrp>price else 0
        authors=[a['name'] for a in p.get('authors') or []]
        rows.append([p['name'],', '.join(authors),price,off,pid])
        cat=(p.get('category') or {}).get('name') or ''
        x=X.get(pid,{})
        dim=[v.get('dimensionL'),v.get('dimensionB'),v.get('dimensionH')]
        detail[pid]={'desc':x.get('desc',''),'cat':cat,'authors':authors,'fmt':v['title'],'isbn':v.get('isbn13') or v.get('sku'),'pages':p.get('pages'),'lang':x.get('lang') or 'Hindi',
                     'wt':v.get('weightGrams'),'dim':[d for d in dim if d],'year':v.get('publicationYear'),'reprint':v.get('reprintYear'),'ed':ordinal(v.get('edition')),'mrp':str(mrp),'price':str(price),'stock':v.get('stock')}
        fl=[];mask=0;instock=False
        for w in p['variants']:
            t=w['title']; eb=bool(re.search(r'e-?book',t,re.I))
            f={'t':t,'isbn':w.get('isbn13') or w.get('sku'),'p':num(w['price']),'m':num(w.get('compareAtPrice')) or num(w['price'])}
            if not eb: f['stock']=w.get('stock')
            if w.get('weightGrams'): f['wt']=w['weightGrams']
            dd=[w.get('dimensionL'),w.get('dimensionB'),w.get('dimensionH')]
            if all(dd): f['dim']=' × '.join(str(num(d)) for d in dd)
            for a,b in (('year','publicationYear'),('reprint','reprintYear'),('pub','publication'),('publisher','publisher')):
                if w.get(b): f[a]=w[b]
            if ordinal(w.get('edition')): f['ed']=ordinal(w['edition'])
            if w.get('isDefault'): f['def']=True
            imgs=[m['url'] for m in sorted(w.get('media') or [],key=lambda m:m.get('position',0)) if m.get('url')]
            if imgs: f['imgs']=imgs
            if w.get('onlineBuyLinks'): f['links']=[[l['name'],l['url']] for l in w['onlineBuyLinks'] if l.get('url')]
            fl.append(f)
            mask|= 1 if re.match(r'paperback',t,re.I) else 2 if re.match(r'hardcover',t,re.I) else 4 if eb else 0
            if eb or (w.get('stock') or 0)>0: instock=True
        ppl=lambda k:[[a.get('slug'),a.get('name'),a.get('profilePictureUrl') or ''] for a in p.get(k) or []]
        formats[pid]={'fmt':fl,'au':ppl('authors'),'edr':ppl('editors'),'tr':ppl('translators'),'pages':p.get('pages'),'lang':x.get('lang') or 'Hindi','cats':[c['name'] for c in p.get('categories') or []] or ([cat] if cat else [])}
        if cat: cats[pid]=cat
        facets[pid]=[mask,v.get('publicationYear') or 0,1 if instock else 0]
        if p.get('publication'): pubs[pid]=p['publication']
    cols[slug]={'name':name,'books':rows,'total':total,'live':'https://www.rajkamalprakashan.com/collections/'+slug}
J=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
MARK='\n/* ---- home collections (Author of the Week, Must Read, Deal of the Day, Representative Poem / Stories, Children Books):\n   the first 24 books of each from rajkamalprakashan.com/collections/<slug>, added 2026-10-07 by the build script ---- */\n'
def patch(path,code):
    s=open(path,encoding='utf-8').read()
    i=s.find(MARK)
    if i>=0: s=s[:i]
    open(path,'w',encoding='utf-8').write(s.rstrip('\n')+'\n'+MARK+code+'\n')
patch('books/books-data.js','Object.assign(window.RK_COLLECTIONS,'+J(cols)+');')
patch('books/books-detail.js','Object.assign(window.RK_DETAIL,'+J(detail)+');')
patch('books/books-formats.js','Object.assign(window.RK_FORMATS,'+J(formats)+');')
patch('books/books-cats.js','Object.assign(window.RK_CATS,'+J(cats)+');')
patch('books/books-facets.js','Object.assign(window.RK_FACETS,'+J(facets)+');')
patch('books/books-pubs.js','(function(){var X='+J(pubs)+',o=window.RK_PUBS.of;window.RK_PUBS.of=function(id){return X[id]||o(id);};})();')
print({k:len(v['books']) for k,v in cols.items()},'new detail',len(detail))
