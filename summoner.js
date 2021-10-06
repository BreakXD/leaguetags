class summoner {

	constructor(data, APIRoutes) {
		// Modules
		this.request = require("request");

		// class data

		if (!this.IsJsonString(data)) return;
		data = JSON.parse(data)
		this.APIRoutes = APIRoutes;
		this.level = this.level || data.summonerLevel;
		this.name = this.name || data.displayName;
		this.ID = this.ID || data.summonerId;
		this.iconID = this.iconID || data.profileIconId;
		this.getRankedStats();
	}

	compareRanks(r1, r2) {
		let highestRank;

		let leagues = {
			"IRON" 	    	: 1, 
			"BRONZE" 		: 2, 
			"SILVER" 		: 3, 
			"GOLD" 		    : 4, 
			"PLATINUM" 		: 5, 
			"DIAMOND" 		: 6, 
			"MASTER" 		: 7, 
			"GRANDMASTER" 	: 8, 
			"CHALLENGER" 	: 9
		};

		let league1 = leagues[r1.rankedTier], 
			league2 = leagues[r2.rankedTier];

		if (league1 > league2) {
			highestRank = r1;
		} else if (league2 > league1) {
			highestRank = r2;
		} else { // same league
			if (r1.division < r2.division) { // r1 is higher (diamond 1 higher than diamond 5)
				highestRank = r1;
			} else if (r1.division > r2.division) {
				highestRank = r2;
			} else { // same division
				if (r1.lp > r2.lp) {
					highestRank = r1;
				} else {
					highestRank = r2;
				}
			}
		}

		return highestRank;
	}

	getHighestRank(ranks) {
		let highestRank;
		for (let i = 0; i < ranks.length; i++) {
			let rankedData = ranks[i];
			let division = rankedData.division;
			let leagueName = rankedData.leagueName;

			if (!highestRank) highestRank = rankedData;
			highestRank = this.compareRanks(highestRank, rankedData);
		}

		return highestRank;
	}

	receivedRankedStats(data) {
		let rankedData = data.highestRankedEntry;

		if (rankedData) { // Checking if summoner is unranked
			this.division = rankedData.division;
			this.wins = rankedData.wins;
			this.rankedTier = rankedData.tier;
			this.leagueName = rankedData.leagueName;
			this.rankedQueue = rankedData.queueType;
			this.lp = rankedData.leaguePoints;
		}
	}

	IsJsonString(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}

	getProfileData() {
		let arr = {
			name: this.name,
			iconID: this.iconID,
			leagueName: this.leagueName,
			leagueWins: this.wins,
			rankedTier: this.rankedTier + " " + this.division,
			level: this.level
		}
		return arr
	}

	getRankedStats() {
		let rankedUrl = this.APIRoutes.Route("getRankedStats", this.ID);
		let body = {
			url: rankedUrl,
			"rejectUnauthorized": false,
			headers: {
				Authorization: this.APIRoutes.getAuth()
			}
		};
		let callback = (error, response, body) => {
			if (!response) return;
			if (response.statusCode == 200) {
				body = JSON.parse(body);
				this.receivedRankedStats(body);
			}
		}
		this.request.get(body, callback);
	}


	reset() {
		console.log("Starting reset.")
		let url = this.APIRoutes.Route("reset");
		let body = {
			url: url,
			"rejectUnauthorized": false,
			headers: {
				Authorization: this.APIRoutes.getAuth()
			},
			json: {
				"availability": "chat",
				"icon": this.iconID,
				"id": this.ID,
				"lastSeenOnlineTimestamp": (new Date().getTime()).toString(),
				"lol": {
					"level": this.level.toString(),
					"mapId": "",
					"rankedLeagueDivision": this.returnRomanDivision(this.division),
					"rankedLeagueName": this.leagueName,
					"rankedLeagueQueue": this.rankerQueue,
					"rankedLeagueTier": this.rankedTier,
					"rankedLosses": "0",
					"rankedWins": this.wins.toString()
				},
				"name": this.name
				// "statusMessage": "Most dedicated support player EUW!"
			}
		}
		let callback = function(error, response, body) {
			// console.log('error:', error);
			// console.log('statusCode:', response && response.statusCode);
			// console.log('body:', body);
		};
		this.request.put(body, callback);
	}

}

module.exports = summoner;
