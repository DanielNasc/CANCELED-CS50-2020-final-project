const db = require("./firebase")
const { doc, getDoc, collection, where, query, getDocs, addDoc, orderBy, limit, updateDoc, arrayRemove, arrayUnion } = require("firebase/firestore")

 async function create_doc(collec, obj)
 {
    const REF = collection(db, collec)
    const id = (await addDoc(REF, {...obj})).id
    return id
 }

async function get_snap_and_ref(collec, id)
{
    const REF = doc(db, collec, id)
    const SNAP = await getDoc(REF)
    if (!SNAP.exists())
        return false
    return {REF, SNAP}
}

async function check_if_this_exists(collec, id)
{
    const REF = doc(db, collec, id)
    const SNAP = await getDoc(REF)
    return SNAP.exists()
}

async function get_data_by_query(collec, prop, value)
{
    // get the reference of the collection
    const REF = collection(db, collec)

    // check if query exists
    const q = query(REF, where(prop, "==", value))
    const docs = await getDocs(q)
    if (docs.empty)
        return false
    return docs.docs[0]
}

async function order_limit_data(collec, o, l)
{
    const REF = collection(db, collec)
    
    const q = query(REF, orderBy(o), limit(l))
    const docs = await getDocs(q)
    return docs
}

async function get_username(user_id)
{
    const user = await get_snap_and_ref("users", user_id)
    if (user) return user.SNAP.data().username
}

async function accept_friend_request(RECEIVER_REF, SENDER_REF, RECEIVER_ID, SENDER_ID)
{
    await updateDoc(RECEIVER_REF, {pending: arrayRemove(SENDER_ID), friends: arrayUnion(SENDER_ID)})
    await updateDoc(SENDER_REF, {friends: arrayUnion(RECEIVER_ID)})
    return
}

async function reject_friend_request(RECEIVER_REF, SENDER_ID)
{
    await updateDoc(RECEIVER_REF, {pending: arrayRemove(SENDER_ID)})
    return
}

async function delete_friend_firestore(RECEIVER_REF, SENDER_REF, RECEIVER_ID, SENDER_ID)
{
    await updateDoc(RECEIVER_REF, {friends: arrayRemove(SENDER_ID)})
    await updateDoc(SENDER_REF, {friends: arrayRemove(RECEIVER_ID)})
    return
}

module.exports = {
    get_snap_and_ref, 
    check_if_this_exists, 
    get_data_by_query,
    create_doc,
    order_limit_data,
    get_username,
    accept_friend_request,
    reject_friend_request,
    delete_friend_firestore
}