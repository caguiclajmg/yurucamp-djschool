const overlay = document.getElementById('screen-overlay');
const image = document.getElementById('img-main');
const music = document.getElementById('audio-music');
const overlayText = document.getElementById('overlay-text');
const scoreText = document.getElementById('score-text');

const actions = [
    {
        id: 1,
        time: 2.506,
        action: "stop"
    },
    {
        id: 2,
        time: 11.750,
        action: "dab"
    },
    {
        id: 3,
        time: 16.275,
        action: "stop"
    },
    {
        id: 4,
        time: 18.481,
        action: "dab"
    }
];

let score = 0;
let run = false;
let animations = {};
let currentAnimation = 'idle';
let currentFrame = 0;
let activeActions = actions;

function Point(x, y) {
    return {x: x, y: y};
}

scoreText.addEventListener('transitionend', () => {
    scoreText.classList.remove('pulse-miss');
    scoreText.classList.remove('pulse-good');
    scoreText.classList.remove('pulse-great');
    void scoreText.offsetWidth;
});

function loadAnimationSet(name, count) {
    let frames = new Array(count);

    for(let i = 0; i < count; ++i) {
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

function pulseScore(type) {
    scoreText.classList.remove(type);
    void scoreText.offsetWidth;
    scoreText.classList.add(type);
}

function gameTick() {
    if(!run) return;

    const currentTime = music.currentTime;
    const expiredActions = activeActions.filter(action => (currentTime - action.time) > 0.5);
    expiredActions.forEach(expiredAction => {
        activeActions = activeActions.filter(action => action.id !== expiredAction.id);
        score -= 25;

        pulseScore('pulse-miss');

        scoreText.textContent = `Score: ${score}`;
    });
}

function actionEvent(animation) {
    const currentTime = music.currentTime;
    const targetActions = activeActions.filter(action => Math.abs(currentTime - action.time) <= 0.5);

    targetActions.forEach(targetAction => {
        if(targetAction.action === animation) {            
            activeActions = activeActions.filter(action => action.id !== targetAction.id);

            const diff = Math.abs(targetAction.time - currentTime);
            switch(true) {
                case (diff < 0.25):
                    score += 50;
                    pulseScore('pulse-great');
                    break;
                    
                default:
                    score += 25;
                    pulseScore('pulse-good');
            }

            scoreText.textContent = `Score: ${score}`;
        }
    });
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
    let timeDelta = Date.now() - swipeTimer;
    let positionDelta = Point(position.x - swipeStartPosition.x, position.y - swipeStartPosition.y);
    let velocity = Point(positionDelta.x / timeDelta, positionDelta.y / timeDelta);

    if(currentAnimation === 'beat') {
        currentAnimation = 'idle';
        currentFrame = 0;
    }

    if(velocity.x < -0.5 && velocity.y -0.5) {
        currentAnimation = 'dab';
        currentFrame = 0;

        actionEvent('dab');
    } else if(velocity.x > 0.5 && velocity.y > 0.5) {
        if(currentAnimation !== 'stop_idle') {
            currentAnimation = 'stop';
            currentFrame = 0;

            actionEvent('stop');
        }
    }
}

let swipeTimer = Date.now();
let swipeStartPosition = Point(0, 0);

image.addEventListener('dragstart', function(e) { e.preventDefault(); });

loadAnimationSets();
image.src = animations[currentAnimation][currentFrame].src;

setInterval(tick, 75);
setInterval(gameTick, 25);

function absorbEvent(e) {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}

window.addEventListener('load', function() {
    overlayText.innerHTML = "Tap to start!";
    overlayText.classList.add('pulse');

    overlay.addEventListener('click', function() {
        overlay.style.display = 'none';
        run = true;
    });
});

image.addEventListener('contextmenu', absorbEvent);

image.addEventListener('touchstart', function(e) {
    actionDown(Point(e.changedTouches[0].pageX, e.changedTouches[0].pageY));
});

image.addEventListener('touchend', function(e) {
    actionUp(Point(e.changedTouches[0].pageX, e.changedTouches[0].pageY));
});

image.addEventListener('mousedown', function(e) { actionDown(Point(e.offsetX, e.offsetY)); });
image.addEventListener('mouseup', function(e) { actionUp(Point(e.offsetX, e.offsetY)); });

scoreText.textContent = `Score: ${score}`;