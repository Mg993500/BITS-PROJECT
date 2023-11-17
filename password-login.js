const bcrypt = require('bcrypt')
// const mysql = require('./db-manager')
const mysql = require('mysql')

// Import the module responsible for sending emails
const secondChannel = require('./second-channel')

const con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'password', database: 'snowbeez', port: 3306 })

let fp = null
let gp = null
let sweetWordOne = null
let sweetWordTwo = null
let email = null
const secondChannelEmail = 'djsparten117@gmail.com'
const OTP = secondChannel.generateOTP()
let OTPsent = false

const messages = {
  invalidEmail: 'Invalid email'

}
con.connect((err) => {
  if (err) console.log('bad luck - no connection' + err)
  else {
    console.log('db connected')
  }
})

exports.passwordAuth = (req, res) => {
  // console.log('this is the response: \n', req)
  console.log(req.body)
  email = req.body.email
  const password = req.body.password
  con.query('SELECT * FROM users WHERE users.email = ?', [email], async (err, results, fields) => {
    if (err) {
      console.log(err, 'something happened ERROR')
    }

    if (results.length > 0) {
      console.log('These are the results from the DB ', results)
      console.log('Found user email in DB ', results[0].email)
      try {
        // Check if passwords match.
        if (await bcrypt.compare(password, results[0].pass)) {
          // Check if the fingerprint in the database matches the collected one.
          for (let i = 0; i < results.length; i++) {
            if (results[i].dbFingerprint === fp) {
              // Call for graphical..
              sweetWordOne = results[i].sweetWordOne
              sweetWordTwo = results[i].sweetWordTwo
              return res.redirect('/graphical')
            }
          }

          secondChannel.sendEmail(secondChannelEmail, 'You have received this email because you recently tried logging in to your sonwbeeZ account but your device/browser have changed' + OTP)
          OTPsent = true
          // OTP logic method call
          return res.redirect('/graphical')
        } else {
          return res.render('./login.ejs', { messages: 'Wrong password' })
        }
      } catch (e) {
        console.log(e)
        return res.status(500).send('an Error happened when checking password hashes')
      }
    } else {
      console.log('DID NOT Find user email in DB ')
      return res.render('./login.ejs', { messages: 'Invalid email' })
    }
  })
}

exports.fingerprintAuth = (req, res) => {
  fp = req.body.fingerprintJS
  console.log('The fingerprint collected: ', fp)
  res.status(200)
}

exports.graphicalAuth = async (req, res) => {
  temp = req.body.paswordNumbers
  temp2 = ''
  // console.log("the RWQ", req)
  temp.forEach(element => {
    temp2 += element
  })
  gp = temp2
  console.log('returning graphicalAuth', req.body.paswordNumbers)
  console.log('graphicalCheckDB userGp:', gp)
  console.log('sweetword1:', sweetWordOne)
  console.log('sweetword2:', sweetWordTwo)
  let sweetword = null
  if (OTPsent) {
    console.log('Got in OTP sent thing')
    const orderList = ['Monitor', 'Basket Ball', 'Lantern', 'Top Hat', 'Battery', 'Dirt Block', 'Eagle', 'Anchor', 'Brick Wall', 'House', 'Chest', 'Pineapple', 'Wooden Crate', 'White Alien Standing', 'Brown Golem', 'Hexagonal Emerald']
    let newOTPnumbers = ''
    for (let k = 0; k < OTP.length; k++) {
      var temp = orderList.indexOf(OTP[k])
      newOTPnumbers = newOTPnumbers + temp
    }
    if (newOTPnumbers === gp) {
      console.log('Matching GP , authenticate')
      con.query('SELECT * FROM users WHERE users.email = ?', [email], async (err, results) => {
        if (err) {
          console.log(err, 'something happened in graphical checking ERROR')
        }
        con.query('INSERT INTO snowbeez.users (email, pass, dbFingerprint, sweetWordOne, sweetWordTwo) VALUES (?, ?, ?, ?, ?)', [results[0].email, results[0].pass, fp, results[0].sweetWordOne, results[0].sweetWordTwo], async (err, results) => {
          if (err) {
            console.log(err, 'something happened when inserting new fingerprint')
          }
        })
        // INSERT INTO `snowbeez`.`users` (`email`, `pass`, `dbFingerprint`, `sweetWordOne`, `sweetWordTwo`) VALUES ('d@d', '$2b$10$BXodD/MX35duUXKysDsi9.5EOXgZG5kHngHc/jAbnhbSU0uvcqrzu', '0d1b9e7f2bd4d261ee8745a036829583', '$2b$10$YN.GgPSzC9HyvdWWqcxJCO9x5iyKeS9hckoEiabNZwEYkQbq54ao.', '$2b$10$O1S.dOkPS3juBgahPNXveu9qo9AXiB06.INN6M8kOeBBvMAkWYuHy');
      })
      OTPsent = false
      return res.redirect('/')
    } else {
      console.log('internal OTP: ', newOTPnumbers)
      console.log('from them:', gp)
      OTPsent = false
      return res.redirect('/login')
    }
  } else {
    try {
      con.query('SELECT * FROM honeychecker WHERE honeychecker.user = ?', [email], async (err, results) => {
        if (err) {
          console.log(err, 'something happened in graphical checking ERROR')
        } else if (await bcrypt.compare(gp, sweetWordOne)) {
          console.log('mattching sweetword one!!!')
          sweetword = 'sweetWordOne'
        } else if (await bcrypt.compare(gp, sweetWordTwo)) {
          console.log('mattching sweetword Two!!!')
          sweetword = 'sweetWordTwo'
        } else {
          console.log('No Matching sweewords') // just an incorect GP
          sweetword = 'wrong'
        }

        if (results.length > 0) {
          console.log(results)
          console.log('SW: ', results[0].correctSW)
          if (results[0].correctSW === sweetword) {
            console.log('screaming found')
            // log in here
            return res.redirect('/')
          } else if (sweetword == 'wrong') {
            // only wrong GP, no HT
            console.log('Simply incorrect GP')
            return res.redirect('/graphical')
          } else {
            console.log('from DB: ', results[0].correctSW, 'From here', sweetword)
            console.log('HONEYTOKEN ALERT?')
            // honeytoken alert
            secondChannel.sendEmail(secondChannelEmail, 'WE got caught! Check yourself before you reck yourself..')
            return res.redirect('/login')
          }
        } else {
          console.log('DID NOT Find any Results in DB GP (Liekly problem is User is not in HC)')
          // return res.render('./login.ejs', { messages: 'Invalid email' })
          return res.redirect('/login')
        }
      })
    } catch (e) {
      console.log(e)
      return res.status(500).send('an Error happened when checking graphical hashes')
    }
  }

  res.status(200)
}

// Add logic for when OTP is generated
