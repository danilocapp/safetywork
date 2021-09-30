function authRole(role) {
    return (req, res, next) => {
        if (req.user.role === "Azienda") {
            return res.redirect("/public" )
        } if (req.user.role === "Utente") {
            return res.redirect("/utente")
        }

        next()
    }
}

module.exports = {

    authRole

}

//+ String(req.user.id) + "'"