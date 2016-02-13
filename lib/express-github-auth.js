
var GitHubStrategy = require('passport-github').Strategy
var _ = require('lodash')

module.exports = function (options) {
  var seneca = this
  var service = 'github'

  var params = {
    clientID: options.clientID,
    clientSecret: options.clientSecret,
    callbackURL: options.urlhost + (options.callbackUrl || '/auth/github/callback')
  }
  params = _.extend(params, options.serviceParams || {})

  var authPlugin = new GitHubStrategy(params,
    function (accessToken, refreshToken, profile, done) {
      seneca.act(
        {
          role: 'auth',
          prepare: 'github_login_data',
          accessToken: accessToken,
          refreshToken: refreshToken,
          profile: profile
        }, done)
    }
  )

  function init (args, done) {
    seneca.act({role: 'auth', cmd: 'register_service', service: service, plugin: authPlugin, conf: options})
    done()
  }

  seneca.add('init: common-github-auth', init)


  return {
    name: 'express-github-auth'
  }
}
