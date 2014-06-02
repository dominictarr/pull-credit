var async = require('interleavings')
var assert = require('assert')
var pull = require('pull-stream')

var creditor = require('../creditor')
var debtor = require('../debtor')


var crypto = require('crypto')
var pull = require('pull-stream')
var tape = require('tape')
var randomsp = require('pull-randomly-split')
var property = require('pull-property')


function streamTest (async) {
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

  function interleave () {
    return function (read) {
      return function (abort, cb) {
        read(abort, async(cb))
      }
    }
  }

  pull(
    pull.values([buffer]),
    interleave(),
    dr,
    pull.through(function (data) {
      if(data.length > 128) {
        throw new Error('too much data')
      }
    }),
    interleave(),
    cr,
    interleave(),
    pull.collect(function (err, ary) {
      console.log(ary.length)
      var avg = 1024 / ary.length
      assert.ok(avg > 64, 'average chunk should be > 64, was:' + avg)
      assert.deepEqual(Buffer.concat(ary), buffer)
      async.done(null, Buffer.concat(ary))
    })
  )

  pull(creditSource, interleave() , creditSink)
}

async.test(streamTest, function (err, result, stats) {
  console.log(result)
  console.log(stats)
})
