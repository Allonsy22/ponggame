const state = {
    currentPlayer: null,
    sessionId: null, 
    socket: null,
}

const mutations = {
    SET_FIRST_PLAYER( state, payload ) {
        state.currentPlayer = payload;
    },
    SET_SECOND_PLAYER( state, payload ) {
        state.currentPlayer = payload;
    },
    SET_SESSION_ID( state, payload ) {
        state.sessionId = payload;
    },
    SET_SOCKET( state, payload ) {
        state.socket = payload;
    }
}

const actions = {
    setFirstPlayer( {commit} ) {
        commit('SET_FIRST_PLAYER', 'firstPlayer')
    },
    setSecondPlayer( {commit} ) {
        commit('SET_SECOND_PLAYER', 'secondPlayer')
    },
    setSessionId( {commit}, sessionId ) {
        commit('SET_SESSION_ID', sessionId);
    }, 
    setSocket( {commit}, socket ) {
        commit('SET_SOCKET', socket);
    }
}

const getters = {
    currentPlayer: state => state.currentPlayer,
    sessionId: state => state.sessionId, 
    socket: state => state.socket
}

const sessionModule = {
    state,
    mutations,
    actions,
    getters
}

export default sessionModule;