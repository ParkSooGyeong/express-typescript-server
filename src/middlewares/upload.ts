import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Config from '../config/s3'; // S3 설정 파일 import

const upload = multer({
    storage: multerS3({
        s3: s3Config, // S3Client 객체 사용
        bucket: process.env.AWS_S3_BUCKET_NAME!, // 버킷 이름을 환경 변수로 관리
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, `${Date.now().toString()}_${file.originalname}`); // 파일 이름 설정
        },
    }),
});

export default upload;
