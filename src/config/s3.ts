import { S3Client } from '@aws-sdk/client-s3';

const s3Config = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESSID!,
        secretAccessKey: process.env.AWS_ACCESSKEY!,
    },
});

export default s3Config;
