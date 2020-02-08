---
title: Spherical Harmonics Transform and Rotation in Python
---

Recently I needed a module that provides spherical harmonics transforms and tools in Python and I started wrapping the library shtools written by Mark Wieczorek using f2py from the numpy/scipy packages.
Here is the result in case anyone is interested.
If you are looking for a complete package, note that there is also another python module (pyspharm) that deals with spherical harmonics.

UPDATE: a new and better version of the python wrapper is now included in the SHTOOLS library which you can find here: pyshtools.
Numerous examples are included that show how it can be used from Python.
Other spherical harmonics libraries are: pyspharm and SHTns.
In addition to the spherical harmonics transforms, SHTOOLS provides local multitaper spherical harmonics analysis, as well as spherical harmonics rotations, coupling matrices, etc ... 

Little Examples
Once the package is compiled, a spherical harmonics transform is as easy as:

```python
>>> import shtools
>>> grid = shtools.pymakegriddh(coeffs)
>>> coeffs = shtools.pyshexpanddh(grid,nlat=90)
```
a rotation by 3 Euler angles can be done with:

```python
>>> angles = np.radians(np.array[90.,-30.,0.])) 
>>> coeffs = shtools.pyshrotaterealcoef(coeffs_trim,angles) 
```

Wrapped subroutines (so far)

* makegriddh (expand spherical harmonic coefficients on a regular lat-lon grid)
* shexpanddh (get spherical harmonics coefficients from a regular lat-lon grid)
* shpowerspectrum (get power spectrum from spherical harmonics coefficients)
* shcrosspowerspectrum (get cross power spectrum)
* shadmitcorr (compute admittance and correlation)
* shconfidence
* shrotaterealcoef (rotate spherical harmonic coefficients by 3 angles)

For a detailed description of all the routines available in shtools see shtools.ipgp.fr.

## Installation:
### Prerequisites:
First you need to compile and install the shtools library. To do this, follow the instructions on its webpage (you'll also need fftw3 for this which is often available through the package manager of many distributions). I compiled with gfortran and changed the associated compiler flags in the shtools Makefile to:

```makefile
ifeq ($(F95),gfortran)
# Default gfortran flags
F95FLAGS ?= -m64 -O3 -fPIC
MODFLAG = -Imodpath
endif 
```

The fPIC option is important and ensures compilation with position independent code.

Second you need to have scipy/numpy and especially the f2py compiler installed.
You can test this by typing the command "f2py" in the console.
It is often installed along numpy/scipy installations. Sometimes you have to set the correct path to it.
You can find more info on how to use and install f2py on the google codes or scipy webpages.

Finally you can download the actual wrapper files here.
wrapper.f90 contains the wrapper routines that need to be compiled with f2py.
test.py is a small example script that shows how one can plot a map from spherical harmonic coefficients using shtools, numpy, matplotlib and basemap.

How to compile the wrapper
So far I only tested the compilation on my own linux machine.
Once you have a working shtools library and also the f2py compiler running, try:

```bash
f2py -I"SHTOOLS_INCLUDE_DIR" -L"SHTOOLS_LIB_DIR" -lSHTOOLS2.8 -lfftw3 -lm --f90flags="-m64 -fPIC" --f77flags="-m64 -fPIC" -c -m shtools wrapper.f90 
```

this should create the file shtools.so that you can finally import into python.

The test script
the test script test.py shows an example on how to plot a map from spherical harmonics coefficients. You need shtools,numpy, matplotlib and basemap working. The script plots a function with sh-coefficients up to a certain degree. The result should look something like this:

<img src="/images/posts/spherical-harmonics.png" style="width:50%"></img>
