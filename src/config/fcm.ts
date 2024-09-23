import admin from 'firebase-admin';
import * as serviceAccount from '../../firebase-adminsdk.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const fcm = admin.messaging();

export default fcm;
