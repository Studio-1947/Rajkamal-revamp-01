import re,json,sys
S=sys.argv[1]
def products(slug):
    raw=open(f'{S}/col-{slug}.html',encoding='utf-8').read()
    s=''.join(json.loads(m.group(1)) for m in re.finditer(r'self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)',raw))
    i=s.find('"products":[')+len('"products":')
    d=0;k=i;ins=False;esc=False
    while k<len(s):
        c=s[k]
        if ins:
            if esc: esc=False
            elif c=='\\': esc=True
            elif c=='"': ins=False
        else:
            if c=='"': ins=True
            elif c=='[': d+=1
            elif c==']':
                d-=1
                if d==0: break
        k+=1
    arr=json.loads(s[i:k+1],strict=False)
    m=re.search(r'"(total|totalCount|totalProducts|count)":(\d+)',s[k:k+600])
    return arr,(m.group(0) if m else s[k+1:k+200])
if __name__=='__main__':
    allp={}
    for slug in ['author-of-the-week','must-read','deal-of-the-day','representative-poem','representative-stories','children-books']:
        arr,tail=products(slug); allp[slug]=arr
        print(slug,len(arr),'| after:',tail[:120].replace('\n',' '))
    p=allp['must-read'][0]
    print(sorted(p.keys()))
    print({k:(v if not isinstance(v,(list,dict)) else type(v).__name__+str(len(v))) for k,v in p.items()})
    print('authors sample',json.dumps(p.get('authors'),ensure_ascii=False)[:300]); print('cats',json.dumps(p.get('categories') or p.get('category'),ensure_ascii=False)[:200])
    json.dump(allp,open(f'{S}/cols.json','w'),ensure_ascii=False)
