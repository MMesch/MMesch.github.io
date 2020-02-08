---
title: Executing SAC through Python
---

SAC (get it here) is a processing tool for seismic traces. The question came up recently how to handle it through a python pipe, instead of the common perl approach. This is the short answer we found, employing python's subprocess module. Remember to exchange the SAC executable path.

```python
import subprocess
process = subprocess.Popen(['/usr/local/sac/bin/sac'],stdin = subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
process.stdin.write('fg\n')
process.stdin.write('lh\n')
process.stdin.write('quit\n')
out,err = process.communicate()
print out
```

An explanation can also be found here. I usually avoid SAC and use the python package obspy.
