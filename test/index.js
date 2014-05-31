var creditor = require('../creditor')
var debtor = require('../debtor')

var crypto = require('crypto')
var pull = require('pull-stream')
var tape = require('tape')
var randomsp = require('pull-randomly-split')

tape('simple creditReader', function (t) {

  var dr = debtor(128)

  var buffer = crypto.randomBytes(1024)

  var i = setInterval(function () {
    dr.credit(128)
  }, 10)

  pull(
    pull.values([buffer]),
    randomsp(64, 256),
    dr,
    pull.through(function (data) {
      if(data.length > 128) {
        clearInterval(i)
        throw new Error('too much data')
      }
    }),
    pull.collect(function (err, ary) {
      console.log(ary)
      clearInterval(i)
      t.deepEqual(Buffer.concat(ary), buffer)
      t.end()
    })
  )

})

tape('simple creditReadable', function (t) {
  var expected = [new Buffer(32)]
  var account = 0
  pull(
    pull.values(expected),
    creditor(128, function (end, _account) {
      if(!end)
        account = _account
    }),
    pull.collect(function (err, actual) {
      if(err) throw err
      t.deepEqual(actual, expected)
      t.equal(account, 32)
      t.end()
    })
  )
})
