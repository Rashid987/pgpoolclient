require("console-stamp")(console, {pattern: "dd/mm/yyyy HH:MM:ss.l"});
var pg = require("pg");
var conString1 ;
exports.client=function(conString){
conString1 = conString;
connect();
}
var queryArr = [];
var db = {};
var client;
var state = 'NoConnection';
var connect = function () {
    if (state === 'Connected')
        return true;
    if (state === 'Connecting') {
        return false;
    }
    state = 'Connecting';
    client = new pg.Client(conString);
    console.log('--------- connecting to postgres ---------');
    
    client.connect();
    console.log('----------- after connect() ----------');

    client.on('connect', function (err) {
        console.log('-------- Connected ----------');
        state = 'Connected';
        queryArr.forEach(function(query) {
            console.log(query.query);
            db.query(query.query, query.params, query.callback);
        });
        queryArr = [];
    });
    client.on('error', function (err) {
        console.log('Database error!', err.code);
        state = 'Ended';
        if (state != 'Connecting')
            client.end();
    });
    client.on('end', function () {
        console.log('---------- postgres END event --------');
        state = 'Ended';
    });
    return false;
};

exports.query = function (query, params, callback) {
    
    if (!connect()) {
        queryArr.push({query:query, params:params, callback:callback});
        return;
    }
    try {
        client.query(query, params, function (err, res) {
            console.log('----------- query callback -------', JSON.stringify(err));
            //console.log('------ code ---- ', err.code);
            if (err) {
                console.log('---------- query error ------',err, '==== string ===',  err.toString());
                if ((err.code && (err.code === '57000' || err.code === 'ECONNRESET')) || err.toString().indexOf('Connection terminated') >= 0 ) {
                    state = 'Error';
                    //client.end();
                    queryArr.push({query:query, params:params, callback:callback});
                    connect();
                } else
                    callback(err, res);
            } else {
                callback(err, res);
            }
        });
        /////////////// RAJA
    } catch (e) {
        console.log(' ----- ERROR: in postgresQuery ----', e);
    }
};