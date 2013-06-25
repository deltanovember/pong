(function() {

    var BALL_RADIUS = 20;
    var PAD_WIDTH = 8;
    var PAD_HEIGHT = 80;

    var WIDTH = 600;
    var HEIGHT = 400; 

    var HALF_PAD_WIDTH = PAD_WIDTH / 2;
    var HALF_PAD_HEIGHT = PAD_HEIGHT / 2;
    var paddle1_pos = [HALF_PAD_WIDTH, (HEIGHT - PAD_HEIGHT) / 2];
    var paddle2_pos = [WIDTH - PAD_WIDTH + HALF_PAD_WIDTH, (HEIGHT - PAD_HEIGHT) / 2];
    var ball_pos = [WIDTH / 2, HEIGHT / 2];
    var paddle1_vel = [0, 0];
    var paddle2_vel = [0, 0];
    var PADDLE_VEL = 5;
    var vel = [8, 2];
    var p1_score = 0;
    var p2_score = 0;

    var socket = io.connect('http://192.168.1.2');


    // shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();


    var body = document.getElementById('body');
    body.onkeydown = function(e) {

        // down
        if (e.keyCode == 40) {
            paddle2_vel[1] = PADDLE_VEL;

        } else if (e.keyCode == 38) {
            // up
            paddle2_vel[1] = -PADDLE_VEL;
        } else if (e.keyCode == 87) {
            // w
            paddle1_vel[1] = -PADDLE_VEL;

        } else if (e.keyCode == 83) {
            // 's'
             paddle1_vel[1] = PADDLE_VEL;

        }

    };

    body.onkeyup = function(e) {
        if (e.keyCode == 38 || e.keyCode == 40) {
            // up
            paddle2_vel[1] = 0;
        } else if (e.keyCode == 87 || e.keyCode == 83) {
            // w
            paddle1_vel[1] = 0;

        }

    };

    (function animateLoop(){
        requestAnimFrame(animateLoop);
        draw();
    })();


    // helper function that spawns a ball by updating the 
    // ball's position vector and velocity vector
    // if right is True, the ball's velocity is upper right, else upper left
    function ballInit(right) {
        ball_pos = [WIDTH / 2, HEIGHT / 2];
        vel[0] = -Math.random() * 3  + 6;
        vel[1] = -Math.random() * 3 + 3;
        if (right)
            vel[0] = -vel[0];
    } 

    // pos - top left
    function drawPaddle(context, pos) {
        var top_right = [pos[0] + PAD_WIDTH, pos[1]]
        var bottom_left = [pos[0], pos[1] + PAD_HEIGHT]
        var bottom_right = [pos[0] + PAD_WIDTH, pos[1] + PAD_HEIGHT]

        context.beginPath();
        context.lineWidth = 10;

        context.moveTo(pos[0], pos[1]);
        context.lineTo(bottom_left[0], bottom_left[1]);
        context.stroke();
        context.lineWidth = 1;

    } 

    function getBallEndPoint(startPos) {
        return [ball_pos[0] + BALL_RADIUS, ball_pos[1]];
    }


    function draw() {

    	var context = canvas.getContext("2d");

        if (canvas.getContext) {

        	context.fillStyle   = '#FFFFFF'; // set canvas background color
        	context.strokeStyle = '#000000';
        	context.fillRect  (0, 0, canvas.width, canvas.height);  // now fill the canvas
        	context.strokeRect  (0, 0, canvas.width, canvas.height);  // now fill the canvas
                
            context.font = '40pt Calibri';
            context.fillStyle = '#000000';  // set text color
        	context.fillText(p1_score, 100, 50);
        	context.fillText(p2_score, 450, 50);

            // update paddle's vertical position, keep paddle on the screen
            var p1y = paddle1_pos[1] + paddle1_vel[1];
            var p2y = paddle2_pos[1] + paddle2_vel[1];
            if (p1y >= 0 && (p1y + PAD_HEIGHT) <= HEIGHT) {   
                paddle1_pos[1] += paddle1_vel[1];
            }
            if (p2y >= 0 && (p2y + PAD_HEIGHT) <= HEIGHT) {
                paddle2_pos[1] += paddle2_vel[1];
            }

            // draw mid line and gutters
            context.beginPath();
            context.moveTo(WIDTH / 2, 0);
            context.lineTo(WIDTH / 2, HEIGHT);
            context.fill();

            context.moveTo(PAD_WIDTH, 0);
            context.lineTo(PAD_WIDTH, HEIGHT);

            context.moveTo(WIDTH - PAD_WIDTH, 0);
            context.lineTo(WIDTH - PAD_WIDTH, HEIGHT); 
            context.stroke();          

            drawPaddle(context, paddle1_pos);
            drawPaddle(context, paddle2_pos); 

            var centerX = canvas.width / 2;
            var centerY = canvas.height / 2;

            // update ball
            ball_pos[0] = ball_pos[0] + vel[0];
            ball_pos[1] = ball_pos[1] + vel[1];


            // draw ball and scores
            context.beginPath();
            context.arc(ball_pos[0], ball_pos[1], BALL_RADIUS, 0, 2 * Math.PI, false);
            context.fillStyle = 'green';
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = '#003300';
            context.stroke();

            // check top/bottom collisions
            if (ball_pos[1] <= BALL_RADIUS || ball_pos[1] >= HEIGHT - BALL_RADIUS) {
                vel[1] = -vel[1];
            }       

            function withinPaddle(paddle_pos, paddle_height, ball_y) {
                return ball_y > (paddle_pos[1] - paddle_height/4) && ball_y < paddle_pos[1] + paddle_height*1.25;
            }
        
            // check gutter collisions
            var accel = 1.1;

            if ((ball_pos[0] - BALL_RADIUS <= PAD_WIDTH) || (ball_pos[0] + BALL_RADIUS >= WIDTH - PAD_WIDTH)) {
                //paddle collisions
            
                if (ball_pos[0] + BALL_RADIUS >= WIDTH - PAD_WIDTH && withinPaddle(paddle2_pos, PAD_HEIGHT, ball_pos[1])) {
                    vel[0] = -vel[0] * accel;
                }
                else if (ball_pos[0] - BALL_RADIUS <= PAD_WIDTH && withinPaddle(paddle1_pos, PAD_HEIGHT, ball_pos[1])) {
                    vel[0] = -vel[0] * accel;
                } 
                else {
                    if (ball_pos[0] - BALL_RADIUS <= PAD_WIDTH)
                        p2_score += 1;
                    if (ball_pos[0] + BALL_RADIUS >= WIDTH - PAD_WIDTH)
                        p1_score += 1;
                    right = vel[0] < 0;
                    ballInit(right);
                }                   
            }    

        }

    }

    function newGame() {
        var left = Math.random() > 0.5;
        ballInit(left);
    }    

    function reset() {
        p1_score = 0;
        p2_score = 0;
        left = Math.random() > 0.5;
        ball_init(left);
    }

})();
