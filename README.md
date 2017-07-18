# Revoke Security Groups with a Lambda

If you have a system that leverages security groups to restrict access by IP address, you may have run into a number of problems:
* Stale IP addresses.  An IP address you don't recognize is there, but you don't want to delete it.
* Out of room.  Due to the number of stale IP addresses, the Security Group you made is at capacity for number of rules.

This is a lambda function that can be used to automatically purge all Security Group ingress rules at a specified time of day (or whenever).  This will allow for a "disposable" security group where temporary access requests can be implemented.  Permanent access can be added on a separate Security Group, and coffee shop access can be added on the disposable one.

There's probably a minimum version of node.js required for this, I dunno.  I ran this with 7.1.0, but if you find it works with a lower version, let me know.

## Configuration

### Create a Security Group

1. Create Security Group
1. After creation, tag the Security Group with Name `RevokeAllIngressAtMidnight` and Value `true`
1. Attach it to an instance now, or save it for later.

### Create AWS Policy

Create a policy similar to this.  Ensure you update your region, account-id, and SecurityGroup-id's in the revoking statement
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowListingSecurityGroups",
      "Effect": "Allow",
      "Action": [ "ec2:DescribeSecurityGroups" ],
      "Resource": [ "*" ]
    },
    {
      "Sid": "AllowRevokingSecurityGroupRulesOnSpecificARNs",
      "Effect": "Allow",
      "Action": [ "ec2:RevokeSecurityGroupIngress" ],
      "Resource": [
        "arn:aws:ec2:us-east-1:123456789012:security-group/sg-1234abcd",
        "arn:aws:ec2:us-east-1:123456789012:security-group/sg-fedc9876"
      ]
    }
  ]
}
```

### Create AWS Role

Create a Role, add the Policy you just created.  ezpz.

### Package This Script
```
npm install
npm run package
```
This will create a zip file that can be uploaded to the Lambda Console

### Create a Lambda Function

1. Blank Function
1. Triggered by CloudWatch Events
  * Enable Trigger
  * New (or existing) rule
  * Set your rule, such as `cron(0 20 * * ? *)` to run every day at midnight EDT
1. Set Name, Description
1. Set Code Entry to "Upload a .zip", and upload the zip file generated in the last step.

## Why?

I wrote this in Node.js as a way to avoid a minor frustration in my day-do-day life, but also as a way to better understand promises in Node.
