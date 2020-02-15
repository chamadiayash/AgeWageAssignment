const mysql = require('mysql');

class DB {
    static initialize(dbCredentials) {
        // return Promise.reject('111');
        this.db = mysql.createConnection(dbCredentials);
        return new Promise((resolve, reject) => this.db.connect(err => {
            if(err){
                return reject(err);
            }
            return resolve(true);
        }));
    }
    static async getQuery(query) {
        return new Promise((resolve, reject) => {
            this.db.query(query, (error, results, fields) => {
                if(error) reject(error);
                resolve(results);
            })
        });
    }
    static async getQueryStream() {
        
    }
}

module.exports = DB;