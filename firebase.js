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
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyAvlN5TvJWyqZMQ6IpcgCNUCx0A0KsR6j4",
    authDomain: "bandplanner-35c5f.firebaseapp.com",
    projectId: "bandplanner-35c5f",
    storageBucket: "bandplanner-35c5f.firebasestorage.app",
    messagingSenderId: "905591319348",
    appId: "1:905591319348:web:58efc3599b068c4ae11361"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
    collection,
    addDoc
};

import {
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


window.firebaseLogin = async function (
    username,
    password
) {

    const q = query(
        collection(db, "users"),
        where(
            "username",
            "==",
            username
        )
    );

    const snapshot =
        await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const user =
        snapshot.docs[0].data();

    const enteredHash =
        await hashPassword(
            password
        );

    if (
        user.passwordhash &&
        user.passwordhash === enteredHash
    ) {

        return user;

    }

    if (
        user.password &&
        user.password === password
    ) {

        return user;

    }

    return null;

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

    const passwordhash =
        await hashPassword(
            password
        );

    await addDoc(
        collection(db, "users"),
        {
            username,
            passwordhash,
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
        passwordhash:
            await hashPassword(
                password
            )
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

window.firebaseAddProposal =
async function (proposal) {

    await addDoc(
        collection(db, "proposals"),
        proposal
    );

};

window.firebaseGetProposals =
async function () {

    const snapshot =
        await getDocs(
            collection(db, "proposals")
        );

    const result = [];

    snapshot.forEach(docItem => {

        result.push({
            firestoreId: docItem.id,
            ...docItem.data()
        });

    });

    return result;
};

window.firebaseUpdateProposal =
async function (
    firestoreId,
    data
) {

    await updateDoc(
        doc(
            db,
            "proposals",
            firestoreId
        ),
        data
    );

};

window.firebaseDeleteProposal =
async function (
    firestoreId
) {

    await deleteDoc(
        doc(
            db,
            "proposals",
            firestoreId
        )
    );

};

window.firebaseUploadFile =
async function (
    file,
    description,
    uploadedBy
) {

    const storagePath =
        "files/" +
        Date.now() +
        "_" +
        file.name;

    const storageRef =
        ref(
            storage,
            storagePath
        );

    await uploadBytes(
        storageRef,
        file
    );

    const downloadUrl =
        await getDownloadURL(
            storageRef
        );

    await addDoc(
        collection(
            db,
            "files"
        ),
        {
            filename: file.name,
            description,
            uploadedBy,
            uploadedAt:
                new Date().toISOString(),
		size:file.size,
            storagePath,
            downloadUrl
        }
    );

};

window.firebaseGetFiles =
async function () {

    const snapshot =
        await getDocs(
            collection(
                db,
                "files"
            )
        );

    const result = [];

    snapshot.forEach(docItem => {

        result.push({
            firestoreId:
                docItem.id,
            ...docItem.data()
        });

    });

    return result;

};

window.firebaseDeleteFile =
async function (
    firestoreId,
    storagePath
) {

    await deleteObject(
        ref(
            storage,
            storagePath
        )
    );

    await deleteDoc(
        doc(
            db,
            "files",
            firestoreId
        )
    );

};

window.firebaseSaveFilesVisit =
async function (username) {

    const q = query(
        collection(db, "fileViews"),
        where("username", "==", username)
    );

    const snapshot =
        await getDocs(q);

    if (snapshot.empty) {

        await addDoc(
            collection(db, "fileViews"),
            {
                username,
                lastVisitedFiles:
                    new Date().toISOString()
            }
        );

        return;

    }

    await updateDoc(
        doc(
            db,
            "fileViews",
            snapshot.docs[0].id
        ),
        {
            lastVisitedFiles:
                new Date().toISOString()
        }
    );

};

window.firebaseGetFilesVisit =
async function (username) {

    const q = query(
        collection(db, "fileViews"),
        where("username", "==", username)
    );

    const snapshot =
        await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs[0].data();

};

window.firebaseSaveCalendarVisit =
async function (username) {

    const q = query(
        collection(db, "calendarViews"),
        where("username", "==", username)
    );

    const snapshot =
        await getDocs(q);

    if (snapshot.empty) {

        await addDoc(
            collection(db, "calendarViews"),
            {
                username,
                lastVisitedCalendar:
                    new Date().toISOString()
            }
        );

        return;
    }

    await updateDoc(
        doc(
            db,
            "calendarViews",
            snapshot.docs[0].id
        ),
        {
            lastVisitedCalendar:
                new Date().toISOString()
        }
    );
};

window.firebaseGetCalendarVisit =
async function (username) {

    const q = query(
        collection(db, "calendarViews"),
        where("username", "==", username)
    );

    const snapshot =
        await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs[0].data();
};

window.firebaseSaveDeviceToken =
async function (
    username,
    token
) {

    const q = query(
        collection(
            db,
            "deviceTokens"
        ),
        where(
            "token",
            "==",
            token
        )
    );

    const snapshot =
        await getDocs(q);

    if (!snapshot.empty) {
        return;
    }

    await addDoc(
        collection(
            db,
            "deviceTokens"
        ),
        {
            username,
            token,
            createdAt:
                new Date().toISOString()
        }
    );

};

window.firebaseRegisterForPush =
async function (
    username
) {

const registration =
    await navigator.serviceWorker.register(
        "./service-worker.js"
    );

await navigator.serviceWorker.ready;

    const permission =
        await Notification.requestPermission();

    if (
        permission !== "granted"
    ) {

        alert(
            "Notifikace nebyly povoleny."
        );

        return;

    }

const token =
    await getToken(
        messaging,
        {
            vapidKey:
                "BONAuoS3Jyw1IkHojEPr_ofaY8D56TmPS1QjBXnlZ_tYtVUxj4ZyVws3_hqsHSitErg3zBMV7Fu9Dq3fufsy3kU",
            serviceWorkerRegistration:
                registration
        }
    );

    if (!token) {

        alert(
            "Token se nepodařilo získat."
        );

        return;

    }

    await firebaseSaveDeviceToken(
        username,
        token
    );

    alert(
        "Push notifikace aktivovány."
    );

};

window.firebaseHasDeviceToken =
async function (username) {

    const q = query(
        collection(
            db,
            "deviceTokens"
        ),
        where(
            "username",
            "==",
            username
        )
    );

    const snapshot =
        await getDocs(q);

    return !snapshot.empty;

};

async function hashPassword(
    password
) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(
            password
        );

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(
                hashBuffer
            )
        );

    return hashArray
        .map(b =>
            b.toString(16)
             .padStart(2, "0")
        )
        .join("");

}

let proposalsUnsubscribe = null;

window.firebaseListenToProposals =
function (callback) {
    if (proposalsUnsubscribe) {
        proposalsUnsubscribe();
    }

    proposalsUnsubscribe =
        onSnapshot(
            collection(db, "proposals"),
            snapshot => {
                const result = [];

                snapshot.forEach(docItem => {
                    result.push({
                        firestoreId: docItem.id,
                        ...docItem.data()
                    });
                });

                callback(result);
            },
            error => {
                console.error(
                    "Chyba živého načítání návrhů:",
                    error
                );
            }
        );

    return proposalsUnsubscribe;
};

