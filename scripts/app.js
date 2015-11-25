window.addEventListener("load",init(1,1));
function init(level, max){

    // Matter module aliases
    var Engine = Matter.Engine,
        World = Matter.World,
        Body = Matter.Body,
        Bodies = Matter.Bodies,
        Common = Matter.Common,
        Composites = Matter.Composites,
        Composite = Matter.Composite,
        Events = Matter.Events,
        MouseConstraint = Matter.MouseConstraint;

    // create a Matter.js engine
    var engine = Engine.create(document.body, {
        render: {
            options: {
                showAngleIndicator: true,
                wireframes: true,
            }
        }
    });

    // add a mouse controlled constraint
    var mouseConstraint = MouseConstraint.create(engine);
    World.add(engine.world, mouseConstraint);
    //the left box
    var superman = Bodies.rectangle(35,320, 15, 15, {});

    // the right string goal
    var target = Bodies.rectangle(770 ,315, 15, 1, {isStatic: true});

    //compare the current level with the max to get the max level record
    max = Math.max(max, level);

    //show the max level record and the current level
    var levelshow = document.createElement('h2');
    levelshow.innerHTML = 'Max Level:' + "<br />" + max + "<br />" + "<br />" + "<br />"
        + 'Current Level:' + "<br />" + level;
    document.body.appendChild(levelshow);

    //add the box, the target, the starting building and the ending building
    World.add(engine.world, [
            Bodies.rectangle(760,450, 40, 255, {isStatic:true}),
            Bodies.rectangle(35,450, 30, 255, {isStatic:true}),
            Bodies.rectangle(35, 300, 40, 5, {isStatic:true}),
            Bodies.rectangle(760,300, 40, 5, {isStatic:true}),
            superman,
            target
        ]
    )

    //make the explosion
    var explosion = function(engine) {
        var bodies = Composite.allBodies(engine.world);

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (!body.isStatic && body.position.y >= 500) {
                var forceMagnitude = 0.05 * body.mass;

                Body.applyForce(body, { x: 0, y: 0 }, {
                    x: (forceMagnitude + Math.random() * forceMagnitude) * Common.choose([1, -1]),
                    y: -forceMagnitude + Math.random() * -forceMagnitude
                });
            }
        }
    };

    var timeScaleTarget = 1,
        counter = 20;

    //bullet time and explosion time
    Events.on(engine, 'tick', function(event) {
        // tween the timescale for bullet time slow-mo
        engine.timing.timeScale += (timeScaleTarget - engine.timing.timeScale) * 0.05;

        counter += 1;

        // every 1.4 sec
        if (counter >= 60 * 2) {

            // flip the timescale
            if (timeScaleTarget < 1) {
                timeScaleTarget = 1;
            } else {
                timeScaleTarget = 0.05;
            }
            // create some random forces
            explosion(engine);

            // reset counter
            counter = 0;
        }
    });

    var bodyOptions = {
        frictionAir: 0,
        friction: 0.0001,
        restitution: 0.8
    };

    //pieces are all the circles that the box should avoid
    var pieces = [];
    // add some small bouncy circles...
    World.add(engine.world, Composites.stack(20, 100, 5, level, 20, 40, function(x, y, column, row) {
        var piece = Bodies.circle(x, y, Common.random(10, 20), bodyOptions);
        pieces.push(piece);
        return piece;
    }));

    //add four rectangles as the borders
    var offset = 5;
    World.add(engine.world, [
        Bodies.rectangle(400, -offset, 800 + 2 * offset, 50, { isStatic: true }),
        Bodies.rectangle(400, 600 + offset, 800 + 2 * offset, 50, { isStatic: true }),
        Bodies.rectangle(800 + offset, 300, 50, 600 + 2 * offset, { isStatic: true }),
        Bodies.rectangle(-offset, 300, 50, 600 + 2 * offset, { isStatic: true }),
    ]);


    //if there is a collision, filter out the collision has the box
    Matter.Events.on(engine,'collisionStart', function(event) {
        for (var i = 0; i < event.pairs.length; i ++) {
            // if box touches the ball, die
            if((event.pairs[i].bodyA == superman && pieces.indexOf(event.pairs[i].bodyB) > -1)
                || (event.pairs[i].bodyB == superman && pieces.indexOf(event.pairs[i].bodyA) > -1)) {
                startNew(1, false);
            }

            //if box touches the target, next level
            if((event.pairs[i].bodyA == superman && event.pairs[i].bodyB == target)
                || (event.pairs[i].bodyB == superman && event.pairs[i].bodyA == target)) {
                startNew(level+1, true);
            }
        }
    });

    //recevive the level number and whether the user win or lose
    //clear the current canvas and game, start a new one
    function startNew(newLevel, win) {
        World.remove(engine.world, mouseConstraint);
        engine.events = {};
        var btn = document.createElement("button");
        if(win) {
            var t = document.createTextNode("Next Level");
        } else {
            var t = document.createTextNode("Try Again");
        }
        btn.className = 'button';
        btn.onclick = function() {
            var element = document.getElementsByTagName('canvas');
            document.body.removeChild(element[0]);
            document.body.removeChild(btn);
            document.body.removeChild(levelshow);
            init(newLevel, max);
        }
        btn.appendChild(t);
        document.body.appendChild(btn);
    }



    // run the engine
    Engine.run(engine);

}