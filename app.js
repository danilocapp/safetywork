//Declaring env variavles
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config
}
//Declaring all the needed libraries and created functions

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const connection = require('./dbconnect')
const initializePassport = require('./passport-config')
const bodyParser = require("body-parser")
const loginService = require('./loginService.js')
const multer = require('multer')
const path = require('path')
const helpers = require('./helpers.js')
const updateAziende = require('./updateRecordForm.js')
const updateUser = require('./updateAccountForm.js')
const { authRole } = require("./auth")

//Documets library
const fs = require('fs')

//Static folders
app.use(express.static(__dirname + '/views/'));
app.use(express.static(__dirname + './views/'));
app.use(bodyParser.urlencoded({ extended: true }));
//Session create
app.use(session({
    secret: 'process.env.SESSION_SECRET',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3000000 }
}))
//Passport session initialize
initializePassport(
    passport,
    email => loginService.findUserByEmail(email),
    id => loginService.findUserById(id)

)
app.use(passport.initialize())
app.use(passport.session())
//connection.query('SELECT * FROM users WHERE email = ?', [email])
//connection.query('SELECT * FROM users WHERE id = ?', [id])
app.listen()

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
//Flash for messages
app.use(flash());

app.use(methodOverride('_method'))
//Home admin route
app.get('/', checkAuthenticated, authRole("Admin"),
    (req, res) => {
        connection.query("SELECT * FROM aziende, corsi", (err, rows, fields) => {
            if (err) {
                console.log(err)
                return
            }
            res.render('index.ejs', {
                rows: rows,
                fields: fields,
                name: req.user.name,
                email: req.user.email
            })
        }
        )
    })
//Home aziende route
app.get('/public', checkAuthenticated, (req, res) => {
    if (req.user.role === "Admin") {
        id = req.params.id
        idnew = id.slice(1)
    } else {
        idnew = req.user.idazienda
    }


    connection.query("SELECT * FROM aziende where id  = '" + String(idnew) + "'", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM corsi", (err, corsi) => {
            if (err) {
                console.log(err)
                return
            }
            res.render('indexpublic.ejs', {
                rows: rows,
                fields: fields,
                corsi: corsi,
                name: req.user.name,
                email: req.user.email
            })
        }
        )
    })
}
)
//Profilo azienda
app.get('/profiloazienda', checkAuthenticated, authRole("Admin"), (req, res) => {
    var id = req.user.idazienda
    connection.query("SELECT * FROM aziende WHERE id = '" + String(id) + "' ", (err, rows) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('profilo_azienda.ejs', {
            rows: rows,
            user: req.user,
            name: req.user.name,
            email: req.user.email
        })
    }
    )

})
//Login route
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
//Single user register for admin page
app.get('/register', checkAuthenticated, authRole("Admin"), (req, res) => {
    connection.query("SELECT * FROM aziende", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('register.ejs', {
            user: req.user,
            name: req.user.name,
            email: req.user.email,
            rows: rows
        })
    })

})
//Azienda registration admin page
app.get('/register-azienda', checkAuthenticated, authRole("Admin"), (req, res) => {
    res.render('register-azienda.ejs', {
        user: req.user,
        name: req.user.name,
        email: req.user.email
    })
})
//New course create
app.get('/nuovo-corso', checkAuthenticated, authRole("Admin"), (req, res) => {
    res.render('nuovo-corso.ejs', {
        user: req.user,
        name: req.user.name,
        email: req.user.email
    })
})
//Users from database single profile azienda
app.get('/libretto', checkAuthenticated, authRole("Admin"), (req, res) => {
    var id = req.body.idazienda
    connection.query("SELECT * FROM users WHERE role = 'Utente' AND idazienda = '" + String(id) + "' ", (err, users) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM aziende", (err, aziende) => {
            if (err) {
                console.log(err)
                return
            }
            res.render('libretto.ejs', {
                aziende: aziende,
                users: users,
                user: req.user,
                name: req.user.name,
                email: req.user.email
            })
        }
        )
    }
    )

})
app.get('/libretto:id', checkAuthenticated, authRole("Admin"), (req, res) => {
    var id = req.params.id.slice(1)
    connection.query("SELECT * FROM aziende", (err, aziende) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM gruppi WHERE idazienda='" + String(id) + "'", (err, groups) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM users WHERE idazienda = '" + String(id) + "'", (err, users) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.render('libretto.ejs', {
                    aziende: aziende,
                    users: users,
                    groups: groups,
                    name: req.user.name,
                    email: req.user.email

                })
            }
            )

        })

    })
})
//Single profile admin view
app.get('/libretto/:id', checkAuthenticated, authRole("Admin"), (req, res) => {
    var id = req.params.id.slice(1)
    connection.query("SELECT * FROM users WHERE id='" + String(id) + "'", (err, rows) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM gruppi WHERE idazienda='" + String(id) + "'", (err, groups) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM aziende WHERE id='" + String(rows[0].idazienda) + "'", (err, aziende) => {
                if (err) {
                    console.log(err)
                    return
                }
                connection.query("SELECT * FROM users WHERE id = '" + String(id) + "'", (err, users) => {
                    if (err) {
                        console.log(err)
                        return
                    }
                    res.render('profile-edit.ejs', {
                        aziende: aziende,
                        groups: groups,
                        users: users,
                        user: req.user,
                        name: req.user.name,
                        email: req.user.email
                    })
                }
                )

            })

        })
    })
})

