import bowser from 'bowser'
const vendorPrefixes = {
  Webkit: [ 'chrome', 'safari', 'ios', 'android', 'phantom', 'opera', 'webos', 'blackberry', 'bada', 'tizen', 'chromium', 'vivaldi' ],
  Moz: [ 'firefox', 'seamonkey', 'sailfish' ],
  ms: [ 'msie', 'msedge' ]
}
const browsers = {
  chrome: [ [ 'chrome' ], [ 'chromium' ] ],
  safari: [ [ 'safari' ] ],
  firefox: [ [ 'firefox' ] ],
  ie: [ [ 'msie' ] ],
  edge: [ [ 'msedge' ] ],
  opera: [ [ 'opera' ], [ 'vivaldi' ] ],
  ios_saf: [ [ 'ios', 'mobile' ], [ 'ios', 'tablet' ] ],
  ie_mob: [ [ 'windowsphone', 'mobile', 'msie' ], [ 'windowsphone', 'tablet', 'msie' ], [ 'windowsphone', 'mobile', 'msedge' ], [ 'windowsphone', 'tablet', 'msedge' ] ],
  op_mini: [ [ 'opera', 'mobile' ], [ 'opera', 'tablet' ] ],
  and_uc: [ [ 'android', 'mobile' ], [ 'android', 'tablet' ] ],
  android: [ [ 'android', 'mobile' ], [ 'android', 'tablet' ] ]
}

const browserByInfo = (info) => {
  if (info['firefox']) {
      return 'firefox';
  }
  let name = '';
  Object.keys(browsers).forEach(browser => {
    browsers[browser].forEach(condition => {
      let match = 0
      condition.forEach(single => {
        if (info[single]) {
          match += 1
        }
      })
      if (condition.length === match) {
        name = browser;
      }
    })
  })
  return name;
}

/**
 * Uses bowser to get default browser information such as version and name
 * Evaluates bowser info and adds vendorPrefix information
 * @param {string} userAgent - userAgent that gets evaluated
 */
export default userAgent => {
  if (!userAgent) {
    return false
  }
  const info = bowser._detect(userAgent)

  Object.keys(vendorPrefixes).forEach(prefix => {
    vendorPrefixes[prefix].forEach(browser => {
      if (info[browser]) {
        info.prefix = {
          inline: prefix,
          css: '-' + prefix.toLowerCase() + '-'
        }
      }
    })
  })

  info.browser = browserByInfo(info);

  // For cordova IOS 8 the version is missing, set truncated osversion to prevent NaN
  info.version = info.version ? parseFloat(info.version) : parseInt(parseFloat(info.osversion), 10)
  info.osversion = parseFloat(info.osversion)


  // iOS forces all browsers to use Safari under the hood
  // as the Safari version seems to match the iOS version
  // we just explicitely use the osversion instead
  // https://github.com/rofrischmann/inline-style-prefixer/issues/72
  if (info.browser === 'ios_saf' && info.version > info.osversion) {
    info.version = info.osversion
    info.safari = true
  }


  // seperate native android chrome
  // https://github.com/rofrischmann/inline-style-prefixer/issues/45
  if (info.browser === 'android' && info.chrome && info.version > 37) {
    info.browser = 'and_chr'
  }

  // For android < 4.4 we want to check the osversion
  // not the chrome version, see issue #26
  // https://github.com/rofrischmann/inline-style-prefixer/issues/26
  if (info.browser === 'android' && info.osversion < 5) {
    info.version = info.osversion
  }

  return info
}
