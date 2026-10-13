import sys,json
for line in sys.stdin:
    line=line.rstrip()
    if ': ' in line and line.split(': ',1)[1][:1] in '{[':
        k,v=line.split(': ',1)
        try:d=json.loads(v)
        except Exception:print(line);continue
        if isinstance(d,dict) and 'log' in d:
            log=d.pop('log');print(k,d)
            for l in log:print('  ',l)
        elif isinstance(d,list):
            print(k)
            for l in d:print('  ',l)
        else:print(k,d)
    else:print(line)
