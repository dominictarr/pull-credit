
/*

http://250bpm.com/blog:22

http://hintjens.com/blog:15

*/

module.exports = duplex

var pull = require('pull-stream')

var debtor   = module.exports.debtor = require('./debtor')
var creditor = module.exports.creditor = require('./creditor')
var property = require('pull-property')
var many     = require('pull-many')

function duplex (defaults) {

  var account = null
  var p = property()

  var dr = debtor(defaults)
  var cr = creditor(defaults, function (end, data) {
    p.update(data, end)
  })


  return {
    creditor: pull(
      pull.filter(function (data) {
        if('number' === typeof data)
          cr.credit(data)
        else
          return true
      }),
      dr
    ),
    sink: p,
    debtor: many([cr, p])
  }
}