//Audit
app.get('/audit', checkAuthenticated, authRole("Admin"), (req, res) => {
    connection.query("SELECT * FROM clienti", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('audit.ejs', {
            rows: rows,
            fields: fields,
            user: req.user,
            name: req.user.name,
            email: req.user.email
        })
    }
    )

})
app.get('/auditnew', checkAuthenticated, authRole("Admin"), (req, res) => {
    connection.query("SELECT * FROM clienti", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM gruppi", (err, groups) => {
            if (err) {
                console.log(err)
                return
            }
            res.render('auditnew.ejs', {
                rows: rows,
                groups: groups,
                fields: fields,
                user: req.user,
                name: req.user.name,
                email: req.user.email
            })
        }
        )
    }
    )


})
app.post('/auditnew', checkAuthenticated, authRole("Admin"), (req, res) => {

    try {

        utente = req.body.utente,
            sedeoperativa = req.body.sedeoperativa,
            data = req.body.data,
            ora = req.body.ora,
            orediservizio = req.body.orediservizio,
            eta = req.body.eta,
            anzianitalavorativa = req.body.anzianitalavorativa,
            note = req.body.note,
            auditor = req.body.auditor,
            domanda1 = ""

        for (let x = 2; x < 16; x++) {
            if (req.body.audit + x + CheckBox1 === on) {

                return domanda1 === str("Ottimo")


            } else {

                if (req.body.audit + x + CheckBox2 === on) {

                    return domanda1 === str("Buono")


                } else {

                    if (req.body.audit + x + CheckBox3 === on) {

                        return domanda1 === str("Sufficiente")


                    } else {

                        return domanda1 === str("Insufficiente")

                    }
                }
            }
        }
        console.log(domanda1)
        // console.log(domanda2)
        // console.log(domanda3)
        // console.log(domanda4)
        // console.log(domanda5)
        // console.log(domanda6)
        // console.log(domanda7)
        // console.log(domanda8)
        // console.log(domanda9)



        connection.connect(function (err) {
            console.log("Connected!");
            //Insert a record in the "users" table:
            var sql = "INSERT INTO audit (utente, sedeoperativa,data,ora,orediservizio,eta,anzianitalavorativa,note,auditor,domanda1) VALUES ('" + utente + "', '" + sedeoperativa + "','" + data + "','" + ora + "','" + orediservizio + "','" + eta + "','" + anzianitalavorativa + "','" + note + "','" + auditor + "','" + domanda1 + "')";
            connection.query(sql, function (err, next) {

                if (err) return err;
                else {
                    return next
                }
            });
        });
        res.redirect('/audit')
    } catch {
        res.redirect('/auditnew')
    }
})
//Mancati infortuni
app.get('/mancati', checkAuthenticated, authRole("Admin"), (req, res) => {
    connection.query("SELECT * FROM clienti", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('mancati.ejs', {
            rows: rows,
            fields: fields,
            user: req.user,
            name: req.user.name,
            email: req.user.email
        })
    }
    )

})
app.get('/mancatinew', checkAuthenticated, authRole("Admin"), (req, res) => {
    connection.query("SELECT * FROM clienti", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM gruppi", (err, groups) => {
            if (err) {
                console.log(err)
                return
            }
            res.render('mancatinew.ejs', {
                rows: rows,
                groups: groups,
                fields: fields,
                user: req.user,
                name: req.user.name,
                email: req.user.email
            })
        }
        )
    }
    )


})
app.post('/mancatinew', checkAuthenticated, authRole("Admin"), (req, res) => {

    try {

        utente = req.body.utente,
            email = req.body.email,
            sedeoperativa = req.body.sedeoperativa,
            mansione = req.body.mansione



        connection.connect(function (err) {
            console.log("Connected!");
            //Insert a record in the "users" table:
            var sql = "INSERT INTO clienti (utente, email,sedeoperativa,mansione) VALUES ('" + utente + "', '" + email + "','" + sedeoperativa + "','" + mansione + "')";
            connection.query(sql, function (err, next) {

                if (err) return err;
                else {
                    return next
                }
            });
        });
        res.redirect('/mancati')
    } catch {
        res.redirect('/mancatinew')
    }
})
//Infortuni
app.get('/infortuni', checkAuthenticated, authRole("Admin"), (req, res) => {
    connection.query("SELECT * FROM clienti", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('infortuni.ejs', {
            rows: rows,
            fields: fields,
            user: req.user,
            name: req.user.name,
            email: req.user.email
        })
    }
    )

})
app.get('/infortuninew', checkAuthenticated, authRole("Admin"), (req, res) => {
    connection.query("SELECT * FROM clienti", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM gruppi", (err, groups) => {
            if (err) {
                console.log(err)
                return
            }
            res.render('infortuninew.ejs', {
                rows: rows,
                groups: groups,
                fields: fields,
                user: req.user,
                name: req.user.name,
                email: req.user.email
            })
        }
        )
    }
    )


})
app.post('/infortuninew', checkAuthenticated, authRole("Admin"), (req, res) => {

    try {

        utente = req.body.utente,
            email = req.body.email,
            sedeoperativa = req.body.sedeoperativa,
            mansione = req.body.mansione



        connection.connect(function (err) {
            console.log("Connected!");
            //Insert a record in the "users" table:
            var sql = "INSERT INTO clienti (utente, email,sedeoperativa,mansione) VALUES ('" + utente + "', '" + email + "','" + sedeoperativa + "','" + mansione + "')";
            connection.query(sql, function (err, next) {

                if (err) return err;
                else {
                    return next
                }
            });
        });
        res.redirect('/infortuni')
    } catch {
        res.redirect('/infortuninew')
    }
})

