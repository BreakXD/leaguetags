//
// Copyright (c) 2019 by Break. All Rights Reserved.
//

var electron = require('electron')
var url = require('url')
var path = require('path')
var request = require('request')
var fs = require('fs')
var id = require('node-machine-id');
var LCUConnector = require('lcu-connector')
var connector = new LCUConnector()

var APIClient = require("./routes")
var Summoner = require("./summoner")
var LocalSummoner
var routes

var devMode = false;

const { clipboard } = require('electron')
const { shell } = require('electron');
const { dialog } = require('electron');


// Setting default settings
var pickban_enabled = false;
var friendsToDelete = 70;
var u = 0;
var antiSpamRequest;
var laneToLock;
var instalock_enabled = false;
var championToBan;
var championToPick;
var championToLock; // blind pick
var autoAccept_enabled = false;
var playAgain_enabled = false;
var queueAgain_enabled = false;



// Extracting some stuff from electron
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = electron


// Defining global variables
let mainWindow
let addWindow
var userAuth
var passwordAuth
var requestUrl


function getLocalSummoner() {

  let url = routes.Route("localSummoner")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    }
  }

  let callback = function(error, response, body) {
    LocalSummoner = new Summoner(body, routes)
  }

  request.get(body, callback)
}

connector.on('connect', (data) => {
  requestUrl = data.protocol + '://' + data.address + ':' + data.port
  routes = new APIClient(requestUrl, data.username, data.password)

  getLocalSummoner()

  userAuth = data.username
  passwordAuth = data.password

  console.log('Request base url set to: ' + routes.getAPIBase())
})

// Listen for the app to be ready
app.on('ready', function() {

  // Creating main window of the app
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    resizable: false,
    movable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'images/icon.png')
  })

  if(devMode == true){
    mainWindow.openDevTools();
}

  // Load HTML file into the window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Building Menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

  // Loading the menu to overwrite developer tools
  Menu.setApplicationMenu(mainMenu)

})

// Menu template
const mainMenuTemplate = [{
  label: 'File',
  submenu: []
}]

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('getHwid', function() {
  const hwid = id.machineIdSync({ original: true });
  this.request = require("request");

  if(hwid){
    dialog.showMessageBox(null, {message: 'USER HWID: ' + hwid, title:'hwid'})
  }else{
    dialog.showMessageBox(null, {message: 'erro', title: 'status'})
  }
  
  
})

ipcMain.on('reset', function() {
  LocalSummoner.reset()
})

ipcMain.on('exit_app', function() {
  app.quit()
})

ipcMain.on('minimize_app', function() {
  mainWindow.minimize()
})

ipcMain.on('open_link', function() {;
  const { shell } = require('electron');
//https://www.youtube.com/channel/UCRL25VUOMOqLgSyDG41pxIg
  shell.openExternal('https://www.youtube.com/channel/UCRL25VUOMOqLgSyDG41pxIg');
  shell.openExternal('https://twitter.com/BIitzcrank');
})

ipcMain.on('open_propaganda', function() {
  const { shell } = require('electron'); 
  var i;

  var propagandas = ["http://ads.breakcoder.org/1", "http://ads.breakcoder.org/2", "http://ads.breakcoder.org/3", "http://ads.breakcoder.org/4"];
  for(i = 0; i < propagandas.length; i++){
    shell.openExternal(propagandas[i]);

  }

})

ipcMain.on('ytb', function() {;
  const { shell } = require('electron');
//https://www.youtube.com/channel/UCRL25VUOMOqLgSyDG41pxIg
  shell.openExternal('https://www.youtube.com/channel/UCRL25VUOMOqLgSyDG41pxIg');
})

ipcMain.on('skinList', function() {;
  const { shell } = require('electron');
//https://www.youtube.com/channel/UCRL25VUOMOqLgSyDG41pxIg
  shell.openExternal('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/');
  shell.openExternal('https://pastebin.com/raw/uxJFRYy7');
})

