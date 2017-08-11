(function(){
    // Polyfill
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback){window.setTimeout(callback, 1000 / 60)}
    })();

    let canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        width = canvas.width = 640,
        height = canvas.height = 480,
        speed, cellSize, direction, item, score, snake,
        _oldFrame, _newFrame, _deltaTime, acc, keyboardLocked

    //Event Listeners
    window.addEventListener("keydown", (event)=>{
        event.preventDefault()
        event.stopPropagation()
        if(!keyboardLocked){
            keyboardLocked = !keyboardLocked;
            switch(event.keyCode){
                case 87: //UP
                case 38:
                    if(direction != 'D') direction = 'U'
                    break
                case 83: //DOWN
                case 40:
                    if(direction != 'U') direction = 'D'
                    break
                case 65: //LEFT
                case 37:
                    if(direction != 'R') direction = 'L'
                    break
                case 68: //RIGHT
                case 39:
                    if(direction != 'L') direction = 'R'
                    break
            }
        }
    }, false )

    window.addEventListener("keyup", (event)=>{
        event.preventDefault()
        event.stopPropagation()
        keyboardLocked = false
    }, false)

    //Game Logic here
    function randomItemPosition(){
        let position = {
            x: ~~(Math.random() * (width - cellSize) / cellSize),
            y: ~~(Math.random() * (height - cellSize) / cellSize)
        }
        if(snake.some((body)=>{ return (body.x === position.x && body.y === position.y) })){
            randomItemPosition()
        }else{
            item = position
        }
    }

    function runGame(){
        _oldFrame = +new Date()
        cellSize = 40
        speed = 0.15
        direction = 'R'
        score = acc = 0
        keyboardLocked = false
        snake = []
        for (let i = 2; i >=0; --i){
            snake.push({ x: i, y: 0 })
        }
        randomItemPosition()
        gameLoop()
    }

    function gameLoop(){
        requestAnimFrame(gameLoop)
        _newFrame = +new Date()
        _deltaTime = (_newFrame - _oldFrame)/1000
        _oldFrame = _newFrame
        update()
        render()
    }

    function update(){
        acc += _deltaTime
        if(acc >= speed){
            acc = 0
            let snakeHeadX = snake[0].x
            let snakeHeadY = snake[0].y

            switch(direction){
                case 'U': --snakeHeadY; break
                case 'D': ++snakeHeadY; break
                case 'L': --snakeHeadX; break
                default:  ++snakeHeadX; break
            }

            //Avoid screen limits
            if(snakeHeadX < 0) snakeHeadX = (width/cellSize)-1
            if(snakeHeadY < 0) snakeHeadY = (height/cellSize)-1
            if(snakeHeadX > ((width/cellSize)-1)) snakeHeadX = 0
            if(snakeHeadY > ((height/cellSize)-1)) snakeHeadY = 0

            //Check collisions with Snake itself
            if(snake.some((body)=>{ return snakeHeadX === body.x && snakeHeadY === body.y })){
                runGame()
            }

            //Check collision with Item
            if(snakeHeadX === item.x && snakeHeadY === item.y){
                speed -= 0.005
                if(speed < 0) speed = 0.0
                ++score
                snake.unshift({ x: snakeHeadX, y: snakeHeadY })
                randomItemPosition()
            }else{
                let head = snake.pop()
                head.x = snakeHeadX
                head.y = snakeHeadY
                snake.unshift(head)
            }
        }
    }

    function render(){
        ctx.save()
        //Clear Screen
        ctx.clearRect(0, 0, width, height)
        //Draw Snake
        ctx.fillStyle = 'green'
        snake.forEach((body)=>{
            ctx.fillRect(body.x * cellSize, body.y * cellSize, cellSize, cellSize)
        })
        //Draw head in other color
        ctx.fillStyle = '#014b01'
        ctx.fillRect(snake[0].x * cellSize, snake[0].y * cellSize, cellSize, cellSize)
        //Draw Item
        ctx.fillStyle = 'orange'
        ctx.fillRect(item.x * cellSize, item.y * cellSize, cellSize, cellSize)

        ctx.fillStyle = 'purple'
        ctx.font = '32px helvetica';
        ctx.fillText('score: ' + score, width-200, height-20);
        ctx.restore()
    }

    runGame()
})()