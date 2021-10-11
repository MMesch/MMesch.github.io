---
title: Blender Voxel Data
class: post
---

You can do cool stuff with manual Blender voxel data. See for example this video:

<iframe align="middle" allowfullscreen="" frameborder="40" height="315" src="//www.youtube.com/embed/6n62SZMC3fo" width="560"></iframe>

Unfortunately there is not much documentation about the input file formats ".bvox" or 8bit raw. Both are simple structured rectangular grids in which usually 'x' is the fastest and 'z' the slowest dimension.

### bvox format

bvox is a very simple binary file that looks like this:

```default
nx ny nz nframes data[1,0,0] data[2,0,0] .... data[nx-1,ny-1,nz-1]
```

`nx,ny,nz,nframes` are 32bit integers, data_xyz are 32bit floats between 0 and 1. This is a purely rectangular structured grid which is mapped to the appropriate domain within blender. There are options for spherical and cylindrical mappings, but I have only tried mapping it to a simple cube. Here is an example script that creates a simple 3D texture:

```python
import numpy as np

#specify dimensions header
nx, ny, nz, nframes = 100,100,100,1
header = np.array([nx,ny,nz,nframes])

#create simple distance to origin texture
x = np.linspace(-1,1,nx)
y = np.linspace(-1,1,ny)
z = np.linspace(-1,1,nz)
zz,yy,xx = np.meshgrid(z,y,x,indexing='ij')
pointdata = yy.flatten()**2+zz.flatten()**2+xx.flatten()**2

#open and write to file
binfile = open('test1.bvox','wb')
header.astype('&lti4').tofile(binfile)
pointdata.astype('&ltf4').tofile(binfile)
```

### 8bit raw format
This format is even simpler and saves space. It is just a long array of 8bit uints, frame by frame. The dimensions are specified in blender itself.

```
frame1[1,0,0] frame1[2,0,0] .... frame1[nx-1,ny-1,nz-1] frame2[0,0,0] ...
```

A test file can be written with:

```python
import numpy as np

nx, ny, nz = 100,100,100

#create simple distance to center texture
x = np.linspace(-1,1,nx)
y = np.linspace(-1,1,ny)
z = np.linspace(-1,1,nz)
zz,yy,xx = np.meshgrid(z,y,x,indexing='ij')
pointdata = yy.flatten()**2+zz.flatten()**2+xx.flatten()**2

#open and write to file
binfile = open('test_8bit.raw','wb')
pointdata *= 255/pointdata.max()
pointdata.astype(np.uint8).tofile(binfile)
```

test render

<img src="/images/posts/voxelsphere.png" style="width:50%"/>

EDIT: see Leo's comment below the text for a quick overview on how to get this into blender!

As you can see the volume data receives and casts shadows, can be made transparent, change the color and much more.

