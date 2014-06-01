var creditor = require('../creditor')
var debtor = require('../debtor')

var crypto = require('crypto')
var pull = require('pull-stream')
var tape = require('tape')
var randomsp = require('pull-randomly-split')
var property = require('pull-property')

function delay () {
  return function (read) {
    return function (abort, cb) {
      setTimeout(function () {
        read(abort, cb)
      }, 10)
    }
  }
}

function streamTest (main, credit) {

  tape('credit/debit stream - '
     + (main?'sync main, ':'')
     + (credit?'sync credit':'')
  , function (t) {
    var totalRead = 0
    var totalGiven = 0, totalReceived = 0

    var dr = debtor(128)
    var creditSource = property()

    var cr = creditor(128, function (_, data){
      console.log('totalGiven   ', totalGiven += data)
      creditSource.update(data | 0)
    })

    var creditSink = pull.drain(function (data) {
      console.log('totalReceived', totalReceived += data)
      dr.credit(data)
    })

    var buffer = crypto.randomBytes(1024)

    pull(
      pull.values([buffer]),
      randomsp(64, 256),
      dr,
      pull.through(function (data) {
        if(data.length > 128) {
          throw new Error('too much data')
        }
      }),
      main ? delay() : pull.through() ,
      cr,
      pull.collect(function (err, ary) {
        console.log(ary.length)
        var avg = 1024 / ary.length
        t.ok(avg > 64, 'average chunk should be > 64, was:' + avg)
        t.deepEqual(Buffer.concat(ary), buffer)
        t.end()
      })
    )

    pull(creditSource, credit ? delay() : pull.through() , creditSink)
  })
}

streamTest(true, true)
streamTest(false, false)
streamTest(true, false)
streamTest(false, true)

