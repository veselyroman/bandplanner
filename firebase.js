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

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

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
