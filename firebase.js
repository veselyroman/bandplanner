import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAvlN5TvJWyqZMQ6IpcgCNUCx0A0KsR6j4",
    authDomain: "bandplanner-35c5f.firebaseapp.com",
    projectId: "bandplanner-35c5f",
    storageBucket: "bandplanner-35c5f.firebasestorage.app",
    messagingSenderId: "905591319348",
    appId: "1:905591319348:web:58efc3599b068c4ae11361"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export {
    collection,
    addDoc
};

import {
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

window.firebaseTest = async function () {

    try {

        await addDoc(
            collection(db, "test"),
            {
                message: "BandPlanner connected",
                created: serverTimestamp()
            }
        );

        alert(
            "Zápis do Firebase proběhl úspěšně."
        );

    } catch (error) {

        console.error(error);

        alert(
            "Firebase chyba. Zkontroluj konzoli."
        );
    }
};