---
title: collective motion model
class: post
thumbnail: "/images/thumbnails/collective_motion_animation.png"
---

This is a collective motion simulation that I have done while working in Biophysics.
It is based upon the Vicsek model (<a href="https://en.wikipedia.org/wiki/Vicsek_model">Wikipedia article</a>).
Essentially each particle (fish, locust, bird...) adjusts its movement direction to its neighbours while always retaining the same speed.
This is similar to a ferromagnet where particles adjust their spins but don't change position.
As the magnet, the moving system can show a "phase transition" from unordered to swarm-like, depending on the strength of the random perturbations.
Interestingly a similar effect of organized motion can be observed if particles repel each other (<a href="http://iopscience.iop.org/1367-2630/10/2/023036">Grossman, Aranson and Jacob 2008</a>)

<script src="/content/2014-02-21-collective-motion.js"></script>

<br />
<div align="center" id="outer" style="margin-bottom: 50px; margin-top: 50px;">
<div id="canvasContainer">
<canvas height="500" id="mainCanvas" width="500"></canvas>
 </div>
</div>

I started the code based upon an example by Daniel Puhe (<a href="http://www.spielzeugz.de/lab/">www.spielzeugz.de</a>).