app.get('/struttura', checkAuthenticated, (req, res) => {
    var userId = req.user.id
    res.redirect('/struttura:' + userId)
})
//Azienda struttura gruppi 
app.get('/strutturapublic', checkAuthenticated, (req, res) => {
    connection.query("SELECT * FROM gruppi WHERE idazienda = '" + req.user.idazienda + "' ", (err, groups) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM users WHERE idazienda = '" + req.user.idazienda + "' ", (err, rows, fields) => {
            if (err) {
                console.log(err)
                return
            }
            res.render('strutturapublic.ejs', {
                rows: rows,
                fields: fields,
                groups: groups,
                name: req.user.name,
                email: req.user.email

            })
        }
        )
    }
    )


})
//Admin struttura gruppi
app.get('/struttura:id', checkAuthenticated, (req, res) => {
    var id = req.params.id.slice(1)
    connection.query("SELECT * FROM gruppi WHERE idazienda = '" + String(id) + "' ", (err, groups) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM users WHERE idazienda ='" + String(id) + "' ", (err, rows, fields) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM aziende ", (err, aziende) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.render('struttura.ejs', {
                    aziende: aziende,
                    rows: rows,
                    fields: fields,
                    groups: groups,
                    name: req.user.name,
                    email: req.user.email

                })
            }
            )
        }
        )
    }
    )


})
//Groups admin
app.get('/gruppi', checkAuthenticated, authRole("Admin"), (req, res) => {
    idazienda = req.body.idazienda
    connection.query("SELECT * FROM aziende", (err, aziende) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM users WHERE idazienda = '" + idazienda + "' ", (err, users) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM gruppi WHERE idazienda = '" + idazienda + "'", (err, groups) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.render('gruppi.ejs', {
                    aziende: aziende,
                    users: users,
                    groups: groups,
                    name: req.user.name,
                    email: req.user.email
                })
            })
        })
    })

})
app.get('/gruppi:id', checkAuthenticated, authRole("Admin"), (req, res) => {
    var id = req.params.id.slice(1)
    connection.query("SELECT * FROM aziende", (err, aziende) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM gruppi WHERE idazienda='" + String(id) + "'", (err, groups) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM users WHERE idazienda = '" + String(id) + "'", (err, users) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.render('gruppi.ejs', {
                    aziende: aziende,
                    users: users,
                    groups: groups,
                    name: req.user.name,
                    email: req.user.email

                })
            }
            )

        })

    })
})
app.post('/gruppi:id', checkAuthenticated, authRole("Admin"), (req, res) => {

    try {
        titolo = req.body.titolo,
            sottotitolo = req.body.sottotitolo,
            idazienda = req.body.idaziendao

        connection.connect(function (err) {
            console.log("Connected!");
            var sql = "INSERT INTO gruppi (titolo, sottotitolo,idazienda) VALUES ('" + titolo + "', '" + sottotitolo + "', '" + idazienda + "')";
            connection.query(sql, function (err, next) {

                if (err) return err;
                else {
                    return next
                }
            });
        });
        res.redirect('/struttura:' + idazienda)
    } catch {
        res.redirect('/utentiingruppi')
    }
})
app.post('/gruppi', checkAuthenticated, (req, res) => {

    try {
        titolo = req.body.titolo,
            sottotitolo = req.body.sottotitolo,
            idazienda = req.body.idazienda
        // idgruppo = 
        // uniqueid = idazienda + idgruppo

        connection.connect(function (err) {
            console.log("Connected!");
            var sql = "INSERT INTO gruppi (titolo, sottotitolo,idazienda) VALUES ('" + titolo + "', '" + sottotitolo + "', '" + idazienda + "')";
            connection.query(sql, function (err, next) {

                if (err) return err;
                else {
                    return next
                }
            });
        });
        res.redirect('/struttura')
    } catch {
        res.redirect('/utentiingruppi')
    }
})
//Utenti nei gruppi admin
app.get('/utentiingruppi', checkAuthenticated, (req, res) => {
    var userId = req.user.id
    res.redirect('/utentiingruppi:' + userId)
})
app.get('/utentiingruppi:id', checkAuthenticated, authRole("Admin"), (req, res) => {
    var id = req.params.id.slice(1)
    connection.query("SELECT * FROM aziende", (err, aziende) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM gruppi WHERE idazienda='" + String(id) + "'", (err, groups) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM users WHERE idazienda = '" + String(id) + "'", (err, users) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.render('utentiingruppi.ejs', {
                    aziende: aziende,
                    users: users,
                    groups: groups,
                    name: req.user.name,
                    email: req.user.email

                })
            })
        })
    })
})
app.post('/utentiingruppi:id', checkAuthenticated, authRole("Admin"), (req, res) => {

    idgruppo = req.body.idgruppo,
        idutente = req.body.idutente,
        idazienda = req.body.idazienda


    connection.connect(function (err) {
        console.log("Connected!");
        var sql = "SELECT * FROM users WHERE id = '" + String(idutente) + "'";
        connection.query(sql, function (err) {

            if (err) return err;

            var sql2 = "INSERT INTO users (idgruppo) VALUES ('" + String(idgruppo) + "')";
            connection.query(sql2, function (err, next) {

                if (err) return err;

                return res.redirect('/struttura:' + String(idazienda))

            });

        });
    });


})
app.post('/utentiingruppi', checkAuthenticated, (req, res) => {
    idgruppo = req.body.idgruppo,
        idutente = req.body.idutente,
        idazienda = req.body.idazienda

    connection.connect(function (err) {
        console.log("Connected!");
        var sql = "UPDATE users SET idgruppo = '" + String(idgruppo) + "' WHERE id ='" + String(idutente) + "';"
        connection.query(sql, function (err, next) {

            if (err) return err;

            next

        });
    });
    res.redirect('/struttura:' + String(idazienda))
})

