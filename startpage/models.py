from django.db import models


class Task(models.Model):
    task_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    def __str__(self):
        return self.task_text
    
class Planet(models.Model):
    name = models.CharField(max_length=20, primary_key=True)
    structures = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    texture = models.ImageField(upload_to="texture")
    def __str__(self):
        return self.name