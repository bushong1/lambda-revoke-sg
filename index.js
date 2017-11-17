var AWS = require('aws-sdk');
var ec2 = new AWS.EC2({region: "us-east-1"});

const filterTagName = "RevokeAllIngressAtMidnight";
const params = {
  Filters: [
    { Name: "tag-key", Values: [ filterTagName ] },
    { Name: "tag-value", Values: [ "true" ] }
  ]
};


function resetSecurityGroupRules(event, context, callback) {
  console.log("Describing security groups...");
  ec2.describeSecurityGroups(params).promise().then(function(groups) {
    console.log(`Successfully described security groups: ${JSON.stringify(groups)}`);
    let promises = groups.SecurityGroups.map(revokeSecurityGroupIngress);
    Promise.all(promises).then(resultArray => {
      console.log(`Successfully revoked all permissions.  resultArray=${JSON.stringify(resultArray)}`);
      callback(null, `Successfully revoked all permissions.  resultArray=${JSON.stringify(resultArray)}`);
    })
  }).catch(function(err) {
    console.log(`ERROR revoking security groups.  err=${JSON.stringify(err)}`);
    callback(err);
  })
}

function revokeSecurityGroupIngress(group) {
  if (group.IpPermissions.length > 0) {
    var revokeParams = {
      IpPermissions: group.IpPermissions.map(mapIpPermissions),
      GroupId: group.GroupId
    };
    console.log(`Promising to  to revoke permissions with the following params: ${JSON.stringify(revokeParams)}`);
    return ec2.revokeSecurityGroupIngress(revokeParams).promise().then(function(data) {
      console.log(`Successfully revoked permissions on group "${group.GroupName}"`);
      return `Successfully revoked permissions on group "${group.GroupName}"`;
    });
  } else {
    console.log(`No permissions to revoke on group "${group.GroupName}"`);
    return `No permissions to revoke on group "${group.GroupName}"`;
  }
}

function mapIpPermissions(item) {
  return {
    FromPort: item.FromPort,
    IpProtocol: item.IpProtocol,
    IpRanges: item.IpRanges,
    ToPort: item.ToPort
  }
}

exports.handler = resetSecurityGroupRules;
