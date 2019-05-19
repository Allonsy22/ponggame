<template>
    <v-content>
        <div id="gameArea" class="gameArea">
            <div id="ball" class="ball"></div>
            <div id="firstPlayer" class="player"></div>
            <div id="secondPlayer" class="player"></div>
            <div class="firstScore">{{fPScore}}</div>
            <div class="secondScore">{{sPScore}}</div>
            <div id="centerLine" class="centerLine"></div>
        </div>
    </v-content>
</template>

<script>
import Ball from '@/components/game/Ball';
import Player from '@/components/game/Player';
import io from 'socket.io-client';
import {mapGetters} from 'vuex';

export default {
    name: 'GamePage',
    data() {
        return {
            fPDOM: null,
            sPDOM: null,
            ballDOM: null,
            firstPlayer: null,
            secondPlayer: null,
            ball: null,
            fPScore: 0,
            sPScore: "",
            nsp: null,
            socket: null,
            timeout: null
        }
    },
    computed: {
        ...mapGetters([
            'sessionId',
            'currentPlayer'
        ]),
        wWidth() {
            return window.innerWidth;
        },
        wHeight() {
            return window.innerHeight;
        }
    },
    created() {
        if ( !this.currentPlayer ) {
            this.$router.push({path: '/'});
        } else {
            let nsp = window.location.pathname;
            this.socket = io.connect('https://pingpong-game-app.herokuapp.com' + nsp);
            this.fPScore = "id " + nsp.slice(-5);
        }
       
    },
    mounted() {
        this.prepareToGame().then( () => {
            this.startGame();
        }).catch( e => {
            console.log(e.message);
        });
    },
    methods: {
        startGame() {
            this.firstPlayer.start(this.socket, this.sPDOM);
                
            if ( this.currentPlayer == 'firstPlayer' ) {
                this.firstPlayer.getPlayersData(this.socket);
                this.socket.on('first-player-score', (score) => {
                    this.sPScore = score;
                });
                this.socket.on('second-player-score', (score) => {
                    this.fPScore = score;
                });
            } else if ( this.currentPlayer == 'secondPlayer' ) {
                this.socket.on('first-player-score', (score) => {
                    this.fPScore = score;
                });
                this.socket.on('second-player-score', (score) => {
                    this.sPScore = score;
                });
            }

            this.socket.on('get-ball-coords', (coords) => {
                let wWidth = coords[2],
                    wHeight = coords[3];
                let coefX = this.wWidth / wWidth,
                    coefY = this.wHeight / wHeight;
                let fX = coords[0],
                    fY = coords[1],
                    sX = (wWidth - coords[0] ) * coefX,
                    sY = (wHeight - coords[1] ) * coefY;
                if ( this.currentPlayer == 'secondPlayer' ) {
                    this.ball.setCoords(sX, sY, true);
                } else {
                    this.ball.setCoords(fX, fY);
                }
            });

            this.socket.on('end-game', () => {
                this.fPScore = "opponent disconnected";
                this.timeout = setTimeout(() => {
                    this.$router.push({path: '/'});
                }, 2000);
            })
        },
        prepareToGame() {
            return new Promise( (res, rej) => {
                try {
                    this.ballDOM = document.getElementById("ball");
                    this.fPDOM = document.getElementById("firstPlayer");
                    this.sPDOM = document.getElementById("secondPlayer");
                    
                    this.firstPlayer = new Player(this.fPDOM, this.wWidth, this.wHeight);
                    this.secondPlayer = new Player(this.sPDOM, this.wWidth, this.wHeight);
                    this.ball = new Ball(this.ballDOM, this.wWidth, this.wHeight);
                    this.ball.resize(this.wWidth, this.wHeight);
                    this.secondPlayer.resize(this.wWidth, this.wHeight);
                    res();
                } catch(e) {
                    rej(e.message);
                }
            });
        },
    },
    beforeDestroy() {
        this.timeout = null;
    },
}
</script>

<style scoped>
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.gameArea {
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: #000000;
}

.centerLine {
    position: absolute;
    width: calc(100% - 12px);
    background-color: transparent;
    border: 6px dashed #ffffff;
    top: 50%;
    transform: translate(0, -50%);
    z-index: 99;
}

.ball {
    position: absolute;
    width: 30px;
    height: 30px;
    background-color: #ffffff;
    border-radius: 50%;
}

.player {
    width: 120px;
    height: 15px;
    background-color: #ffffff;
}

.firstScore {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -70px);
    font-size: 3em;
    color: #ffffff;
}

.secondScore {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 20px);
    font-size: 3em;
    color: #ffffff;
}

#firstPlayer {
    position: absolute;
    bottom: 0;
    left: 0;
}

#secondPlayer {
    position: absolute;
    top: 0;
    left: 0;
}
</style>

