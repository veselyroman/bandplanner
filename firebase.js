import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    deleteDoc,
    updateDoc
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

window.firebaseReadUsers = async function () {

    try {

        const snapshot =
            await getDocs(
                collection(db, "users")
            );

        console.log(
            "===== Uživatelé z Firestore ====="
        );

        snapshot.forEach(doc => {

            console.log(
                doc.id,
                doc.data()
            );

        });

        alert(
            "Uživatelé načteni. Podívej se do konzole."
        );

    } catch (error) {

        console.error(error);

        alert(
            "Chyba při čtení uživatelů."
        );

    }
};

window.firebaseLogin = async function (
    username,
    password
) {

    const q = query(
        collection(db, "users"),
        where("username", "==", username),
        where("password", "==", password)
    );

    const snapshot =
        await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs[0].data();
};

window.firebaseGetUsers = async function () {

    const snapshot =
        await getDocs(
            collection(db, "users")
        );

    const result = [];

    snapshot.forEach(docItem => {

        result.push({
            id: docItem.id,
            ...docItem.data()
        });

    });

    return result;
};

window.firebaseAddUser = async function (
    username,
    password,
    role
) {

    await addDoc(
        collection(db, "users"),
        {
            username,
            password,
            role
        }
    );

};

window.firebaseDeleteUser = async function (
    username
) {

    const q = query(
        collection(db, "users"),
        where("username", "==", username)
    );

    const snapshot =
        await getDocs(q);

    for (const docItem of snapshot.docs) {

        await deleteDoc(
            doc(db, "users", docItem.id)
        );

    }
};

window.firebaseUpdateRole = async function (
    username,
    role
) {

    const q = query(
        collection(db, "users"),
        where("username", "==", username)
    );

    const snapshot =
        await getDocs(q);

    for (const docItem of snapshot.docs) {

        await updateDoc(
            doc(db, "users", docItem.id),
            {
                role
            }
        );

    }
};

window.firebaseUpdatePassword =
async function (
    username,
    password
) {

    const q = query(
        collection(db, "users"),
        where("username", "==", username)
    );

    const snapshot =
        await getDocs(q);

    for (const docItem of snapshot.docs) {

        await updateDoc(
            doc(db, "users", docItem.id),
            {
                password
            }
        );

    }
};

window.firebaseUserExists =
async function (username) {

    const q = query(
        collection(db, "users"),
        where("username", "==", username)
    );

    const snapshot =
        await getDocs(q);

    return !snapshot.empty;
};
