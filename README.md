# AWS IAMROLE Helper
This project builds off of the AWS SDK and makes it easier for you to instantiate an IAM Role Session for your SDK Needs. Once you have instantiated your role session using a simple command, you can go ahead and use the SDK to query for your resources.

Instantiate Your Role Session:
```javascript
createRoleSession(your_role_ARN, session_name)
  .then(() => {
    // do your work here to query the SDK
  })
```