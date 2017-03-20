from pymongo import MongoClient
client = MongoClient('mongodb://hpmaharaja:Jaganath1@ds117869.mlab.com:17869/resang_users')
db = client.resang_users
collection = db.images
cursor = collection.find( {} )
collection.update( {}, {"$set": {"processed":True} })
for document in cursor:
    doc = collection.update( {"localPath":document['localPath']}, {"$set": {"processed":True} })