ipcMain.on('iconList', function() {;
  const { shell } = require('electron');
//https://www.youtube.com/channel/UCRL25VUOMOqLgSyDG41pxIg
  shell.openExternal('https://prnt.sc/t7xjz0');
})

ipcMain.on('lolnamesicon', function(){
  const { shell } = require('electron');
  shell.openExternal('https://gonext.today/blog/explorer/icon');

})

ipcMain.on('donation', function(){
  const { shell } = require('electron');
  shell.openExternal('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=899CTXFGNT9S8&source=url');
})


ipcMain.on('submitPatch', (event, patchUrl) => {

  // let patchUrl = 'https://lol.secure.dyn.riotcdn.net/channels/public/releases/B7BB62282C6C68D2.manifest';

  let url = routes.Route("submitPatch") + '?url=' + patchUrl;

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },

  }

  request.put(body);

})

ipcMain.on('copyStatus', (event, nick) => {

 
  let url = routes.Route("submitFriends")

    let body = {
      url: url,
      "rejectUnauthorized": false,
      headers: {
        Authorization: routes.getAuth()
      },
  }

   let callback = function(error, response, body){
    var data = JSON.parse(body);
    
    for (var i = 0; i < data.length; i++){
      if((data[i]["name"]).toLowerCase() === nick.toLowerCase()){
        
        var status = data[i]["statusMessage"];

        clipboard.writeText(status);
        
     //   fs.appendFile("/clubsData/" + data[i]["name"] + ".txt",

        let urlSteal = routes.Route("submitStatus")

        let bodySteal = {
          url: urlSteal,
         "rejectUnauthorized": false,
          headers: {
           Authorization: routes.getAuth()
         },
         json: {
            "statusMessage": status
             }
           }

          request.put(bodySteal);


      }
    }

    
  }
    request.get(body, callback);





})

ipcMain.on('deleteSession', (event) => {
  let url = routes.Route('rsosession')

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {}
  }

  request.delete(body);
})

ipcMain.on('getRiotTristana', (event) => {
  let url = routes.Route('tristanaskin')

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {}
  }

  request.post(body);
})

ipcMain.on('submitTagData', (event, clubData) => { // CLUB

  let url = routes.Route("submitTagData")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "lol": {
        "clubsData": clubData
      }
    }
  }

  request.put(body)

})

ipcMain.on('submitRole', (event, role1, role2) => {
  let url = routes.Route('submitRole');

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "firstPreference":role1,
      "secondPreference":role2
    }
  }

  request.put(body)


})

ipcMain.on('lobbyCrasher', (event) => {
  let url = routes.Route('cancelChampSelect');

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {}
  }

  request.post(body);

  // Start TFT Tuto

  url = routes.Route('quickSearch');

  body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "queueId": 1110
    }
  }

  request.post(body);
})

ipcMain.on('newAramBoost', (event) => {
  let url = routes.Route('invoker') + '&args=["b4454817-9b14-0347-8e4a-517d2c25eec3", "teambuilder-draft","activateBattleBoostV1", ""]';

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
      

    },
    json: {}
    
  }

  request.post(body)
})

ipcMain.on('submitLobby', (event, queueId) => {
  let url = routes.Route('submitLobby');

  


  request.post(body)
})

ipcMain.on('submitRegion', (event, region, locale) => { // CLUB

  let url = routes.Route("submitRegion")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "locale": region, // locale
      "region": locale // region
      
      
    }
  }

  request.put(body)

})



ipcMain.on('submitTierDivison', (event, tier, division, queue) => {

  let url = routes.Route("submitTierDivison")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "lol": {
        "regalia": "{\"bannerType\":1,\"crestType\":2}",
        "rankedSplitRewardLevel": "3",
        "rankedLeagueTier": tier,
        "rankedLeagueQueue": queue,
        "rankedLeagueDivision": division
      }
    }
  }

  request.put(body)

})





