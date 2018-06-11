/**
 * All helper functions related to setting up the IAM Role credentialed session go here.
 */

const AWS = require('AWS-sdk')

/**
 * Returns whether the parameter is null or undefined.
 * @param {Any} d The parameter that should be checked for null or undefined
 */
const isNullOrUndefined = (d) => {
  return !d || (d === null)
}

class AWSRoleSession {
  constructor (roleARN) {
    this.roleARN = roleARN
    this.sessionName = null
    this.session = null
    this.sessionData = {}
  }

  /**
   * Creates a new AWSRoleSession
   */
  createSession () {
    const token = 'role/'
    const roleName = this.roleARN.substr(this.roleARN.indexOf(token) + token.length)
    this.sessionName = `${roleName}-aws-sdk`

    return new Promise((resolve, reject) => {
      this.session = new AWS.STS()
      this.session.assumeRole({
        RoleArn: this.roleARN,
        RoleSessionName: this.sessionName
      }).promise().then((data) => {
        this.sessionData = data
        resolve(this)
      }).catch(e => {
        reject(e)
      })
    })
  }
}

/**
 * This class is responsible for maintaining all the active
 * roll sessions during the duration of the use of this library.
 */
class AWSRoleSessionManager {
  constructor () {
    this.activeRoleSessions = {}
  }

  /**
   * Assumes the role provided within the session data.
   * @param {Object} sessionData The AWSRoleSession session data
   * that should be used in the config.
   */
  assumeRoleInConfig (sessionData) {
    AWS.config.update({
      accessKeyId: sessionData.Credentials.AccessKeyId,
      secretAccessKey: sessionData.Credentials.SecretAccessKey,
      sessionToken: sessionData.Credentials.SessionToken
    })
  }

  /**
   * This creates or retrieves an active IAM Role Session
   * for usage.
   *
   * @param {String} roleARN AWS Role ARN for usage
   */
  assumeRole (roleARN, options) {
    return new Promise((resolve, reject) => {
      const updateConfigForOptions = (opt) => {
        if (!isNullOrUndefined(options)) {
          AWS.config.update(options)
        }
      }

      // Update the AWS config for the provided options
      updateConfigForOptions(options)

      // Create or apply the activer ole
      if (this.activeRoleSessions[roleARN]) {
        const existingRoleSession = this.activeRoleSessions[roleARN]
        this.assumeRoleInConfig(existingRoleSession.sessionData)
        resolve(existingRoleSession.session)
      } else {
        // Create a new session
        const newRoleSession = AWSRoleSession(roleARN)
        newRoleSession.createSession()
          .then((session) => {
            // Store for future retrieval
            this.activeRoleSessions[roleARN] = newRoleSession
            this.assumeRoleInConfig(newRoleSession.sessionData)
            resolve(newRoleSession)
          })
          .catch(e => {
            reject(e)
          })
      }
    })
  }
}

// let session = null

/**
 * Instantiates a session based on an IAM Role specified in your AWS Config under
 * ~/.aws/config.
 * The role ARN needs to be the same as has been allocated under your config and the
 * sessionName is arbitrary. This is a promisfied function that will instantiate a new
 * session in case a pre-existing one does not already exist.
 *
 * @param roleArn The role ARN (Amazon Resource Number) specified in your ~/.aws/Config file
 * @param sessionName The name of the session that will be allocated. This is arbitrary.
 * @param options This can include any other options for your session. Ex. "region"
 */
// const createRoleSession = (roleARN, sessionName, options = null) => {
//   console.log('Instantiating Role Session', roleARN, sessionName, options)
//   const updateConfigForOptions = (opt) => {
//     if (!isNullOrUndefined(options)) {
//       AWS.config.update(options)
//     }
//   }

//   // Update the AWS config for the provided options
//   updateConfigForOptions(options)

//   if (isNullOrUndefined(session)) {
//     return new Promise((resolve, reject) => {
//       session = new AWS.STS()
//       session.assumeRole({
//         RoleArn: roleARN,
//         RoleSessionName: sessionName
//       }).promise().then((data) => {
//         AWS.config.update({
//           accessKeyId: data.Credentials.AccessKeyId,
//           secretAccessKey: data.Credentials.SecretAccessKey,
//           sessionToken: data.Credentials.SessionToken
//         })

//         resolve(session)
//       }).catch(e => {
//         reject(e)
//       })
//     })
//   } else {
//     return Promise.resolve(session)
//   }
// }

const sessionManager = new AWSRoleSessionManager()

/**
 * Instantiates a session based on an IAM Role specified in your AWS Config under
 * ~/.aws/config.
 * The role ARN needs to be the same as has been allocated under your config and the
 * sessionName is arbitrary. This is a promisfied function that will instantiate a new
 * session in case a pre-existing one does not already exist.
 *
 * @param {String} roleARN The role ARN (Amazon Resource Number) specified in your ~/.aws/Config file
 * @param {Object} any other configuration options for the AWS SDK such as the region for which the role should be
 * assumed.
 * @returns {Promise} Promise which will assume the role and update the config to reflect it.
 */
const assumeRole = (roleARN, options) => {
  return sessionManager.assumeRole(roleARN, options)
}

module.exports = {
  assumeRole: assumeRole
}