//Prenotazioni dei corsi admin
app.get('/prenotazione', checkAuthenticated, (req, res) => {
    var userId = req.user.id
    res.redirect('/prenotazione:' + userId)
})
app.get('/prenotazione:id', checkAuthenticated, authRole("Admin"), (req, res) => {
    var id = req.params.id.slice(1)
    connection.query("SELECT * FROM aziende", (err, aziende) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM corsi ", (err, corsi) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM users WHERE idazienda = '" + String(id) + "'", (err, users) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.render('prenotazione.ejs', {
                    aziende: aziende,
                    users: users,
                    corsi: corsi,
                    name: req.user.name,
                    email: req.user.email

                })
            })
        })
    })
})
app.post('/prenotazione:id', checkAuthenticated, authRole("Admin"), (req, res) => {

    idcorso = req.body.idcorso,
        idutente = req.body.idutente,
        idazienda = req.params.id

    connection.query("SELECT * FROM users WHERE id = '" + String(idutente) + "'", (err, users) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM corsi WHERE id = '" + idcorso + "'", (err, corsi) => {
            if (err) {
                console.log(err)
                return
            }
            var sql = "INSERT INTO prenotazioni (dipendente,codicecorso,descrizione,datainzio,datafine,data,orario,docente,aula,modulo) VALUES ('" + users[0].name + "', '" + corsi[0].matricola + "', '" + corsi[0].descrizione + "', '" + corsi[0].datainzio + "', '" + corsi[0].datafine + "', '" + corsi[0].scadenza + "', '" + corsi[0].orario + "', '" + corsi[0].docente + "', '" + corsi[0].aula + "', '" + corsi[0].modulo + "')";
            console.log(users[0].name)
            console.log(corsi[0].matricola)
            connection.query(sql, function (err, next) {

                if (err) return err;

                return res.redirect('/struttura:' + String(idazienda))

            });
        })
    })
})
app.post('/prenotazione', checkAuthenticated, authRole("Admin"),(req, res) => {

        idcorso = req.body.idcorso,
        idutente = req.body.idutente,
        idazienda = req.params.id
    connection.connect(function (err) {
        connection.query("SELECT * FROM users WHERE id = '" + String(idutente) + "'", (err, users) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM corsi WHERE id = '" + String(idcorso) + "'", (err, corsi) => {
                if (err) {
                    console.log(err)
                    return
                }
                connection.query("INSERT INTO prenotazioni (dipendente,codicecorso,descrizione,datainizio,datafine,data,orario,docente,aula,modulo) VALUES ('" + users[0].name + "', '" + corsi[0].matricola + "', '" + corsi[0].descrizione + "', '" + corsi[0].datainzio + "', '" + corsi[0].datafine + "', '" + corsi[0].scadenza + "', '" + corsi[0].orario + "', '" + corsi[0].docente + "', '" + corsi[0].aula + "', '" + corsi[0].modulo + "')", function (err, next) {

                    if (err)  
                    console.log(err);

                    next

                });
            })
        })
    });
    res.redirect('/')
})

