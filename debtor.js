'use strict';


module.exports = function (credit) {
  var buffer = new Buffer(0),
    cb, read, abort, reading,
    spent = 0, offset = 0,
    ended = false

  credit = credit | 0

  function spend () {

    if(!cb) return

    var avail = credit - spent
    var remain = buffer.length - offset

    if( remain > 0 && avail > 0) {
      var m = Math.min(avail, remain)
      if(m == 0) return
      var data = buffer.slice(offset, offset + m)
      offset += m
      spent += m
      var _cb = cb
      cb = null
      _cb(null, data)
    } else if(remain == 0 && ended) {
      var _cb = cb
      cb = null
      _cb(ended)
    }
  }

  function pull () {
    if(reading) return spend()
    reading = true
    if(!read) return
    read(abort, function (end, data) {
      reading = false
      //append data to the buffer
      if(end) ended = end
      else if(!buffer || !buffer.length) {
        buffer = data
        offset = 0
      }
      else {
        buffer = Buffer.concat([buffer.slice(offset), data])
        offset = 0
      }
      spend()
    })
  }

  function reader (_read) {
    read = _read
    return function (_abort, _cb) {
      if(_abort)
        abort = _abort
      cb = _cb
      buffer.length - offset > 0 ? spend() : pull()
    }
  }

  reader.credit = function (n) {
    credit += n
    buffer.length - offset > 0 ? spend() : pull()
  }

  return reader

}

