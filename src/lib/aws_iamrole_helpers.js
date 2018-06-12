/**
 * All helper functions related to setting up the IAM Role credentialed session go here.
 */

/**
 * Returns whether the parameter is null or undefined.
 * @param {Any} d The parameter that should be checked for null or undefined
 */
const isNullOrUndefined = (d) => {
  return !d || (d === null)
}

/**
 * Definition of a RoleSession. This keeps track of everything from the roleARN being used to the
 * name of the session and the stored data associated with the session.
 */
class AWSRoleSession {
  constructor (AWS, roleARN) {
    this.AWS = AWS
    this.roleARN = roleARN
    this.sessionName = null
    this.session = null
    this.sessionData = {}
  }

  /**
   * Creates a new AWSRoleSession
   */
  createSession () {
    console.log('Creating session...')
    return new Promise((resolve, reject) => {
      try {
        const token = 'role/'
        const roleName = this.roleARN.substr(this.roleARN.indexOf(token) + token.length)
        this.sessionName = `${roleName}-aws-sdk`
        this.session = new this.AWS.STS()
        this.session.assumeRole({
          RoleArn: this.roleARN,
          RoleSessionName: this.sessionName
        }).promise().then((data) => {
          this.sessionData = data
          resolve(this)
        }).catch(e => {
          reject(e)
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}

/**
 * This class is responsible for maintaining all the active
 * roll sessions during the duration of the use of this library.
 */
class AWSRoleSessionManager {
  constructor (AWS) {
    this.AWS = AWS
    this.activeRoleSessions = {}
  }

  /**
   * Assumes the role provided within the session data.
   * @param {Object} sessionData The AWSRoleSession session data
   * that should be used in the config.
   */
  assumeRoleInConfig (sessionData) {
    console.log('Assuming Role with Credentials', sessionData)
    this.AWS.config.update({
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
        if (!isNullOrUndefined(opt)) {
          this.AWS.config.update(opt)
        }
      }

      // Update the AWS config for the provided options
      updateConfigForOptions(options)

      try {
        // Create or apply the activer ole
        if (this.activeRoleSessions[roleARN]) {
          console.log('Loading already instantiated session...')
          const existingRoleSession = this.activeRoleSessions[roleARN]
          this.assumeRoleInConfig(existingRoleSession.sessionData)
          resolve(existingRoleSession.session)
        } else {
          // Create a new session
          console.log(`Creating new AWSRoleSession with ARN [${roleARN}]...`)
          const newRoleSession = new AWSRoleSession(this.AWS, roleARN)
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
      } catch (thrownError) {
        console.log('Unexpected Error', thrownError)
        reject(thrownError)
      }
    })
  }
}

/**
 * Singleton Session Manager for all aws-role stuff.
 */
let sessionManager = null

/**
 * Instantiates a session based on an IAM Role specified in your AWS Config under
 * ~/.aws/config.
 * The role ARN needs to be the same as has been allocated under your config and the
 * sessionName is arbitrary. This is a promisfied function that will instantiate a new
 * session in case a pre-existing one does not already exist.
 *
 * @param {AWS} AWS Pass in the reference to your imported AWS-sdk library here. This way all operations involved with
 * assuming roles apply to your singleton instance of the AWS-sdk.
 * @param {String} roleARN The role ARN (Amazon Resource Number) specified in your ~/.aws/Config file
 * @param {Object} any other configuration options for the AWS SDK such as the region for which the role should be
 * assumed.
 * @returns {Promise} Promise which will assume the role and update the config to reflect it.
 */
const assumeRole = (AWS, roleARN, options) => {
  if (isNullOrUndefined(sessionManager)) {
    sessionManager = new AWSRoleSessionManager(AWS)
  }
  return sessionManager.assumeRole(roleARN, options)
}

module.exports = {
  assumeRole: assumeRole
}
