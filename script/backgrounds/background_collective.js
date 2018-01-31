function background_collective(){
        var body = document.body,
            html = document.documentElement;
        
        var canvasH = Math.max( body.scrollHeight, body.offsetHeight, 
                               html.clientHeight, html.scrollHeight,
                               html.offsetHeight );
        var canvasW = body.clientWidth;

        var canvas = document.createElement('canvas');
        canvas.id = 'background';
        canvas.width = canvasW;
        canvas.height = canvasH;
        canvas.setAttribute('style', 'position:absolute;z-index:-1')
        
        document.body.insertBefore(canvas, document.body.firstChild);

        var PI_2        = Math.PI * 2;
        
        var numMovers   = 60;
        var movers      = [];
        
        var canvas;
        var ctx;
        
        function init(){
                if ( canvas.getContext ){
                        setup();
                        setInterval( run , 50 );
                }
        }

        function setup(){
                ctx       = canvas.getContext("2d");
                
                var i = numMovers;
                while ( i-- ){
                        var m = new Mover();
                        m.x   = Math.random() * canvasW;
                        m.y   = Math.random() * canvasH;
                        m.vX  = (Math.random() - 0.5) * 2.0;
                        m.vY  = (Math.random() - 0.5) * 2.0;
                        movers[i] = m;
                }                
        }

        function run(){
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = "rgba(255,255,255,0.02)";
                ctx.fillRect( 0 , 0 , canvasW , canvasH );
                ctx.globalCompositeOperation = "darker";
                
                var interaction_range = 50.0;
                var velocity = 1;
                
                var i = numMovers;
                while ( i-- ){
                        var m  = movers[i];
                        var j = numMovers;
                        var vmeanx = 0.0;
                        var vmeany = 0.0;
                        while (j--){
                                var mj = movers[j];
                             
                                dX = (m.x - mj.x);
                                dX -= Math.floor(dX/canvasW)*canvasW;
                                dY = (m.y - mj.y);
                                dY -= Math.floor(dY/canvasH)*canvasH;

                                var D  = Math.sqrt( dX * dX + dY * dY ) || 1e-4;
                                if ( D < interaction_range){;
                                    vmeanx += mj.vX;
                                    vmeany += mj.vY;
                                    }
                                }
                        var vXnew = vmeanx + 0.2 * (Math.random() - 0.5);
                        var vYnew = vmeany + 0.2 * (Math.random() - 0.5);

                        var norm = Math.sqrt(vXnew*vXnew + vYnew*vYnew) || 1e-4;
                        vXnew /= norm;
                        vYnew /= norm;
                        
                        var nextX = m.x + velocity*vXnew;
                        var nextY = m.y + velocity*vYnew;

                        nextX -= Math.floor(nextX/canvasW) * canvasW;
                        nextY -= Math.floor(nextY/canvasH) * canvasH;
                        
                        m.vX = vXnew;
                        m.vY = vYnew;
                        m.x  = nextX;
                        m.y  = nextY;
                        
                        ctx.fillStyle = m.color;
                        ctx.beginPath();
                        ctx.arc(nextX, nextY, 1.0 , 0 , PI_2 , true );
                        ctx.closePath();
                        ctx.fill(); 
                }
        }
        function Mover(){
                this.color = "rgba(100,100,100, 0.5)";
                this.y     = 0;
                this.x     = 0;
                this.vX    = 0;
                this.vY    = 0;
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
}
