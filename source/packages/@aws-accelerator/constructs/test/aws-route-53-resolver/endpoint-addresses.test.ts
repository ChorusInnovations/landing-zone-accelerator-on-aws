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

import { EndpointAddresses } from '../../lib/aws-route-53-resolver/endpoint-addresses';

const testNamePrefix = 'Construct(ResolverEndpointAddresses): ';

const stack = new cdk.Stack();

new EndpointAddresses(stack, 'TestEndpointAddresses', {
  endpointId: 'TestEndpointId',
  kmsKey: new cdk.aws_kms.Key(stack, 'CustomKey', {}),
  logRetentionInDays: 3653,
});

/**
 * Resolver endpoint addresses construct test
 */
describe('EndpointAddresses', () => {
  /**
   * Resolver endpoint addresses count test
   */
  test(`${testNamePrefix} Resolver endpoint addresses count test`, () => {
    cdk.assertions.Template.fromStack(stack).resourceCountIs('Custom::ResolverEndpointAddresses', 1);
  });

  /**
   * IAM role count test
   */
  test(`${testNamePrefix} IAM role count test`, () => {
    cdk.assertions.Template.fromStack(stack).resourceCountIs('AWS::IAM::Role', 1);
  });

  /**
   * Lambda function count test
   */
  test(`${testNamePrefix} Lambda function count test`, () => {
    cdk.assertions.Template.fromStack(stack).resourceCountIs('AWS::Lambda::Function', 1);
  });

  /**
   * Resolver endpoint addresses resource config test
   */
  test(`${testNamePrefix} Resolver endpoint addresses resource configuration test`, () => {
    cdk.assertions.Template.fromStack(stack).templateMatches({
      Resources: {
        TestEndpointAddressesCE4F1BB4: {
          Type: 'Custom::ResolverEndpointAddresses',
          Properties: {
            ServiceToken: {
              'Fn::GetAtt': ['CustomResolverEndpointAddressesCustomResourceProviderHandler09D4123E', 'Arn'],
            },
            endpointId: 'TestEndpointId',
            region: {
              Ref: 'AWS::Region',
            },
          },
        },
      },
    });
  });

  /**
   * IAM role resource config test
   */
  test(`${testNamePrefix} IAM role resource configuration test`, () => {
    cdk.assertions.Template.fromStack(stack).templateMatches({
      Resources: {
        CustomResolverEndpointAddressesCustomResourceProviderRoleA94B4F27: {
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
                      Action: ['route53resolver:ListResolverEndpointIpAddresses'],
                      Effect: 'Allow',
                      Resource: '*',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    });
  });

  /**
   * Lambda function resource config test
   */
  test(`${testNamePrefix} Lambda function resource configuration test`, () => {
    cdk.assertions.Template.fromStack(stack).templateMatches({
      Resources: {
        CustomResolverEndpointAddressesCustomResourceProviderHandler09D4123E: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            Code: {
              S3Bucket: {
                'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
              },
              S3Key: cdk.assertions.Match.stringLikeRegexp('\\w+.zip'),
            },
            Handler: '__entrypoint__.handler',
            MemorySize: 128,
            Role: {
              'Fn::GetAtt': ['CustomResolverEndpointAddressesCustomResourceProviderRoleA94B4F27', 'Arn'],
            },
            Runtime: 'nodejs14.x',
            Timeout: 900,
          },
        },
      },
    });
  });
});
