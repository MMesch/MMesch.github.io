---
title: calling fortran from python without f2py
---

This post explains how you can use a fortran shared object file without(!) recompiling it with the f2py compile.
Say you want to wrap the library add.so, compiled with


```bash
gfortran -shared -fPIC add.f95 -o add.so
```

from file add.f95:

```fortran
subroutine add(a,b,c)    
    implicit none
    integer a,b,c
    c = a + b 
end
```

The simple python code with which you can call it is:

```python
from ctypes import c_int, byref, cdll

a = c_int(3)
b = c_int(4)
c = c_int()

addlib = cdll.LoadLibrary('./add.so')
addlib.add_(byref(a),byref(b),byref(c))
print c
```

Note the extra underscore.
I didn't play around with arrays.
It should work as well but is maybe more a dirty hack than a good solution.
ctypes is however python standard if you don't have access to f2py.
