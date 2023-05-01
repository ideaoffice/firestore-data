import { CollectionReference, DocumentReference, Firestore } from "@google-cloud/firestore"; 

export default class FirestoreData {
  private firestore: Firestore;
  private collectionRef: CollectionReference;
  private counterRef: DocumentReference;

  constructor(collectionName: string) {
    this.firestore = new Firestore();
    this.collectionRef = this.firestore.collection(collectionName);
    this.counterRef = this.firestore.collection("counters").doc(collectionName);
  }

  public async add(data: any) {
    const id = await this.generateId();
    const docRef = this.collectionRef.doc(id);
    await docRef.set({ id, ...data});
    return docRef;
  }

  public async get(idOrCondition: string | Query | Query[]) {
    var query = this.buildQuery(idOrCondition);
    const snapshot = await query.get();
    const data:any = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  }

  public async update(idOrCondition: string | Query | Query[], data: any) {
    const query = this.buildQuery(idOrCondition);
    const snapshot = await query.get();
    const batch = this.firestore.batch();
    snapshot.forEach((doc) => {
      const docRef = this.collectionRef.doc(doc.id);
      batch.update(docRef, data, { merge: true });
    });
    return batch.commit();
  }

  public async delete(idOrCondition: string | Query | Query[]) {
    const query = this.buildQuery(idOrCondition);
    const snapshot = await query.get();
    const batch = this.firestore.batch();
    snapshot.forEach((doc) => {
      const docRef = this.collectionRef.doc(doc.id);
      batch.delete(docRef);
    });
    return batch.commit();
  }

  private async generateId() {
    const counter = await this.firestore.runTransaction(async (transaction) => {
      const counterDoc = (await this.counterRef.get()).data();
      const currentCount = counterDoc==undefined ? 0 : counterDoc.count;
      const nextCount = currentCount + 1;
      transaction.set(this.counterRef, { count: nextCount });
      return nextCount;
    });
    return counter.toString();
  }
  
  private buildQuery(idOrCondition: string | Query | Query[]) {
    let query: FirebaseFirestore.Query;
    if (typeof idOrCondition === "string" && /^\d+$/.test(idOrCondition)) {
      query = this.collectionRef.where("id", "==", idOrCondition);
    } else if (idOrCondition instanceof Query) {
      const { field, value } = idOrCondition;
      query = this.collectionRef.where(field, "==", value);
    } else if (Array.isArray(idOrCondition)) {
      query = this.collectionRef.where(
        idOrCondition[0].field,
        "==",
        idOrCondition[0].value
      );
      for (let i = 1; i < idOrCondition.length; i++) {
        const { field, value } = idOrCondition[i];
        query.where(field, "==", value)
      }
    } else if (idOrCondition.indexOf("&") > 0) {
      const conditions = idOrCondition.split("&");
      query = this.collectionRef.where(
        conditions[0].split("=")[0],
        "==",
        conditions[0].split("=")[1]
      );
      for (let i = 1; i < conditions.length; i++) {
        const [field, value] = conditions[i].split("=");
        //query = query.where(field, "==", value);
        query.where(field, "==", value)
      }
    } else if (idOrCondition.indexOf("=") > 0) {
      const [field, value] = idOrCondition.split("=");
      query = this.collectionRef.where(field, "==", value);
    } else {
      throw new Error("Invalid parameter: idOrCondition");
    }
    return query;
  }
}

class Query {
  public field: string;
  public value: string;
  public constructor(field: string, value: string) {
    this.field = field;
    this.value = value;
  }
}
