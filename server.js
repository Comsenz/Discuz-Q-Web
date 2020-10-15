var http = require('http')
var fs = require('fs')

var server = http.createServer(function(request, response) {
  // const html = fs.readFileSync('/dist/index.html')
  response.statusCode = 200
  const html = fs.readFileSync(`./dist/index.html`)
  response.setHeader('Content-Type', 'text/html;charset=utf-8')
  response.write(html)
  response.end()
})

server.listen(3000)
