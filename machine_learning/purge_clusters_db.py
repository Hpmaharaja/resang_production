from pymongo import MongoClient
import sys
client = MongoClient('mongodb://hpmaharaja:Jaganath1@ds117869.mlab.com:17869/resang_users')
db = client.resang_users
try:
    if (sys.argv[1] == 'dbadmin'):
        db.clusters.remove({})
    print('Purging complete.')
except IndexError:
    print('db is still intact. nothing removed')

