import {
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";

import { auth } from "./firebase";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const idToken = await user.getIdToken();

    return {
        user,
        idToken
    };
};