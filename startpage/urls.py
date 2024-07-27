from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path("<str:planetURL>/", views.index),
    path("api/page/<int:pageNum>/", views.pageAPI),
]