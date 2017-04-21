var is = require('type-is')
var Busboy = require('busboy')
var onFinished = require('on-finished')
var appendField = require('append-field')
var makeError = require('./error')

module.exports = makeMiddleware

function makeMiddleware () {
  return function middleware (req, res, next) {
    if (!is(req, ['multipart'])) return next()

    req.body = Object.create(null)

    var busboy
    var isDone = false
    var readFinished = false
    var errorOccured = false

    try {
      busboy = new Busboy({ headers: req.headers})

    } catch (err) {
      return next(err)
    }

    busboy.on('field', function (fieldname, value, fieldnameTruncated, valueTruncated) {
      if (fieldnameTruncated) return abortWithCode('LIMIT_FIELD_KEY')
      if (valueTruncated) return abortWithCode('LIMIT_FIELD_VALUE', fieldname)

      appendField(req.body, fieldname, value)
    })

    busboy.on('error', function (err) { abortWithError(err) })
    busboy.on('fieldsLimit', function () { abortWithCode('LIMIT_FIELD_COUNT') })
    busboy.on('finish', function () {
      readFinished = true
      indicateDone()
    })

    req.pipe(busboy)
  }
}


function drainStream (stream) {
  stream.on('readable', stream.read.bind(stream))
}

function done (err) {
  if (isDone) return
  isDone = true

  req.unpipe(busboy)
  drainStream(req)
  busboy.removeAllListeners()

  onFinished(req, function () { next(err) })
}

function indicateDone () {
  if (readFinished && !errorOccured) done()
}

function abortWithError (uploadError) {
  if (errorOccured) return
  errorOccured = true
  done(uploadError)
}

function abortWithCode (code, optionalField) {
  abortWithError(makeError(code, optionalField))
}
