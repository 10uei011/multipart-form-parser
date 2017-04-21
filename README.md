Multipart-form-parser is a node.js middleware for getting the form text fields of a `multipart/form-data`. This module does not handle file uploading.

## Installation

```sh
$ npm install --save multipart-form-parser
```

## Usage

Multipart-form-parser adds a `body` object to the `request` object. The `body` object contains the values of the text fields of the form.

Basic usage example:

```javascript
var express = require('express')
var multipartFormParser = require('multipart-form-parser')

var app = express()

app.post('/profile', multipartFormParser(), function (req, res, next) {
	//req.body will contain the text fields 
})```

## License

[MIT](LICENSE)