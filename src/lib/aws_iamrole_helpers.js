/**
 * All helper functions related to setting up the IAM Role credentialed session go here.
 */

const AWS = require('AWS-sdk')
let session = null

const isNullOrUndefined = (d) => {
  return !d || (d === null)
}

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
const instantiateRoleSession = (roleARN, sessionName, options) => {
  if (isNullOrUndefined(session)) {
    return new Promise((resolve, reject) => {
      session = new AWS.STS()
      session.assumeRole({
        RoleArn: roleARN,
        RoleSessionName: sessionName
      }).promise().then((data) => {
        console.log(data)
        AWS.config.update({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken
        })
      }).catch(e => {
        reject(e)
      })
    })
  } else {
    return Promise.resolve(session)
  }
}

/**
 * Returns true if the IAM Role Session has been activated.
 */
const isRoleSessionActive = () => {
  return !isNullOrUndefined(session)
}

module.exports = {
  instantiateRoleSession: instantiateRoleSession,
  isRoleSessionActive: isRoleSessionActive
}
