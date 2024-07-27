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


def index(request, planetURL=None):
    if request.method == 'POST':
        file = json.loads(request.body.decode("utf-8"))["file"]
        name = file["name"]
        structures = file["structures"]
        # Add check if valid step
        savePlanet = Planet(name=name,
                            structures=structures,
                            pub_date=timezone.now())
        savePlanet.save()
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
            
