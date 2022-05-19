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
import { RegisterDelegatedAdministrator } from '../../index';

const testNamePrefix = 'Construct(RegisterDelegatedAdministrator): ';

//Initialize stack for snapshot test and resource configuration test
const stack = new cdk.Stack();

new RegisterDelegatedAdministrator(stack, 'RegisterDelegatedAdministrator', {
  servicePrincipal: 'macie.amazonaws.com',
  accountId: stack.account,
  kmsKey: new cdk.aws_kms.Key(stack, 'CustomKey', {}),
  logRetentionInDays: 3653,
});

/**
 * RegisterDelegatedAdministrator construct test
 */
describe('RegisterDelegatedAdministrator', () => {
  /**
   * Number of IAM role resource test
   */
  test(`${testNamePrefix} IAM role resource count test`, () => {
    cdk.assertions.Template.fromStack(stack).resourceCountIs('AWS::IAM::Role', 1);
  });

  /**
   * Number of Lambda function resource test
   */
  test(`${testNamePrefix} Lambda function resource count test`, () => {
    cdk.assertions.Template.fromStack(stack).resourceCountIs('AWS::Lambda::Function', 1);
  });

  /**
   * Number of OrganizationsRegisterDelegatedAdministrator custom resource test
   */
  test(`${testNamePrefix} EnablePolicyType custom resource count test`, () => {
    cdk.assertions.Template.fromStack(stack).resourceCountIs('Custom::OrganizationsRegisterDelegatedAdministrator', 1);
  });

  /**
   * Lambda Function resource configuration test
   */
  test(`${testNamePrefix} Lambda Function resource configuration test`, () => {
    cdk.assertions.Template.fromStack(stack).templateMatches({
      Resources: {
        CustomOrganizationsRegisterDelegatedAdministratorCustomResourceProviderHandlerFAEA655C: {
          Type: 'AWS::Lambda::Function',
          DependsOn: ['CustomOrganizationsRegisterDelegatedAdministratorCustomResourceProviderRole4B3EAD1B'],
          Properties: {
            Code: {
              S3Bucket: {
                'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
              },
            },
            Handler: '__entrypoint__.handler',
            MemorySize: 128,
            Role: {
              'Fn::GetAtt': [
                'CustomOrganizationsRegisterDelegatedAdministratorCustomResourceProviderRole4B3EAD1B',
                'Arn',
              ],
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
        CustomOrganizationsRegisterDelegatedAdministratorCustomResourceProviderRole4B3EAD1B: {
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
                        'organizations:DeregisterDelegatedAdministrator',
                        'organizations:RegisterDelegatedAdministrator',
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
   * OrganizationsRegisterDelegatedAdministrator custom resource configuration test
   */
  test(`${testNamePrefix} OrganizationsRegisterDelegatedAdministrator custom resource configuration test`, () => {
    cdk.assertions.Template.fromStack(stack).templateMatches({
      Resources: {
        RegisterDelegatedAdministratorF9498A1E: {
          Type: 'Custom::OrganizationsRegisterDelegatedAdministrator',
          DeletionPolicy: 'Delete',
          UpdateReplacePolicy: 'Delete',
          Properties: {
            ServiceToken: {
              'Fn::GetAtt': [
                'CustomOrganizationsRegisterDelegatedAdministratorCustomResourceProviderHandlerFAEA655C',
                'Arn',
              ],
            },
            accountId: {
              Ref: 'AWS::AccountId',
            },
            servicePrincipal: 'macie.amazonaws.com',
          },
        },
      },
    });
  });
});
