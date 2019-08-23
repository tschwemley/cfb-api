const recruitingController = require('./recruiting.controller');

module.exports = (app, db, cors) => {
    const controller = recruitingController(db);

    app.route('/recruiting/players').get(cors, controller.getPlayers);
    app.route('/recruiting/teams').get(cors, controller.getTeams);
};
