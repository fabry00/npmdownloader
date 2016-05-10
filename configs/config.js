var config = {
    development: {
        //url to be used in link generation
        url: 'http://faust.chickenkiller.com',
        //mongodb connection settings
        database: {
            host: '127.0.0.1',
            port: '27017',
            db: 'npminstaller'
        },
        //server details
        server: {
            host: '127.0.0.1',
            port: '3000',
            log: 'dev' //morgan logger
        }
    },
    production: {
        //url to be used in link generation
      url: 'http://faust.chickenkiller.com',
        //mongodb connection settings
        database: {
            host: '127.0.0.1',
            port: '27017',
            db: 'npminstaller'
        },
        //server details
        server: {
            host: '127.0.0.1',
            port: '3000',
            log: 'tiny'
        }
    }
};
module.exports = config;
