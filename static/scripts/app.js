const overlay = document.getElementById('screen-overlay');
const image = document.getElementById('img-main');
const music = document.getElementById('audio-music');

var run = false;
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
    if(!run) return;
    if(music.paused) music.play();

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

function actionDown(position) {
    swipeTimer = Date.now();
    swipeStartPosition = position;

    if(currentAnimation === 'idle') {
        currentAnimation = 'beat';
        currentFrame = 0;
    }
}

function actionUp(position) {
    var timeDelta = Date.now() - swipeTimer;
    var positionDelta = Point(position.x - swipeStartPosition.x, position.y - swipeStartPosition.y);
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
}

var swipeTimer = Date.now();
var swipeStartPosition = Point(0, 0);

image.addEventListener('dragstart', function(e) { e.preventDefault(); });

loadAnimationSets();
image.src = animations[currentAnimation][currentFrame].src;

setInterval(tick, 75);

function absorbEvent(e) {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}

overlay.addEventListener('click', function() {
    overlay.style.display = 'none';
    run = true;
});

image.addEventListener('contextmenu', absorbEvent);

//image.addEventListener('click', function(e) { if(!run) run = true; });

image.addEventListener('touchstart', function(e) {
    actionDown(Point(e.changedTouches[0].pageX, e.changedTouches[0].pageY));
});

image.addEventListener('touchend', function(e) {
    actionUp(Point(e.changedTouches[0].pageX, e.changedTouches[0].pageY));
});

image.addEventListener('mousedown', function(e) { actionDown(Point(e.offsetX, e.offsetY)); });
image.addEventListener('mouseup', function(e) { actionUp(Point(e.offsetX, e.offsetY)); });
