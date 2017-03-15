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
import pprint
import pyexifinfo as p
import datetime

client = MongoClient('mongodb://hpmaharaja:Jaganath1@ds117869.mlab.com:17869/resang_users')
db = client.resang_users

'''
image = {
    TimeStamp:
'''
'''
image = 
{
    'Cluster_id': 5,
    'Distance_meters': '12555299.95510138',
    'Distance_ML' = '32706127160.23138',
    'FileName': '/root/Developer/resang_production/uploads/20150827_205131.jpg',
    'Latitude': '33.64416666666666',
    'Longitude': '-117.84277777777777',
    'Timestamp': '20150827205130.0'
    'Keyword': 'person'
}

'''
'''
{'ml_keywords': [], 'userName': 'hp', 'timestamp': datetime.datetime(2017, 3, 14, 5, 19, 58, 133000), '__v': 0, 'pathTofile': 'http://localhost:5000/images/?image=hp_1473587780000_IMG_8177.JPG', '_id': ObjectId('58c77d7ec80ade2804233be2'), 'localPath': '/root/Developer/resang_production/uploads/hp_1473587780000_IMG_8177.JPG', 'processed': False}
'''
#def insert_images(images):
#    collection = db.images
#    for image in images:
#        json_cluster = {'ml_keywords': [], 'userName': 'testing', 'timestamp': datetime.datetime(2017, 3, 14, 5, 19, 58, 133000), '__v': 0, 'pathTofile': 'http://localhost:5000/images/?image=hp_1473587780000_IMG_8177.JPG', 'processed': False}
#        json_cluster['localPath'] = image['FileName']
#        collection.insert_one(json_cluster)

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
    #print(lat)
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
    #print(longit)
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
    #print('lat=',latitude)
    #print('longit=',longitude)
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
#        image['Distance_meters'] = float(distance_meters) * 1000
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
            #for k,v in document.items():
            #    print(k,v)
            #print(type(document))
        return images
    else: 
        images = []
        times = []
        dists = []
        ml_dists = []
        with open('../EXIF/copy.csv') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                #print(row)
                #images.append(row['FileName'])
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
    #json = {'cluster_id': 2, 'images': ['testing','testing_insert'], 'keywords': ['hi','hello']}
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
    #for image in images:
    #    print(type(image))
    #    print(image)
    clusters = chunkIt(images,num_clusters)
    for i in range(num_clusters):
        cluster_id = i+1
        for j in range(len(clusters[i])):
            #print(cluster[i][j])
            clusters[i][j]['Cluster_id'] = cluster_id
        json_to_insert = format_cluster(clusters[i],cluster_id)
        insert_cluster(json_to_insert)
    pprint.pprint(clusters)
    
def update_images_db(images):
    collection = db.images
    for image in images:
        document = collection.update( {"localPath":image['FileName']}, {"$set": {"processed":True} })
        
        #document['processed'] = True
        #collection.insert_one(json_cluster)
    

def main():
    #(times,dists,ml_dists,images) = get_unprocessed_images('csv')
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
   # pprint.pprint(images)
        
        
    #print(times)
    #times = [20151210173405.0,20151210173405.0]
    #dists = [12549839.127236418,12549839.127236418]
    #create_basic_clusters(ml_dists,images)
    #create_clusters(times,dists)
    #get_clusters()
    #json = {'cluster_id': 2, 'images': ['testing','testing_insert'], 'keywords': ['hi','hello']}
    #insert_cluster(json) 
    #get_clusters()

    

if __name__ == "__main__": 
    #get_unprocessed_images()
    #get_clusters()
    #print(get_images_csv())
    main()
    #db.images.insert({'ml_keywords': [], 'userName': 'hp', 'timestamp': datetime.datetime(2017, 3, 14, 5, 19, 58, 133000), '__v': 0, 'pathTofile': 'http://localhost:5000/images/?image=hp_1473587780000_IMG_8177.JPG', 'localPath': '/root/Developer/resang_production/uploads/hp_1473587780000_IMG_8177.JPG', 'processed': False})
