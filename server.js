// Importing express to this module and creating an app instance.
const express = require('express')
const app = express()

// Requiring bcrypt that will be used for hashing the passwords
const bcrypt = require('bcrypt')

// JavaScript library in order to read data from POST requests on our server.
const bodyParser = require('body-parser')

// Requiring password login logic.
const passwordController = require('./password-login')
// Requiring fingerprint login logic.
// const fingerprintController = require('./fingerprint-auth')

// Local variable to store users.
const users = []

// Setting the rendering engine to ejs
app.set('view-engine', 'ejs')

// Use this to be able to access the values from the HTML login forms.
app.use(express.urlencoded({ extended: false }))
// Using static to serve client scripts and CSS from public directory.
app.use(express.static('public'))
// Used to be able to parse JSON requests from a client.
app.use(bodyParser.json())

// Handling GET requests coming to our app by serving from the root directory.
app.get('/', (req, res) => {
  res.render('index.ejs')
})

// Adding a route to serve the login page.
app.get('/login', (req, res) => {
  res.render('login.ejs', { messages: '' })
})

// Adding a route to serve the login page.
app.get('/register', (req, res) => {
  res.render('register.ejs')
})

// Adding a route to serve the graphical testing page.
app.get('/graphical', (req, res) => {
  res.render('graphical.ejs')
})

// app.post('/graphical', graphicalManager.checkPictures)
app.post('/graphical', passwordController.graphicalAuth)

// Adding a new route from the login page to deal with incoming data.
app.post('/login', passwordController.passwordAuth)

// Added a route to handle fingerprinting requests. This can be turned into a route to handle all post methods from the client.
// If there is anything they want to send in the background.
app.post('/fp', passwordController.fingerprintAuth)

// Logout redirect to login
app.post('/logout', (req, res) => {
  res.redirect('/login')
})

// Adding a new route from the register page to deal with incoming data.
app.post('/register', async (req, res) => {
  try {
    // Creating a hash out of the submitted password upon registering.
    // req.body.password is getting the body of the POST request the contains password input we then await hashing.
    // password is the name attribute in the HTML
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    console.log(hashedPassword)
    // Adding the user to the users array.
    // TODO replace this with adding user to DB. Also maybe add a user ID
    users.push({
      email: req.body.email,
      password: hashedPassword
    })
    // If the user was successful we redirect them to login using the response.
    res.redirect('/login')
  } catch {
    // If registration fails we send them back to the same registration page.
    res.redirect('/register')
  }
  // Check if user is created
  console.log(users)
})

// Express app listening on port 3000
app.listen(3000)