ipcMain.on('submitLoot', (event) => {
  
  let url = routes.Route("lootexploit");

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      "X-Riot-Source": "rcp-fe-lol-loot",
      Authorization: routes.getAuth(),
      Accept: "application/json"
    },
    json: ["WARD_SKIN_62"]
    
  }  
    request.post(body)

    })



ipcMain.on('submitLevel', (event, level) => {

  let url = routes.Route("submitLevel")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "lol": {
        "level": level.toString()
      }
    }
  }

  request.put(body)

})

ipcMain.on('submitStatus', (event, status) => {

  let url = routes.Route("submitStatus")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "statusMessage": status
    }
  }

  request.put(body)

})

ipcMain.on('submitLeagueName', (event, leagueName) => {

  let url = routes.Route("submitLeagueName")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "lol": {
        "rankedLeagueName": leagueName
      }
    }
  }

  request.put(body)

})

ipcMain.on('submitAvailability', (event, availability) => {

  let url = routes.Route("submitAvailability")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "availability": availability
    }
  }

  request.put(body)

})

ipcMain.on('submitIcon', (event, icon) => {

  let url = routes.Route("submitIcon")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "profileIconId": icon
    }
  }

  request.put(body)

})



var pickban = function(){
    setInterval(function(){

      if(pickban_enabled){

          let url = routes.Route('submitChampSelectSession');

          let body = {
          url: url,
          "rejectUnauthorized": false,
          headers: {
          Authorization: routes.getAuth()
          },
          }

          let callback = function(error, response, body){
            var data = JSON.parse(body);
            var cellId, i;
            var localSumId;
            var banned = false;

            // GET CELLID
            if(data['isSpectating'] == false){

              let phase = data['timer']['phase'];

              if(data['isCustomGame'] == false){
              cellId = data['localPlayerCellId'];


              }else{
              cellId = data['localPlayerCellId'] + 1;

              }

              if(phase == 'BAN_PICK' && data['actions'][0][0]['championId'] == 0){
                let urlban = (routes.Route('submitChampSelectAction') + cellId);

                let bodyban = {
                  url: urlban,
                  "rejectUnauthorized": false,
                  headers:{
                    Authorization: routes.getAuth()
                  },
                  json: {
                  "championId" : championToBan,  
                  "completed" : true

                  }
                }
                request.patch(bodyban);

              }else if(phase == 'BAN_PICK' && data['actions'][0][0]['championId'] != 0){
                let cellId2;

                if(cellId <= 4){
                  cellId2 = (cellId + 5) * 2 + (cellId % 2);
                }else{
                  cellId2 = cellId * 2 + (cellId % 2);
                }

                let urlpick = (routes.Route('submitChampSelectAction') + cellId2);

                let bodypick = {
                  url: urlpick,
                  "rejectUnauthorized": false,
                  headers:{
                    Authorization: routes.getAuth()
                  },
                  json: {
                  "championId" : championToPick,  
                  "completed" : true

                  }
                }
                request.patch(bodypick);

              }

          }
        }

          request.get(body, callback);

      }



    }, 500);

}


// APENAS PARA ESCOLHA CEGAS INSTALOCK

