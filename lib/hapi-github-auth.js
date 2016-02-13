var _ = require('lodash')

module.exports = function (opts) {
  var seneca = this
  var options = opts
  var service = 'github'

  seneca.add('role: auth, cmd: loginGithub', function (args, done) {
    var msg = _.extend({}, args, {role: 'auth', trigger: 'service-login-github', service: 'github'})
    delete msg.cmd
    seneca.act(msg, function (err, data) {
      done(err, data)
    })
  })

  function init_strategy (strategy) {
    seneca.act('role: web, get: server', function (err, data) {
      if (err) {
        throw new Error('Cannot retrieve server: ' + err)
      }

      if (!data) {
        throw new Error('Cannot retrieve server')
      }

      var server = data.server
      server.auth.strategy('github', 'bell', {
        provider: 'github',
        password: options.password,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        isSecure: _.has(options, 'isSecure') ? options.isSecure : true
      })

      seneca.act(
        'role: web',
        {
          plugin: 'auth',
          config: strategy,
          use: {
            prefix: '/auth/',
            pin: {role: 'auth', cmd: '*'},
            auth: 'github',
            map: {
              loginGithub: {GET: true, POST: true, auth: 'github', alias: 'github'}
            }
          }
        }, function (err, result) {
          console.log('Register', err, result)
        })
    })
  }

  function init (args, done) {
    init_strategy(options)
    seneca.act({role: 'auth', cmd: 'register_service', service: service, plugin: service, conf: options})
    done()
  }

  seneca.add('init: hapi-github-auth', init)

  return {
    name: 'hapi-github-auth'
  }
}