//Groups aziende
app.get('/azigruppi', checkAuthenticated, (req, res) => {
    idazienda = req.user.idazienda
    connection.query("SELECT * FROM aziende", (err, aziende) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM users WHERE idazienda = '" + idazienda + "' ", (err, users) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM gruppi WHERE idazienda = '" + idazienda + "'", (err, groups) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.render('azigruppi.ejs', {
                    aziende: aziende,
                    users: users,
                    groups: groups,
                    name: req.user.name,
                    email: req.user.email
                })
            })
        })
    })

})
app.post('/azigruppi', checkAuthenticated, (req, res) => {

    try {
        titolo = req.body.titolo,
            sottotitolo = req.body.sottotitolo,
            idazienda = req.user.idazienda

        connection.connect(function (err) {
            console.log("Connected!");
            var sql = "INSERT INTO gruppi (titolo, sottotitolo,idazienda) VALUES ('" + titolo + "', '" + sottotitolo + "', '" + idazienda + "')";
            connection.query(sql, function (err, next) {

                if (err) return err;
                else {
                    return next
                }
            });
        });
        res.redirect('/azigruppi')
    } catch {
        res.redirect('/')
    }
})
//Azienda struttura utenti gruppi
app.post('/userstruttura', checkAuthenticated, (req, res) => {

    try {
        utente = req.body.utente,
            email = req.body.email,
            mansione = req.body.mansione,
            role = "Utente",
            password = hashedPassword

        connection.connect(function (err) {
            console.log("Connected!");
            var clienti = "INSERT INTO clienti (utente, email, mansione, password) VALUES ('" + utente + "', '" + email + "', '" + mansione + "', '" + password + "')";
            connection.query(clienti, function (err, next) {

                if (err) return err;
                else {
                    return next
                }
            });
            var addToAuth = "INSERT INTO users (email,password,role) VALUES ('" + email + "', '" + password + "', '" + role + "')";
            connection.query(addToAuth, function (err, result) {

                if (err) throw err;
                else {
                    console.log("Credenziali azienda aggiunte!");
                    return result
                }
            });
        });
        res.redirect('/struttura')
    } catch {
        res.redirect('/')
    }
})
//Single page for simple users
app.get('/utente', checkAuthenticated, authRole("Utente"), (req, res) => {
    res.render('profile.ejs', {
        user: req.user,
        name: req.user.name,
        email: req.user.email
    })
})
//Admin docs for info
app.get('/documenti', checkAuthenticated, authRole("Admin"), (req, res, next) => {
    const cartella = './views/uploads/'
    //passsing directoryPath and callback function
    fs.readdir(cartella, function (err, files) {
        if (err) {
            console.log(err)
        } else {
            res.render('documenti.ejs', {
                files: files,
                name: req.user.name,
                email: req.user.email
            });
            next
        }
    });

})
//Corsi
app.get('/corsi', checkAuthenticated, authRole("Admin"), (req, res) => {
    connection.query("SELECT * FROM corsi", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('corsi.ejs', {
            rows: rows,
            fields: fields,
            name: req.user.name,
            email: req.user.email

        })
    })
})
//Dinamyc generate corsi
app.get('/corsi:id', checkAuthenticated, authRole("Admin"), (req, res) => {
    var id = req.params.id.slice(1)
    connection.query("SELECT * FROM corsi WHERE id='" + String(id) + "'", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('corso-singolo.ejs', {
            rows: rows,
            fields: fields,
            name: req.user.name,
            email: req.user.email

        })
    })

})
//Corsi nella visualizzazione azienda
app.get('/corsipublic', checkAuthenticated, (req, res) => {
    connection.query("SELECT * FROM corsi", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('corsipublic.ejs', {
            rows: rows,
            fields: fields,
            name: req.user.name,
            email: req.user.email

        })
    })
})
// app.get('/corsosingolo/:id', checkAuthenticated, (req, res) => {
//     connection.query("SELECT * FROM corsi", (err, rows, fields) => {
//         if (err) {
//             console.log(err)
//             return
//         }

