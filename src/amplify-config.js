import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";

Amplify.configure({
    ...awsExports,
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
});
