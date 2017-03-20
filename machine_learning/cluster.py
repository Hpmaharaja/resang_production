import os
import site
import subprocess
import re
import numpy as np
from sklearn import cluster, datasets
import geopy
from geopy.distance import great_circle
import pymongo
from pymongo import MongoClient
import csv
from operator import itemgetter 
import pprint
import pyexifinfo as p
import datetime

client = MongoClient('mongodb://hpmaharaja:Jaganath1@ds117869.mlab.com:17869/resang_users')
db = client.resang_users
IP_ADDR = '138.197.207.68'
PORT_FRONTEND = '5600'

'''
def insert_images(images):
    collection = db.images
    for image in images:
        json_cluster = {'ml_keywords': [], 'userName': 'testing', 'timestamp': datetime.datetime(2017, 3, 14, 5, 19, 58, 133000), '__v': 0, 'pathTofile': 'http://localhost:5000/images/?image=hp_1473587780000_IMG_8177.JPG', 'processed': False}
        json_cluster['localPath'] = image['FileName']
        collection.insert_one(json_cluster)
'''

def get_EXIF(image):
    path_name = image['FileName']
    try:
        tags = p.get_json(path_name)[0] # dictionary
    except ValueError: 
        print('Image does not exist')
        return
    if (not tags):
        print('Unable to process image')
        return
    file_name = os.path.split(path_name)[-1]
    try:
        lat = tags['EXIF:GPSLatitude']
    except KeyError:
        print('Skipping',path_name,'due to lack of GPSLatitude')
        return
    lat = lat.split()
    latitude = 0.0
    for i in range(len(lat)):
        non_decimal = re.compile(r'[^\d.]+')
        value = non_decimal.sub('',lat[i])
        if (i == 0):
            num = float(value)/1.0
        elif (i == 1):
            num = 0
        elif (i == 2):
            num = float(value)/60.0
        else:
            num = float(value)/3600.0
        latitude += num
    try:
        longit = tags['EXIF:GPSLongitude']
    except KeyError:
        print('Skipping',path_name,'due to lack of GPSLongitude')
        return
    longit = longit.split()
    longitude = 0.0
    for i in range(len(longit)):
        non_decimal = re.compile(r'[^\d.]+')
        value = non_decimal.sub('',longit[i])
        if (i == 0):
            num = float(value)/1.0
        elif (i == 1):
            num = 0
        elif (i == 2):
            num = float(value)/60.0
        else:
            num = float(value)/3600.0
        longitude += num
    ref_lat = tags['EXIF:GPSLatitudeRef']
    if (ref_lat.lower()[0] == 's'):
        latitude = latitude * (-1)
    ref_long = tags['EXIF:GPSLongitudeRef']
    if (ref_long.lower()[0] == 'w'):
        longitude = longitude * (-1)
    try:
        time = tags['EXIF:DateTimeOriginal']
        timestamp = ''.join(c for c in time if c.isdigit())
    except KeyError:
        print('Skipping',path_name,'due to lack of EXIFTimestamp data')
        return
    PRIME_MERIDIAN_EQUATOR = (0,0)
    lat_long = (latitude, longitude)
    distance_meters = great_circle(PRIME_MERIDIAN_EQUATOR,lat_long).meters
    image['Timestamp'] = float(timestamp)
    image['Longitude'] = longitude
    image['Latitude'] = latitude       
    image['Distance_meters'] = float(distance_meters)
    image['Distance_ML'] = image['Timestamp'] / 1000 + image['Distance_meters'] * 1000
    return image

def get_keyword(image):
    PYTHON_PATH = site.getsitepackages()[0]
    CLASSIFY_IMAGE_PATH = PYTHON_PATH + "/tensorflow/models/image/imagenet/classify_image.py"
    command = 'python3 ' + CLASSIFY_IMAGE_PATH + ' --image_file=' + image['FileName']
    keywords = subprocess.check_output(command,shell=True).decode('UTF-8')
    keyword_list = keywords.split('\n')
    newlis=[]
    for i in range(len(keyword_list)):
        newlis.append(keyword_list[i].split('('))
    top_keywords = newlis[0][0].strip() + ', ' 
    image['Keyword'] = top_keywords
    return image

