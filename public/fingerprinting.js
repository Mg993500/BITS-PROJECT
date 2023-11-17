// const fpPromise = import('https://openfpcdn.io/fingerprintjs/v3')
//     .then(FingerprintJS => FingerprintJS.load())

// // Get the visitor identifier when you need it.
// fpPromise
//     .then(fp => fp.get())
//     .then(result => {
//         //console.log(result.components)
//         // This is the visitor identifier:
//         const visitorId = result.visitorId

//         // Trying ti goet only canvas but facing some problems https://github.com/fingerprintjs/fingerprintjs/blob/master/docs/extending.md

//         //  const { audio, colorDepth, colorGamut, contrast, cookiesEnabled, cpuClass, deviceMemory, domBlockers, fontPreferences, fonts, forcedColors, hardwareConcurrency, hdr,
//         //     indexedDB, invertedColors, languages, localStorage, math, monochrome, openDatabase, osCpu, platform, plugins, reducedMotion, screenFrame, screenResolution, sessionStorage,
//         //     timezone, touchSupport, vendor, vendorFlavors, ...components } = result.components
//         //console.log('RESULT AFTER EXCLUDING ALL COMPONENTS', result)
//         // const visitorId = FingerprintJS.hashComponents(components)

//         document.querySelector('form').addEventListener('submit', async () => {
//             console.log('Visitor ID when submitting: ', visitorId)
//             await postFP('http://localhost:3000/fp', { fingerprintJS: visitorId })
//         });
//         console.log(visitorId)
//     })

async function initFingerprintJS () {
  const fp = await FingerprintJS.load()
  const result = await fp.get()

  // Exclude a couple components
  const {
    audio, colorDepth, colorGamut, contrast, cookiesEnabled, cpuClass, deviceMemory, domBlockers, fontPreferences, fonts, forcedColors, hardwareConcurrency, hdr,
    indexedDB, invertedColors, languages, localStorage, math, monochrome, openDatabase, osCpu, platform, plugins, reducedMotion, screenFrame, screenResolution, sessionStorage,
    timezone, touchSupport, vendor, vendorFlavors, ...components
  } = result.components

  // Make a visitor identifier from your custom list of components
  const visitorId = FingerprintJS.hashComponents(components)
  console.log('visitorId:', visitorId)

  document.querySelector('form').addEventListener('submit', async () => {
    console.log('Visitor ID when submitting: ', visitorId)
    await postFP('http://localhost:3000/fp', { fingerprintJS: visitorId })
  })
}

async function postFP (url, body) {
  const data = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
  console.log('the data being posted to, ', url, 'is the following: ', data)
  // eslint-disable-next-line no-undef
  const response = await fetch(url, data)

  if (!response.ok) {
    const data = await response.json()

    console.log(response)
    console.log(JSON.stringify(data, null, 4))

    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response
}

// TODO use information from here to understand how to get CANVAS only!
// TODO Check this link to work FingerprintJS to get canvas https://github.com/fingerprintjs/fingerprintjs/issues/607
