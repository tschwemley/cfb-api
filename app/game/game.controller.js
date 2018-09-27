module.exports = (db) => {
    return {
        /** 
         * @api {get} /games Get game information
         * @apiVersion 1.0.0
         * @apiName GetGames
         * @apiGroup Games
         * 
         * @apiParam {String} seasonType 'regular' or 'postseason'. Defaults to 'regular'.
         * @apiParam {Number} year Required. Year filter for games.
         * @apiParam {Number} week Week filter for games.
         * @apiParam {String} team Name of a team to filter on.
         * @apiParam {String} home Name of home team to filter on.
         * @apiParam {String} away Name of away team to filter on.
         * 
         * @apiExample Whole season
         * curl -i https://api.collegefootballdata.com/games?year=2018
         * 
         * @apiExample Single home team
         * curl -i https://api.collegefootballdata.com/games?year=2018&home=michigan
         * 
         * @apiSuccess {Object[]} games List of games.
         * @apiSuccess {Number} games.id Id
         * @apiSuccess {Number} games.season Season
         * @apiSuccess {Number} games.week Week
         * @apiSuccess {String} games.season_type Season type (e.g. regular or postseason)
         * @apiSuccess {Date} games.start_date Start date
         * @apiSuccess {Boolean} games.neutral_site Neutral site flag
         * @apiSuccess {Boolean} games.conference_game Conference game flag
         * @apiSuccess {Number} games.attendance Attendance
         * @apiSuccess {String} games.venue Venue for game
         * @apiSuccess {String} games.home_team Home team name
         * @apiSuccess {Number} games.home_points Home team points
         * @apiSuccess {Number[]} games.home_line_scores Home points breakdown by quarter
         * @apiSuccess {String} games.away_team Home team name
         * @apiSuccess {Number} games.away_points Away team points
         * @apiSuccess {Number[]} games.away_line_scores Away points breakdown by quarter
         * 
         */
        getGames: async (req, res) => {
                try {
                    if (!req.query.year) {
                        res.status(400).send({
                            error: 'A year parameter must be specified.'
                        });

                        return;
                    }

                    let filter = 'WHERE g.season = $1 AND season_type = $2';
                    let params = [req.query.year, req.query.seasonType || 'regular'];

                    let index = 3;

                    if (req.query.week) {
                        filter += ` AND g.week = $${index}`;
                        params.push(req.query.week);
                        index++;
                    }

                    if (req.query.team) {
                        filter += ` AND (LOWER(away.school) = LOWER($${index}) OR LOWER(home.school) = LOWER($${index}))`;
                        params.push(req.query.team);
                        index++;
                    }

                    if (req.query.home) {
                        filter += ` AND LOWER(home.school) = LOWER($${index})`;
                        params.push(req.query.home);
                        index++;
                    }

                    if (req.query.away) {
                        filter += ` AND LOWER(away.school) = LOWER($${index})`;
                        params.push(req.query.away);
                        index++;
                    }

                    let games = await db.any(`
                    SELECT g.id, g.season, g.week, g.season_type, g.start_date, g.neutral_site, g.conference_game, g.attendance, v.name as venue, home.school as home_team, gt.points as home_points, gt.line_scores as home_line_scores, away.school as away_team, gt2.points as away_points, gt2.line_scores as away_line_scores
                    FROM game g
                        INNER JOIN game_team gt ON g.id = gt.game_id AND gt.home_away = 'home'
                        INNER JOIN team home ON gt.team_id = home.id
                        INNER JOIN game_team gt2 ON g.id = gt2.game_id AND gt2.home_away = 'away'
                        INNER JOIN team away ON gt2.team_id = away.id
                        LEFT JOIN venue v ON g.venue_id = v.id
                    ${filter}
                    ORDER BY g.season, g.week, g.start_date
            `, params);

                    res.send(games);
                } catch (err) {
                    console.error(err);
                    res.status(500).send({
                        error: 'Something went wrong.'
                    });
                }
            },
            /** 
             * @api {get} /drives Get drive information
             * @apiVersion 1.0.0
             * @apiName GetDrives
             * @apiGroup Games
             * 
             * @apiParam {String} seasonType 'regular' or 'postseason'. Defaults to 'regular'.
             * @apiParam {Number} year Required. Year filter for drives.
             * @apiParam {Number} week Week filter for drives.
             * @apiParam {String} team Name of team to filter on.
             * @apiParam {String} offense Name of offense team to filter on.
             * @apiParam {String} defense Name of defense team to filter on.
             * 
             * @apiExample Whole season
             * curl -i https://api.collegefootballdata.com/drives?year=2018
             * 
             * @apiExample Single defensive team
             * curl -i https://api.collegefootballdata.com/drives?year=2018&defense=virginia%20tech
             * 
             * @apiSuccess {Object[]} drives List of drives.
             * @apiSuccess {String} drives.offense Offense team name
             * @apiSuccess {String} drives.defense Defense team name
             * @apiSuccess {Number} drives.id Id
             * @apiSuccess {Boolean} drives.scoring Scoring flag
             * @apiSuccess {Number} drives.start_period Quarter the drive started in
             * @apiSuccess {Number} drives.start_yardline Yard line at which the drive began
             * @apiSuccess {Object} drives.start_time Time that the drive started on the playclock
             * @apiSuccess {Number} drives.start_time.minutes Minutes on the playclock
             * @apiSuccess {Number} drives.start_time.seconds Seconds on the playclock
             * @apiSuccess {Number} drives.end_period Quarter the drive ended in
             * @apiSuccess {Number} drives.end_yardline Yard line at which the drive began
             * @apiSuccess {Object} drives.end_time Time that the drive ended on the playclock
             * @apiSuccess {Number} drives.end_time.minutes Minutes on the playclock
             * @apiSuccess {Number} drives.end_time.seconds Seconds on the playclock
             * @apiSuccess {Number} drives.plays Number of plays in the drive
             * @apiSuccess {Number} drives.yards Length of the drive
             * @apiSuccess {String} drives.drive_result Result of the drive
             * 
             */
            getDrives: async (req, res) => {
                    try {
                        if (!req.query.year) {
                            res.status(400).send({
                                error: 'A year parameter must be specified.'
                            });

                            return;
                        }

                        let filter = 'WHERE g.season = $1 AND season_type = $2';
                        let params = [req.query.year, req.query.seasonType || 'regular'];

                        let index = 3;

                        if (req.query.week) {
                            filter += ` AND g.week = $${index}`;
                            params.push(req.query.week);
                            index++;
                        }

                        if (req.query.team) {
                            filter += ` AND (LOWER(offense.school) = LOWER($${index}) OR LOWER(defense.school) = LOWER($${index}))`;
                            params.push(req.query.team);
                            index++;
                        }

                        if (req.query.offense) {
                            filter += ` AND LOWER(offense.school) = LOWER($${index})`;
                            params.push(req.query.offense);
                            index++;
                        }

                        if (req.query.defense) {
                            filter += ` AND LOWER(defense.school) = LOWER($${index})`;
                            params.push(req.query.defense);
                            index++;
                        }

                        let drives = await db.any(`
                    SELECT offense.school as offense, defense.school as defense, g.id as game_id, d.id, d.scoring, d.start_period, d.start_yardline, d.start_time, d.end_period, d.end_yardline, d.end_time, d.elapsed, d.plays, d.yards, dr.name as drive_result
                    FROM game g
                        INNER JOIN drive d ON g.id = d.game_id
                        INNER JOIN team offense ON d.offense_id = offense.id
                        INNER JOIN team defense ON d.defense_id = defense.id
                        INNER JOIN drive_result dr ON d.result_id = dr.id
                    ${filter}
                    ORDER BY d.id
                `, params);

                        res.send(drives);
                    } catch (err) {
                        console.error(err);
                        res.status(500).send({
                            error: 'Something went wrong.'
                        });
                    }
                },
                /** 
                 * @api {get} /plays Get play information
                 * @apiVersion 1.0.0
                 * @apiName GetPlays
                 * @apiGroup Games
                 * 
                 * @apiParam {String} seasonType 'regular' or 'postseason'. Defaults to 'regular'.
                 * @apiParam {Number} year Required. Year filter for plays.
                 * @apiParam {Number} week Week filter for plays.
                 * @apiParam {String} team Name of team to filter on.
                 * @apiParam {String} offense Name of offense team to filter on.
                 * @apiParam {String} defense Name of defense team to filter on.
                 * 
                 * @apiExample Whole week
                 * curl -i https://api.collegefootballdata.com/plays?year=2018&week=3
                 * 
                 * @apiExample Single offensive team
                 * curl -i https://api.collegefootballdata.com/plays?year=2018&offense=clemson
                 * 
                 * @apiSuccess {Object[]} plays List of plays.
                 * @apiSuccess {String} plays.offense Offense team name
                 * @apiSuccess {String} plays.defense Defense team name
                 * @apiSuccess {Number} plays.id Id
                 * @apiSuccess {Number} plays.drive_id Id of the drive
                 * @apiSuccess {Number} plays.period Period
                 * @apiSuccess {Object} plays.clock Playclock information
                 * @apiSuccess {Number} plays.clock.minutes Minutes on the playclock
                 * @apiSuccess {Number} plays.clock.seconds Seconds on the playclock
                 * @apiSuccess {Number} plays.yard_line Where the play started
                 * @apiSuccess {Number} plays.down Down
                 * @apiSuccess {Number} plays.distance Distance
                 * @apiSuccess {Number} plays.yards_gained Yards gained
                 * @apiSuccess {String} plays.play_type Type of play
                 * @apiSuccess {String} plays.play_text Description of the play
                 * 
                 */
                getPlays: async (req, res) => {
                        try {
                            if (!req.query.year) {
                                res.status(400).send({
                                    error: 'A year parameter must be specified.'
                                });

                                return;
                            }

                            let filter = 'WHERE g.season = $1 AND season_type = $2';
                            let params = [req.query.year, req.query.seasonType || 'regular'];

                            let index = 3;

                            if (req.query.week) {
                                filter += ` AND g.week = $${index}`;
                                params.push(req.query.week);
                                index++;
                            }

                            if (req.query.team) {
                                filter += ` AND (LOWER(offense.school) = LOWER($${index}) OR LOWER(defense.school) = LOWER($${index}))`;
                                params.push(req.query.team);
                                index++;
                            }

                            if (req.query.offense) {
                                filter += ` AND LOWER(offense.school) = LOWER($${index})`;
                                params.push(req.query.offense);
                                index++;
                            }

                            if (req.query.defense) {
                                filter += ` AND LOWER(defense.school) = LOWER($${index})`;
                                params.push(req.query.defense);
                                index++;
                            }

                            if (params.length < 3) {
                                res.status(400).send({
                                    error: 'Either a week, a team, an offensive team, or a defensive team must be specified.'
                                });

                                return;
                            }

                            let plays = await db.any(`
                        SELECT p.id, offense.school as offense, defense.school as defense, d.id as drive_id, p.period, p.clock, p.yard_line, p.down, p.distance, p.yards_gained,  pt.text as play_type, p.play_text
                        FROM game g
                            INNER JOIN drive d ON g.id = d.game_id
                            INNER JOIN play p ON d.id = p.drive_id
                            INNER JOIN team offense ON p.offense_id = offense.id
                            INNER JOIN team defense ON p.defense_id = defense.id
                            INNER JOIN play_type pt ON p.play_type_id = pt.id
                        ${filter}
                        ORDER BY d.id
                `, params);

                            res.send(plays);
                        } catch (err) {
                            console.error(err);
                            res.status(500).send({
                                error: 'Something went wrong.'
                            });
                        }
                    },
                                    /** 
                 * @api {get} /games/teams Get team statistics broken down by game
                 * @apiVersion 1.0.0
                 * @apiName GetTeamStats
                 * @apiGroup Games
                 * 
                 * @apiParam {String} seasonType 'regular' or 'postseason'. Defaults to 'regular'.
                 * @apiParam {Number} year Year filter
                 * @apiParam {Number} week Week filter
                 * @apiParam {String} team Team filter
                 * 
                 * @apiExample Whole week
                 * curl -i https://api.collegefootballdata.com/games/teams?year=2018&week=3
                 * 
                 * @apiExample Single team
                 * curl -i https://api.collegefootballdata.com/games/teams?year=2018&team=clemson
                 * 
                 * @apiExample Single game
                 * curl -i https://api.collegefootballdata.com/games/teams?gameId=401012891
                 * 
                 * @apiSuccess {Object[]} games List of games.
                 * @apiSuccess {Number} games.id Game id
                 * @apiSuccess {String} games.teams Teams associated with a game
                 * @apiSuccess {String} games.teams.school Name of school
                 * @apiSuccess {String} games.teams.homeAway Home/away flag
                 * @apiSuccess {String} games.teams.stats Collection of stats
                 * @apiSuccess {String} games.teams.stats.category Statistical category
                 * @apiSuccess {String} games.teams.stats.stat Stat
                 * 
                 */
                    getTeamStats: async (req, res) => {
                        try {
                            if (!req.query.gameId && !(req.query.year && (req.query.week || req.query.team))) {
                                res.status(400).send({
                                    error: 'Must specify a gameId or a year with either a week or a team.'
                                });

                                return;
                            }

                            let filter;
                            let params;

                            let index = 2;

                            if (req.query.gameId) {
                                filter = 'WHERE g.id = $1';
                                params = [req.query.gameId];
                            } else {
                                filter = 'WHERE g.season_type = $1';
                                params = [req.query.seasonType || 'regular'];

                                let index = 2;

                                if (req.query.year) {
                                    filter += ` AND g.season = $${index}`;
                                    params.push(req.query.year);
                                    index++;
                                }

                                if (req.query.week) {
                                    filter += ` AND g.week = $${index}`;
                                    params.push(req.query.week);
                                    index++;
                                }

                                if (req.query.team) {
                                    filter += ` AND LOWER(t.school) = LOWER($${index})`;
                                    params.push(req.query.team);
                                    index++;
                                }
                            }

                            let data = await db.any(`
                                SELECT g.id, gt.home_away, t.school, tst.name, gts.stat
                                FROM team t
                                    INNER JOIN game_team gt ON t.id = gt.team_id
                                    INNER JOIN game g ON gt.game_id = g.id
                                    INNER JOIN game_team_stat gts ON gts.game_team_id = gt.id
                                    INNER JOIN team_stat_type tst ON gts.type_id = tst.id
                                ${filter}
                            `, params);

                            let stats = [];

                            let ids = Array.from(new Set(data.map(d => d.id)));
                            for (let id of ids) {
                                let game = {
                                    id,
                                    teams: []
                                }

                                let gameStats = data.filter(d => d.id == id);
                                let gameTeams = Array.from(new Set(gameStats.map(gs => gs.school)));

                                for (let team of gameTeams) {
                                    let teamStats = gameStats.filter(gs => gs.school == team);

                                    game.teams.push({
                                        school: team,
                                        homeAway: teamStats[0].home_away,
                                        stats: teamStats.map(ts => {
                                            return {
                                                category: ts.name,
                                                stat: ts.stat
                                            }
                                        })
                                    });
                                }

                                stats.push(game);
                            }

                            res.send(stats);

                        } catch (err) {
                            console.error(err);
                            res.status(500).send({
                                error: 'Something went wrong.'
                            });
                        }
                    }
    }
}