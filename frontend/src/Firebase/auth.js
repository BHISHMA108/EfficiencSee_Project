import { GoogleAuthProvider } from "firebase/auth/web-extension";
import { auth } from "./Firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
// import { sendEmailVerification , sendPasswordResetEmail , updatePassword } from "firebase/auth";

export const doCreataUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth , email , password);
}

export const doSignInWithEmailAndPassword = (email , password) =>{
    return signInWithEmailAndPassword(auth , email , password);
}

export const doSignInWithGoogle = async () =>{
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth , provider);

    return result;
}//This is for selecting the accout while signin 

export const doSignOut = () =>{
    return auth.signOut();
}

// export const doPasswordReset = (email) =>{
//     return sendPasswordResetEmail(auth  , email);
// }

// export const doPasswordChange = (password) =>{
//     return updatePassword(auth.currentUser , password);
// }

// export const doSendEmailVerification = () =>{
//     return sendEmailVerification(auth.currentUser , {
//         url : `${window.location.origin}/home`,
//     })
// }
