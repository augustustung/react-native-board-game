import React, {Component} from 'react';
import {View,
        TouchableWithoutFeedback,
        StyleSheet,
        Dimensions,
        Image} from 'react-native';
import Score from '../components/Soccer/Score';
import Emoji from '../components/Soccer/Emoji';
import { Audio } from 'expo-av'

const LC_IDLE = 0;
const LC_RUNNING = 1;
const LC_TAPPED = 2;
const GRAVITY = 0.8;
const TAPPED_VELOCITY = 20;
const ROTATION_FACTOR = 7;

const SCREEN_HEIGHT = Dimensions.get("screen").height
const SCREEN_WIDTH = Dimensions.get("screen").width
const BALL_WIDTH = SCREEN_WIDTH * 0.33;
const BALL_HEIGHT = SCREEN_WIDTH * 0.33;
const FLOOR_Y = SCREEN_HEIGHT - BALL_HEIGHT;
const FLOOR_X = SCREEN_WIDTH / 2;
const SCORE_Y = SCREEN_HEIGHT / 6;
const EMOJI_Y = SCREEN_HEIGHT / 3;

export default class BallScreen extends Component {
    constructor(props) {
        super(props);
        this.interval = null;
        this.state = {
            x: FLOOR_X,
            y: FLOOR_Y,
            vx: 0,
            vy: 0,
            lifeCycle: LC_IDLE,
            score: 0,
            scored: false,
            lost: false,
            rotate: 0,
        };
    }

    componentDidMount() {
        this.interval = setInterval(this.update.bind(this), 1000 / 60);
    }

    componentWillUnmount() {
        if(this.interval) {
            clearInterval(this.interval);
        }
    }


    async playSoundKick() {
        const { sound } = await Audio.Sound.createAsync(
          require('../audio/BallSound/kick.mp3')
        )
        await sound.playAsync()
    }

    onTap(event) {
        if(this.state.lifeCycle === LC_TAPPED) {
            this.setState({
                lifeCycle: LC_RUNNING,
                scored: false,
            });
        }
        else {
            let centerX = BALL_WIDTH / 2;
            let centerY = BALL_HEIGHT / 2;
            let velocityX = ((centerX - event.locationX) / SCREEN_WIDTH) * TAPPED_VELOCITY;
            let velocityY = -TAPPED_VELOCITY;
            this.setState({
                vx: velocityX,
                vy: velocityY,
                score: this.state.score + 1,
                lifeCycle: LC_TAPPED,
                scored: true,
                lost: false,
            });
            this.playSoundKick()
        }
        return false;
    }

    updatePosition(nextState) {
        nextState.x += nextState.vx;
        nextState.y += nextState.vy;
        nextState.rotate += ROTATION_FACTOR * nextState.vx;
        // Hit the left wall
        if(nextState.x < BALL_WIDTH / 2) {
            nextState.vx = -nextState.vx;
            nextState.x = BALL_WIDTH / 2;
        }

        // Hit the right wall
        if(nextState.x > SCREEN_WIDTH - BALL_WIDTH / 2) {
            nextState.vx = -nextState.vx;
            nextState.x = SCREEN_WIDTH - BALL_WIDTH / 2;
        }

        // Reset after falling down
        if(nextState.y > SCREEN_HEIGHT + BALL_HEIGHT) {
            nextState.y = FLOOR_Y;
            nextState.x = FLOOR_X;
            nextState.lifeCycle = LC_IDLE;
            nextState.score = 0;
            nextState.lost = true;
            nextState.scored = false;
        }
    }

    updateVelocity(nextState) {
        nextState.vy += GRAVITY;
    }

    update() {
        if(this.state.lifeCycle === LC_IDLE) {
            return;
        }

        let nextState = Object.assign({}, this.state);

        this.updatePosition(nextState);
        this.updateVelocity(nextState);

        this.setState(nextState);
    }

    render() {
        var position = {
            left: this.state.x - (BALL_WIDTH / 2),
            top: this.state.y - (BALL_HEIGHT / 2),
        }
        var rotation = {
            transform: [
                {rotate: this.state.rotate + 'deg'},
            ],
        }
        return (
            <View>
                <Score score={this.state.score} y={SCORE_Y} scored={this.state.scored}/>
                <Emoji scored={this.state.scored} y={EMOJI_Y} lost={this.state.lost}/>
                <TouchableWithoutFeedback onPress={(event) => {
                    this.onTap(event.nativeEvent)
                    }}
                >
                  <Image source={require('../img/Soccer/soccer.png')} style={[styles.ball, position, rotation]} />
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    ball: {
        width: BALL_WIDTH,
        height: BALL_HEIGHT,
    },
});