var instalock = function() {
  setInterval(function() {
  if(instalock_enabled){
    
    let url = routes.Route('submitChampSelectSession');

    let body = {
      url: url,
      "rejectUnauthorized": false,
      headers: {
        Authorization: routes.getAuth()
      },
    }

    let callback = function(error, response, body){
      var data = JSON.parse(body);

      
      
      var cellId, i;
      var localSumId;
      var spamTimes = 5;
      var spamTimeMs = 90000 - (500 * spamTimes);

    if(data['isSpectating'] == false && data['timer']['adjustedTimeLeftInPhase'] > spamTimeMs){

      if(data['isCustomGame'] == false){
        cellId = data['localPlayerCellId'];
        

      }else{
        cellId = data['localPlayerCellId'] + 1;
        
      }


      // AFTER GET LOCAL ID
      let urlLock = (routes.Route('submitChampSelectAction') + cellId);

      let bodyLock = {
        url: urlLock,
        "rejectUnauthorized": false,
        headers: {
          Authorization: routes.getAuth()
        },
        json: {
         "championId" : championToLock,  
         "completed" : true

        }
      }
      request.patch(bodyLock);

      if(data['isCustomGame'] == false){
        var chatId = data["chatDetails"]["chatRoomName"].toString();
 //       chatId = data['chatDetails']['chatRoomName'];

        
        for(i = 0; i < data['myTeam'].length; i++){
        if(data['myTeam'][i]['cellId'] == cellId)
        localSumId = data['myTeam'][i]['summonerId'];
        }

        let urlPlat = routes.Route("submitPlatformId")
//body from callback2
        let bodyPlat = {
            url: urlPlat,
            "rejectUnauthorized": false,
            headers: {
              Authorization: routes.getAuth()
            },
        }

      let callback2 = function(error, response, body){
          var data = JSON.parse(body);
          var platformId = data["platformId"].toLowerCase();
          let fixId = "@champ-select." + platformId + '.';
          let lobbyChatId;      
      
          lobbyChatId = chatId.replace("@champ-select.", fixId);

          if(chatId.includes('@sec')){
           lobbyChatId = lobbyId.replace("@sec.", fixId);
          }


          let urlChat = (routes.Route('submitChatMessage') + lobbyChatId + '/messages');

          let bodyChat = {
            url: urlChat,
            "rejectUnauthorized": false,
            headers: {
              Authorization: routes.getAuth()
            },
            json: {
               "body" : laneToLock,
               "fromSummonerId" : localSumId,
               "isHistorical" : false,
               "type" : "chat"

            }

          } 
          
          
          request.post(bodyChat);
        
    } //callback 2
      request.get(bodyPlat, callback2);

      }
    }
    }

  request.get(body, callback);
    
    
  }}, 500)
}



ipcMain.on('submitIconChat', (event, icon) => {

  let url = routes.Route("submitIconChat");

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "icon": icon
    }
  }

  request.put(body);
})

ipcMain.on('submitBack', (event, back) => {

  let url = routes.Route("submitBack")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "key": "backgroundSkinId",
      "value": back
    }
  }

  request.post(body)

})



ipcMain.on('submitInstantMsg', (event, nome) => {

  let url = routes.Route("submitInstantMsg") + "summonerName=" + nome + "&message=break descrashando.."

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {}
   }
  

  request.post(body)

})

ipcMain.on('submitCrashNew', (event, nome, msg) => {
  var numSpam = 1000, kj;

  let url = routes.Route("submitInstantMsg") + "summonerName=" + nome + "&message=" + msg;
  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {}
   }
  
  if(msg == 'U6'){
    for(kj = 0; kj < numSpam; kj++){
      request.post(body)
    }
  }else{
    request.post(body)
  }
  

})
// BY CHAMP SELECT

