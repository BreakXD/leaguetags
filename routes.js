class routes {

  constructor(base, username, password) {
    if (!base) throw "Invalid base URL..";
    if (!username) throw "Invalid username..";
    if (!password) throw "Invalid password..";
    // Modules
    this.request = require("request");

    // class data
    this.base = base;
    this.username = username;
    this.password = password;
    this.routes = {
      lolchatv1me: "/lol-chat/v1/me", // GERAL
      lolmatchmakingv1readycheck: "/lol-matchmaking/v1/ready-check",
      lolmatchmakingv1readycheckaccept: "/lol-matchmaking/v1/ready-check/accept",
      lollobbyv2receivedinvitations: "/lol-lobby/v2/received-invitations",
      lolsummonerv1currentsummoner: "/lol-summoner/v1/current-summoner",
      lollobbyv2: "/lol-lobby/v2/lobby",
      lolsummonerv1summoner: "/lol-summoner/v1/summoners?name=",
      lolsummonerv1currentsummonericon: "/lol-summoner/v1/current-summoner/icon",
      lolsummonerv1currentsummonerbackground: "/lol-summoner/v1/current-summoner/summoner-profile",
      lolrankedstatsv1statsByID: "/lol-ranked/v1/current-ranked-stats", // /lol-ranked/v1/ranked-stats/
      lolriotclientRegion: "/riotclient/region-locale",
      lolchatcrasher: "/lol-chat/v1/conversations/",
      lolgameclientchat: "/lol-game-client-chat/v1/instant-messages?",
      lolchatcvdelete: "/lol-chat/v1/conversations/",
      lolnicksnipe: '/lol-summoner/v1/current-summoner/name',
      lolfreearam: '/lol-champ-select/v1/team-boost/purchase',
      autoloot: '/lol-loot/v1/recipes/WARDSKIN_disenchant/craft?repeat=0', //https://127.0.0.1:2241/lol-loot/v1/recipes/WARDSKIN_RENTAL_disenchant/craft?repeat=1
      autoban: '',
      lolchatv1friends: '/lol-chat/v1/friends',
      activecv: '/lol-chat/v1/conversations/active',
      lollobby: '/lol-lobby/v2/lobby',
      lolchatv1conversations: '/lol-chat/v1/conversations',
      lolchampselect: '/lol-champ-select/v1/session',
      lolchampselectaction: '/lol-champ-select/v1/session/actions/',
      lolpatch: '/lol-patch/v1/game-patch-url',
      lolplayagain: '/lol-lobby/v2/play-again',
      gameflow: '/lol-gameflow/v1/gameflow-phase',
      invokerpost: '/lol-login/v1/session/invoke?destination=lcdsServiceProxy&method=call',
      rsosession: '/lol-rso-auth/v1/session',
      gameflowtuto: '/lol-gameflow/v1/basic-tutorial/start',
      gameflowtutostop: '/lol-gameflow/v1/basic-tutorial/stop',
      searchgame: '/lol-lobby/v2/lobby/matchmaking/search',
      quitinvoker: '/lol-login/v1/session/invoke?destination=gameService&method=quitGame&args=[]',
      cancelchampselect: '/lol-lobby/v1/lobby/custom/cancel-champ-select',
      lollobbyv2quicksearch: '/lol-lobby/v2/matchmaking/quick-search',
      riottristana: '/lol-login/v1/session/invoke?destination=inventoryService&method=giftFacebookFan&args=[]',
      lollobbyv2search: '/lol-lobby/v2/lobby/matchmaking/search',
      lollobbyrole: '/lol-lobby/v1/lobby/members/localMember/position-preferences',
      gameservice: '/lol-login/v1/session/invoke?destination=gameService'

    }
    this.alias = {
      //inventory
      tristanaskin: this.routes['riottristana'],

      //rso
      rsosession: this.routes['rsosession'],

      //invoker
      gameservice: this.routes['gameservice'],
      invoker: this.routes['invokerpost'],
      quitinvoker: this.routes['quitinvoker'],

      //gameflow
      gameflow: this.routes['gameflow'],
      gameflowtuto: this.routes['gameflowtuto'],
      gameflowtutostop: this.routes['gameflowtutostop'],

      //patch
      submitPatch: this.routes['lolpatch'],

      //lobby v2
      submitSearchQueue: this.routes['lollobbyv2search'],
      quickSearch: this.routes['lollobbyv2quicksearch'],
      submitLobby: this.routes['lollobbyv2'],
      searchGame: this.routes['searchgame'],
      submitPlayAgain: this.routes['lolplayagain'],

      //lol champ-select v1
      submitChampSelectAction: this.routes["lolchampselectaction"],
      submitChampSelectSession: this.routes["lolchampselect"],

      //lol lobby v1
      submitRole: this.routes['lollobbyrole'],
      submitLobbyId: this.routes["lollobby"],
      cancelChampSelect: this.routes["cancelchampselect"],

      //loot exploit
      lootexploit: this.routes["autoloot"],

      //nick snipe
      submitSnipe: this.routes["lolnicksnipe"],

      //free aram team-boost
      aramboost: this.routes["lolfreearam"],

      //lolchatv1conversations
      submitConversation: this.routes["lolchatv1conversations"],

      // lolchatv1me
      submitPlatformId: this.routes["lolchatv1me"],
      submitIconChat: this.routes["lolchatv1me"],
      getActiveConversation: this.routes["activecv"],
      submitFriends: this.routes["lolchatv1friends"],
      reset: this.routes["lolchatv1me"],
      submitTierDivison: this.routes["lolchatv1me"],
      submitTagData: this.routes["lolchatv1me"],
      submitLevel: this.routes["lolchatv1me"],
      submitStatus: this.routes["lolchatv1me"],
      submitLeagueName: this.routes["lolchatv1me"],
      submitAvailability: this.routes["lolchatv1me"],
      submitSummoner: this.routes["lolchatv1me"],
      submitWinsLosses: this.routes["lolchatv1me"],

      //chat message
      submitChatMessage: this.routes['lolchatcrasher'],
      submitCrash: this.routes["lolchatcrasher"],
      submitDescrash: this.routes["lolchatcvdelete"],

      // lolsummoner

      submitIcon: this.routes["lolsummonerv1currentsummonericon"],
      submitBack: this.routes["lolsummonerv1currentsummonerbackground"],
      submitSumID: this.routes["lolsummonerv1summoner"],

      // lolmatchmakinv1readycheck
      autoAccept: this.routes["lolmatchmakingv1readycheck"],
      accept: this.routes["lolmatchmakingv1readycheckaccept"],

      // lolsummonerv1currentsummoner
      localSummoner: this.routes["lolsummonerv1currentsummoner"],

      // lollobbyv2receivedinvitations
      invDecline: this.routes["lollobbyv2receivedinvitations"],

      // lolriotclientRegion
      submitRegion: this.routes["lolriotclientRegion"],

      // lolgameclientchat
      submitInstantMsg: this.routes["lolgameclientchat"],

      // lolrankedstatsv1statsByID:
      getRankedStats: function(instance, id) {
        return instance.routes["lolrankedstatsv1statsByID"]
      }
    }
  }

  setAPIBase(base) {
    this.base = base;
  }

  getAPIBase() {
    return this.base;
  }

  delete(body, callback) {
    body.url = this.base + body.url;
    console.log(body);
    return this.request.get(body, callback);
  }

  get(body, callback) {
    body.url = this.base + body.url;
    console.log(body);
    return this.request.get(body, callback);
  }

  post(body, callback) {
    body.url = this.base + body.url;
    console.log(body);
    return this.request.post(body, callback);
  }

  patch(body, callback) {
    body.url = this.base + body.url;
    console.log(body);
    return this.request.patch(body, callback);
  }

  put(body, callback) {
    body.url = this.base + body.url;
    console.log(body);
    return this.request.put(body, callback);
  }

  getAuth() {
    return "Basic " + (new Buffer(this.username + ":" + this.password).toString("base64"));
  }

  Route(alias, id) {
    let route = id ? this.alias[alias](this, id) : this.alias[alias];
    if (!route) throw "Invalid alias.";
    //console.log("Route is: " + route)
    return this.base + route;
  }
}

module.exports = routes;