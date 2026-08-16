from pathlib import Path
import re

path = Path('app/src/main/java/com/nexora/music/MainActivity.java')
s = path.read_text(encoding='utf-8')

def find_matching_brace(text, start):
    n=len(text); depth=0; i=start; quote=None; esc=False; line=False; block=False
    while i<n:
        c=text[i]; d=text[i+1] if i+1<n else ''
        if line:
            if c=='\n': line=False
            i+=1; continue
        if block:
            if c=='*' and d=='/': block=False; i+=2; continue
            i+=1; continue
        if quote:
            if esc: esc=False
            elif c=='\\': esc=True
            elif c==quote: quote=None
            i+=1; continue
        if c=='/' and d=='/': line=True; i+=2; continue
        if c=='/' and d=='*': block=True; i+=2; continue
        if c in ('"', "'"): quote=c; i+=1; continue
        if c=='{': depth+=1
        elif c=='}':
            depth-=1
            if depth==0: return i
        i+=1
    return -1

def brace_depth(text, end):
    depth=0; i=0; quote=None; esc=False; line=False; block=False
    while i<end:
        c=text[i]; d=text[i+1] if i+1<end else ''
        if line:
            if c=='\n': line=False
            i+=1; continue
        if block:
            if c=='*' and d=='/': block=False; i+=2; continue
            i+=1; continue
        if quote:
            if esc: esc=False
            elif c=='\\': esc=True
            elif c==quote: quote=None
            i+=1; continue
        if c=='/' and d=='/': line=True; i+=2; continue
        if c=='/' and d=='*': block=True; i+=2; continue
        if c in ('"', "'"): quote=c; i+=1; continue
        if c=='{': depth+=1
        elif c=='}': depth-=1
        i+=1
    return depth

pat=re.compile(r'(?m)^\s*(?:private|public|protected)\s+(?:static\s+)?[\w<>\[\], ?]+\s+(\w+)\s*\(([^)]*)\)\s*\{')
items=[]
for m in pat.finditer(s):
    if brace_depth(s,m.start())!=1: continue
    end=find_matching_brace(s,m.end()-1)
    if end<0: continue
    sig=(m.group(1),re.sub(r'\s+','',m.group(2)))
    items.append((sig,m.start(),end+1))
seen=set(); remove=[]
for sig,start,end in items:
    if sig in seen: remove.append((start,end))
    else: seen.add(sig)
for start,end in reversed(remove): s=s[:start]+s[end:]
path.write_text(s,encoding='utf-8')
print(f'Removed {len(remove)} duplicate top-level methods')