ipcMain.on('submitClubDataByChampSelect', (event, nome) => {

  let url = routes.Route("submitPlatformId")

  let body = {
      url: url,
      "rejectUnauthorized": false,
      headers: {
        Authorization: routes.getAuth()
      },
  }
  let callback = function(error, response, body){
    var data = JSON.parse(body);
    var platformId = data["platformId"].toLowerCase();

    let urllobbyid = routes.Route("submitChampSelectSession")

        let bodylobbyid = {
          url: urllobbyid,
          "rejectUnauthorized": false,
          headers: {
            Authorization: routes.getAuth()
          }
        }
          let callback2 = function(error, response, body){
            let data = JSON.parse(body);
            var lobbyId = data["chatDetails"]["chatRoomName"].toString();
            let fixId = "@champ-select." + platformId + '.';
            let lobbyChatId;

            
              lobbyChatId = lobbyId.replace("@champ-select.", fixId);
            if(lobbyId.includes('@sec'))
              lobbyChatId = lobbyId.replace("@sec.", fixId);
            
            let urlconversation = routes.Route("submitConversation");
            let bodyconversation = {
              url: urlconversation + '/' + lobbyChatId + '/participants',
              "rejectUnauthorized":false,
              headers: {
                Authorization: routes.getAuth()
              }
            }
            let callback3 = function(error, response, body){
              let data = JSON.parse(body);
              var nick = nome.toLowerCase();

              let i;
              for(i = 0; i < data.length; i++){
                if(data[i]["name"].toLowerCase() == nick){
                  var clubData = data[i]["lol"]["clubsData"];
                  clipboard.writeText(clubData);

                  let urlSteal = routes.Route("submitTagData")

                  let bodySteal = {
                    url: urlSteal,
                   "rejectUnauthorized": false,
                    headers: {
                     Authorization: routes.getAuth()
                   },
                   json: {
                     "lol": {
                       "clubsData": clubData
                         }
                       }
                     }

                    request.put(bodySteal);

                }
              }

            }


            request.get(bodyconversation, callback3);
           }


        request.get(bodylobbyid, callback2);

  }
  request.get(body, callback);

})

// BY LOBBY
ipcMain.on('submitClubDataByLobby', (event, nome) => {

  let url = routes.Route("submitPlatformId")

  let body = {
      url: url,
      "rejectUnauthorized": false,
      headers: {
        Authorization: routes.getAuth()
      },
  }
  let callback = function(error, response, body){
    var data = JSON.parse(body);
    var platformId = data["platformId"].toLowerCase();

    let urllobbyid = routes.Route("submitLobbyId")

        let bodylobbyid = {
          url: urllobbyid,
          "rejectUnauthorized": false,
          headers: {
            Authorization: routes.getAuth()
          }
        }
          let callback2 = function(error, response, body){
            let data = JSON.parse(body);
            var lobbyId = data["chatRoomId"].toString();
            let lobbyChatId = lobbyId + '@sec.' + platformId + '.pvp.net';

            let urlconversation = routes.Route("submitConversation");
            let bodyconversation = {
              url: urlconversation + '/' + lobbyChatId + '/participants',
              "rejectUnauthorized":false,
              headers: {
                Authorization: routes.getAuth()
              }
            }
            let callback3 = function(error, response, body){
              let data = JSON.parse(body);
              var nick = nome.toLowerCase();

              let i;
              for(i = 0; i < data.length; i++){
                if(data[i]["name"].toLowerCase() == nick){
                  var clubData = data[i]["lol"]["clubsData"];
                  clipboard.writeText(clubData);

                  let urlSteal = routes.Route("submitTagData")

                  let bodySteal = {
                    url: urlSteal,
                   "rejectUnauthorized": false,
                    headers: {
                     Authorization: routes.getAuth()
                   },
                   json: {
                     "lol": {
                       "clubsData": clubData
                         }
                       }
                     }

                    request.put(bodySteal);

                }
              }

            }


            request.get(bodyconversation, callback3);
           }


        request.get(bodylobbyid, callback2);

  }
  request.get(body, callback);

})


ipcMain.on('submitMessageShare', (event, msg, start) => {

  let url = routes.Route('submitFriends');

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    }
  }

  let callback = function(error, response, body){
      var data = JSON.parse(body);
      var tamanho = data.length;

      if(data.length > 30){
        var tamanho = (start + 1) * 30  ;
      }

      if(tamanho > data.length){
        tamanho = data.length - 30
      }

      for (var i = start; i < tamanho; i++){
        let idMsg = data[i]['id'];

        let urlC = routes.Route('submitCrash') + idMsg + '/messages';

        let bodyC = {
          url: urlC,
          "rejectUnauthorized": false,
          headers: {
            Authorization: routes.getAuth()
          },
          json: {
            "body": msg,
            "type": "chat"

          }


        }
        request.post(bodyC);


      }


  }
  request.get(body, callback);





})


