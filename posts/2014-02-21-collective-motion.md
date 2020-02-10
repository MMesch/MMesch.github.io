---
title: collective motion model
class: post
---

This is a collective motion simulation that I have done while working in Biophysics.
It is based upon the Vicsek model (<a href="https://en.wikipedia.org/wiki/Vicsek_model">Wikipedia article</a>).
Essentially each particle (fish, locust, bird...) adjusts its movement direction to its neighbours while always retaining the same speed.
This is similar to a ferromagnet where particles adjust their spins but don't change position.
As the magnet, the moving system can show a "phase transition" from unordered to swarm-like, depending on the strength of the random perturbations.
Interestingly a similar effect of organized motion can be observed if particles repel each other (<a href="http://iopscience.iop.org/1367-2630/10/2/023036">Grossman, Aranson and Jacob 2008</a>)

<script type="text/javascript">
(function(){
        
        var PI_2        = Math.PI * 2;
        
        var canvasW     = 500;
        var canvasH     = 500;
        var numMovers   = 100;
        var movers      = [];
        
        var canvas;
        var ctx;
        var canvasDiv;
        var outerDiv;
        
        var mouseX;
        var mouseY;
        var mouseVX;
        var mouseVY;
        var prevMouseX;
        var prevMouseY;
        var isMouseDown;


        function init(){
                canvas = document.getElementById("mainCanvas");
                
                if ( canvas.getContext ){
                        setup();
                        setInterval( run , 33 );
                }
        }
           
        function setup(){
                outerDiv  = document.getElementById("outer");
                canvasDiv = document.getElementById("canvasContainer");
                ctx       = canvas.getContext("2d");
                
                var i = numMovers;
                while ( i-- ){
                        var m = new Mover();
                        m.x   = Math.random();
                        m.y   = Math.random();
                        m.vX  = (Math.random()-0.5)*2.0;
                        m.vY  = (Math.random()-0.5)*2.0;
                        movers[i] = m;
                }                
        }

        function run(){
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = "rgba(255,255,255,0.2)";
                ctx.fillRect( 0 , 0 , canvasW , canvasH );
                ctx.globalCompositeOperation = "darker";
                
                mouseVX    = mouseX - prevMouseX;
                mouseVY    = mouseY - prevMouseY;
                prevMouseX = mouseX;
                prevMouseY = mouseY;
                var size = 1.0;
                
                var toDist   = 0.1;
                
                var i = numMovers;
                while ( i-- ){
                        var m  = movers[i];
                        var x  = m.x;
                        var y  = m.y;
                        var vX = m.vX;
                        var vY = m.vY;
                        var j = numMovers;
                        var vmeanx = 0.0;
                        var vmeany = 0.0;
                        while (j--){
                                var jm = movers[j];
                                var jx  = jm.x;
                                var jy  = jm.y;
                                var jvX = jm.vX;
                                var jvY = jm.vY;
                             
                                dX = (x - jx);
                                dX -= Math.round(dX/size)*size;
                                dY = (y - jy);
                                dY -= Math.round(dY/size)*size;
                                var D  = Math.sqrt( dX * dX + dY * dY ) || 0.0001;
                                if ( D < toDist){;
                                    vmeanx += jvX;
                                    vmeany += jvY;
                                    }
                                }
                        var rndangle = 2.0*Math.PI/360.0 * 40.0*(Math.random()*2.0-1.0);
                        var vXnew = vmeanx * Math.cos(rndangle) - vmeany * Math.sin(rndangle);
                        var vYnew = vmeanx * Math.sin(rndangle) + vmeany * Math.cos(rndangle);

                        var norm = Math.sqrt(vXnew*vXnew + vYnew*vYnew) || 0.0001;
                        vXnew /= norm;
                        vYnew /= norm;
                        
                        var nextX = x + toDist*1e-1*vXnew;
                        var nextY = y + toDist*1e-1*vYnew;

                        nextX = nextX.mod(size);
                        nextY = nextY.mod(size);
                        
                        m.vX = vXnew;
                        m.vY = vYnew;
                        m.x  = nextX;
                        m.y  = nextY;
                        
                        ctx.fillStyle = m.color;
                        ctx.beginPath();
                        ctx.arc(nextX*canvasW/size, nextY*canvasH/size , 5.0 , 0 , PI_2 , true );
                        ctx.closePath();
                        ctx.fill(); 
                }
        }
        Number.prototype.mod = function(n) {
        return ((this%n)+n)%n;
        }
        function Mover(){
                this.color = "rgb(0,0,0)";
                this.y     = 0;
                this.x     = 0;
                this.vX    = 0;
                this.vY    = 0;
                this.size  = 1; 
        }

        function log(msg) {
            setTimeout(function() {
                throw new Error(msg);
            }, 0);
        }

        function rect( context , x , y , w , h ){
                context.beginPath();
                context.rect( x , y , w , h );
                context.closePath();
                context.fill();
        }

        window.onload = init;
        
})();
</script>

<br />
<div align="center" id="outer" style="margin-bottom: 50px; margin-top: 50px;">
<div id="canvasContainer">
<canvas height="500" id="mainCanvas" width="500"></canvas>
 </div>
</div>

I started the code based upon an example by Daniel Puhe (<a href="http://www.spielzeugz.de/lab/">www.spielzeugz.de</a>).
