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


def index(request):
    if request.method == 'POST':
        file = json.loads(request.body.decode("utf-8"))["file"]
        task_id = None
        edited = None
        name = file["name"]
        structures = file["structures"]

        if task_id != None:
            Planet.objects.filter(pk=task_id).delete()
            return HttpResponseRedirect('')
        elif edited != None:
            t = Planet.objects.get(id=edited)
            # t.task_text = newText  # change field
            t.save() # this will update only
            return HttpResponseRedirect('')
        else:
            # Add check if valid step
            savePlanet = Planet(name=name,
                                structures=structures,
                                pub_date=timezone.now())
            savePlanet.save()
    else:
        query = request.GET.get('w')
        if (query == None):
            # template = loader.get_template('startpage/index.html')
            # latest_task_list = Planet.objects.order_by('pub_date')
            # context = {
            #     'latest_task_list': latest_task_list,
            # }
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
            
