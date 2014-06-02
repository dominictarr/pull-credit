'use strict';

//read data in, until you have hit a threashold,
//and call a listener with the change in credit.
// this should be continously reading, until the buffer is full.
// but calling read empties the buffer.
// when you call read, it returns the entire buffer.

module.exports = function (max, onChange) {
  var buffer = null, ended, running, cb, read, abort
  function drain () {
    if(cb) {
      if(buffer) {
        var _buffer = buffer; buffer = null;
        var _cb = cb; cb = null
        onChange(null, _buffer.length)
        _cb(null, _buffer)
      } else if(ended) {
        var _cb = cb; cb = null
        onChange(ended, 0)
        _cb(ended, buffer)
      }
    }
  }

  function start () {
    if(running || ended) return
    running = true
    read(abort, function next (end, data) {
      if(end) {
        ended = end; return drain()
      }
      else if(!buffer)
        buffer = data
      else
        buffer = Buffer.concat([buffer, data])

      if(buffer.length > max) {
        return read(ended = new Error('overflow'), function () {
          buffer = null
          drain()
        })
      }
      else if(buffer.length < max && !ended)
        read(null, next)
      else
        running = false

      drain()
    })
  }

  return function (_read) {
    read = _read
    return function (_abort, _cb) {
      abort = _abort
      cb = _cb
      start(); drain()
    }
  }
}