//         var t = findCorsoIndex(req.params.id, rows)

//         res.render('corso-singolo.ejs', {
//             rows: rows,
//             fields: fields,
//             name: req.user.name,
//             email: req.user.email,
//         })
//     })
// })

//Lista aziende
app.get('/aziende', checkAuthenticated, authRole("Admin"), (req, res) => {
    connection.query("SELECT * FROM aziende", (err, rows, fields) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('aziende.ejs', {
            rows: rows,
            fields: fields,
            name: req.user.name,
            email: req.user.email

        })
    })

})
//Profili personali
app.get('/profile', checkAuthenticated, (req, res) => {
    var userId = req.user.id
    res.redirect('/profile' + userId)
})
//Gestione profili
app.get('/profile:id', checkAuthenticated, (req, res) => {
    var id = req.params.id.slice(1)
    connection.query("SELECT * FROM aziende", (err, aziende) => {
        if (err) {
            console.log(err)
            return
        }
        connection.query("SELECT * FROM gruppi WHERE idazienda='" + String(id) + "'", (err, groups) => {
            if (err) {
                console.log(err)
                return
            }
            connection.query("SELECT * FROM users WHERE idazienda = '" + String(id) + "'", (err, users) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.render('profile-edit.ejs', {
                    aziende: aziende,
                    groups: groups,
                    users: users,
                    user: req.user,
                    name: req.user.name,
                    email: req.user.email
                })
            }
            )

        })

    })

})

