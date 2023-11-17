const nodemailer = require('nodemailer')


// If we face trouble using GMAIL we should check here for fixes https://nodemailer.com/usage/using-gmail/

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mg993500@gmail.com',
    pass: 'nyyc yqqn qcxj acif'
  }
})

exports.sendEmail = (receiver, message) => {
  const mailOptions = {
    from: 'mg993500@gmail.com',
    to: receiver,
    subject: 'New authentication attempt to your BITS PILANI account',
    text: message
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

exports.generateOTP = () => {
  const newOTP = []
  // var idList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  const idList = ['Monitor', 'Basket Ball', 'Lantern', 'Top Hat', 'Battery', 'Dirt Block', 'Eagle', 'Anchor', 'Brick Wall', 'House', 'Chest', 'Pineapple', 'Wooden Crate', 'White Alien Standing', 'Brown Golem', 'Hexagonal Emerald']
  for (let i = 0; i < 4; i++) {
    const theid = idList[Math.floor(Math.random() * idList.length)]

    // overcomplicated removing
    for (let k = 0; k < idList.length; k++) {
      if (idList[k] === theid) {
        idList.splice(k, 1)
      }
    }
    newOTP.push(theid)
  }
  // passwordController.OTPhandling(newOTPnumbers)
  return newOTP
}
