<template>
    <v-content>

        <div id="gameArea" class="gameArea" v-if="gameIsReady">
            <div id="ball" class="ball"></div>
            <div id="firstPlayer" class="player"></div>
            <div id="secondPlayer" class="player"></div>
            <div class="firstScore">0</div>
            <div class="secondScore">0</div>
            <div id="centerLine" class="centerLine"></div>
        </div>

        <v-container fill-height v-else>
            <v-layout justify-center align-center>
                <v-btn @click="createGame">create</v-btn>
                <v-btn @click="showJoinDialog">join</v-btn>
            </v-layout>
        </v-container>

        <div class="text-xs-center">
            <v-dialog v-model="createDialog"
                        width="500"
                        persistent
            >
                <v-card>
                    <v-card-title class="headline grey lighten-2"
                                  primary-title
                        >
                        Session id
                    </v-card-title>

                    <div class="title">{{sessionId}}</div>
                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary"
                                flat
                                large
                                @click="createDialog = false"
                            >
                            OK
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>

        <div class="text-xs-center">
            <v-dialog v-model="joinDialog"
                        width="500"
                >
            <v-card>
                <v-card-title class="headline grey lighten-2"
                                primary-title
                    >
                    Session code
                </v-card-title>

                <v-text-field label="Please enter friend's code"
                                v-model="sessionValue"
                ></v-text-field>

                <v-divider></v-divider>

                <v-alert :value="error"
                        type="error"
                    >
                    Invalid code
                </v-alert>
                <v-alert :value="warning"
                        type="warning"
                >
                    The game session does not exist. Make sure you enter the correct code.
                </v-alert>
                <v-card-actions>
                <v-spacer></v-spacer>
                    <v-btn color="primary"
                            flat
                            @click="joinGame"
                        >
                        JOIN
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
    </v-content>
</template>

<script>
import Ball from '@/components/game/Ball';
import Player from '@/components/game/Player';
import io from 'socket.io-client';
import {mapGetters} from 'vuex';

export default {
    name: 'StartPage',
    data() {
        return {
            createDialog: false,
            joinDialog: false,
            sessionValue: null,
            error: false,
            warning: false,
            socket: null,
            gameIsReady: false,
            ball: null
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
    methods: {
        createGame() {
            this.createDialog = true;
            this.$store.dispatch('setFirstPlayer');
            let sessionId = Math.random().toString().slice(-5);
            this.connect(`/game/${sessionId}`);
            this.$router.push({path: `/game/${sessionId}`});
            this.$store.dispatch('setSessionId', sessionId);
            
        },

        joinGame() {
            this.checkGame().then( () => {
               console.log('Joined to the game ' + this.sessionValue);
            }).catch( e => {
                console.log(e);
            })
        },

        connect(nsp) {
            return io.connect("https://pingpong-game-app.herokuapp.com/", 
                    {query: "nsp=" +  nsp
                            + "&currentPlayer=" + this.currentPlayer
                            + "&wWidth=" + this.wWidth 
                            + "&wHeight=" + this.wHeight});
        },

        checkGame() {
            return new Promise( (res, rej) => {
                try {
                    this.$store.dispatch('setSecondPlayer');
                    this.socket = this.connect(`/game/${this.sessionValue}`);
                    this.socket.on('cancel', (isCanceled) => {
                        this.warning = isCanceled;
                        if ( !isCanceled ) {
                            this.$router.push({path: `/game/${this.sessionValue}`});
                        }
                    });
                    res();
                } catch(e) {
                    rej(e.message);
                }
            });
        },
        
        startGame() {
            if ( !this.warning ) {
                this.$router.push({path: `/game/${this.sessionValue}`});
            } else {
                return;
            }
        },
        
        showJoinDialog() {
            this.joinDialog = true;
        },
    },
}
</script>