/**
 *  Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import * as cdk from 'aws-cdk-lib';
import { EnableSharingWithAwsOrganization } from '../../index';

const testNamePrefix = 'Construct(EnableSharingWithAwsOrganization): ';

//Initialize stack for snapshot test and resource configuration test
const stack = new cdk.Stack();

new EnableSharingWithAwsOrganization(stack, 'EnableSharingWithAwsOrganization', {
  kmsKey: new cdk.aws_kms.Key(stack, 'CustomKey', {}),
  logRetentionInDays: 3653,
});

/**
 * HostedZone construct test
 */
describe('EnableSharingWithAwsOrganization', () => {
  /**
   * Number of Lambda function test
   */
  test(`${testNamePrefix} Lambda function count test`, () => {
    cdk.assertions.Template.fromStack(stack).resourceCountIs('AWS::Lambda::Function', 1);
  });

  /**
   * Number of IAM role test
   */
  test(`${testNamePrefix} IAM role count test`, () => {
    cdk.assertions.Template.fromStack(stack).resourceCountIs('AWS::IAM::Role', 1);
  });

  /**
   * Number of EnableSharingWithAwsOrganization custom resource test
   */
  test(`${testNamePrefix} EnableSharingWithAwsOrganization custom resource count test`, () => {
    cdk.assertions.Template.fromStack(stack).resourceCountIs('Custom::EnableSharingWithAwsOrganization', 1);
  });

  /**
   * Lambda function resource configuration test
   */
  test(`${testNamePrefix} Lambda function resource configuration test`, () => {
    cdk.assertions.Template.fromStack(stack).templateMatches({
      Resources: {
        CustomEnableSharingWithAwsOrganizationCustomResourceProviderHandler405D7398: {
          Type: 'AWS::Lambda::Function',
          DependsOn: ['CustomEnableSharingWithAwsOrganizationCustomResourceProviderRole4FE5EBD7'],
          Properties: {
            Code: {
              S3Bucket: {
                'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
              },
            },
            Handler: '__entrypoint__.handler',
            MemorySize: 128,
            Role: {
              'Fn::GetAtt': ['CustomEnableSharingWithAwsOrganizationCustomResourceProviderRole4FE5EBD7', 'Arn'],
            },
            Runtime: 'nodejs14.x',
            Timeout: 900,
          },
        },
      },
    });
  });

  /**
   * IAM role resource configuration test
   */
  test(`${testNamePrefix} IAM role resource configuration test`, () => {
    cdk.assertions.Template.fromStack(stack).templateMatches({
      Resources: {
        CustomEnableSharingWithAwsOrganizationCustomResourceProviderRole4FE5EBD7: {
          Type: 'AWS::IAM::Role',
          Properties: {
            AssumeRolePolicyDocument: {
              Statement: [
                {
                  Action: 'sts:AssumeRole',
                  Effect: 'Allow',
                  Principal: {
                    Service: 'lambda.amazonaws.com',
                  },
                },
              ],
              Version: '2012-10-17',
            },
            ManagedPolicyArns: [
              {
                'Fn::Sub': 'arn:${AWS::Partition}:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
              },
            ],
            Policies: [
              {
                PolicyDocument: {
                  Statement: [
                    {
                      Action: [
                        'ram:EnableSharingWithAwsOrganization',
                        'iam:CreateServiceLinkedRole',
                        'organizations:EnableAWSServiceAccess',
                        'organizations:ListAWSServiceAccessForOrganization',
                        'organizations:DescribeOrganization',
                      ],
                      Effect: 'Allow',
                      Resource: '*',
                    },
                  ],
                  Version: '2012-10-17',
                },
                PolicyName: 'Inline',
              },
            ],
          },
        },
      },
    });
  });

  /**
   * EnableSharingWithAwsOrganization custom resource configuration test
   */
  test(`${testNamePrefix} EnableSharingWithAwsOrganization custom resource configuration test`, () => {
    cdk.assertions.Template.fromStack(stack).templateMatches({
      Resources: {
        EnableSharingWithAwsOrganization81D5714F: {
          Type: 'Custom::EnableSharingWithAwsOrganization',
          DeletionPolicy: 'Delete',
          UpdateReplacePolicy: 'Delete',
          Properties: {
            ServiceToken: {
              'Fn::GetAtt': ['CustomEnableSharingWithAwsOrganizationCustomResourceProviderHandler405D7398', 'Arn'],
            },
          },
        },
      },
    });
  });
});
