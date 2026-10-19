module.exports = function authAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    res.locals.admin = req.session.admin;
    return next();
  }
  return res.redirect('/admin/login');
};
