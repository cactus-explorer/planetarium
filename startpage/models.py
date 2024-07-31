from django.db import models
    
class Planet(models.Model):
    name = models.CharField(max_length=20, primary_key=True)
    structures = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    texture = models.ImageField(upload_to="texture")
    surface = models.PositiveIntegerField()
    def __str__(self):
        return self.name