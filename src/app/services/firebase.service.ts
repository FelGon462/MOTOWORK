import { inject, Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../pages/models/user.model';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, setDoc, updateDoc } from '@angular/fire/firestore'
import { UtilsService } from './utils.service';
import { ref, getStorage, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  UtilsService = inject(UtilsService);
  
  getAuth(){
    return getAuth();
  }

  signIn(user: User){
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);

  }

  signUp(user: User){
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  updateUser(displayName: any){
    return updateProfile(getAuth().currentUser, {displayName});
  }

  setDcument(path: any, data: any){
    return setDoc(doc(getFirestore(), path), data);
  }

  async getDocument(path: any){
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  sendRecoveyEmail(email: string){
    return sendPasswordResetEmail(getAuth(), email);
  }

  signOut(){
    getAuth().signOut();
    localStorage.removeItem('user');
    this.UtilsService.routerlink('/auth');
  }

  addDocument(path: any, data: any){ // 'users/id/document0s'
    return addDoc(collection(getFirestore(), path), data); //add guarda los datos
  }

  async updateImg(path: any, data_url: any){
    return uploadString(ref(getStorage(), path),data_url, 'data_url')
    .then(() => {
      return getDownloadURL(ref(getStorage(), path))
    })
  }

  //obtener ruta de la imagen con su url
  async getFilePath( url: string){
    return ref(getStorage(), url).fullPath;
  }

  //Para actualizar informacion de un documento
  updateDocument(path: any, data: any){
    return updateDoc(doc(getFirestore(), path), data);
  }

}
