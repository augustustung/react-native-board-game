import React from 'react';
import { Text, View, StyleSheet } from 'react-native'
import { Audio } from 'expo-av'
import Ball from '../components/PingPong/ball'
import User1 from '../components/PingPong/user1'
import User2 from '../components/PingPong/user2'

const MAX_HEIGHT = 600, MAX_WIDTH = 400

const ballProps = {
  x: MAX_HEIGHT/2 - 10,
  y: MAX_WIDTH/2 - 10,
  velocityX: 5,
  velocityY: 0,
}

const user1Props = {
  x : 0,
  y : MAX_WIDTH/2 - 50
}

const user2Props = {
  x : MAX_HEIGHT - 10,
  y : MAX_WIDTH/2 - 50
}

const user = {
  width:  100,
  height: 10
}

export default class PingPongScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      speed: 7,

      ball: [ballProps.x, ballProps.y],
      velocityX : ballProps.velocityX,
      velocityY : ballProps.velocityY,

      user1: [user1Props.x, user1Props.y],
      score1: 0,

      user2: [user2Props.x, user2Props.y],
      score2: 0
    }
  }

  componentDidMount() {
    setInterval(this.update, 1000/50)
  }

  async playSoundComScore() {
    const { sound } = await Audio.Sound.createAsync(
      require('../audio/PingPong/comScore.mp3')
    )
    await sound.playAsync()
  }

  async playSoundUserScore() {
    const { sound } = await Audio.Sound.createAsync(
      require('../audio/PingPong/userScore.mp3')
    )
    await sound.playAsync()
  }

  async playSoundHit() {
    const { sound } = await Audio.Sound.createAsync(
      require('../audio/PingPong/hit.mp3')
    )
    await sound.playAsync()
  }

  async playSoundWall() {
    const { sound } = await Audio.Sound.createAsync(
      require('../audio/PingPong/wall.mp3')
    )
    await sound.playAsync()
  }

  resetBall = () => {
    this.setState({
      speed: 7,
      ball: [ballProps.x, ballProps.y],
      velocityX: -this.state.velocityX
    })
  }

  moveUser1 = (direction) => {
    const { user1 } = this.state
    let gap

    if(direction == 'left') {
      if(user1[1] < 300 || user1[1] == 0)
        gap = 30
      else 
        gap = 0
    } else {
      if(user1[1] > 0 || user1[1] == 300)
        gap = -30
      else 
        gap = 0
    }
    let newUser = [user1[0], user1[1] + gap]
    this.setState({ user1: newUser})
  }

  moveUser2 = (direction) => {
    const { user2 } = this.state
    let gap

    if(direction == 'left') {
      if(user2[1] < 300 || user2[1] == 0)
        gap = 30
      else 
        gap = 0
    } else {
      if(user2[1] > 0 || user2[1] == 300)
        gap = -30
      else 
        gap = 0
    }
    let newUser = [user2[0], user2[1] + gap]
    this.setState({ user2: newUser})
  }

  collision = (b,p) =>  {
    let pTop = p[1]
    let pBottom = p[1] + user.width
    let pLeft = p[0]
    let pRight = p[0] + user.height
    
    let bTop = b[1]
    let bBottom = b[1] + 20
    let bLeft = b[0]
    let bRight = b[0] + 20
    
    return pLeft < bRight && pTop < bBottom && pRight > bLeft && pBottom > bTop
  }

  update = () => {
    const { ball, score1, score2, user1, user2, speed, velocityX, velocityY } = this.state

    //check out of game area
    if(ball[0] < 0) {
      this.setState({ score2: score2 + 1})
      this.playSoundComScore()
      this.resetBall()
    } else if(ball[0] + 20 > MAX_HEIGHT) {
      this.setState({ score1: score1 + 1})
      this.playSoundUserScore()
      this.resetBall()
    }
    
    //start ball
    let newBall = [ball[0] + velocityX, ball[1] + velocityY]
    this.setState({ ball: newBall })
    
    //simple AI
    let bot = [user2[0], user2[1] + ((ball[1]- ( user2[1] + user.width/2))) * 0.1] 
    this.setState({ user2: bot })
    
    // when the ball collides with bottom and top walls we inverse the velocityY.
    if(ball[1] < 0 || ball[1] > MAX_WIDTH-20) {
      this.setState({ velocityY: -this.state.velocityY})
      this.playSoundWall()
    }

    //check player
    let player = (ball[0] + 20 < MAX_HEIGHT/2) ? user1 : user2

    // if the ball hits a paddle
    if(this.collision(ball, player)) {

      this.playSoundHit()

      //check where the ball hit is
      let collidePoint = (ball[1]+10) - (player[1] + 50)

      collidePoint = collidePoint / (user.width/2)

      let angleRad = (Math.PI/4) * collidePoint

      // change the X and Y velocity direction
      let direction = (ball[0] + 10 < MAX_HEIGHT/2) ? 1 : -1
      this.setState({
        velocityX: direction * Math.cos(angleRad) * speed,
        velocityY: Math.sin(angleRad) * speed,
        speed: speed+0.1
      })
    }
  }

  render() {
    const { ball, user1, user2, score1, score2 } = this.state
    return (
      <View style={styles.container}>

        <View style={styles.containButton}>
          <Text onPress={() => this.moveUser1('left')} style={styles.button}>{'<'}</Text>
          <Text onPress={() => this.moveUser1('right')} style={styles.button}>{'>'}</Text>
        </View>

        <View style={styles.gameArea}>

          <Ball size={20} ball={ball}/>

          <User1 
            width={user.width} 
            height={user.height}
            user1={user1}
          />

          <View style={styles.pointArea1}>
            <Text style={styles.score}>{score1}</Text>
          </View>

          <User2
            width={user.width} 
            height={user.height}
            user2={user2}
          />

          <View style={styles.pointArea2}>
            <Text style={styles.score}>{score2}</Text>
          </View>

        </View>

        {/* <View style={styles.containButton}>
          <Text onPress={() => this.moveUser2('left')} style={styles.button}>{'<'}</Text>
          <Text onPress={() => this.moveUser2('right')} style={styles.button}>{'>'}</Text>
        </View> */}

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bbb'
  },
  gameArea: {
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
    position: 'relative',
    backgroundColor: '#fff',
    borderWidth: 1
  },
  containButton: {
    flexDirection: 'row'
  },
  button: {
    paddingHorizontal: 32,
    fontSize: 30,
    color: '#fff'
  },
  pointArea1: {
    position: 'absolute',
    right: MAX_WIDTH/5, 
    top: MAX_HEIGHT*1/7
  },
  pointArea2: {
    position: 'absolute',
    right: MAX_WIDTH/5, 
    top: MAX_HEIGHT*0.8
  },
  score: {
    fontSize: 35,
    color: '#fff',
    fontWeight: 'bold'
  }
})
