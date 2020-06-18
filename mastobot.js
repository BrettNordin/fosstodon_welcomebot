const Sequelize = require('sequelize');
const Mastodon = require('mastodon-api');
console.log('Fosstodon bot starting...');

const M = new Mastodon({
/*
REDACTED
*/
});

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const userdb = sequelize.define('users', {
    id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
    }
});

const interval = 5 * 60 * 1000;
automaticToot(); 
setInterval(automaticToot, interval); 
function automaticToot() {
    M.get('/api/v1/accounts/245045/followers', {}, (error, data) => {
        if (error) {
          console.error(error);
        } else {
            for (let index = 0; index < data.length; index++) {
                let user = data[index];
                let userID = user.id;
                let username = user.username
                userdb.findOne({where: {id: user.id }}).then(userinfo => {
                    if(!userinfo)
                    {
                        var rawdate = user.created_at.slice(0, 10).split('-');
                        var userdate = new Date(rawdate[0],rawdate[1]-1,rawdate[2]);
                        var ONE_DAY  = 24 * 60 * 60 * 1000;
                        userdb.create({id: user.id }).catch();
                        if(((new Date) - userdate) < ONE_DAY) 
                        {
                            let message = `Hey @${username}! Welcome to Fosstodon! \n \nWe're glad you decided to join our instance. Please make sure to check the links below, for tips on getting started with Mastodon and information regarding Fosstodon. If you haven't already done so, make your first toot and tell us a bit about yourself. Make sure to use the #introductions tag when doing so. \n \nFosstodon Hub: https://hub.fosstodon.org/ \nGetting Started: https://kevq.uk/how-does-mastodon-work/ `;
                            toot(message);
                        }
                    }
                  });
              }
        }
      })
}


function toot(content) {
  const params = {
    status: content,
    visibility: "direct"
  }
  M.post('/api/v1/statuses', params, (error, data) => {
    if (error) {
      console.error(error);
    } else {
      console.log(`Success! id: ${data.id}, timestamp: ${data.created_at}`)
    }
  })
}
