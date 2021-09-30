
const connection = require('./dbconnect.js');
const bcrypt = require('bcrypt')

let findUserByEmail = (email) => {
    return new Promise(((resolve, reject) => {
        try {
            connection.query("SELECT * FROM users where email=?", email, function (error, rows) {
                if (error) {
                    reject(error)
                }
                let user = rows[0]
                resolve(user)
            })
        } catch (e) {
            reject(e);
        }
    }));
};
let findAziendaByEmail = (email2) => {
    return new Promise(((resolve, reject) => {
        try {
            connection.query("SELECT * from aziende where email=?", email2, function (error, rows) {
                if (error) {
                    reject(error)
                }
                let azienda = rows[0]
                resolve(azienda)
            })
        } catch (e) {
            reject(e);
        }
    }));
};
let findUserById = (id) => {
    return new Promise(((resolve, reject) => {
        try {
            connection.query("SELECT * from users where id=?", id, function (error, rows) {
                if (error) {
                    reject(error)
                }
                let user = rows[0]
                console.log(user)
                resolve(user)
            })
        } catch (e) {
            reject(e);
        }
    }));
};
let findAziendaById = (id) => {
    return new Promise(((resolve, reject) => {
        try {
            connection.query("SELECT * from aziende where id=?", id, function (error, rows) {
                if (error) {
                    reject(error)
                }
                let azienda = rows[0]
                console.log(azienda)
                resolve(azienda)
            })
        } catch (e) {
            reject(e);
        }
    }));
};
let comparePasswordUser = (user, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let isMatch = await bcrypt.compare(password, user.password)
            if (isMatch) resolve(true);
            reject("Password incorrect");
        } catch (e) {
            reject(e);
        }
    }
    )
};


module.exports = {
    comparePasswordUser: comparePasswordUser,
    findUserByEmail: findUserByEmail,
    findUserById:findUserById,
    findAziendaByEmail:findAziendaByEmail,
    findAziendaById:findAziendaById 
}