import os
import site
import subprocess
import re
import numpy as np
from sklearn import cluster, datasets
import geopy
from geopy.distance import great_circle
from pymongo import MongoClient 
import csv
from operator import itemgetter 
import pyexifinfo as p
import datetime

client = MongoClient('mongodb://hpmaharaja:Jaganath1@ds117869.mlab.com:17869/resang_users')
db = client.resang_users

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
        os.system(error_string)
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
        os.system(error_string)
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
        os.system(error_string)
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
    top_keywords = newlis[0][0].strip()
    image['Keyword'] = top_keywords
    return image

def calculate_distance(a,b):
    distance_time = abs( float(a['Timestamp']) - float(b['Timestamp']) )
    gps_a = (a['Latitude'],a['Longitude'])
    gps_b = (b['Latitude'],b['Longitude'])
    distance_meters = great_circle(gps_a,gps_b).meters
    distance = distance_time + distance_meters 
   
def get_clusters():
    collection = db.clusters
    cursor = db.clusters.find()
    for document in cursor:
        print(document)

def get_unprocessed_images(db_or_csv):
    if (db_or_csv == 'db'):
        collection = db.images
        cursor = db.images.find( {"processed":False} )
        images = [] 
        for document in cursor:
            image = {}
            image['FileName'] = document['localPath']
            images.append(image)
        return images
    else: 
        images = []
        times = []
        dists = []
        ml_dists = []
        with open('../EXIF/copy.csv') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                times.append(row['Timestamp'])
                dists.append(row['Distance (km)'])
                ml_dists.append(row['Distance (ML_formula)'])
                images.append(row)
        return (times,dists,ml_dists,images)

def insert_cluster(json_cluster):
    collection = db.clusters
    collection.insert_one(json_cluster)

def format_cluster(cluster_with_id,id): 
    cluster_formatted = {}
    cluster_formatted['cluster_id'] = id
    cluster_formatted['images'] = []
    cluster_formatted['keywords'] = []
    for c in cluster_with_id:
        cluster_formatted['images'].append(c['FileName'])
        cluster_formatted['keywords'].append(c['Keyword'])
    print(cluster_formatted)
    return cluster_formatted
    
def create_agglomerative_clusters(times,dists):
    X = [times,dists]
    print(X)
    agglomerative = cluster.AgglomerativeClustering(
        linkage="complete", affinity="cityblock", n_clusters=2)
    #agglomerative = cluster.AgglomerativeClustering(
    #    linkage="complete", affinity=get_distance(a,b), n_clusters=2)
    fit = agglomerative.fit(X)
    fit_predict = agglomerative.fit_predict(X)
    print(fit)
    print(fit_predict)
    print(type(agglomerative))

def chunkIt(seq, num):
    avg = len(seq) / float(num)
    out = []
    last = 0.0

    while last < len(seq):
        out.append(seq[int(last):int(last + avg)])
        last += avg

    return out

def create_basic_clusters(images):
    num_clusters = 5
    images = sorted(images, key=itemgetter('Distance_ML'))
    clusters = chunkIt(images,num_clusters)
    for i in range(num_clusters):
        cluster_id = i+1
        for j in range(len(clusters[i])):
            clusters[i][j]['Cluster_id'] = cluster_id
        json_to_insert = format_cluster(clusters[i],cluster_id)
        insert_cluster(json_to_insert)
    
def update_images_db(images):
    collection = db.images
    for image in images:
        document = collection.update( {"localPath":image['FileName']}, {"$set": {"processed":True} })
        
    

def main():
    images = get_unprocessed_images('db')
    for i in range(len(images)):
        image = images[i]
        EXIF = get_EXIF(image)
        images[i] = EXIF
    images = [x for x in images if x != None]
    for i in range(len(images)):
        image = images[i]
        images[i] = get_keyword(image)
    create_basic_clusters(images)    
    update_images_db(images) 

    

if __name__ == "__main__": 
    main()
