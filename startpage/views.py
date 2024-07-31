from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import HttpResponseNotFound

from django.template import loader, Context
from django.shortcuts import render
import datetime

from .models import Planet
import json
from django.http import JsonResponse

from datetime import *
from django.utils import timezone

import base64
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage


fs = FileSystemStorage(location="/media/usertex")


def index(request, planetURL=None):
    if request.method == 'POST': # Save planet
        body = json.loads(request.body.decode("utf-8"))
        file = body["file"]
        name = file["name"]
        structures = file["structures"]
        # Add if valid(file): step
        
        # Save image
        # https://stackoverflow.com/questions/39576174/save-base64-image-in-django-file-field
        format, imgstr  = body["image"].split(';base64,') 
        ext = format.split('/')[-1] 

        image = ContentFile(base64.b64decode(imgstr ), name='temp.' + ext)

        savePlanet = Planet(name=name,
                            structures=structures,
                            pub_date=timezone.now(),
                            texture = image)
        savePlanet.save()

        return HttpResponse(status=200) 
    else:
        query = request.GET.get('w')
        if (query == None):
            if (planetURL != None):
                planet = None
                try:
                    planet = Planet.objects.get(name=planetURL)
                except Planet.DoesNotExist:
                    planet = {"structures": "empty"}
                context = {
                    'planet_data': planet,
                }
                print(planet.texture.url)
                return render(request, 'startpage/index.html', context)
            return render(request, 'startpage/index.html')
        else:
            planet = {}
            try:
                planet = Planet.objects.get(name=query)
            except Planet.DoesNotExist:
                return HttpResponseNotFound()   
            
            planetDict = {}
            planetDict["name"] = planet.name;
            planetDict["structures"] = planet.structures;
            print(planetDict["structures"])
            return JsonResponse(planetDict, safe=True)
            
def pageAPI(request, pageNum=1):
    import math
    pageSize = 5

    queryList = list(
        Planet.objects.order_by('pub_date')
        .values_list('name'));
    listIntersection = queryList[(pageNum - 1) * pageSize:pageNum * pageSize];
    length = math.ceil(len(queryList) / pageSize)

    planetList = list(map(lambda x: x[0], listIntersection))
    planetDict = { "pages": length,
                  "list" : planetList}
    return JsonResponse(planetDict, safe=True)