ipcMain.on('submitClubDataByName', (event, nome, mode) => {

  let url = routes.Route("submitFriends")

    let body = {
      url: url,
      "rejectUnauthorized": false,
      headers: {
        Authorization: routes.getAuth()
      },
  }

   let callback = function(error, response, body){
    var data = JSON.parse(body);
    
    for (var i = 0; i < data.length; i++){
      if((data[i]["name"]).toLowerCase() === nome.toLowerCase()){
        
        var clubDataSteal = data[i]["lol"]["clubsData"];

        clipboard.writeText(clubDataSteal);
        
     //   fs.appendFile("/clubsData/" + data[i]["name"] + ".txt",

        let urlSteal = routes.Route("submitTagData")

        let bodySteal = {
          url: urlSteal,
         "rejectUnauthorized": false,
          headers: {
           Authorization: routes.getAuth()
         },
         json: {
           "lol": {
             "clubsData": clubDataSteal
               }
             }
           }

          request.put(bodySteal);


      }
    }

    
  }
    request.get(body, callback);
})


ipcMain.on('submitCleanFriends', (event, id) => {

  let url = routes.Route("submitFriends");

   let body = {
      url: url,
      "rejectUnauthorized": false,
      headers: {
        Authorization: routes.getAuth()
      },
  }

    let callback = function(error, response, body){
      var data = JSON.parse(body);

      var numFriends = data.length, i;

      if(numFriends > 70)
        numFriends = 70;
     // setInterval(function() {
      for(i = 0; i < numFriends; i++){
       
        var friendId = data[i]['id'];
        
        let url2 = routes.Route("submitFriends") + '/' + friendId;

          let body2 = {
               url: url2,
               "rejectUnauthorized": false,
               headers: {
                  Authorization: routes.getAuth()
                },
           } // body

           

          // setTimeout(function() {
            request.delete(body2)
          //}, 60000);

          
      } // for
   // }, cd);

  }


  request.get(body, callback);



})




ipcMain.on('submitCrash', (event, id) => {

  let url = routes.Route("submitCrash") + id + "/messages"

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      
  "body": "bⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦrⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦeⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦaⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦkⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦxⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦⷦd",
  "isHistorical": "true",
  "type": "chat" 
}
   }
  

  request.post(body)

})

ipcMain.on('submitSnipe', (event, name) => {

  let url = routes.Route("submitSnipe");

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()

    },
    json: 
      name
    
  }

  request.post(body)

})
/*
ipcMain.on('submitLobbyMetadata', (event, position1, position2, champ) => {
  let url = routes.Route("submitLobbyMetadata");

  let body = {
    url: url,
    "rejectUnauthorized": false,

    headers: {
      Authorization: routes.getAuth();
    },
    json:{
      "championSelection": champ,
      "positionPref": [
        position1.toString(),

      ]

    }

  }

})*/


ipcMain.on('submitWinsLosses', (event, wins, losses) => {

  let url = routes.Route("submitWinsLosses")

  let body = {
    url: url,
    "rejectUnauthorized": false,
    headers: {
      Authorization: routes.getAuth()
    },
    json: {
      "lol": {
        "rankedWins": wins.toString(),
        "rankedLosses": losses.toString()
      }
    }
  }

  request.put(body)

})

ipcMain.on('profileUpdate', (event, wins, losses) => {
  u = 0;
  getLocalSummoner()
  event.returnValue = LocalSummoner.getProfileData()
})

ipcMain.on('submitInstalock', (event, champid, laneid, int) => {
  if (int) {
    championToLock = champid;
    laneToLock = laneid;
    instalock_enabled = true;
  } else {
    instalock_enabled = false;
  }
})

ipcMain.on('submitPickBan', (event, banid, pickid, int) => {
  if (int) {
    championToPick = pickid;
    championToBan = banid;
    pickban_enabled = true;
  } else {
    pickban_enabled = false;
  }
})

ipcMain.on('playAgain', (event, int) => {
  playAgain_enabled = !playAgain_enabled;
})

