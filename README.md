# AWS IAM Role Helper
This project builds off of the AWS SDK and makes it easier for you to instantiate IAM Role Sessions for your SDK Needs. Once you have instantiated your role session using a simple command, you can go ahead and use the SDK to query for your resources.

Instantiate Your Role Session:
```javascript
const AWS = require('AWS-sdk') // Your top-level import of AWS-sdk
const AWSRoleHelper = require('aws-iamrole-helper')
AWSRoleHelper.assumeRole(AWS, your_role_ARN)
  .then(() => {
    // do your work here to query the SDK
  })
```

Assume multiple roles at the same time. AWSRoleHelper takes care of managing all the sessions behind the scenes.
```javascript
const roleARNblue = 'Role ARN for some resource set blue'
const roleARNred = 'Role ARN for some resource set red'

AWSRoleHelper.assumeRole(AWS, roleARNBlue)
  .then(() => {
    // do something with BLUE resources
  })

AWSRoleHelper.assumeRole(AWS, roleARNRed)
  .then(() => {
    // do something with RED resources
  })
```