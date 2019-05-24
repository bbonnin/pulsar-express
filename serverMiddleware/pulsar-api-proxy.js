import express from 'express'

const app = express()

app.get('/*', (req, res) => {
  // Validate, sanitize and send
  console.log(req.url) // /fdf/lklklk?htht
  console.log(req.query['u']) // 
  console.log(req.params['0'])
  res.write('Hey!')
  res.end()

  /*pathRewrite: { '^/api/' : '/' },
      //pathRewrite: { '^/api/' : function (path, req) { 
      //  return path.replace('/api', '/')
      //}},
      router: function(req) {
        var route = req.url.substring(req.url.indexOf('?') + 1)
        return route
      }*/
})

export default {
  path: '/api2',
  handler: app
}
