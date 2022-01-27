---
title: Earthquake Moment Tensor Radiation Patterns
labels:
  - visualization
  - seismology
thumbnail: "/images/thumbnails/moment_tensors.png"
description: |
  Mayavi illustration of earthquake radiation patterns.
---

This post is about the radiation pattern of elastic waves due to different sources that can be expressed as a moment tensor (see https://en.wikipedia.org/wiki/Focal_mechanism).

I have used mayavi for the visualization, equations from the Aki and Richards Seismology book for the radiation pattern, and the script <a href="https://github.com/geophysics/MoPaD">MoPaD</a> (included in <a href="https://github.com/obspy/obspy/wiki">obspy</a>) to compute the nodal lines of the moment tensor.
The complete script is available here: <a href="https://github.com/MatthiasMeschede/radpattern">github</a>

### Explosive Source 

This is a simple explosive source. P-wave energy radiates equally in all directions.

<img src="/images/posts/explosion.png"/>

### Double Couple Source

Double Couple Sources correspond to fractures.
P-wave radiation is shown on the left side and S-wave radiation on the right.
Green lines correspond to the 'nodal' line where the polarity of the P-wave radiation changes from positive to negative.
This is a parameter that is relatively simple to observe.
In this plot, one of the green lines furthermore corresponds to a fault plane that fractured.
Due to its symmetry, it is not possible to determine from the radiation pattern alone which of the two possible fault planes fractured.
<a href="https://mmesch.github.io/x3d/models/double_couple.html" target="_blank">Click here</a> for a WebGL 3D animation.

<img src="/images/posts/dcouple.png"/>

### Egg source

This source corresponds to an expansion in horizontal direction and a retraction in vertical (in the image coordinate system).
Such a source can be found, for example, in volcanoes (see <a href="http://www.ldeo.columbia.edu/~ekstrom/Projects/EQS/Iceland/">http://www.ldeo.columbia.edu/~ekstrom/Projects/EQS/Iceland/</a>).
<a href="https://mmesch.github.io/x3d/models/egg_tensor.html" target="_blank">Click here</a> for a WebGL 3D animation.

<img src="/images/posts/egg.png"/>

### Moment Tensor Inversion

From the elastic vibrations that are recorded on stations around the globe, source mechanisms of Earthquakes are routinely determined.
This is an example of an Earthquake that occured 1996 in the Philippines.
It resembles an imperfect double couple source.
A complete catalogue can be found here <a href="http://www.globalcmt.org/">http://www.globalcmt.org/</a>.
The 3D focal spheres that I show here are typically projected on a 2D circle to plot their distribution on a map ('beachballs').

<img src="/images/posts/CMT.png"/>
