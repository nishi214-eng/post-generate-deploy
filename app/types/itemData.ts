export type itemData = {
    名前:string,
    時代:string,
    作者:string,
    解説文:string,
    file:File|null
}

export type savedItemData = {
    itemName:string,
    era:string,
    author:string,
    explanation:string,
    storagePath:string,
    vectorEmbedding: [],
    date: Date
}