def calc_affinity(X):
    dists = np.zeros((X.shape[0],X.shape[0]))
    for i in range(X.shape[0]):
        for j in range(X.shape[0]):
            dists[i,j] = calc_distance((X[i],X[j]))
    return dists

def calc_distance(t):
    print(t)
    (a,b) = t
    distance_time = abs( float(a[0]) - float(b[0]) )
    gps_a = (a[1],a[2])
    gps_b = (b[1],b[2])
    distance_meters = great_circle(gps_a,gps_b).meters
    distance = distance_time + distance_meters 
    return distance

def get_clusters():
    collection = db.clusters
    cursor = db.clusters.find()
    for document in cursor:
        print(document)

def get_unprocessed_images(db_or_csv):
    if (db_or_csv == 'db'):
        collection = db.images
        #cursor = db.images.find( {"processed":False} )
        cursor = db.images.find( {} )
        images = [] 
        for document in cursor:
            image = {}
            image['FileName'] = document['localPath']
            image['URL'] = document['pathTofile']
            images.append(image)
        return images

def insert_cluster(json_cluster):
    collection = db.clusters
    collection.insert_one(json_cluster)

def get_largest_cluster_id():
    collection = db.clusters
    max_id = 0
    try:
        max_id = db.clusters.find().sort('cluster_id',pymongo.DESCENDING)[0]['cluster_id']
    except IndexError:
        pass
    return max_id
    

def format_cluster(cluster_with_id,ID): 
    cluster_formatted = {}
    cluster_formatted['cluster_id'] = ID
    cluster_formatted['images'] = []
    keywords_set = set()
    for c in cluster_with_id:
        cluster_formatted['images'].append(c['URL'])
        keywords_set.add(c['Keyword'])
    cluster_formatted['keywords'] = list(keywords_set)
    print(cluster_formatted)
    return cluster_formatted


def purge_clusters_db():
    db.clusters.remove({})
    
def create_agglomerative_clusters(images):
    Xf = np.zeros((len(images),3))
    for i in range(len(images)):
        Xf[i,0] = images[i]['Timestamp']
        Xf[i,1] = images[i]['Latitude']
        Xf[i,2] = images[i]['Longitude']
    #num_clusters = 2
    num_clusters = int( len(images) / 5 )
    agglomerative = cluster.AgglomerativeClustering(
        linkage="complete", affinity=calc_affinity, n_clusters=num_clusters)
    #fit = agglomerative.fit(Xf)
    fit_predict = agglomerative.fit_predict(Xf)
    print(fit_predict)
    #max_id = get_largest_cluster_id()
    max_id = 2
    for i in range(len(fit_predict)): 
        cluster_id = fit_predict[i] + 1 + max_id
        images[i]['Cluster_id'] = cluster_id
    images = sorted(images, key=itemgetter('Cluster_id'))
    ID = -1
    purge_clusters_db()
    for i in range(num_clusters):
        cluster_id = i + 1 + max_id
        temp_cluster = [image for image in images if image['Cluster_id'] == cluster_id]
        pprint.pprint(temp_cluster)
        json_to_insert = format_cluster(temp_cluster,cluster_id)
        insert_cluster(json_to_insert)
    
    
def update_images_db(images):
    collection = db.images
    for image in images:
        document = collection.update( {"localPath":image['FileName']}, {"$set": {"processed":True} })
        

def main():
    images = get_unprocessed_images('db')
    if (images):
        for i in range(len(images)):
            image = images[i]
            EXIF = get_EXIF(image)
            images[i] = EXIF
        images = [x for x in images if x != None]
        if (images):
            for i in range(len(images)):
                image = images[i]
                images[i] = get_keyword(image)
                #images[i]['Keyword'] = ''
            create_agglomerative_clusters(images) 
            update_images_db(images) 

    

if __name__ == "__main__": 
    cursor = db.ml_running.find()
    '''
    try:
        cursor[0]
        print('running')
    except IndexError:
        db.ml_running.insert({"running":True})
        print('inserted')
        main()
        db.ml_running.remove( {} )
    '''
    main()
