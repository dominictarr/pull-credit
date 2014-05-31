
/*

http://250bpm.com/blog:22

http://hintjens.com/blog:15

*/

module.exports = duplex
module.exports.debtor = require('./debtor')
module.exports.creditor = require('./creditor')

function duplex (inner, defaults) {

  var dr = debtor(defaults)
  var cr = creditor(defaults, function (end, data) {
    
  })

  return {
    //read from the stream,
    //but if it gives us a number, that is our credit.
    source: pull(
      inner.source,
      dr
    ),
    sink: pull(
      pull.filter(function (data) {
        if('number' === typeof data)
          cr.credit(data)
        else
          return true
      }),
      dr,
      inner.sink
    )
  }
}

//function (end, cb) {
//      inner.source(end, function next (end, data) {
//        if('number' === typeof data) {
//          cr
//        }
//
//      })
//    }
//
//  }
//}
//
