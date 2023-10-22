import Phaser from "phaser"
import playerConfig from "./playerConfig"

export default class GameScene extends Phaser.Scene {
  private WIDTH: number = 800
  private HEIGHT: number = 800
  private wasd: any
  private playerKeys: any
  private ball: any
  private velocity: number
  private ballVelocity: number
  private backendUrl: string
  private players: any[]
  private posts: any[]
  //Phaser text elements which are rendered
  private scores: any[]
  //array of numbers from where the text elements fetch the scores
  private scoreNumbers: number[]

  constructor() {
    super("hello-world")
  }

  preload() {
    this.load.setBaseURL("https://labs.phaser.io")

    this.load.image("wall", "https://i.imgur.com/WQUKFVC.png")
    this.load.image("wall2", "https://i.imgur.com/YD8kW9f.png")
    this.load.image("ball", "https://i.imgur.com/xtFdsIU.png")
    this.load.image("post", "https://i.imgur.com/9LJC7V8.png")

    this.velocity = 800
    this.ballVelocity = 400

    this.backendUrl = `http://localhost:${import.meta.env.PUBLIC_BACKEND_PORT}`
    this.players = []
    this.posts = []
    this.scores = []
    this.scoreNumbers = [10,10,10,10]
  }

  create() {
    this.wasd = {
      up: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    this.playerKeys = {
      0: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      1: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      2: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      3: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    }

    this.ball = this.add.sprite(400, 300, "ball")
    this.physics.world.enable(this.ball)
    this.ball.body!.velocity.set(this.ballVelocity, (Math.random()*2 - 1)*400)
    this.ball.body!.setBounce(1)
    this.ball.body!.collideWorldBounds = false
    this.ball.onPlayerOnePaddle = false
    this.ball.onPlayerTwoPaddle = false
    this.ball.onPlayerThreePaddle = false
    this.ball.onPlayerFourPaddle = false

    this.posts[0] = this.add.sprite(0,0, "post")
    this.posts[1] = this.add.sprite(this.WIDTH,0, "post")
    this.posts[2] = this.add.sprite(0, this.HEIGHT, "post")
    this.posts[3] = this.add.sprite(this.WIDTH, this.HEIGHT, "post")

    for (let i = 0; i < this.posts.length; i++) {
      this.physics.world.enable(this.posts[i])
      this.posts[i].setScale(2)
      this.posts[i].body!.setBounce(1)
      this.posts[i].body!.immovable = true
      this.physics.add.collider(this.ball, this.posts[i])
    }

  }

  update() {
    this.checkPlayers()
    this.players.forEach((player, i) => {
      if(this.scoreNumbers[i] > 0){
        this.movePaddle(i as keyof typeof playerConfig)
        this.updateScorePosition(i as keyof typeof playerConfig)
      }
    })
    this.ballCollision()

    //Dont apply these to the walls which replace lost players
    if (this.ball.onPlayerOnePaddle) {
      this.increaseBallSpeed()
      this.calculateXCollisions(this.players[0], 1)
    }
    if (this.ball.onPlayerTwoPaddle) {
      this.increaseBallSpeed()
      this.calculateYCollisions(this.players[1], 1)
    }
    if (this.ball.onPlayerThreePaddle) {
      this.increaseBallSpeed()
      this.calculateXCollisions(this.players[2], -1)
    }
    if (this.ball.onPlayerFourPaddle) {
      this.increaseBallSpeed()
      this.calculateYCollisions(this.players[3], -1)
    }

    //check if ball out of play, change scores
    if(this.ball.x > this.WIDTH+25){
      this.ballLost()
      if(this.players.length === 4){
        this.scoreNumbers[3] -= 1
        if(this.scoreNumbers[3] == 0){
          this.replacePlayerWithWall(3)
        }
      }
    } else if(this.ball.x < -25){
      this.ballLost()
      if(this.players.length === 4){
        this.scoreNumbers[1] -= 1
        if(this.scoreNumbers[1] == 0){
          this.replacePlayerWithWall(1)
        }
      }
    } else if(this.ball.y < -25){
      this.ballLost()
      if(this.players.length === 4){
        this.scoreNumbers[0] -= 1
        if(this.scoreNumbers[0] == 0){
          this.replacePlayerWithWall(0)
        }
      }
    } else if(this.ball.y > this.HEIGHT+25){
      this.ballLost()
      if(this.players.length === 4){
        this.scoreNumbers[2] -= 1
        if(this.scoreNumbers[2] == 0){
          this.replacePlayerWithWall(2)
        }
      }
    }

    if(this.players.length === 4){
      this.updateScores()
    }
  }

  addplayer(playerNo: keyof typeof playerConfig) {
    const config = playerConfig[playerNo]
    this.scoreNumbers[playerNo] = config.hp
    const player: any =
      config.direction === "y"
        ? this.add.sprite(config.spawn.x, config.spawn.y, "wall")
        : this.add.sprite(config.spawn.x, config.spawn.y, "wall2")
    player.setOrigin(0.5, 0.5)
    const hitpoints: any = this.add.text(config.spawn.x-10, config.spawn.y-10, this.scoreNumbers[playerNo].toString(),{font: "16px Arial", color: "#000000", align: "center"})
    
    config.direction === "y" ? (player.scaleY = 0.33) : (player.scaleX = 0.33)
    this.physics.world.enable(player)
    player.body!.collideWorldBounds = true
    player.body!.immovable = true
    
    this.players.push(player)
    this.scores.push(hitpoints)
  }

  async getConnectionType() {
    const response = await fetch(`${this.backendUrl}/connection-type`)
    const connectionType = await response.json()
    console.log(connectionType)
  }

  checkPlayers() {
    Object.keys(this.playerKeys).forEach((key: any) => {
      if (this.playerKeys[key].isDown && !this.players[key]) {
        this.addplayer(key as keyof typeof playerConfig)
      }
    })
  }

  movePaddle(playerNo: keyof typeof playerConfig) {
    if (!this.players[playerNo]) {
      return
    }
    const config = playerConfig[playerNo]
    const player = this.players[playerNo]
    if (config.direction === "x") {
      if (this.wasd.left.isDown) {
        player.body.velocity.x = -1 * this.velocity
      } else if (this.wasd.right.isDown) {
        player.body.velocity.x = this.velocity
      } else {
        player.body.velocity.x = 0
      }
    } else {
      if (this.wasd.up.isDown) {
        player.body.velocity.y = -1 * this.velocity
      } else if (this.wasd.down.isDown) {
        player.body.velocity.y = this.velocity
      } else {
        player.body.velocity.y = 0
      }
    }
  }

  updateScorePosition(playerNo: keyof typeof playerConfig) {
    if (!this.players[playerNo]) {
      return
    }
    const player = this.players[playerNo]
    const score = this.scores[playerNo]

    score.setPosition(player.x-10, player.y-10)
    
  }

  //Function to check paddle and ball collisions
  ballCollision() {
    this.players.forEach((player, i) => {
      i as keyof typeof playerConfig
      if (i === 0 && this.scoreNumbers[0] > 0 ) {
        this.ball.onPlayerOnePaddle = false
        this.physics.collide(this.players[0], this.ball, () => {
          this.ball.onPlayerOnePaddle = true
        })
      }
      if (i === 1 && this.scoreNumbers[1] > 0) {
        this.ball.onPlayerTwoPaddle = false
        this.physics.collide(this.players[1], this.ball, () => {
          this.ball.onPlayerTwoPaddle = true
        })
      }
      if (i === 2 && this.scoreNumbers[2] > 0) {
        this.ball.onPlayerThreePaddle = false
        this.physics.collide(this.players[2], this.ball, () => {
          this.ball.onPlayerThreePaddle = true
        })
      }
      if (i === 3 && this.scoreNumbers[3] > 0) {
        this.ball.onPlayerFourPaddle = false
        this.physics.collide(this.players[3], this.ball, () => {
          this.ball.onPlayerFourPaddle = true
        })
      }
    })
  }

  calculateYCollisions(paddle: any, direction: any) {
    //Calculate the relative collision point of the ball and paddle
    const relativeIntersectY = paddle.y - this.ball.y
    //Normalize the relativeIntersectY value
    const normalizedRelativeIntersectionY =
      relativeIntersectY / (paddle.displayHeight / 2)
    //Calculate the bounce angle (maximum 45 degrees)
    const bounceAngle = (normalizedRelativeIntersectionY * Math.PI) / 4
    //Calculate the x-velocity of the ball
    const ballVx = this.ballVelocity * Math.cos(bounceAngle)
    //Calculate the y-velocity of the ball
    const ballVy = this.ballVelocity * -Math.sin(bounceAngle)
    //Update the x and y ball velocities

    this.ball.body.velocity.y = ballVy
    this.ball.body.velocity.x = direction * ballVx

    direction === 1
      ? (this.ball.onPlayerTwoPaddle = false)
      : (this.ball.onPlayerFourPaddle = false)
  }

  calculateXCollisions(paddle: any, direction: any) {
    //Calculate the relative collision point of the ball and paddle
    const relativeIntersectX = paddle.x - this.ball.x
    //Normalize the relativeIntersectX value
    const normalizedRelativeIntersectionX =
      relativeIntersectX / (paddle.displayWidth / 2)
    //Calculate the bounce angle (maximum 45 degrees)
    const bounceAngle = (normalizedRelativeIntersectionX * Math.PI) / 4
    //Calculate the y-velocity of the ball
    const ballVy = this.ballVelocity * Math.cos(bounceAngle)
    //Calculate the x-velocity of the ball
    const ballVx = this.ballVelocity * -Math.sin(bounceAngle)
    //Update the x and y ball velocities
    this.ball.body.velocity.y = direction * ballVy
    this.ball.body.velocity.x = ballVx

    direction === 1
      ? (this.ball.onPlayerOnePaddle = false)
      : (this.ball.onPlayerThreePaddle = false)
  }
  //Update ball velocity after each collision
  increaseBallSpeed() {
    if (this.ballVelocity < 1200) {
      this.ballVelocity += 100
    }
  }

  updateScores(){
    for (let i = 0; i < this.scores.length; i++) {
      this.scores[i].setText(this.scoreNumbers[i].toString())
  }
}

  ballLost(){
    this.ball.body!.reset(400,300)
    this.ball.body!.velocity.set(400, (Math.random()*2 - 1)*400)
  }

  replacePlayerWithWall(playerNo: keyof typeof playerConfig){
    const config = playerConfig[playerNo]
    
    const solidWall: any = this.getWall(config.spawn.x, config.spawn.y, config.direction)
    
    this.physics.world.enable(solidWall)
    solidWall.body!.collideWorldBounds = true
    solidWall.body!.immovable = true
    
    this.players[playerNo].destroy(true)
    this.players[playerNo] = solidWall
    this.physics.add.collider(this.ball, this.players[playerNo])
  }

  getWall(x:number, y:number, configDir:string){
    if(configDir === "y"){
      if(x < this.WIDTH/2){
        const wall = this.add.sprite(0,0,"wall")
        wall.displayHeight = this.HEIGHT
        return wall
      } else {
        const wall = this.add.sprite(this.WIDTH,0,"wall")
        wall.displayHeight = this.HEIGHT
        return wall
      }
    } else {
      if(y < this.HEIGHT/2){
        const wall = this.add.sprite(0,0,"wall2")
        wall.displayWidth = this.WIDTH
        return wall
      }else{
        const wall =  this.add.sprite(0,this.HEIGHT,"wall2")
        wall.displayWidth = this.WIDTH
        return wall
      }
    }
  }

 
}