//Login richiesta
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
//Registrazione nuovo utente da Admin
app.post('/register', checkAuthenticated, authRole("Admin"), async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        fname = req.body.fname,
            email = req.body.email,
            password = hashedPassword,
            role = req.body.role,
            mansione = req.body.mansione,
            sedeoperativa = req.body.sedeoperativa,
            idazienda = req.body.idazienda,
            matricola = req.body.matricola,
            cellulare = req.body.cellulare,
            datadinascita = req.body.datadinascita,
            luogodinascita = req.body.luogodinascita,
            cf = req.body.cf



        connection.connect(function (err) {
            console.log("Connected!");
            if (loginService.findUserByEmail === req.body.email) {
                console.log('Duplicated record')
                return err
            }
            //Insert a record in the "users" table:
            var sql = "INSERT INTO users (idazienda, name, email, password, role, mansione, sedeoperativa,matricola,cellulare,datadinascita,luogodinascita,cf) VALUES ('" + idazienda + "', '" + fname + "','" + email + "','" + password + "','" + role + "','" + mansione + "','" + sedeoperativa + "','" + matricola + "','" + cellulare + "','" + datadinascita + "','" + luogodinascita + "','" + cf + "')";
            connection.query(sql, function (err, next) {

                if (err) return err;
                else {
                    return next
                }
            });
        });
        res.redirect('/')
    } catch {
        res.redirect('/register')
    }
})
//Registrazione nuova azienda da Admin
app.post('/register-azienda', checkAuthenticated, authRole("Admin"), async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        ragionesociale = req.body.ragionesociale,
            sedelegale = req.body.sedelegale,
            sedeoperativa = req.body.sedeoperativa,
            piva = req.body.piva,
            recapitotelefonico = req.body.recapitotelefonico,
            referente = req.body.referente,
            localitasl = req.body.localitasl,
            localitaso = req.body.localitaso,
            ateco = req.body.ateco,
            email = req.body.email,
            cellulare = req.body.cellulare,
            capso = req.body.capso,
            capsl = req.body.capsl,
            categoriadirischio = req.body.categoriadirischio,
            emailreferente = req.body.emailreferente,
            provinciasl = req.body.provinciasl,
            provinciaso = req.body.provinciaso,
            dipendentdichiarati = req.body.dipendentdichiarati,
            impiegati = req.body.impiegati,
            operai = req.body.operai,
            autisti = req.body.autisti,
            altro = req.body.altro,
            iniziocontratto = req.body.iniziocontratto,
            annualita = req.body.annualita,
            finecontratto = req.body.finecontratto,
            password = hashedPassword,
            role = "Azienda"



        connection.connect(function (err) {
            console.log("Connected!");
            //Insert a record in the "aziende" table:
            var sql = "INSERT INTO aziende (ragionesociale,sedelegale,sedeoperativa,piva,recapitotelefonico,referente,localitasl,localitaso,ateco,email,cellulare,capsl,capso,categoriadirischio,emailreferente,provinciasl,provinciaso,dipendentidichiarati,impiegati,operai,autisti,altro,iniziocontratto,annualita,finecontratto,password) VALUES ('" + ragionesociale + "', '" + sedelegale + "','" + sedeoperativa + "','" + piva + "','" + recapitotelefonico + "','" + referente + "','" + localitasl + "','" + localitaso + "','" + ateco + "','" + email + "','" + cellulare + "','" + capso + "','" + capsl + "','" + categoriadirischio + "','" + emailreferente + "','" + provinciasl + "','" + provinciaso + "','" + dipendentdichiarati + "','" + impiegati + "','" + operai + "','" + autisti + "','" + altro + "','" + iniziocontratto + "','" + annualita + "','" + finecontratto + "','" + password + "')";

            connection.query(sql, function (err, result) {

                if (err) throw err;
                else {
                    console.log("Azienda aggiunta!");
                    return result
                }
            });
            var addToAuth = "INSERT INTO users (email,password,role,name) VALUES ('" + email + "', '" + password + "', '" + role + "', '" + ragionesociale + "')";
            connection.query(addToAuth, function (err, result) {

                if (err) throw err;
                else {
                    console.log("Credenziali azienda aggiunte!");
                    return result
                }
            });
        });
        return res.redirect('/')
    } catch {
        return res.send('Errore');
    }
})
//Registra nuovo corso Admin
app.post('/nuovo-corso', checkAuthenticated, authRole("Admin"), (req, res) => {
    // change to new course fields

    try {


        matricola = req.body.matricola,
            nome = req.body.nome,
            orecorso = req.body.orecorso,
            teoria = req.body.teoria,
            pratica = req.body.pratica,
            numerosessioni = req.body.numerosessioni,

            dove = req.body.dove,
            docente = req.body.docente,
            scadenza = req.body.scadenza,

            dove0 = req.body.dove0,
            docente0 = req.body.docente0,
            scadenza0 = req.body.scadenza0,

            dove1 = req.body.dove1,
            docente1 = req.body.docente1,
            scadenza1 = req.body.scadenza1,

            dove2 = req.body.dove2,
            docente2 = req.body.docente2,
            scadenza2 = req.body.scadenza2,

            dove3 = req.body.dove3,
            docente3 = req.body.docente3,
            scadenza3 = req.body.scadenza3,

            connection.connect(function (err) {
                console.log("Connected!");
                //Insert a record in the "corsi" table:
                var sql = "INSERT INTO corsi (matricola,nome,orecorso,teoria,pratica,numerosessioni) VALUES ('" + matricola + "', '" + nome + "','" + orecorso + "','" + teoria + "','" + pratica + "','" + numerosessioni + "')";
                connection.query(sql, function (err, result) {

                    if (err)
                         console.log(err);
                    else {
                        //Insert a record in the "sessioni" table:
                        var sql2 = "INSERT INTO sessioni (dove,docente,validita) VALUES ?";
                        if(dove2===undefined){
                            var values = [
                                [dove0, docente0, scadenza0],
                                [dove1, docente1, scadenza1]
                            ]; 
                        } else if(dove2!==undefined && dove3===undefined) {
                            var values = [
                                [dove0, docente0, scadenza0],
                                [dove1, docente1, scadenza1],
                                [dove2, docente2, scadenza2]
                            ];
                        }else{
                            var values = [
                                [dove0, docente0, scadenza0],
                                [dove1, docente1, scadenza1],
                                [dove2, docente2, scadenza2],
                                [dove3, docente3, scadenza3]
                            ];
                        }
                        
                        connection.query(sql2, [values], function (err, result) {

                            if (err)
                            console.log(err);
                            else {
                                console.log("Records inserted")

                            }
                        });
                    }
                });
            });
        return res.redirect('/corsi')
    } catch {
        return;
    }
})

