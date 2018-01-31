function background_tubes(){
    var body = document.body,
        html = document.documentElement;
    
    var height = Math.max( body.scrollHeight, body.offsetHeight, 
                           html.clientHeight, html.scrollHeight,
                           html.offsetHeight );
    var width = body.clientWidth;

    var svg = d3.select("body")
                .insert('svg', ':first-child')
                .attr('width', width)
                .attr('height', height)
                .attr('style', 'position:absolute;z-index:-1')
    
    var all_lines_data = [];
    var tube_width = width/10;
    var tube_skew = 10;
    var tube_bow = width/10;
    var normalize = function(x, y){
        return Math.sqrt(x*x + y*y);
    }
    
    for(var j=0; j<2; j++){
        var n_path = height/20;
        var path = [];
        var x_old = Math.random()*width;
        var y_old = 0;
        var x_dir = -(x_old - width/2)/150;
        var y_dir = -(y_old - height/2)/150;
        for(var i=0; i<n_path; i++){
            var x_dir = x_dir + 1-2*Math.random();
            var y_dir = y_dir + 1-2*Math.random();
            var norm = normalize(x_dir, y_dir);
            x_old = x_old + x_dir/norm*2*width/n_path;
            y_old = y_old + y_dir/norm*2*height/n_path;
            path.push({x: x_old, y: y_old});
        }
        //for(var i=0; i<path.length; i++){
        //    svg.append('circle')
        //        .attr('cx', path[i].x)
        //        .attr('cy', path[i].y)
        //        .attr('r', 2);
        //}
    
        lines = draw_tube(tube_width, tube_skew, tube_bow, path);
        lines.style('stroke', 'black');
        lines.style('opacity', 0.07);
    }
    
    function draw_tube(tube_width, tube_skew, tube_bow, path){
        var get_directions = function(path){
            directions = []
            for(var i=0; i<path.length-1; i++){
                var x = path[i+1].x - path[i].x
                var y = path[i+1].y - path[i].y
                directions.push({x:x, y:y})
            }
            return directions
        }
    
        var random_corner = function(center, spread){
            var fraction = Math.random();
            return center +  (1-2*fraction) * spread;
        }
    
        var linear_interpolation = function(value1, value2, fraction){
            return value1 + fraction * (value2 - value1);
        }
    
        var get_line = function(y_center){
            var x1 = random_corner(-tube_width/2, tube_width);
            var y1 = random_corner(0, tube_skew);
    
            var x2 = random_corner(tube_width/2, tube_width);
            var y2 = random_corner(0, tube_skew);
    
            var fraction = 0.5*(1-2*Math.random());
            var x1c = linear_interpolation(x1, x2, fraction);
            var y1c = random_corner(0, tube_bow);
    
            var x2c = linear_interpolation(x1, x2, 1-fraction);
            var y2c = random_corner(0, tube_bow);
    
            return {x1:x1, y1:y1, x1c:x1c, y1c:y1c, x2c:x2c, y2c:y2c, x2:x2,
                    y2:y2}
        }
    
        var interpolate_lines = function(line1, line2, fraction){
            return {x1: linear_interpolation(line1.x1, line2.x1, fraction),
                    y1: linear_interpolation(line1.y1, line2.y1, fraction),
                    x1c: linear_interpolation(line1.x1c, line2.x1c, fraction),
                    y1c: linear_interpolation(line1.y1c, line2.y1c, fraction),
                    x2c: linear_interpolation(line1.x2c, line2.x2c, fraction),
                    y2c: linear_interpolation(line1.y2c, line2.y2c, fraction),
                    x2: linear_interpolation(line1.x2, line2.x2, fraction),
                    y2: linear_interpolation(line1.y2, line2.y2, fraction)}
        }
    
        var to_path = function(path_node, dir, x, y){
            return {x: path_node.x + y * dir.x - x * dir.y,
                    y: path_node.y + y * dir.y + x * dir.x};
        }
    
        var directions = get_directions(path);
        var line_to_path = function(line, float_index){
            var index = Math.floor(float_index);
            var dir = directions[index];
            var norm_dir = normalize(dir.x, dir.y);
            var normed_dir = {x: dir.x/norm_dir,
                              y: dir.y/norm_dir};
            var path_node = {x: path[index].x + (float_index - index) * dir.x,
                             y: path[index].y + (float_index - index) * dir.y};
    
            var point1 = to_path(path_node, normed_dir, line.x1, line.y1);
            var point1c = to_path(path_node, normed_dir, line.x1c, line.y1c);
            var point2c = to_path(path_node, normed_dir, line.x2c, line.y2c);
            var point2 = to_path(path_node, normed_dir, line.x2, line.y2);
    
            return {x1: point1.x,
                    y1: point1.y,
                    x1c: point1c.x,
                    y1c: point1c.y,
                    x2c: point2c.x,
                    y2c: point2c.y,
                    x2: point2.x,
                    y2: point2.y}
        }
    
        var x_center = 0;
        var y_center = 0;
        var n_interp = 20;
    
        tube_nodes = [];
        var line1 = line_to_path(get_line(x_center, y_center), 0);
        for(var i=1; i<path.length-1; i++){//10 sublines
            var x_center = tube_width/2*(Math.random()-0.5)
            var y_center = i/path.length;
            line2 = line_to_path(get_line(x_center, y_center), i);
            for(var j=0; j<n_interp; j++){
                var fraction = j/n_interp;
                var line = interpolate_lines(line1, line2, fraction);
                tube_nodes.push(line);
            }
            line1 = line2;
        }
    
        var lines = svg.append('g').attr('id', 'tube').selectAll('.sublines')
            .data(tube_nodes).enter().append('g');
    
        lines.append('path')
            .attr('d', function(d, i) {
                path_line =  'M ' + d.x1 + ',' + d.y1
                path_line += 'C ' + d.x1c + ',' + d.y1c + ' '
                path_line += + d.x2c + ',' + d.y2c + ' '
                path_line += + d.x2 + ',' + d.y2
                return path_line;
                })
             .style('stroke-width', 1)
             .style('fill', 'none');
          return lines;
    }
}
