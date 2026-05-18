// Firebase init — SDK compat (pas de bundler requis)
const firebaseConfig = {
    apiKey: "AIzaSyB7ATYGVXqrGf8PxMNX4tcaMxrUlCabPko",
    authDomain: "graphoquest-pro.firebaseapp.com",
    projectId: "graphoquest-pro",
    storageBucket: "graphoquest-pro.firebasestorage.app",
    messagingSenderId: "551454710362",
    appId: "1:551454710362:web:f5c1856237c439163fd663"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ID unique par appareil — persisté en localStorage
function getDeviceId() {
    try {
        let id = localStorage.getItem('gq_device_id');
        if (!id) {
            id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('gq_device_id', id);
        }
        return id;
    } catch(e) {
        return 'dev_unknown';
    }
}