//Doc for everty user




// Modify aziende live

// // Get route to show update form
// app.get('/aziende/edit',checkAuthenticated, (req, res) => {
//     const id = req.params.id
//     const temp = await (updateAziende({ id }))
//     res.send(temp)
// })

// // Post route to update record
// app.post('/aziende/:id', async (req, res) => {
//     const id = req.params.id
//     const record = await loginService.findAziendaById.update(id, req.body)
//     console.log(`Record Updated : 
//       \n${JSON.stringify(record, null, 2)}`)
//     res.send('Record Updated')
// })


// Modify profilo live


// var sql = "UPDATE users SET ? WHERE ?", [{ mettmeister: mettmeister }, { mettwoch_id: mettwochId }];
// connection.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log(result.affectedRows + " record(s) updated");
// });



// Post route to update record
// app.post('/profile/:id', async (req, res) => {
//     const id = req.user.id
//     console.log(id)
//     const record = await loginService.findUserById.update(id, req.body)
//     console.log(`Record Updated : 
//       \n${JSON.stringify(record, null, 2)}`)
//     res.send('Record Updated')
// })
var singleUpload = multer.diskStorage({
    destination: function (req, file, callback) {
        fs.mkdir(path.join(__dirname, 'docs', req.ui), function () {
            callback(null, path.join(__dirname, 'docs', req.ui));
        });
    },
    filename: function (req, file, callback) {
        callback(null, req.ui + file.originalname.substring(file.originalname.indexOf('.'), file.originalname.length));
    }
});

var upload = multer({
    storage: singleUpload
}).single('pic');

//tell express what to do when the route is requested
app.post('/docs_single', function (req, res, next) {
    req.ui = shortid();
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!");
        }
        return res.end("File uploaded sucessfully!.");
    })
})

// Where are files uploaded Multer Admin files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'views/uploads');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
//Docs for admin
app.post('/documenti', checkAuthenticated, authRole("Admin"), (req, res) => {
    // 10 is the limit I've defined for number of uploaded files at once
    // 'multiple_images' is the name of our file input field
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('multiple_images', 10);

    upload(req, res, function (err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (err) {
            return res.send(err);
        }

        let result = " Hai caricato questi file:";
        const files = req.files;
        let index, len;

        // Loop through all the uploaded images and display them on frontend
        for (index = 0, len = files.length; index < len; ++index) {
            result += `"${files[index].path}"`;
        }

        req.flash('success_msg', "Caricati i documenti con successo!" + " " + result);
        res.redirect("/documenti");
    });
});

//Logut function
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})
//Functions to check authentication
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.local.user = req.user
        return res.redirect('/')
    }
    next()
}
app.listen(process.env.PORT || 3000);