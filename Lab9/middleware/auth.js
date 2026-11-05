
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }

    req.flash('error', 'Спочатку увійдіть у систему.');
    return res.redirect('/login');
}

function isNotAuthenticated(req, res, next) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }

    next();
}

module.exports = {
    isAuthenticated,
    isNotAuthenticated
};
