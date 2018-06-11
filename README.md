# AWS IAM Role Helper
This project builds off of the AWS SDK and makes it easier for you to instantiate IAM Role Sessions for your SDK Needs. Once you have instantiated your role session using a simple command, you can go ahead and use the SDK to query for your resources.

Instantiate Your Role Session:
```javascript
const AWSRoleHelper = require('aws-iamrole-helper')
AWSRoleHelper.assumeRole(your_role_ARN)
  .then(() => {
    // do your work here to query the SDK
  })
```

Assume multiple roles at the same time. AWSRoleHelper takes care of managing all the sessions behind the scenes.
```javascript
const roleARNblue = 'Role ARN for some resource set blue'
const roleARNred = 'Role ARN for some resource set red'

AWSRoleHelper.assumeRole(roleARNBlue)
  .then(() => {
    // do something with BLUE resources
  })

AWSRoleHelper.assumeRole(roleARNRed)
  .then(() => {
    // do something with RED resources
  })
```