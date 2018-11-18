var image = document.getElementById('img-main');

var animations = {};
var currentAnimation = 'idle';
var currentFrame = 0;

function Point(x, y) {
    return {x: x, y: y};
}

function loadAnimationSet(name, count) {
    var frames = new Array(count);

    for(var i = 0; i < count; ++i) {
        frames[i] = new Image();
        frames[i].src = 'static/images/' + name + '/' + i + '.png';
    }

    return frames;
}

function loadAnimationSets() {
    animations['idle'] = loadAnimationSet('idle', 17);
    animations['stop'] = loadAnimationSet('stop', 5);
    animations['stop_idle'] = loadAnimationSet('stop_idle', 6);
    animations['dab'] = loadAnimationSet('dab', 9); // sorry not sorry
    animations['beat'] = loadAnimationSet('beat', 14);
}

function tick() {
    if(++currentFrame >= animations[currentAnimation].length) {
        switch(currentAnimation) {
            case 'stop':
                currentAnimation = 'stop_idle';
                break;

            case 'dab':
                currentAnimation = 'idle';
                break;
        }

        currentFrame = 0;
    }

    image.src = animations[currentAnimation][currentFrame].src;
}

image.addEventListener('dragstart', function(e) { e.preventDefault(); });

loadAnimationSets();
setInterval(tick, 75);

var swipeTimer;
var swipeStartPosition;

// TODO: fix this heaping pile of garbage
document.addEventListener('mousedown', function(e) {
    swipeTimer = Date.now();
    swipeStartPosition = Point(e.offsetX, e.offsetY);

    if(currentAnimation === 'idle') {
        currentAnimation = 'beat';
        currentFrame = 0;
    }
});

document.addEventListener('mouseup', function(e) {
    var timeDelta = Date.now() - swipeTimer;
    var positionDelta = Point(e.offsetX - swipeStartPosition.x, e.offsetY - swipeStartPosition.y);
    var velocity = Point(positionDelta.x / timeDelta, positionDelta.y / timeDelta);

    if(currentAnimation === 'beat') {
        currentAnimation = 'idle';
        currentFrame = 0;
    }

    if(velocity.x < -0.5 && velocity.y -0.5) {
        currentAnimation = 'dab';
        currentFrame = 0;
    } else if(velocity.x > 0.5 && velocity.y > 0.5) {
        if(currentAnimation !== 'stop_idle') {
            currentAnimation = 'stop';
            currentFrame = 0;
        }
    }
});