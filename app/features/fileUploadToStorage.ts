import { storage } from "../infra/firebase"
import { ref,uploadBytes } from "firebase/storage";
export const fileUploadToStorage = async(file:File|null,fileName:string) => {
    const storagePath = `itemImg/${fileName}`;
    const storageRef = ref(storage, storagePath);
    // ファイルが存在すればファイルをアップロードし、storageのpathを返す
    if(file){
        try{
            await uploadBytes(storageRef,file);
            return storagePath
        }catch(error){
            throw new Error(`ファイルのアップロードに失敗`);
        }
    }else{
        throw new Error('ファイルが存在しません');
    }
}