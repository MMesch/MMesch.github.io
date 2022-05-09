---
title: Designing 2D Colormaps for Matplotlib with Blender
labels:
  - colormaps
  - Blender
  - Python
thumbnail: "/images/thumbnails/cmap2d.png"
description: |
  2D colormaps for matplotlib designed with Blender.  
---

UPDATE: check out the <a href="https://github.com/MMesch/cmap_builder.git">github</a> project with blender scripts and python module.

A 2d colormap is designed to represent two dimensional data on a two dimensional domain.
Common examples are wind direction and magnitude, signal amplitude and frequency or a complex functions magnitude and argument.
Typically, direction or frequency are hereby represented by the color hue and magnitude by the lightness or/and saturation of the colors
(check out <a href="http://peterkovesi.com/projects/colourmaps/ColourmapTheory/index.html"></a> for some really nice explanations and examples).

A simple 2d colormap can easily be designed in the HSV (hue, saturation, value) color space.
Unfortunately, HSV is not perceptually uniform.
This means, equal distances in the HSV domain can be visually perceived differently.
It therefore distorts the represented data.

The python module colorspacious (pip install colorspacious) provides access to a colorspace, in which similar distances map to similar perceived distances.
I have written three short blender scripts (available on <a href="www.github.com/mmesch/cmap_builder"></a>) that allow you to visualize this colorspace in blender, and export color values on paths and surfaces to colormaps.

In contrast to a 1d colormap, that can be represented as a path in the 3d colorspace, a 2d colormap can be represented as a surface.
In particular a surface with a topology that can easily be mapped to a rectangle is useful, such that the two dimensions are clear.
Blender offers so called NURBS surfaces, that are defined from a rectangular grid of spline nodes that are perfect for this purpose.

The simplest and obvious choice of a 2d colormap is to use lightness as one axis and color hue as the other.
The color saturation can be adapted for each lightness to span the maximum possible saturation range.
However, this approach has several disadvantages.
The uniform colorspace has 6 corners that allow to have the most saturated colors: blue, cyan, green, yellow, red, magenta.
This used in hexagon representations of the colorspace (<a href="https://en.wikipedia.org/wiki/HSL_and_HSV"></a>).
To make use of the extent of the colorspace we should therefore try to adapt the saturation to the possible values of different colors and to go into these corners.
On the other hand, this shouldn't distort distances too much, because the perceived color differences will become less uniform.
More problematic is, that each corner has a different lightness.
Blue and red are darker colors than yellow and cyan for example.

The following two surfaces try to find a good balance between all of these constraints.
The topology of the surface is represented as a wireframe mesh.
Both surfaces are not fully uniform which is good because this allows us to better explore the color space.

This colormap goes from black to white and has a maximally saturated area in the middle (like HSL).

<img src="/images/posts/cmap-wheel2d.png"/>

This colormap goes from black to white and has a maximally saturated area in the middle (like HSV):

<img src="/images/posts/cmap-darkwheel2d.png"/>

Here is a comparison of these colormaps, showing a complex polynomial.
In the case of poles and zeros, the black-to-white colormap is the best.
For other applications, other colormaps will be better.
The main point is that they are more uniform than HSV, which is shown in the last row.
HSV enhances a few colors and therefore distorts the data:

<img src="/images/posts/cmap-poles_and_zeros.png"/>

A simple way to map data to these colors in python is shown in the following code snippet.
Data is a [2, nwidth, nheight] array with the data and cmap a [ndim1, ndim2, 3] array with the rgb values of the colormap.
The resulting rgb [nwidth, nheight, 3] image can be displayed with plt.imshow(rgb).

```python
def cmap2d_to_rgb(data, cmap):
    from scipy.ndimage.interpolation import map_coordinates
    data_dim, nrows, ncols = data.shape
    idata = np.copy(data)  # index coordinates of the data
    idata[0] *= cmap.shape[0]
    idata[1] *= cmap.shape[1]
    idata = idata.reshape(data_dim, nrows, ncols)
    r = map_coordinates(cmap[:, :, 0], idata, order=1, mode='nearest')
    g = map_coordinates(cmap[:, :, 1], idata, order=1, mode='nearest')
    b = map_coordinates(cmap[:, :, 2], idata, order=1, mode='nearest')
    rgb = np.array([r, g, b])
    rgb = rgb.reshape(3, nrows, ncols).transpose(1, 2, 0)
    return rgb
```
