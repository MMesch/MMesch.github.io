---
title: Solar System SVG Animation
class: post
thumbnail: "/images/thumbnails/solarsystem.svg"
---

Here is a python script that creates an svg animation of the solarsystem from orbital data.
The animation looks like this:


<img border="0" src="/images/posts/solarsystem.svg" style="margin-bottom: 20px; margin-top: 20px;" width="80%" />

```python
"""
This script creates animated svg from orbital data. Planets always have the
same speed. It is therefore not useful for orbits with high eccentricity. 
You can adjust the orbital and visualization parameters below.
"""

from math import sqrt,sin,cos,radians,degrees

#==== SVG STRING TEMPLATES ====
svg_template = \
"""&lt;?xml version="1.0" encoding="UTF-8" standalone="no"?&gt;
&lt;!-- pythology.blogspot.com by Matthias Meschede --&gt;

&lt;svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{width}"
     height="{height}"&gt;

{orbits}

{sun}

{planets}

&lt;/svg&gt;"""

sun_template = \
'&lt;circle cx="{sunx}" cy="{suny}" r="{radius}" fill="{color}" id="sun" stroke="black" stroke-width="1"/&gt;'

orbit_template = \
'&lt;path id="{name}_orbit" d="M{x0} {y0} A{r1} {r2} {rot} 1,1 {x1},{y1}'+\
'A{r1} {r2} {rot} 1,1 {x0},{y0}" '+\
'fill="none" stroke="{stroke}" stroke-width="{width}"/&gt;'

planet_template = \
"""
&lt;circle r="{radius}" fill="{color}" id="{name}" stroke="black" stroke-width="1"&gt;
      &lt;animateMotion begin="0s" dur="{period}s" repeatCount="indefinite" &gt;
          <mpath xlink:href="#{name}_orbit">
      &lt;/animateMotion&gt;
&lt;/circle&gt;
"""

labeled_planet_template = \
"""
&lt;g id="{name}_group"&gt;
  &lt;circle r="{radius}" fill="{color}" id="{name}" stroke="black" stroke-width="1"/&gt;
  &lt;text id="label_{name}" style="font-size:13px;font-weight:bold;fill:{color};stroke:black;stroke-width:0.3" x="-15px" y="15px"&gt;
      {name}
  &lt;/text&gt;
  &lt;animateMotion begin="0s" dur="{period}s" repeatCount="indefinite" &gt;
      <mpath xlink:href="#{name}_orbit">
  </mpath></mpath></code></pre>
&lt;/g&gt;
"""

#==== DOCUMENT SIZE AND SOLARSYSTEM CENTER ====
width, height = 800,800
sun_data = {'sunx':400,'suny':400,'radius':5,'color':'orange'}
docsize_in_au = 25.
px_per_au = width/docsize_in_au
au_per_pix = 1./px_per_au
sec_per_yr = 3.

#==== ORBITAL DATA ====
#distances are in AU, period in Earth years, angles are in degrees
data = {
'Mercury' :{'aphel':0.467,'perihel':0.307,'period':0.241,'inc':6.34,'lonasc': 48.,'argper': 29.,
            'color':'#333333','label':True},
'Venus'   :{'aphel':0.728,'perihel':0.718,'period':0.615,'inc':2.19,'lonasc': 77.,'argper': 55.,
            'color':'#CC9900','label':True},
'Earth'   :{'aphel':1.017,'perihel':0.983,'period':1.000,'inc':1.58,'lonasc':348.,'argper':114.,
            'color':'blue','label':True},
'Mars'    :{'aphel':1.667,'perihel':1.381,'period':1.881,'inc':1.67,'lonasc': 50.,'argper':287.,
            'color':'red','label':True},
'Jupiter' :{'aphel':5.458,'perihel':4.950,'period':11.86,'inc':0.32,'lonasc':100.,'argper':275.,
            'color':'orange','label':True},
'Saturn'  :{'aphel':10.12,'perihel':9.048,'period':29.46,'inc':0.93,'lonasc':114.,'argper':336.,
            'color':'green','label':True},
'Uranus'  :{'aphel':20.10,'perihel':18.28,'period':84.07,'inc':1.02,'lonasc': 74.,'argper': 97.,
            'color':'#990066','label':True},
'Neptune' :{'aphel':30.33,'perihel':29.81,'period':164.8,'inc':0.72,'lonasc':132.,'argper':273.,
            'color':'#330066','label':True}
}

#==== MAIN FUNCTION ====
def main():
    sunx = sun_data['sunx']
    suny = sun_data['suny']
    orbits_svg = []
    planets_svg = []
    for name,planet in data.items():
        #--- convert to image units ----
        perihel = planet['perihel']*px_per_au
        aphel   = planet['aphel']*px_per_au
        argperi = radians(planet['argper'])
        lonasc  = radians(planet['lonasc'])
        inc     = radians(planet['inc'])
        period  = planet['period']*sec_per_yr
    
        ecc = (aphel-perihel)/(aphel+perihel)
        amajor = (aphel+perihel)/2.
        aminor = amajor*sqrt(1.-ecc**2)
    
        params_orbit = {'name':name,
                        'x0':sunx+sin(argperi+lonasc)*cos(inc)*perihel,
                        'y0':suny+cos(argperi+lonasc)*cos(inc)*perihel,
                        'x1':sunx-sin(argperi+lonasc)*cos(inc)*aphel,
                        'y1':suny-cos(argperi+lonasc)*cos(inc)*aphel,
                        'r1':cos(inc)*amajor,
                        'r2':cos(inc)*aminor,
                        'rot':90.-degrees(argperi),
                        'stroke':planet['color'],
                        'width':3}
        params_planet = {'name':name,
                         'period':period,
                         'radius':5,
                         'color':planet['color']}
    
        orbits_svg.append(orbit_template.format(**params_orbit))
        if planet['label']:
            planets_svg.append(labeled_planet_template.format(**params_planet))
        else:
            planets_svg.append(planet_template.format(**params_planet))

    orbits = '\n'.join(orbits_svg)

    sun = sun_template.format(**sun_data)

    planets = '\n\n'.join(planets_svg)

    svg = svg_template.format(width=width,height=height,orbits=orbits,sun=sun,planets=planets)

    with open('solarsystem.svg','w') as outfile:
        outfile.write(svg)
    
#==== EXECUTE SCRIPT ====
if __name__ == "__main__":
    main()
```