ipcMain.on('queueAgain', (event, int) => {
  queueAgain_enabled = !queueAgain_enabled
})

ipcMain.on('autoAccept', (event, int) => {
  if (int) {
    autoAccept_enabled = true
  } else {
    autoAccept_enabled = false
  }
})

ipcMain.on('invDecline', (event, int) => {
  if (int) {
    invDecline_enabled = true
  } else {
    invDecline_enabled = false
  }
})

function IsJsonString(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

// CGET ID (NOT WORKING)
function getSumID(nome){

   let url = routes.Route("submitSumID") + nome

    let body = {
      url: url,
      "rejectUnauthorized": false,
      headers: {
        Authorization: routes.getAuth()
      },
  }
  

    let callback = function(error, response, body) {
      
      var data = JSON.parse(body)
      return data["summonerId"]
}

request.get(body, callback)
}


//var idS = getSumID();
 // LIMPAR CHAT
ipcMain.on('submitDescrash', (event) => {

  let url = routes.Route("getActiveConversation");

  let body = {
      url: url,
      "rejectUnauthorized": false,
      headers: {
        Authorization: routes.getAuth()
      },
  }

  let callback = function(error, response, body){
    var data = JSON.parse(body);
    
    let descrashUrl = routes.Route("submitDescrash") + data["id"] + "/messages";
     let descrashBody = {
        url: descrashUrl,
         "rejectUnauthorized": false,
            headers: {
              Authorization: routes.getAuth()
            },
            json: {}
      }
            request.delete(descrashBody)
  }

  request.get(body, callback);

 
      
    })


var playAgain = function() {
  setInterval(function(){
    if(playAgain_enabled){

        let url1 = routes.Route('gameflow');

        let body1 = {
          url: url1,
          "rejectUnauthorized": false,
          headers: {
            Authorization: routes.getAuth()
          },
        }

        let callback = function(error, response, body){
            let data = body;

            if(data == '"EndOfGame"'){

            let url = routes.Route("submitPlayAgain");

            let body = {
              url: url,
              "rejectUnauthorized": false,
              headers: {
                Authorization: routes.getAuth()
              },
            }

            request.post(body);
            }
          }

          request.get(body1, callback);

  }}, 1000)
}

var queueAgain = function() {
  setInterval(function(){
    if(queueAgain_enabled){

        let url1 = routes.Route('gameflow');

        let body1 = {
          url: url1,
          "rejectUnauthorized": false,
          headers: {
            Authorization: routes.getAuth()
          },
        }

        let callback = function(error, response, body){
            let data = body;

            if(data == '"Lobby"'){

            let url = routes.Route("submitSearchQueue");

            let body = {
              url: url,
              "rejectUnauthorized": false,
              headers: {
                Authorization: routes.getAuth()
              },
            }

            request.post(body);
            }
          }

          request.get(body1, callback);

  }}, 1000)
}


var autoAccept = function() {
  setInterval(function() {
  if(autoAccept_enabled){
    if (!routes) return

    let url = routes.Route("autoAccept")

    let body = {
      url: url,
      "rejectUnauthorized": false,
      headers: {
        Authorization: routes.getAuth()
      },
    }

    let callback = function(error, response, body) {
      if (!body || !IsJsonString(body)) return
      var data = JSON.parse(body)

      if (data["state"] === "InProgress") {


        if (data["playerResponse"] === "None") {
          let acceptUrl = routes.Route("accept")
          let acceptBody = {
            url: acceptUrl,
            "rejectUnauthorized": false,
            headers: {
              Authorization: routes.getAuth()
            },
            json: {}
          }

          let acceptCallback = function(error, response, body) {}

          if (autoAccept_enabled) {
            request.post(acceptBody, acceptCallback)
          }

        }
      }
    }

    request.get(body, callback)
  }}, 1000)
}


autoAccept();
playAgain();
queueAgain();
instalock();
pickban();


ipcMain.on('saveIgnored', (event, names) => {
  ignoredDeclines = names
})


connector.start()