import { inject, Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { User } from '../pages/models/user.model';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, setDoc, updateDoc } from '@angular/fire/firestore'
import { UtilsService } from './utils.service';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString, deleteObject } from 'firebase/storage'; // Asegúrate de tener estas importaciones
import { Document } from '../pages/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  UtilsService = inject(UtilsService);
  dataRef: AngularFirestoreCollection<Document>;
  
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

  createId(): string {
    return this.firestore.createId(); // Genera un ID único
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

  async addDocument(collectionPath: string, data: any, docId?: string) {
    const collectionRef = this.firestore.collection(collectionPath);
    
    if (docId) {
      // Si hay un UID proporcionado, lo usamos como ID del documento
      return collectionRef.doc(docId).set(data);
    } else {
      // Si no hay UID, Firestore genera uno automáticamente
      return collectionRef.add(data);
    }
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

  //Para eliminar un documento
  deleteDocument(path: any){
    return deleteDoc(doc(getFirestore(), path));
  }

  //Para eliminar un archivo de firebase storage
  deleteFile(path: any){
    return deleteObject(ref(getStorage(), path));
  }



  getCollectionData(path: any): AngularFirestoreCollection<Document>{
    this.dataRef = this.firestore.collection(path, ref => ref.orderBy('fecha', 'desc'));
    return this.dataRef;
  }

}
